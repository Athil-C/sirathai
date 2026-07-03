import express from 'express';
import LearningPath from '../models/LearningPath.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/paths
router.get('/', protect, async (req, res) => {
  try {
    const paths = await LearningPath.find({ isActive: true }).sort({ order: 1 });

    // Get progress for each path
    const pathsWithProgress = await Promise.all(
      paths.map(async (path) => {
        const totalLessons = await Lesson.countDocuments({ path: path._id, isActive: true });
        const completedLessons = await Progress.countDocuments({
          user: req.user._id,
          path: path._id,
          status: 'completed',
        });

        return {
          ...path.toObject(),
          totalLessons,
          completedLessons,
          progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        };
      })
    );

    res.json({ success: true, paths: pathsWithProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/paths/:slug
router.get('/:slug', protect, async (req, res) => {
  try {
    const path = await LearningPath.findOne({ slug: req.params.slug });
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });

    const lessons = await Lesson.find({ path: path._id, isActive: true }).sort({ order: 1 });

    // Get progress for each lesson
    const lessonsWithProgress = await Promise.all(
      lessons.map(async (lesson) => {
        const progress = await Progress.findOne({ user: req.user._id, lesson: lesson._id });
        return {
          ...lesson.toObject(),
          progress: progress || { status: 'not_started', stepsCompleted: {} },
        };
      })
    );

    // Determine locked/unlocked status
    const enrichedLessons = lessonsWithProgress.map((lesson, index) => {
      let isUnlocked = false;
      if (index === 0) {
        isUnlocked = true; // First lesson always unlocked
      } else {
        const prevLesson = lessonsWithProgress[index - 1];
        isUnlocked = prevLesson.progress.status === 'completed';
      }
      return { ...lesson, isUnlocked };
    });

    res.json({ success: true, path, lessons: enrichedLessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/paths (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const path = await LearningPath.create(req.body);
    res.status(201).json({ success: true, path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
