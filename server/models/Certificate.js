import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  path: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true },
  certificateId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  pathTitle: { type: String, required: true },
  completionDate: { type: Date, default: Date.now },
  totalLessons: { type: Number, required: true },
  averageScore: { type: Number, default: 0 },
  totalXpEarned: { type: Number, default: 0 },
  timeTaken: { type: String, default: '' }, // e.g., "2 weeks"
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    default: 'B',
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

certificateSchema.index({ user: 1, path: 1 }, { unique: true });

export default mongoose.model('Certificate', certificateSchema);
