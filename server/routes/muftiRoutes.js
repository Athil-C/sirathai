import express from 'express';
import { Message, Conversation } from '../models/Message.js';
import Grade from '../models/Grade.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { protect, authorize, authorizeMufti } from '../middleware/auth.js';

const router = express.Router();

// ────────── MESSAGING ──────────

// Get conversations (works for both student and mufti)
router.get('/conversations', protect, async (req, res) => {
  try {
    const field = req.user.role === 'mufti' ? 'mufti' : 'student';
    const convos = await Conversation.find({ [field]: req.user._id, isActive: true })
      .populate('student', 'name avatar email')
      .populate('mufti', 'name avatar muftiCategory')
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations: convos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start or get conversation (student initiates)
router.post('/conversations', protect, async (req, res) => {
  try {
    const { muftiId } = req.body;
    if (!muftiId) return res.status(400).json({ success: false, message: 'Mufti ID required' });
    let convo = await Conversation.findOne({ student: req.user._id, mufti: muftiId });
    if (!convo) {
      convo = await Conversation.create({ student: req.user._id, mufti: muftiId });
    }
    const populated = await convo.populate([
      { path: 'student', select: 'name avatar email' },
      { path: 'mufti', select: 'name avatar muftiCategory' },
    ]);
    res.json({ success: true, conversation: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });
    // Verify access
    if (convo.student.toString() !== req.user._id.toString() && convo.mufti.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });
    // Mark as read
    const isMufti = req.user.role === 'mufti';
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );
    if (isMufti) { convo.unreadMufti = 0; } else { convo.unreadStudent = 0; }
    await convo.save();
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message
router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Message content required' });
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const msg = await Message.create({ conversation: req.params.id, sender: req.user._id, content: content.trim() });
    convo.lastMessage = content.trim().substring(0, 100);
    convo.lastMessageAt = new Date();
    const isSender = req.user._id.toString();
    if (isSender === convo.student.toString()) { convo.unreadMufti += 1; }
    else { convo.unreadStudent += 1; }
    await convo.save();
    const populated = await msg.populate('sender', 'name avatar role');
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available muftis (for students)
router.get('/muftis', protect, async (req, res) => {
  try {
    const muftis = await User.find({ role: 'mufti', isActive: true, isSuspended: false })
      .select('name avatar muftiCategory isVerifiedMufti');
    res.json({ success: true, muftis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────── GRADING ──────────

// Get students with their progress (mufti)
router.get('/students', protect, authorizeMufti, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true })
      .select('name email avatar xp level streak coins completedLessons createdAt')
      .sort({ name: 1 });
    // Get progress for each student
    const studentsWithProgress = await Promise.all(students.map(async (s) => {
      const progress = await Progress.find({ user: s._id })
        .populate('lesson', 'title pathSlug type')
        .sort({ updatedAt: -1 }).limit(10);
      const grades = await Grade.find({ student: s._id }).sort({ createdAt: -1 }).limit(5);
      return { ...s.toObject(), recentProgress: progress, recentGrades: grades };
    }));
    res.json({ success: true, students: studentsWithProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign grade to student (mufti)
router.post('/grades', protect, authorizeMufti, async (req, res) => {
  try {
    const { studentId, category, grade, score, feedback, lessonId, pathId } = req.body;
    if (!studentId || !grade) return res.status(400).json({ success: false, message: 'Student and grade required' });
    const gradeDoc = await Grade.create({
      student: studentId,
      mufti: req.user._id,
      lesson: lessonId || null,
      path: pathId || null,
      category: category || 'overall',
      grade, score, feedback,
    });
    res.status(201).json({ success: true, grade: gradeDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get grades for a student
router.get('/grades/:studentId', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId })
      .populate('mufti', 'name avatar')
      .populate('lesson', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
