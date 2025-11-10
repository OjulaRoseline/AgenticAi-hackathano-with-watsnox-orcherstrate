const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const watsonxService = require('../services/watsonx');
const { 
    getCachedPatient, 
    cachePatient, 
    getCachedVitals, 
    cacheVitals,
    getCachedSearchResults,
    cacheSearchResults 
} = require('../config/redis');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/agents/query
 * Main endpoint for natural language queries
 * Routes to appropriate AI agent based on intent
 */
router.post('/query', [
    body('query').trim().notEmpty().withMessage('Query is required'),
    body('context').optional().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { query, context = {} } = req.body;
        const nurseId = req.user.id;

        logger.info(`🤖 Agent query from nurse ${nurseId}: "${query}"`);

        const fullContext = {
            ...context,
            nurseId,
            timestamp: new Date().toISOString()
        };

        const startTime = Date.now();
        const agentResponse = await watsonxService.routeToAgent(query, fullContext);
        const executionTime = Date.now() - startTime;

        // Log interaction to database
        await logAgentInteraction({
            nurseId,
            agentType: agentResponse.agent,
            query,
            intent: agentResponse.intent.intent,
            confidence: agentResponse.intent.confidence,
            executionTime,
            wasSuccessful: true
        });

        // If agent requires data from database, fetch it
        if (agentResponse.response.requiresData) {
            const data = await fetchDataForAgent(agentResponse);
            agentResponse.data = data;
        }

        res.json({
            success: true,
            agent: agentResponse.agent,
            intent: agentResponse.intent,
            response: agentResponse.response,
            data: agentResponse.data || null,
            executionTime: `${executionTime}ms`
        });

    } catch (error) {
        logger.error('❌ Error processing agent query:', error);
        
        await logAgentInteraction({
            nurseId: req.user.id,
            agentType: 'unknown',
            query: req.body.query,
            wasSuccessful: false,
            errorMessage: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to process query',
            message: error.message
        });
    }
});

/**
 * Fetch data based on agent response
 */
async function fetchDataForAgent(agentResponse) {
    const { action, entities } = agentResponse.response;

    try {
        switch (action) {
            case 'retrieve_vitals':
                return await getPatientVitals(entities.patientName);
            
            case 'search_patients':
                return await searchPatients(entities);
            
            case 'create_meeting':
                return await prepareMeetingData(entities);
            
            case 'create_handoff_report':
                return await generateHandoffReport(entities);
            
            case 'get_alerts':
                return await getCriticalAlerts();
            
            default:
                return null;
        }
    } catch (error) {
        logger.error('Error fetching data for agent:', error);
        throw error;
    }
}

/**
 * Get patient vitals with Redis caching
 */
async function getPatientVitals(patientName) {
    try {
        if (!patientName) {
            return {
                found: false,
                message: 'Please specify a patient name'
            };
        }

        const [results] = await sequelize.query(`
            SELECT p.id, p.first_name, p.last_name, p.room_number, p.department,
                   vs.systolic_bp, vs.diastolic_bp, vs.heart_rate, 
                   vs.temperature, vs.oxygen_saturation, vs.blood_glucose,
                   vs.recorded_at
            FROM patients p
            LEFT JOIN LATERAL (
                SELECT * FROM vital_signs
                WHERE patient_id = p.id
                ORDER BY recorded_at DESC
                LIMIT 1
            ) vs ON true
            WHERE LOWER(p.first_name || ' ' || p.last_name) LIKE LOWER($1)
            LIMIT 1
        `, {
            bind: [`%${patientName}%`]
        });

        if (results.length === 0) {
            return {
                found: false,
                message: `No patient found matching "${patientName}"`
            };
        }

        const patient = results[0];

        // Check Redis cache first
        const cachedVitals = await getCachedVitals(patient.id);
        if (cachedVitals) {
            logger.info(`✅ Cache HIT for vitals: ${patient.id}`);
            return {
                found: true,
                patient: {
                    name: `${patient.first_name} ${patient.last_name}`,
                    room: patient.room_number,
                    department: patient.department
                },
                vitals: cachedVitals,
                cached: true
            };
        }

        // Cache miss - prepare and cache vitals
        const vitals = {
            bloodPressure: patient.systolic_bp && patient.diastolic_bp 
                ? `${patient.systolic_bp}/${patient.diastolic_bp} mmHg`
                : 'N/A',
            heartRate: patient.heart_rate ? `${patient.heart_rate} bpm` : 'N/A',
            temperature: patient.temperature ? `${patient.temperature}°F` : 'N/A',
            oxygenSaturation: patient.oxygen_saturation ? `${patient.oxygen_saturation}%` : 'N/A',
            bloodGlucose: patient.blood_glucose ? `${patient.blood_glucose} mg/dL` : 'N/A',
            recordedAt: patient.recorded_at || null
        };

        await cacheVitals(patient.id, vitals, 60);

        return {
            found: true,
            patient: {
                name: `${patient.first_name} ${patient.last_name}`,
                room: patient.room_number,
                department: patient.department
            },
            vitals,
            cached: false
        };

    } catch (error) {
        logger.error('Error getting patient vitals:', error);
        throw error;
    }
}

