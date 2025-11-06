const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['training', 'technical', 'meeting', 'administrative', 'social', 'equipment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  assignedTo: {
    type: String
  },
  notes: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ onboardingId: 1, status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
