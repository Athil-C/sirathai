import express from 'express';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/progress/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const totalCompleted = await Progress.countDocuments({ user: req.user._id, status: 'completed' });
    const inProgress = await Progress.countDocuments({ user: req.user._id, status: 'in_progress' });

    // Per-path progress
    const pathProgress = await Progress.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $lookup: { from: 'learningpaths', localField: 'path', foreignField: '_id', as: 'pathInfo' } },
      { $unwind: '$pathInfo' },
      { $group: { _id: '$pathInfo.slug', completed: { $sum: 1 }, pathTitle: { $first: '$pathInfo.title' } } },
    ]);

    // Recent activity
    const recentActivity = await Progress.find({ user: req.user._id })
      .populate('lesson', 'title type')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      dashboard: {
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        longestStreak: user.longestStreak,
        totalCompleted,
        inProgress,
        pathProgress,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/progress/:lessonId/step
router.post('/:lessonId/step', protect, async (req, res) => {
  try {
    const { step, score } = req.body;
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    let progress = await Progress.findOne({ user: req.user._id, lesson: lesson._id });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        lesson: lesson._id,
        path: lesson.path,
        status: 'in_progress',
      });
    }

    // Update step
    if (progress.stepsCompleted[step] !== undefined) {
      progress.stepsCompleted[step] = true;
    }

    const user = await User.findById(req.user._id);
    const todayStr = new Date().toDateString();
    if (user.lastActiveDate && new Date(user.lastActiveDate).toDateString() !== todayStr) {
      user.dailyStudyTime = 0;
      user.dailyBonusClaimed = false;
    }
    user.lastActiveDate = new Date();

    let minutesEarned = 3;
    if (step === 'practice') minutesEarned = 5;
    if (step === 'evaluate') minutesEarned = 5;
    user.dailyStudyTime += minutesEarned;
    await user.save();

    if (step === 'evaluate' && score !== undefined) {
      progress.quizScore = score;
      progress.quizAttempts += 1;
    }

    if (step === 'practice' && score !== undefined) {
      progress.practiceScore = score;
    }

    progress.status = 'in_progress';

    // Check if all steps completed
    const allSteps = Object.values(progress.stepsCompleted);
    if (allSteps.every(Boolean)) {
      // Check pass score
      const passedQuiz = !lesson.quiz?.length || progress.quizScore >= lesson.passScore;
      if (passedQuiz) {
        progress.status = 'completed';
        progress.completedAt = new Date();
        progress.xpEarned = lesson.xpReward;

        // Award XP and coins to user
        user.xp += lesson.xpReward;
        user.coins += lesson.coinReward;
        user.level = user.calculateLevel();
        if (!user.completedLessons.includes(lesson._id)) {
          user.completedLessons.push(lesson._id);
        }

        // Update streak
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
      }
    }

    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/progress/:lessonId
router.get('/:lessonId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id, lesson: req.params.lessonId });
    res.json({ success: true, progress: progress || { status: 'not_started', stepsCompleted: {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/progress/study-time
router.post('/study-time', protect, async (req, res) => {
  try {
    const { minutes } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const todayStr = new Date().toDateString();
    if (user.lastActiveDate && new Date(user.lastActiveDate).toDateString() !== todayStr) {
      user.dailyStudyTime = 0;
      user.dailyBonusClaimed = false;
    }
    user.dailyStudyTime += (minutes || 1);
    user.lastActiveDate = new Date();
    await user.save();

    res.json({ success: true, dailyStudyTime: user.dailyStudyTime, dailyGoal: user.dailyGoal, dailyBonusClaimed: user.dailyBonusClaimed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/progress/claim-daily-bonus
router.post('/claim-daily-bonus', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.dailyStudyTime < user.dailyGoal) {
      return res.status(400).json({ success: false, message: 'Daily goal not met yet' });
    }

    if (user.dailyBonusClaimed) {
      return res.status(400).json({ success: false, message: 'Daily bonus already claimed for today' });
    }

    user.dailyBonusClaimed = true;
    user.lastBonusClaimedDate = new Date().toDateString();
    user.xp += 50; // 50 XP bonus
    user.coins += 10; // 10 coins bonus
    user.level = user.calculateLevel();
    await user.save();

    res.json({ success: true, xp: user.xp, coins: user.coins, level: user.level, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
