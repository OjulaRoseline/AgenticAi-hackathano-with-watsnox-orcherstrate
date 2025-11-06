const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Send message to AI assistant
router.post('/message', authenticateToken, chatController.sendMessage);

// Get chat history
router.get('/history/:employeeId', authenticateToken, chatController.getHistory);

// Get suggested questions
router.get('/suggestions/:employeeId', authenticateToken, chatController.getSuggestions);

// Mark message as helpful/not helpful
router.post('/feedback', authenticateToken, chatController.provideFeedback);

module.exports = router;
