import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  path: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  // Step completion tracking
  stepsCompleted: {
    learn: { type: Boolean, default: false },
    observe: { type: Boolean, default: false },
    practice: { type: Boolean, default: false },
    evaluate: { type: Boolean, default: false },
    mastery: { type: Boolean, default: false },
  },
  // Quiz results
  quizScore: { type: Number, default: 0 },
  quizAttempts: { type: Number, default: 0 },
  // Practice results (worship / recitation)
  practiceScore: { type: Number, default: 0 },
  practiceData: { type: mongoose.Schema.Types.Mixed, default: {} },
  // XP earned from this lesson
  xpEarned: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

// Compound index: one progress record per user per lesson
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