/**
 * Search patients with Redis caching
 */
async function searchPatients(entities) {
    try {
        const searchHash = JSON.stringify(entities);
        
        const cached = await getCachedSearchResults(searchHash);
        if (cached) {
            logger.info('✅ Cache HIT for patient search');
            return { ...cached, cached: true };
        }

        let whereClause = ['p.status = $1'];
        const params = ['active'];
        let paramIndex = 2;

        if (entities.condition) {
            whereClause.push(`$${paramIndex} = ANY(p.chronic_conditions)`);
            params.push(entities.condition);
            paramIndex++;
        }

        if (entities.department) {
            whereClause.push(`p.department = $${paramIndex}`);
            params.push(entities.department);
            paramIndex++;
        }

        if (entities.timeframe === 'today') {
            whereClause.push(`p.admission_date >= CURRENT_DATE`);
        } else if (entities.timeframe === 'week') {
            whereClause.push(`p.admission_date >= CURRENT_DATE - INTERVAL '7 days'`);
        }

        const query = `
            SELECT p.id, p.medical_record_number, p.first_name, p.last_name,
                   p.room_number, p.department, p.admission_date,
                   p.chronic_conditions, p.allergies,
                   n.first_name as nurse_first_name, n.last_name as nurse_last_name
            FROM patients p
            LEFT JOIN nurses n ON p.assigned_nurse_id = n.id
            WHERE ${whereClause.join(' AND ')}
            ORDER BY p.admission_date DESC
            LIMIT 20
        `;

        const [results] = await sequelize.query(query, { bind: params });

        const searchResults = {
            found: results.length > 0,
            count: results.length,
            patients: results.map(p => ({
                id: p.id,
                mrn: p.medical_record_number,
                name: `${p.first_name} ${p.last_name}`,
                room: p.room_number,
                department: p.department,
                admittedOn: p.admission_date,
                conditions: p.chronic_conditions,
                allergies: p.allergies,
                assignedNurse: p.nurse_first_name 
                    ? `${p.nurse_first_name} ${p.nurse_last_name}`
                    : 'Unassigned'
            })),
            searchCriteria: entities
        };

        await cacheSearchResults(searchHash, searchResults, 120);

        return { ...searchResults, cached: false };

    } catch (error) {
        logger.error('Error searching patients:', error);
        throw error;
    }
}

/**
 * Prepare meeting data
 */
