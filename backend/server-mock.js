// Mock server for hackathon demo - no database required!
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mockNurses, mockPatients, mockVitals, mockAlerts } = require('./mockData');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Mock session storage (in-memory)
const sessions = new Map();

console.log('🏥 Starting MediFlow AI Mock Server...\n');

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MediFlow AI Mock Server Running',
        mode: 'DEMO MODE - No database required',
        timestamp: new Date().toISOString()
    });
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const nurse = mockNurses.find(n => n.email === email);
        
        if (!nurse) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, nurse.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: nurse.id, email: nurse.email, role: nurse.role },
            process.env.JWT_SECRET || 'mediflow-secret',
            { expiresIn: '24h' }
        );
        
        const sessionId = Date.now().toString();
        sessions.set(sessionId, { nurseId: nurse.id, email: nurse.email });
        
        console.log(`✅ Login successful: ${email}`);
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            sessionId,
            user: {
                id: nurse.id,
                email: nurse.email,
                firstName: nurse.first_name,
                lastName: nurse.last_name,
                role: nurse.role,
                department: nurse.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, department } = req.body;
    
    if (mockNurses.find(n => n.email === email)) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const newNurse = {
        id: (mockNurses.length + 1).toString(),
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: 'nurse',
        department,
        is_active: true
    };
    
    mockNurses.push(newNurse);
    
    const token = jwt.sign(
        { id: newNurse.id, email: newNurse.email },
        process.env.JWT_SECRET || 'mediflow-secret',
        { expiresIn: '24h' }
    );
    
    console.log(`✅ New nurse registered: ${email}`);
    
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
            id: newNurse.id,
            email: newNurse.email,
            firstName: newNurse.first_name,
            lastName: newNurse.last_name,
            role: newNurse.role,
            department: newNurse.department
        }
    });
});

// Patient Routes
app.get('/api/patients', (req, res) => {
    console.log('📋 Fetching patients...');
    res.json({
        success: true,
        patients: mockPatients,
        count: mockPatients.length
    });
});

app.get('/api/patients/:id', (req, res) => {
    const patient = mockPatients.find(p => p.id === req.params.id || p.medical_record_number === req.params.id);
    
    if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    
    res.json({ success: true, data: patient });
});

// Vitals Routes
app.get('/api/vitals', (req, res) => {
    const { patientId } = req.query;
    
    let vitals = mockVitals;
    if (patientId) {
        vitals = mockVitals.filter(v => v.patient_id === patientId);
    }
    
    res.json({ success: true, data: vitals, count: vitals.length });
});

// Alerts Routes
app.get('/api/alerts', (req, res) => {
    console.log('🚨 Fetching alerts...');
    res.json({
        success: true,
        alerts: mockAlerts,
        count: mockAlerts.length
    });
});

