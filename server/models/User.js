import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'mufti', 'admin'],
    default: 'student',
  },
  avatar: {
    type: String,
    default: '',
  },
  // Onboarding
  onboardingComplete: { type: Boolean, default: false },
  journeyType: {
    type: String,
    enum: ['new_muslim', 'exploring', 'returning', null],
    default: null,
  },
  dailyGoal: {
    type: Number, // minutes per day
    default: 15,
  },
  language: {
    type: String,
    default: 'en',
  },
  // Mufti-specific
  muftiCategory: {
    type: String,
    enum: ['thareeq', 'fiqh', 'quran', 'aqeeda', null],
    default: null,
  },
  isVerifiedMufti: {
    type: Boolean,
    default: false,
  },
  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  dailyStudyTime: { type: Number, default: 0 },
  dailyBonusClaimed: { type: Boolean, default: false },
  lastBonusClaimedDate: { type: String, default: "" },
  dailyXp: { type: Number, default: 0 },
  weeklyXp: { type: Number, default: 0 },
  monthlyXp: { type: Number, default: 0 },
  lastXpReset: { type: Date, default: null },
  // Badges
  badges: [{
    name: String,
    icon: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  // Daily tasks tracking
  dailyTasks: [{
    task: String,
    completed: { type: Boolean, default: false },
    date: Date,
  }],
  // Progress
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath' }],
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }],
  // Account status
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate level from XP (progressive difficulty)
userSchema.methods.calculateLevel = function () {
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-450, etc.
  let xp = this.xp;
  let level = 1;
  let required = 100;
  while (xp >= required) {
    xp -= required;
    level++;
    required = Math.floor(100 * Math.pow(1.3, level - 1));
  }
  return level;
};

// Get XP required for next level
userSchema.methods.getXpForNextLevel = function () {
  let xp = this.xp;
  let level = 1;
  let required = 100;
  while (xp >= required) {
    xp -= required;
    level++;
    required = Math.floor(100 * Math.pow(1.3, level - 1));
  }
  return { currentLevelXp: xp, requiredXp: required, level };
};

export default mongoose.model('User', userSchema);
