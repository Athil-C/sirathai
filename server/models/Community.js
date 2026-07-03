import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community: {
    type: String,
    enum: ['thareeq', 'fiqh', 'quran', 'aqeeda'],
    required: true,
  },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000 },
  // Mufti evaluation
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  evaluation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'corrected', 'flagged'],
      default: 'pending',
    },
    response: { type: String, default: '' },
    evaluatedAt: { type: Date, default: null },
  },
  // Engagement
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

communityPostSchema.index({ community: 1, createdAt: -1 });

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isMuftiResponse: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
export const Comment = mongoose.model('Comment', commentSchema);
