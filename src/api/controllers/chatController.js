const winston = require('winston');
const ChatMessage = require('../../models/ChatMessage');
const Onboarding = require('../../models/Onboarding');
const Task = require('../../models/Task');
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

    // Save to chat history in database
    const chatMessage = new ChatMessage({
      employeeId,
      message,
      response,
      intent
    });

    await chatMessage.save();

    res.json({
      messageId: chatMessage._id,
      message: response,
      intent,
      timestamp: chatMessage.createdAt
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

    // Fetch from database
    const history = await ChatMessage
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await ChatMessage.countDocuments({ employeeId });

    res.json({
      count: history.length,
      total,
      history: history.map(h => ({
        id: h._id,
        employeeId: h.employeeId,
        message: h.message,
        response: h.response,
        intent: h.intent,
        helpful: h.helpful,
        timestamp: h.createdAt
      }))
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

    // Save feedback to database
    const chatMessage = await ChatMessage.findByIdAndUpdate(
      messageId,
      { helpful },
      { new: true }
    );

    if (!chatMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

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
  // Query tasks scheduled for today
  const onboarding = await Onboarding.findOne({ employeeId });
  if (!onboarding) {
    return "I couldn't find your onboarding information. Please contact HR for assistance.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await Task.find({
    onboardingId: onboarding._id,
    dueDate: { $gte: today, $lt: tomorrow },
    status: { $ne: 'completed' }
  }).sort({ order: 1 });

  if (tasks.length === 0) {
    return "You have no scheduled tasks for today. Enjoy your day!";
  }

  const taskList = tasks.map(t => `• ${t.name}`).join('\n');
  return `Your schedule for today includes:\n${taskList}`;
}

async function handleEquipmentQuestion(employeeId, question) {
  const onboarding = await Onboarding.findOne({ employeeId });
  if (!onboarding) {
    return "I couldn't find your equipment information. Please contact IT support.";
  }

  if (onboarding.equipment.delivered) {
    return "Your equipment has been delivered and should be at your desk!";
  } else if (onboarding.equipment.requested) {
    return `Your equipment has been requested (Ticket: ${onboarding.equipment.ticketId}). It will be ready before your first day.`;
  } else {
    return "Your equipment will be requested soon. You'll receive an update within 24 hours.";
  }
}

async function handleBenefitsQuestion(employeeId, question) {
  return "You'll learn about our comprehensive benefits package in your HR orientation. This includes health insurance, 401(k) matching, unlimited PTO, and more. Your benefits enrollment meeting is scheduled for your second day.";
}

async function handleHelpRequest(employeeId, question) {
  // Escalate to HR
  logger.info(`Escalating help request from ${employeeId}`);
  return "I've notified the HR team about your request. Someone will reach out to you within 2 hours. In the meantime, you can also email hr@company.com or call ext. 1234.";
}
