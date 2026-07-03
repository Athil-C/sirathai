import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'siratai_secret_key_dev', { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, language: language || 'en' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        avatar: user.avatar,
        onboardingComplete: user.onboardingComplete,
        journeyType: user.journeyType,
        dailyGoal: user.dailyGoal,
        language: user.language,
        muftiCategory: user.muftiCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }

    // Update streak
    const now = new Date();
    const lastActive = user.lastActiveDate;
    if (lastActive) {
      const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak += 1;
        if (user.streak > user.longestStreak) user.longestStreak = user.streak;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = now;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        longestStreak: user.longestStreak,
        avatar: user.avatar,
        onboardingComplete: user.onboardingComplete,
        journeyType: user.journeyType,
        dailyGoal: user.dailyGoal,
        language: user.language,
        muftiCategory: user.muftiCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        longestStreak: user.longestStreak,
        avatar: user.avatar,
        onboardingComplete: user.onboardingComplete,
        journeyType: user.journeyType,
        dailyGoal: user.dailyGoal,
        language: user.language,
        muftiCategory: user.muftiCategory,
        completedLessons: user.completedLessons,
        achievements: user.achievements,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
