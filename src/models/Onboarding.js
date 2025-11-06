const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  managerId: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  accounts: {
    emailCreated: { type: Boolean, default: false },
    slackInvited: { type: Boolean, default: false },
    googleWorkspace: { type: Boolean, default: false },
    githubInvited: { type: Boolean, default: false }
  },
  equipment: {
    requested: { type: Boolean, default: false },
    ticketId: { type: String },
    delivered: { type: Boolean, default: false }
  },
  buddyId: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
onboardingSchema.index({ status: 1, department: 1 });
onboardingSchema.index({ startDate: 1 });
onboardingSchema.index({ email: 1 });

module.exports = mongoose.model('Onboarding', onboardingSchema);
