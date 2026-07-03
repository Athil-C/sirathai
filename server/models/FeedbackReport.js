import mongoose from 'mongoose';

const feedbackReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  path: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true },
  pathTitle: { type: String, required: true },
  // Performance analysis
  strengths: [String],
  weaknesses: [String],
  overallScore: { type: Number, default: 0 },
  // Detailed breakdown
  lessonScores: [{
    lessonTitle: String,
    quizScore: Number,
    practiceScore: Number,
    completionTime: String,
  }],
  // Learning progress
  totalLessonsCompleted: { type: Number, default: 0 },
  totalQuizzesPassed: { type: Number, default: 0 },
  averageQuizScore: { type: Number, default: 0 },
  totalPracticeHours: { type: Number, default: 0 },
  // Practice performance
  practiceAreas: [{
    area: String,
    score: Number,
    feedback: String,
  }],
  // Recommendations
  recommendedCourses: [String],
  areasForImprovement: [String],
  nextSteps: [String],
  // Report metadata
  generatedAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

feedbackReportSchema.index({ user: 1, path: 1 });

export default mongoose.model('FeedbackReport', feedbackReportSchema);
