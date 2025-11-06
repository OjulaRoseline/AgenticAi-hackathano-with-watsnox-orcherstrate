const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Slack events webhook
router.post('/slack/events', webhookController.handleSlackEvent);

// ServiceNow webhook (equipment delivery, ticket updates)
router.post('/servicenow/:ticketId', webhookController.handleServiceNowUpdate);

// Google Workspace webhook (account creation confirmation)
router.post('/google/account-created', webhookController.handleGoogleAccountCreated);

// Generic webhook for workflow completion
router.post('/workflow/:workflowId/complete', webhookController.handleWorkflowComplete);

module.exports = router;
