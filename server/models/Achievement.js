import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  category: {
    type: String,
    enum: ['learning', 'worship', 'quran', 'streak', 'community', 'milestone'],
    required: true,
  },
  condition: {
    type: { type: String, required: true }, // e.g., 'lessons_completed', 'streak_days', 'path_completed'
    value: { type: Number, required: true },
    path: { type: String, default: null }, // specific path if needed
  },
  xpReward: { type: Number, default: 50 },
  coinReward: { type: Number, default: 20 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);
