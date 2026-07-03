import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: { type: String, required: true },
  longDescription: { type: String, default: '' },
  icon: { type: String, default: '📖' },
  color: { type: String, default: '#10b981' },
  gradient: { type: String, default: 'from-emerald-500 to-emerald-600' },
  totalLessons: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  topics: [String],
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('LearningPath', learningPathSchema);
