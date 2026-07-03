import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, enum: ['inappropriate_behavior', 'wrong_information', 'harassment', 'spam', 'other'], required: true },
  description: { type: String, required: true },
  evidence: [{ type: String }], // URLs or text evidence
  status: { type: String, enum: ['pending', 'reviewed', 'action_taken', 'dismissed'], default: 'pending' },
  adminNotes: { type: String },
  actionTaken: { type: String, enum: ['none', 'warning', 'suspension', 'removal'], default: 'none' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
