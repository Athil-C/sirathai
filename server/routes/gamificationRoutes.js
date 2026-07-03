import express from 'express';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import Progress from '../models/Progress.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/gamification/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const totalCompleted = await Progress.countDocuments({ user: req.user._id, status: 'completed' });

    res.json({
      success: true,
      stats: {
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        longestStreak: user.longestStreak,
        totalCompleted,
        xpToNextLevel: ((user.level) * 100) - user.xp,
        levelProgress: (user.xp % 100),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/gamification/achievements
router.get('/achievements', protect, async (req, res) => {
  try {
    const allAchievements = await Achievement.find({ isActive: true });
    const user = await User.findById(req.user._id);

    const achievementsWithStatus = allAchievements.map((a) => ({
      ...a.toObject(),
      unlocked: user.achievements.includes(a._id),
    }));

    res.json({ success: true, achievements: achievementsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/gamification/check-achievements
router.post('/check-achievements', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const totalCompleted = await Progress.countDocuments({ user: req.user._id, status: 'completed' });

    const allAchievements = await Achievement.find({ isActive: true });
    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      if (user.achievements.includes(achievement._id)) continue;

      let earned = false;
      switch (achievement.condition.type) {
        case 'lessons_completed':
          earned = totalCompleted >= achievement.condition.value;
          break;
        case 'streak_days':
          earned = user.streak >= achievement.condition.value;
          break;
        case 'xp_earned':
          earned = user.xp >= achievement.condition.value;
          break;
        case 'level_reached':
          earned = user.level >= achievement.condition.value;
          break;
      }

      if (earned) {
        user.achievements.push(achievement._id);
        user.xp += achievement.xpReward;
        user.coins += achievement.coinReward;
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      user.level = user.calculateLevel();
      await user.save();
    }

    res.json({ success: true, newlyUnlocked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
