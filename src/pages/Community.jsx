import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChat, HiThumbUp, HiReply, HiCheckCircle, HiExclamationCircle, HiPencilAlt, HiTrash, HiX, HiShieldCheck } from 'react-icons/hi';
import { FaMosque, FaQuran, FaPray } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getCommunityPosts, createPost, likePost, getComments, addComment, editPost, deletePost } from '../services/api';
import toast from 'react-hot-toast';

const communities = [
  { slug: 'thareeq', name: 'Thareeq', icon: <FaMosque className="text-primary-500" />, desc: 'Islamic way of life discussions' },
  { slug: 'fiqh', name: 'Fiqh', icon: <HiShieldCheck className="text-primary-500" />, desc: 'Islamic jurisprudence Q&A' },
  { slug: 'quran', name: 'Quran', icon: <FaQuran className="text-primary-500" />, desc: 'Recitation help & tajweed' },
  { slug: 'aqeeda', name: 'Aqeeda', icon: <FaPray className="text-primary-500" />, desc: 'Belief & theology discussions' },
];

const Community = () => {
  const { user } = useAuth();
  const [activeCommunity, setActiveCommunity] = useState('thareeq');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  useEffect(() => { fetchPosts(); }, [activeCommunity]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await getCommunityPosts(activeCommunity, 1);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return toast.error('Please fill in both title and content');
    setSubmitting(true);
    try {
      const { data } = await createPost(activeCommunity, newPost);
      setPosts(prev => [data.post, ...prev]);
      setNewPost({ title: '', content: '' });
      setShowNewPost(false);
      toast.success('Post created successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = async (postId) => {
    if (!editForm.title.trim() || !editForm.content.trim()) return toast.error('Please fill in both fields');
    setSubmitting(true);
    try {
      const { data } = await editPost(postId, editForm);
      setPosts(prev => prev.map(p => p._id === postId ? data.post : p));
      setEditingPost(null);
      toast.success('Post updated! 📝');
    } catch (err) {
      toast.error('Failed to edit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await likePost(postId);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount: data.likesCount, liked: data.liked } : p));
    } catch { toast.error('Failed to like post'); }
  };

  const toggleComments = async (postId) => {
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({ ...prev, [postId]: false }));
      return;
    }
    try {
      const { data } = await getComments(postId);
      setComments(prev => ({ ...prev, [postId]: data.comments || [] }));
      setExpandedComments(prev => ({ ...prev, [postId]: true }));
    } catch { toast.error('Failed to load comments'); }
  };

  const handleAddComment = async (postId) => {
    const content = commentInput[postId]?.trim();
    if (!content) return;
    try {
      const { data } = await addComment(postId, { content });
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data.comment] }));
      setCommentInput(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
  };

  const statusBadge = (status) => {
    if (!status) return null;
    const styles = { approved: 'badge-success', pending: 'badge-warning', corrected: 'badge-info', flagged: 'badge-locked' };
    const icons = { approved: <HiCheckCircle />, pending: <HiExclamationCircle />, corrected: <HiPencilAlt /> };
    return <span className={styles[status] || 'badge-locked'}>{icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const isOwner = (post) => post.author?._id === user?._id || user?.role === 'admin';

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="section-title mb-2">Communities</h1>
          <p className="section-subtitle mx-auto">Join path-specific communities moderated by expert Muftis</p>
        </div>

        {/* Community tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {communities.map((c) => (
            <button key={c.slug} onClick={() => setActiveCommunity(c.slug)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                activeCommunity === c.slug ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow-sm' : 'glass-card text-dark-300 hover:text-dark-100 hover:bg-dark-800/80'
              }`}>
              <span className="text-lg">{c.icon}</span> {c.name}
            </button>
          ))}
        </div>

        {/* New post */}
        <div className="mb-6">
          <button onClick={() => setShowNewPost(!showNewPost)} className="btn-primary flex items-center gap-2">
            <HiChat /> New Post
          </button>
          <AnimatePresence>
            {showNewPost && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="glass-card p-6 mt-4 space-y-4">
                  <input type="text" placeholder="Post title..." value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="input-field" />
                  <textarea placeholder="Write your question or thought..." value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="input-field min-h-[120px] resize-none" />
                  <div className="flex gap-3">
                    <button onClick={handleCreatePost} disabled={submitting} className="btn-primary">
                      {submitting ? 'Posting...' : 'Submit Post'}
                    </button>
                    <button onClick={() => setShowNewPost(false)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-1/3 mb-3" />
                <div className="h-3 bg-dark-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-4">💬</p>
            <h3 className="text-lg font-bold text-dark-100 mb-2">No posts yet</h3>
            <p className="text-dark-400 text-sm">Be the first to start a discussion in this community!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div key={post._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white font-bold text-sm">
                      {post.author?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-100 text-sm">{post.author?.name}</p>
                      <p className="text-xs text-dark-500">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(post.evaluation?.status)}
                    {isOwner(post) && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => { setEditingPost(post._id); setEditForm({ title: post.title, content: post.content }); }}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-dark-700/50 transition-all" title="Edit">
                          <HiPencilAlt className="text-sm" />
                        </button>
                        <button onClick={() => handleDeletePost(post._id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                          <HiTrash className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit mode */}
                {editingPost === post._id ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-4">
                    <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="input-field" />
                    <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} className="input-field min-h-[80px] resize-none" />
                    <div className="flex gap-3">
                      <button onClick={() => handleEditPost(post._id)} disabled={submitting} className="btn-primary !py-2 !px-4 text-sm">{submitting ? 'Saving...' : 'Save'}</button>
                      <button onClick={() => setEditingPost(null)} className="btn-secondary !py-2 !px-4 text-sm">Cancel</button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-dark-100 mb-2">{post.title}</h3>
                    <p className="text-dark-400 text-sm mb-4">{post.content}</p>
                  </>
                )}

                {/* Mufti response */}
                {post.evaluation?.response && (
                  <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4 mb-4">
                    <p className="text-xs text-primary-400 font-semibold mb-1">🕌 Mufti Response</p>
                    <p className="text-sm text-dark-200">{post.evaluation.response}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-dark-700/50">
                  <button onClick={() => handleLike(post._id)} className="flex items-center gap-1.5 text-dark-400 hover:text-primary-400 text-sm transition-colors">
                    <HiThumbUp /> {post.likesCount || 0}
                  </button>
                  <button onClick={() => toggleComments(post._id)} className="flex items-center gap-1.5 text-dark-400 hover:text-primary-400 text-sm transition-colors">
                    <HiReply /> {post.commentsCount || 0} Comments
                  </button>
                </div>

                {/* Comments section */}
                <AnimatePresence>
                  {expandedComments[post._id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-dark-700/30 space-y-3">
                        {(comments[post._id] || []).map((c) => (
                          <div key={c._id} className={`flex gap-3 p-3 rounded-lg ${c.isMuftiResponse ? 'bg-primary-500/5 border border-primary-500/20' : 'bg-dark-800/30'}`}>
                            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {c.author?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-dark-200">
                                {c.author?.name} {c.isMuftiResponse && <span className="text-primary-400 ml-1">🕌 Mufti</span>}
                              </p>
                              <p className="text-sm text-dark-400 mt-1">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input type="text" placeholder="Write a comment..."
                            value={commentInput[post._id] || ''}
                            onChange={(e) => setCommentInput(prev => ({ ...prev, [post._id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                            className="input-field !py-2 text-sm flex-1" />
                          <button onClick={() => handleAddComment(post._id)} className="btn-primary !py-2 !px-4 text-sm">Send</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
