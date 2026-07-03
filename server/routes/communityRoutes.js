import express from 'express';
import { CommunityPost, Comment } from '../models/Community.js';
import { protect, authorizeMufti } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/community/:community/posts
router.get('/:community/posts', protect, async (req, res) => {
  try {
    const { community } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await CommunityPost.find({ community, isActive: true })
      .populate('author', 'name avatar role')
      .populate('evaluatedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments({ community, isActive: true });

    res.json({ success: true, posts, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/community/:community/posts
router.post('/:community/posts', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await CommunityPost.create({
      author: req.user._id,
      community: req.params.community,
      title,
      content,
    });

    const populated = await post.populate('author', 'name avatar role');
    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/community/posts/:postId/evaluate (Mufti only)
router.post('/posts/:postId/evaluate', protect, authorizeMufti, async (req, res) => {
  try {
    const { status, response } = req.body;
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Verify Mufti is assigned to this community
    if (req.user.role === 'mufti' && req.user.muftiCategory !== post.community) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this community' });
    }

    post.evaluatedBy = req.user._id;
    post.evaluation = { status, response, evaluatedAt: new Date() };
    await post.save();

    const populated = await post.populate([
      { path: 'author', select: 'name avatar' },
      { path: 'evaluatedBy', select: 'name avatar' },
    ]);

    res.json({ success: true, post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/community/posts/:postId/like
router.post('/posts/:postId/like', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id;
    const index = post.likes.indexOf(userId);
    if (index > -1) {
      post.likes.splice(index, 1);
      post.likesCount -= 1;
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }
    await post.save();
    res.json({ success: true, likesCount: post.likesCount, liked: index === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/community/posts/:postId/comments
router.get('/posts/:postId/comments', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name avatar role')
      .sort({ createdAt: 1 });
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/community/posts/:postId/comments
router.post('/posts/:postId/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content,
      isMuftiResponse: req.user.role === 'mufti',
    });

    await CommunityPost.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

    const populated = await comment.populate('author', 'name avatar role');
    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/community/mufti/pending (Mufti dashboard)
router.get('/mufti/pending', protect, authorizeMufti, async (req, res) => {
  try {
    const query = { 'evaluation.status': 'pending', isActive: true };
    if (req.user.role === 'mufti') {
      query.community = req.user.muftiCategory;
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/community/posts/:postId (Edit own post)
router.put('/posts/:postId', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    post.evaluation = { status: 'pending', response: '', evaluatedAt: null };
    await post.save();

    const populated = await post.populate('author', 'name avatar role');
    res.json({ success: true, post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/community/posts/:postId (Delete own post)
router.delete('/posts/:postId', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    post.isActive = false;
    await post.save();
    await Comment.deleteMany({ post: post._id });
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
