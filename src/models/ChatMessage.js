const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    enum: [
      'question_about_schedule',
      'question_about_equipment',
      'question_about_benefits',
      'question_about_buddy',
      'request_help',
      'general_query',
      'greeting',
      'farewell'
    ]
  },
  helpful: {
    type: Boolean
  },
  context: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
chatMessageSchema.index({ employeeId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
