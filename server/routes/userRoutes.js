import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('achievements')
      .populate('completedLessons');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = ['name', 'avatar', 'journeyType', 'dailyGoal', 'language', 'onboardingComplete'];
    const user = await User.findById(req.user._id);
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Streak management: update streak on daily activity
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      const lastDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
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
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    let dateFilter = {};

    if (period === 'daily') {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      dateFilter = { lastActiveDate: { $gte: dayAgo } };
    } else if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { lastActiveDate: { $gte: weekAgo } };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { lastActiveDate: { $gte: monthAgo } };
    }

    const users = await User.find({ role: 'student', isActive: true, ...dateFilter })
      .select('name avatar xp level streak')
      .sort({ xp: -1 })
      .limit(50);

    res.json({ success: true, leaderboard: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: 'i' };

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id/suspend (Admin only)
router.put('/:id/suspend', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id/role (Admin only)
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, muftiCategory } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.role = role;
    if (role === 'mufti' && muftiCategory) {
      user.muftiCategory = muftiCategory;
      user.isVerifiedMufti = true;
    }
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
