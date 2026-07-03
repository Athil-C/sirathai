import express from 'express';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import LearningPath from '../models/LearningPath.js';
import Report from '../models/Report.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ────────── USER MANAGEMENT ──────────

// Create user (admin)
router.post('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, muftiCategory } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });
    const userData = { name, email, password, role: role || 'student', onboardingComplete: true };
    if (role === 'mufti' && muftiCategory) {
      userData.muftiCategory = muftiCategory;
      userData.isVerifiedMufti = true;
    }
    const user = await User.create(userData);
    res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, isSuspended: user.isSuspended, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user (admin)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin accounts' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle suspend/activate (admin)
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { action } = req.body; // 'suspend' or 'activate'
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isSuspended = action === 'suspend';
    user.isActive = action !== 'suspend';
    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, isSuspended: user.isSuspended, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────── LESSON MANAGEMENT ──────────

// Create lesson (admin/mufti)
router.post('/lessons', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const { title, description, pathSlug, type, nodeType, xpReward, coinReward, learnContent, observeContent, practiceContent, quiz } = req.body;
    const path = await LearningPath.findOne({ slug: pathSlug });
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });
    const lastLesson = await Lesson.findOne({ path: path._id }).sort({ order: -1 });
    const order = (lastLesson?.order || 0) + 1;
    const lesson = await Lesson.create({
      title, description, path: path._id, pathSlug, order,
      type: type || 'theory', nodeType: nodeType || 'lesson',
      xpReward: xpReward || 25, coinReward: coinReward || 5,
      learnContent: learnContent || { sections: [{ heading: title, body: description, icon: '📖' }] },
      observeContent: observeContent || { title, description, steps: [] },
      practiceContent: practiceContent || { type: 'flashcards', cards: [] },
      quiz: quiz || [], passScore: 70,
    });
    path.totalLessons = await Lesson.countDocuments({ path: path._id, isActive: true });
    await path.save();
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lesson
router.put('/lessons/:id', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete lesson
router.delete('/lessons/:id', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    lesson.isActive = false;
    await lesson.save();
    const path = await LearningPath.findById(lesson.path);
    if (path) {
      path.totalLessons = await Lesson.countDocuments({ path: path._id, isActive: true });
      await path.save();
    }
    res.json({ success: true, message: 'Lesson removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────── SUBJECT (PATH) MANAGEMENT ──────────

// Create path
router.post('/paths', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const { title, slug, description, icon, color, difficulty, topics } = req.body;
    if (!title || !slug) return res.status(400).json({ success: false, message: 'Title and slug required' });
    const exists = await LearningPath.findOne({ slug });
    if (exists) return res.status(400).json({ success: false, message: 'Slug already exists' });
    const lastPath = await LearningPath.findOne().sort({ order: -1 });
    const path = await LearningPath.create({
      title, slug, description, icon: icon || '📚', color: color || '#10b981',
      order: (lastPath?.order || 0) + 1, difficulty: difficulty || 'beginner',
      topics: topics || [], totalLessons: 0,
    });
    res.status(201).json({ success: true, path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update path
router.put('/paths/:id', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const path = await LearningPath.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });
    res.json({ success: true, path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete path
router.delete('/paths/:id', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);
    if (!path) return res.status(404).json({ success: false, message: 'Path not found' });
    path.isActive = false;
    await path.save();
    await Lesson.updateMany({ path: path._id }, { isActive: false });
    res.json({ success: true, message: 'Path and its lessons removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────── REPORT MANAGEMENT ──────────

// Get all reports (admin)
router.get('/reports', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('reportedUser', 'name email role avatar muftiCategory')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Review report and take action (admin)
router.put('/reports/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNotes, actionTaken } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    report.status = status || report.status;
    report.adminNotes = adminNotes || report.adminNotes;
    report.actionTaken = actionTaken || report.actionTaken;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    // Take action on reported user
    if (actionTaken === 'suspension' || actionTaken === 'warning') {
      const reported = await User.findById(report.reportedUser);
      if (reported && actionTaken === 'suspension') {
        reported.isSuspended = true;
        reported.isActive = false;
        await reported.save();
      }
    }
    if (actionTaken === 'removal') {
      await User.findByIdAndDelete(report.reportedUser);
    }

    await report.save();
    const populated = await report.populate([
      { path: 'reporter', select: 'name email' },
      { path: 'reportedUser', select: 'name email role' },
    ]);
    res.json({ success: true, report: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit report (student)
router.post('/reports', protect, async (req, res) => {
  try {
    const { reportedUserId, reason, description, evidence } = req.body;
    if (!reportedUserId || !reason || !description) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason, description,
      evidence: evidence || [],
    });
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all lessons for admin (including inactive)
router.get('/all-lessons', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const { pathSlug } = req.query;
    const query = pathSlug ? { pathSlug } : {};
    const lessons = await Lesson.find(query).populate('path', 'title slug icon').sort({ pathSlug: 1, order: 1 });
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all paths for admin (including inactive)
router.get('/all-paths', protect, authorize('admin', 'mufti'), async (req, res) => {
  try {
    const paths = await LearningPath.find().sort({ order: 1 });
    res.json({ success: true, paths });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
