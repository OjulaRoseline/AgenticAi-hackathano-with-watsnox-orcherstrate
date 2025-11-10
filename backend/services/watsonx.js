const axios = require('axios');
const logger = require('../utils/logger');

/**
 * IBM watsonx Orchestrate Integration
 * Manages AI agents for hospital operations
 */

class WatsonxService {
    constructor() {
        this.apiKey = process.env.WATSONX_API_KEY;
        this.projectId = process.env.WATSONX_PROJECT_ID;
        this.orchestrateUrl = process.env.WATSONX_ORCHESTRATE_URL;
        this.baseUrl = process.env.WATSONX_BASE_URL || 'https://us-south.ml.cloud.ibm.com';
        
        // Agent configurations
        this.agents = {
            PATIENT_RETRIEVAL: 'patient_retrieval_agent',
            MEETING_COORDINATOR: 'meeting_coordinator_agent',
            SHIFT_HANDOFF: 'shift_handoff_agent',
            EMERGENCY_PRIORITIZER: 'emergency_prioritizer_agent'
        };
    }

    /**
     * Get authentication token for watsonx
     */
    async getAuthToken() {
        try {
            if (!this.apiKey) {
                logger.warn('WATSONX_API_KEY not configured - using local fallback');
                return null;
            }
            
            // Get IBM Cloud IAM token
            const response = await axios.post(
                'https://iam.cloud.ibm.com/identity/token',
                `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${this.apiKey}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                }
            );
            
            logger.info('✅ Got watsonx auth token');
            return response.data.access_token;
        } catch (error) {
            logger.error('❌ Error getting watsonx auth token:', error.message);
            return null;
        }
    }

    /**
     * Analyze natural language query and extract intent
     */
    async analyzeIntent(query) {
        try {
            const token = await this.getAuthToken();
            
            // If no token, use local NLP fallback
            if (!token) {
                return this.localIntentAnalysis(query);
            }

            // Call watsonx.ai for intent analysis
            const response = await axios.post(
                `${this.baseUrl}/ml/v1/text/generation?version=2023-05-29`,
                {
                    input: `Analyze this medical query and extract intent and entities:\n\nQuery: "${query}"\n\nProvide response in JSON format with fields: intent, entities, action, confidence`,
                    model_id: 'ibm/granite-13b-chat-v2',
                    project_id: this.projectId,
                    parameters: {
                        max_new_tokens: 200,
                        temperature: 0.1
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 15000
                }
            );

            const result = JSON.parse(response.data.results[0].generated_text);
            logger.info('watsonx intent analysis:', result);
            return result;

        } catch (error) {
            logger.error('Error analyzing intent with watsonx:', error.message);
            // Fallback to local analysis
            return this.localIntentAnalysis(query);
        }
    }

    /**
     * Local fallback for intent analysis
     * Used when watsonx is not available
     */
    localIntentAnalysis(query) {
        const lowerQuery = query.toLowerCase();
        
        // Patient retrieval patterns
        if (lowerQuery.includes('show') || lowerQuery.includes('get') || 
            lowerQuery.includes('find') || lowerQuery.includes('search')) {
            
            if (lowerQuery.includes('vital') || lowerQuery.includes('bp') || 
                lowerQuery.includes('heart rate') || lowerQuery.includes('temperature')) {
                return {
                    intent: 'get_vitals',
                    entities: this.extractPatientName(query),
                    action: 'retrieve_vitals',
                    confidence: 0.85
                };
            }
            
            if (lowerQuery.includes('patient')) {
                return {
                    intent: 'search_patient',
                    entities: this.extractSearchTerms(query),
                    action: 'search_patients',
                    confidence: 0.80
                };
            }
        }
        
        // Meeting scheduling patterns
        if (lowerQuery.includes('schedule') || lowerQuery.includes('meeting') || 
            lowerQuery.includes('board')) {
            return {
                intent: 'schedule_meeting',
                entities: this.extractMeetingDetails(query),
                action: 'create_meeting',
                confidence: 0.75
            };
        }
        
        // Alert patterns
        if (lowerQuery.includes('alert') || lowerQuery.includes('emergency') || 
            lowerQuery.includes('critical')) {
            return {
                intent: 'check_alerts',
                entities: {},
                action: 'get_alerts',
                confidence: 0.80
            };
        }
        
        // Handoff patterns
        if (lowerQuery.includes('handoff') || lowerQuery.includes('shift') || 
            lowerQuery.includes('report')) {
            return {
                intent: 'generate_handoff',
                entities: this.extractPatientName(query),
                action: 'create_handoff_report',
                confidence: 0.75
            };
        }
        
        return {
            intent: 'unknown',
            entities: {},
            action: 'clarify',
            confidence: 0.20
        };
    }

    extractPatientName(query) {
        const namePattern = /(?:patient\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
        const matches = query.match(namePattern);
        
        if (matches && matches.length > 0) {
            return { patientName: matches[0].replace('patient ', '').trim() };
        }
        
        return {};
    }

    extractSearchTerms(query) {
        const entities = {};
        
        // Medical conditions
        const conditions = ['diabetic', 'hypertension', 'cardiac', 'pneumonia', 'covid'];
        conditions.forEach(condition => {
            if (query.toLowerCase().includes(condition)) {
                entities.condition = condition;
            }
        });
        
        // Departments
        const departments = ['icu', 'er', 'emergency', 'surgical', 'medical'];
        departments.forEach(dept => {
            if (query.toLowerCase().includes(dept)) {
                entities.department = dept.toUpperCase();
            }
        });
        
        // Time references
        if (query.includes('today')) entities.timeframe = 'today';
        if (query.includes('week')) entities.timeframe = 'week';
        if (query.includes('month')) entities.timeframe = 'month';
        
        return entities;
    }

    extractMeetingDetails(query) {
        const entities = {};
        
        // Time patterns
        const timePattern = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
        const timeMatch = query.match(timePattern);
        if (timeMatch) {
            entities.time = timeMatch[0];
        }
        
        // Date patterns
        if (query.includes('tomorrow')) entities.date = 'tomorrow';
        if (query.includes('today')) entities.date = 'today';
        if (query.match(/\d{1,2}\/\d{1,2}/)) {
            entities.date = query.match(/\d{1,2}\/\d{1,2}/)[0];
        }
        
        return entities;
    }

    /**
     * Route query to appropriate agent
     */
    async routeToAgent(query, context = {}) {
        try {
            // Analyze intent
            const intentResult = await this.analyzeIntent(query);
            
            logger.info(`🤖 Routing to agent: ${intentResult.action}`);
            
            // Route to appropriate agent based on intent
            switch (intentResult.action) {
                case 'retrieve_vitals':
                case 'search_patients':
                    return {
                        agent: this.agents.PATIENT_RETRIEVAL,
                        intent: intentResult,
                        response: { action: intentResult.action, entities: intentResult.entities, requiresData: true }
                    };
                
                case 'create_meeting':
                    return {
                        agent: this.agents.MEETING_COORDINATOR,
                        intent: intentResult,
                        response: { action: intentResult.action, entities: intentResult.entities, requiresData: true }
                    };
                
                case 'create_handoff_report':
                    return {
                        agent: this.agents.SHIFT_HANDOFF,
                        intent: intentResult,
                        response: { action: intentResult.action, entities: intentResult.entities, requiresData: true }
                    };
                
                case 'get_alerts':
                    return {
                        agent: this.agents.EMERGENCY_PRIORITIZER,
                        intent: intentResult,
                        response: { action: intentResult.action, entities: intentResult.entities, requiresData: true }
                    };
                
                default:
                    return {
                        agent: 'unknown',
                        intent: intentResult,
                        response: {
                            message: "I'm not sure how to help with that. Could you rephrase your request?",
                            suggestions: [
                                "Show me patient vitals",
                                "Search for diabetic patients",
                                "Schedule a board meeting",
                                "Generate shift handoff report"
                            ]
                        }
                    };
            }
        } catch (error) {
            logger.error('Error routing to agent:', error);
            throw error;
        }
    }

    /**
     * Generate AI summary using watsonx.ai
     */
    async generateSummary(content, maxLength = 200) {
        try {
            const token = await this.getAuthToken();
            
            if (!token) {
                // Simple local summarization
                return content.substring(0, maxLength) + '...';
            }

            const response = await axios.post(
                `${this.baseUrl}/ml/v1/text/generation?version=2023-05-29`,
                {
                    input: `Summarize the following medical information in ${maxLength} characters or less:\n\n${content}`,
                    model_id: 'ibm/granite-13b-chat-v2',
                    project_id: this.projectId,
                    parameters: {
                        max_new_tokens: maxLength,
                        temperature: 0.3
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            return response.data.results[0].generated_text.trim();

        } catch (error) {
            logger.error('Error generating summary:', error.message);
            return content.substring(0, maxLength) + '...';
        }
    }
}

module.exports = new WatsonxService();
