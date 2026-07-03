import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mufti: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  path: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath' },
  category: { type: String, enum: ['quiz', 'recitation', 'salah_practice', 'wudu_practice', 'overall'], default: 'overall' },
  grade: { type: String, enum: ['excellent', 'good', 'average', 'needs_improvement'], required: true },
  score: { type: Number, min: 0, max: 100 },
  feedback: { type: String },
}, { timestamps: true });

export default mongoose.model('Grade', gradeSchema);
