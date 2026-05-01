const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema(
  { role: { type: String, enum: ['user','assistant'], required: true }, content: { type: String, required: true } },
  { timestamps: true }
);
const scorecardSchema = new mongoose.Schema({
  debugSkillRating: { type: Number, min:1, max:10 },
  summary: String,
  logicalFallacies: [String],
  conceptsToReview: [String],
  strengths: [String],
  generatedAt: { type: Date, default: Date.now },
});
const sessionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, default: 'Debugging Session' },
  language:    { type: String, enum: ['javascript','python','java','cpp'], default: 'javascript' },
  mode:        { type: String, enum: ['socratic','rubber_duck'], default: 'socratic' },
  codeSnippet: { type: String, default: '' },
  status:      { type: String, enum: ['active','completed'], default: 'active' },
  score:       { type: Number, default: 0 },
  messages:    [msgSchema],
  scorecard:   scorecardSchema,
  bugPatterns: [String],
}, { timestamps: true });
sessionSchema.virtual('messageCount').get(function() { return this.messages.length; });
sessionSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Session', sessionSchema);