async function prepareMeetingData(entities) {
    try {
        const [criticalPatients] = await sequelize.query(`
            SELECT p.id, p.first_name, p.last_name, p.room_number,
                   vs.is_critical, COUNT(a.id) as alert_count
            FROM patients p
            LEFT JOIN vital_signs vs ON vs.patient_id = p.id AND vs.is_critical = true
            LEFT JOIN alerts a ON a.patient_id = p.id AND a.is_read = false
            WHERE p.status = 'active'
            GROUP BY p.id, p.first_name, p.last_name, p.room_number, vs.is_critical
            HAVING COUNT(a.id) > 0 OR vs.is_critical = true
            ORDER BY alert_count DESC
            LIMIT 10
        `);

        return {
            suggestedTime: entities.time || '2:00 PM',
            suggestedDate: entities.date || 'tomorrow',
            criticalCases: criticalPatients.map(p => ({
                patient: `${p.first_name} ${p.last_name}`,
                room: p.room_number,
                alertCount: parseInt(p.alert_count)
            })),
            attendeesNeeded: ['ICU Head Nurse', 'ER Supervisor', 'Chief Physician']
        };

    } catch (error) {
        logger.error('Error preparing meeting data:', error);
        throw error;
    }
}

/**
 * Generate shift handoff report
 */
async function generateHandoffReport(entities) {
    try {
        const [patients] = await sequelize.query(`
            SELECT p.first_name, p.last_name, p.room_number, p.department,
                   COUNT(DISTINCT vs.id) as vitals_count,
                   COUNT(DISTINCT ma.id) as medications_count,
                   COUNT(DISTINCT mn.id) as notes_count,
                   MAX(vs.recorded_at) as last_vitals_check
            FROM patients p
            LEFT JOIN vital_signs vs ON vs.patient_id = p.id 
                AND vs.recorded_at > NOW() - INTERVAL '8 hours'
            LEFT JOIN medication_administrations ma ON ma.patient_id = p.id
                AND ma.administered_time > NOW() - INTERVAL '8 hours'
            LEFT JOIN medical_notes mn ON mn.patient_id = p.id
                AND mn.created_at > NOW() - INTERVAL '8 hours'
            WHERE p.status = 'active'
            GROUP BY p.id, p.first_name, p.last_name, p.room_number, p.department
            ORDER BY p.room_number
        `);

        const summary = await watsonxService.generateSummary(
            `Shift handoff for ${patients.length} patients. Key activities include vital signs monitoring, medication administration, and patient notes.`,
            300
        );

        return {
            shiftSummary: summary,
            patientCount: patients.length,
            patients: patients.map(p => ({
                name: `${p.first_name} ${p.last_name}`,
                room: p.room_number,
                department: p.department,
                vitalsChecked: parseInt(p.vitals_count),
                medicationsGiven: parseInt(p.medications_count),
                notesAdded: parseInt(p.notes_count),
                lastVitalsCheck: p.last_vitals_check
            })),
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        logger.error('Error generating handoff report:', error);
        throw error;
    }
}

/**
 * Get critical alerts
 */
async function getCriticalAlerts() {
    try {
        const [alerts] = await sequelize.query(`
            SELECT a.id, a.alert_type, a.severity, a.title, a.message,
                   a.created_at, a.is_acknowledged,
                   p.first_name, p.last_name, p.room_number
            FROM alerts a
            LEFT JOIN patients p ON p.id = a.patient_id
            WHERE a.is_read = false
            ORDER BY 
                CASE a.severity
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    ELSE 4
                END,
                a.created_at DESC
            LIMIT 20
        `);

        return {
            count: alerts.length,
            alerts: alerts.map(a => ({
                id: a.id,
                type: a.alert_type,
                severity: a.severity,
                title: a.title,
                message: a.message,
                patient: a.first_name ? `${a.first_name} ${a.last_name}` : 'N/A',
                room: a.room_number,
                timestamp: a.created_at,
                acknowledged: a.is_acknowledged
            }))
        };

    } catch (error) {
        logger.error('Error getting critical alerts:', error);
        throw error;
    }
}

/**
 * Log agent interaction to database
 */
async function logAgentInteraction(data) {
    try {
        await sequelize.query(`
            INSERT INTO agent_interactions 
            (nurse_id, agent_type, query, intent, confidence_score, 
             execution_time_ms, was_successful, error_message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, {
            bind: [
                data.nurseId,
                data.agentType,
                data.query,
                data.intent || null,
                data.confidence || null,
                data.executionTime || null,
                data.wasSuccessful,
                data.errorMessage || null
            ]
        });
    } catch (error) {
        logger.error('Error logging agent interaction:', error);
    }
}

module.exports = router;
