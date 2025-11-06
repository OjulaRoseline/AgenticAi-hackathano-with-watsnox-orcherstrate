const mongoose = require('mongoose');

const workflowExecutionSchema = new mongoose.Schema({
  workflowId: {
    type: String,
    required: true,
    unique: true
  },
  workflowName: {
    type: String,
    required: true
  },
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding'
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'cancelled'],
    default: 'running'
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed
  },
  steps: [{
    name: String,
    status: String,
    startedAt: Date,
    completedAt: Date,
    output: mongoose.Schema.Types.Mixed,
    error: String
  }],
  error: {
    type: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
workflowExecutionSchema.index({ workflowName: 1, status: 1 });
workflowExecutionSchema.index({ onboardingId: 1 });
workflowExecutionSchema.index({ startedAt: -1 });

module.exports = mongoose.model('WorkflowExecution', workflowExecutionSchema);