// Agent Query Route
app.post('/api/agents/query', (req, res) => {
    const { query } = req.body;
    console.log(`🤖 AI Query: "${query}"`);
    
    const lowerQuery = query.toLowerCase();
    
    // Check for vitals query with patient name
    if (lowerQuery.includes('vital')) {
        // Find the patient by name
        let patient = null;
        if (lowerQuery.includes('john doe')) {
            patient = mockPatients.find(p => p.first_name === 'John' && p.last_name === 'Doe');
        } else if (lowerQuery.includes('sarah smith')) {
            patient = mockPatients.find(p => p.first_name === 'Sarah' && p.last_name === 'Smith');
        } else if (lowerQuery.includes('robert johnson')) {
            patient = mockPatients.find(p => p.first_name === 'Robert' && p.last_name === 'Johnson');
        }
        
        if (patient) {
            const vitals = mockVitals.find(v => v.patient_id === patient.id);
            return res.json({
                success: true,
                agent: 'patient_retrieval_agent',
                intent: { intent: 'get_vitals', confidence: 0.95 },
                data: {
                    patient: {
                        name: `${patient.first_name} ${patient.last_name}`,
                        department: patient.department,
                        room: patient.room_number
                    },
                    vitals: vitals ? {
                        bloodPressure: `${vitals.systolic_bp}/${vitals.diastolic_bp} mmHg`,
                        heartRate: `${vitals.heart_rate} bpm`,
                        temperature: `${vitals.temperature}°F`,
                        oxygenSaturation: `${vitals.oxygen_saturation}%`,
                        bloodGlucose: vitals.blood_glucose ? `${vitals.blood_glucose} mg/dL` : 'N/A'
                    } : null,
                    cached: true
                }
            });
        }
        
        // Generic vitals response
        return res.json({
            success: true,
            agent: 'patient_retrieval_agent',
            intent: { intent: 'get_vitals', confidence: 0.75 },
            data: {
                message: 'Please specify a patient name (e.g., "Show me John Doe\'s vitals")'
            }
        });
    }
    
    // Patient search
    if (lowerQuery.includes('patient') || lowerQuery.includes('find') || lowerQuery.includes('search')) {
        let filteredPatients = mockPatients;
        
        // Filter by condition
        if (lowerQuery.includes('diabetic')) {
            filteredPatients = mockPatients.filter(p => 
                p.chronic_conditions && p.chronic_conditions.includes('diabetic')
            );
        } else if (lowerQuery.includes('cardiac')) {
            filteredPatients = mockPatients.filter(p => 
                p.chronic_conditions && p.chronic_conditions.includes('cardiac')
            );
        }
        
        // Filter by department
        if (lowerQuery.includes('icu')) {
            filteredPatients = filteredPatients.filter(p => p.department === 'ICU');
        } else if (lowerQuery.includes('er') || lowerQuery.includes('emergency')) {
            filteredPatients = filteredPatients.filter(p => p.department === 'ER');
        }
        
        return res.json({
            success: true,
            agent: 'patient_retrieval_agent',
            intent: { intent: 'search_patient', confidence: 0.90 },
            data: {
                patients: filteredPatients.map(p => ({
                    name: `${p.first_name} ${p.last_name}`,
                    room: p.room_number,
                    department: p.department,
                    conditions: p.chronic_conditions || []
                })),
                count: filteredPatients.length,
                cached: true
            }
        });
    }
    
    // Alerts query
    if (lowerQuery.includes('alert') || lowerQuery.includes('critical') || lowerQuery.includes('emergency')) {
        return res.json({
            success: true,
            agent: 'emergency_prioritizer_agent',
            intent: { intent: 'check_alerts', confidence: 0.95 },
            data: {
                alerts: mockAlerts.map(a => {
                    const patient = mockPatients.find(p => p.id === a.patient_id);
                    return {
                        title: a.title,
                        severity: a.severity,
                        message: a.message,
                        patient: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
                        room: patient ? patient.room_number : 'N/A'
                    };
                }),
                count: mockAlerts.length
            }
        });
    }
    
    // Handoff report
    if (lowerQuery.includes('handoff') || lowerQuery.includes('shift') || lowerQuery.includes('report')) {
        return res.json({
            success: true,
            agent: 'shift_handoff_agent',
            intent: { intent: 'generate_handoff', confidence: 0.90 },
            data: {
                shiftSummary: 'All patients stable. One critical alert for Sarah Smith (elevated BP). Medications administered on schedule.',
                patientCount: mockPatients.length,
                patients: mockPatients.map(p => ({
                    name: `${p.first_name} ${p.last_name}`,
                    vitalsChecked: 3,
                    medicationsGiven: 2
                }))
            }
        });
    }
    
    // Default response
    res.json({
        success: true,
        agent: 'unknown',
        intent: { intent: 'unknown', confidence: 0.20 },
        data: {
            message: 'I can help you with: patient searches, vitals, alerts, and shift reports!',
            suggestions: [
                "Show me John Doe's vitals",
                'Find diabetic patients in ICU',
                'Show critical alerts',
                'Generate shift handoff report'
            ]
        }
    });
});

// Catch all 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('\n✅ MediFlow AI Mock Server Started!');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📱 Frontend: http://localhost:5173`);
    console.log('\n📧 Demo Credentials:');
    console.log('   Email: alice.nurse@mediflow.ai');
    console.log('   Password: demo123');
    console.log('\n🎯 Mode: DEMO (No database required)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
