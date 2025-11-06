const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const onboardingController = require('../controllers/onboardingController');

// Create new onboarding instance
router.post('/create', authenticateToken, onboardingController.createOnboarding);

// Get onboarding details
router.get('/:id', authenticateToken, onboardingController.getOnboarding);

// Get all onboardings (with filters)
router.get('/', authenticateToken, onboardingController.getAllOnboardings);

// Update onboarding status
router.patch('/:id/status', authenticateToken, onboardingController.updateStatus);

// Get onboarding tasks
router.get('/:id/tasks', authenticateToken, onboardingController.getTasks);

// Update task status
router.patch('/:id/tasks/:taskId', authenticateToken, onboardingController.updateTask);

// Get onboarding progress
router.get('/:id/progress', authenticateToken, onboardingController.getProgress);

// Trigger specific workflow
router.post('/:id/workflows/:workflowName', authenticateToken, onboardingController.triggerWorkflow);

// Delete onboarding (soft delete)
router.delete('/:id', authenticateToken, onboardingController.deleteOnboarding);

module.exports = router;
