const winston = require('winston');
const watsonxService = require('../../services/watsonxService');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Send a message to the AI assistant
 */
exports.sendMessage = async (req, res) => {
  try {
    const { employeeId, message } = req.body;

    if (!employeeId || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['employeeId', 'message']
      });
    }

    logger.info(`Processing chat message from employee ${employeeId}`);

    // Classify intent using watsonx
    const intent = await watsonxService.classifyIntent(message);

    // Generate response based on intent
    let response;
    switch (intent) {
      case 'question_about_schedule':
        response = await handleScheduleQuestion(employeeId, message);
        break;
      case 'question_about_equipment':
        response = await handleEquipmentQuestion(employeeId, message);
        break;
      case 'question_about_benefits':
        response = await handleBenefitsQuestion(employeeId, message);
        break;
      case 'request_help':
        response = await handleHelpRequest(employeeId, message);
        break;
      default:
        response = await watsonxService.generateResponse(message, employeeId);
    }

    // Save to chat history
    // TODO: Save to database

    res.json({
      message: response,
      intent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error processing chat message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
};

/**
 * Get chat history for an employee
 */
exports.getHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // TODO: Fetch from database
    const history = [
      {
        id: 1,
        employeeId,
        message: 'When is my first day?',
        response: 'Your first day is November 15, 2024. We\'re excited to have you!',
        intent: 'question_about_schedule',
        timestamp: '2024-11-10T14:30:00Z'
      },
      {
        id: 2,
        employeeId,
        message: 'What equipment will I receive?',
        response: 'You\'ll receive a MacBook Pro 16", dual 27" monitors, keyboard, mouse, and headset. Everything will be set up at your desk before you arrive.',
        intent: 'question_about_equipment',
        timestamp: '2024-11-10T14:32:00Z'
      }
    ];

    res.json({
      count: history.length,
      history
    });

  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

/**
 * Get suggested questions for an employee
 */
exports.getSuggestions = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // TODO: Generate personalized suggestions based on onboarding stage
    const suggestions = [
      "What's on my schedule for today?",
      "Where can I find the employee handbook?",
      "Who is my assigned buddy?",
      "When is my first team meeting?",
      "How do I access the company VPN?"
    ];

    res.json({ suggestions });

  } catch (error) {
    logger.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

/**
 * Provide feedback on a chat response
 */
exports.provideFeedback = async (req, res) => {
  try {
    const { messageId, helpful } = req.body;

    logger.info(`Feedback received for message ${messageId}: ${helpful ? 'helpful' : 'not helpful'}`);

    // TODO: Save feedback to database for model improvement

    res.json({
      message: 'Thank you for your feedback!',
      messageId,
      helpful
    });

  } catch (error) {
    logger.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
};

// Helper functions

async function handleScheduleQuestion(employeeId, question) {
  // TODO: Query schedule from database
  return "Your schedule for today includes:\n• 9:00 AM - IT Setup\n• 11:00 AM - Team Introduction\n• 2:00 PM - HR Benefits Overview";
}

async function handleEquipmentQuestion(employeeId, question) {
  // TODO: Query equipment status from ServiceNow
  return "Your equipment is ready! You'll receive:\n• MacBook Pro 16\"\n• Dual 27\" monitors\n• Wireless keyboard and mouse\n• Noise-canceling headset\n\nEverything will be at your desk on your first day.";
}

async function handleBenefitsQuestion(employeeId, question) {
  return "You'll learn about our comprehensive benefits package in your HR orientation. This includes health insurance, 401(k) matching, unlimited PTO, and more. Your benefits enrollment meeting is scheduled for your second day.";
}

async function handleHelpRequest(employeeId, question) {
  // Escalate to HR
  logger.info(`Escalating help request from ${employeeId}`);
  return "I've notified the HR team about your request. Someone will reach out to you within 2 hours. In the meantime, you can also email hr@company.com or call ext. 1234.";
}
