import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiChat, HiThumbUp, HiReply, HiCheckCircle, HiExclamationCircle, 
  HiPencilAlt, HiTrash, HiX, HiShieldCheck, HiAcademicCap, 
  HiShare 
} from 'react-icons/hi';
import { FaMosque, FaQuran, FaPray, FaBookmark, FaRegHeart, FaHeart, FaRegComment } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getCommunityPosts, createPost, likePost, getComments, addComment, editPost, deletePost } from '../services/api';
import toast from 'react-hot-toast';

const communities = [
  { slug: 'thareeq', name: 'Thareeq', icon: <FaMosque />, desc: 'Islamic way of life discussions', unread: 3, count: 124 },
  { slug: 'fiqh', name: 'Fiqh', icon: <HiShieldCheck />, desc: 'Islamic jurisprudence Q&A', count: 287 },
  { slug: 'quran', name: 'Quran', icon: <FaQuran />, desc: 'Recitation help & tajweed', unread: 5, count: 432 },
  { slug: 'aqeeda', name: 'Aqeeda', icon: <FaPray />, desc: 'Belief & theology discussions', count: 156 },
  { slug: 'seerah', name: 'Seerah', icon: <HiAcademicCap />, desc: 'Prophetic biography discussions', unread: 1, count: 98 },
];

const trendingTopics = [
  { tag: '#tajweed', count: '1.2k posts' },
  { tag: '#ramadan', count: '850 posts' },
  { tag: '#fiqh_questions', count: '620 posts' },
  { tag: '#memorization', count: '430 posts' },
  { tag: '#hadith', count: '310 posts' }
];

const topContributors = [
  { name: 'Mufti Yusuf', role: 'Verified Scholar', avatar: 'Y', color: 'bg-primary-500' },
  { name: 'Sheikh Abdullah', role: 'Verified Scholar', avatar: 'S', color: 'bg-emerald-600' },
  { name: 'Ustadha Aisha', role: 'Verified Teacher', avatar: 'A', color: 'bg-gold-500' }
];

const pinnedTopics = [
  { title: 'Getting Started Guide', link: '#' },
  { title: 'Scholar Verification', link: '#' },
  { title: 'Posting Guidelines', link: '#' }
];

const Community = () => {
  const { user } = useAuth();
  const [activeCommunity, setActiveCommunity] = useState('thareeq');
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
    <div className="min-h-screen py-8 px-4 bg-dark-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Communities & Pinned Topics */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-4">Communities</h3>
              <div className="space-y-1">
                {communities.map((c) => {
                  const isActive = activeCommunity === c.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setActiveCommunity(c.slug)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                        isActive 
                          ? 'bg-primary-500/10 text-primary-600 font-bold border border-primary-500/20 shadow-glow-sm' 
                          : 'text-dark-300 hover:text-primary-600 hover:bg-dark-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-lg ${isActive ? 'text-primary-600' : 'text-dark-400'}`}>{c.icon}</span>
                        <span className="text-sm">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                        <span className="text-xs text-dark-500 font-normal">{c.count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-4">Pinned Topics</h3>
              <div className="space-y-3">
                {pinnedTopics.map((topic, i) => (
                  <a
                    key={i}
                    href={topic.link}
                    className="flex items-center gap-2.5 text-sm text-dark-300 hover:text-primary-600 transition-colors group"
                  >
                    <span className="text-xs text-dark-400">📄</span>
                    <span className="flex-1 group-hover:underline">{topic.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Share Form & Posts Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Share Post Card */}
            <div className="glass-card p-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 space-y-3">
                  <input 
                    type="text" 
                    placeholder="Title of your post..." 
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} 
                    className="w-full bg-transparent border-b border-dark-800 focus:border-primary-500 py-1 text-sm font-semibold text-dark-100 placeholder-dark-500 focus:outline-none transition-colors"
                  />
                  <textarea 
                    placeholder="Share something with the community..." 
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} 
                    className="w-full bg-transparent text-sm text-dark-200 placeholder-dark-500 focus:outline-none resize-none min-h-[80px]"
                  />
                  <div className="flex items-center justify-between pt-3 border-t border-dark-800/60">
                    <div className="flex items-center gap-1.5 text-dark-400">
                      <button 
                        type="button" 
                        onClick={() => setNewPost(prev => ({ ...prev, content: prev.content + ' #' }))}
                        className="p-2 rounded-lg hover:bg-dark-900 hover:text-primary-600 transition-all font-mono font-bold"
                        title="Add Tag"
                      >
                        #
                      </button>
                      <button 
                        type="button" 
                        onClick={() => toast.info('Image upload is handled via Cloudinary in post details')}
                        className="p-2 rounded-lg hover:bg-dark-900 hover:text-primary-600 transition-all"
                        title="Add Image"
                      >
                        🖼️
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setNewPost(prev => ({ ...prev, content: prev.content + ' **bold**' }))}
                        className="p-2 rounded-lg hover:bg-dark-900 hover:text-primary-600 transition-all font-bold"
                        title="Bold"
                      >
                        B
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setNewPost(prev => ({ ...prev, content: prev.content + ' *italic*' }))}
                        className="p-2 rounded-lg hover:bg-dark-900 hover:text-primary-600 transition-all italic font-serif"
                        title="Italic"
                      >
                        I
                      </button>
                    </div>
                    <button 
                      onClick={handleCreatePost} 
                      disabled={submitting || !newPost.title.trim() || !newPost.content.trim()} 
                      className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {submitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts list */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-6 animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dark-700" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-dark-700 rounded w-1/3" />
                        <div className="h-3 bg-dark-700 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-4 bg-dark-700 rounded w-3/4" />
                    <div className="h-3 bg-dark-700 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-4xl mb-4">💬</p>
                <h3 className="text-lg font-bold text-dark-100 mb-2">No posts yet</h3>
                <p className="text-dark-400 text-sm">Be the first to start a discussion in the #{activeCommunity} community!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, i) => {
                  const hasMuftiResponse = post.evaluation?.status === 'approved' || post.evaluation?.response;
                  return (
                    <motion.div 
                      key={post._id} 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.05 }} 
                      className="glass-card p-6 space-y-4"
                    >
                      {/* Author row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white font-bold text-sm">
                            {post.author?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-dark-100 text-sm">{post.author?.name}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-dark-800 text-dark-300 capitalize font-medium">
                                {post.author?.role || 'Student'}
                              </span>
                              {post.author?.role === 'mufti' && (
                                <span className="text-[10px] text-primary-500 font-bold" title="Verified Scholar">✓</span>
                              )}
                            </div>
                            <p className="text-xs text-dark-500">{timeAgo(post.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasMuftiResponse && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-medium">
                              Mufti Answered
                            </span>
                          )}
                          {statusBadge(post.evaluation?.status)}
                          {isOwner(post) && (
                            <div className="flex gap-1 ml-2">
                              <button 
                                onClick={() => { setEditingPost(post._id); setEditForm({ title: post.title, content: post.content }); }}
                                className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-dark-900 transition-all"
                                title="Edit"
                              >
                                <HiPencilAlt className="text-sm" />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post._id)}
                                className="p-1.5 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                title="Delete"
                              >
                                <HiTrash className="text-sm" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content block */}
                      {editingPost === post._id ? (
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            value={editForm.title} 
                            onChange={e => setEditForm({ ...editForm, title: e.target.value })} 
                            className="input-field" 
                          />
                          <textarea 
                            value={editForm.content} 
                            onChange={e => setEditForm({ ...editForm, content: e.target.value })} 
                            className="input-field min-h-[100px] resize-none" 
                          />
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleEditPost(post._id)} 
                              disabled={submitting} 
                              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold"
                            >
                              {submitting ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              onClick={() => setEditingPost(null)} 
                              className="px-4 py-2 bg-white border border-dark-800 text-dark-300 rounded-xl text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-dark-100 leading-snug">{post.title}</h3>
                          <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          <div className="flex gap-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-dark-900 text-dark-400">
                              #{post.community}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-dark-900 text-dark-400">
                              #discussion
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Scholar Verification Details */}
                      {post.evaluation?.response && (
                        <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-4 shadow-sm space-y-1">
                          <p className="text-xs text-primary-600 font-bold flex items-center gap-1.5">
                            🕌 Mufti Clarification
                          </p>
                          <p className="text-sm text-dark-200 leading-relaxed">{post.evaluation.response}</p>
                        </div>
                      )}

                      {/* Footer actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-dark-800/50">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => handleLike(post._id)} 
                            className={`flex items-center gap-1.5 text-xs transition-colors ${
                              post.liked ? 'text-red-500 font-bold' : 'text-dark-400 hover:text-red-500'
                            }`}
                          >
                            {post.liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                            <span>{post.likesCount || 0}</span>
                          </button>
                          <button 
                            onClick={() => toggleComments(post._id)} 
                            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-primary-600 transition-colors"
                          >
                            <FaRegComment />
                            <span>{post.commentsCount || 0} Comments</span>
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/community?post=${post._id}`);
                              toast.success('Share link copied to clipboard!');
                            }}
                            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-primary-600 transition-colors"
                            title="Share Post"
                          >
                            <HiShare />
                            <span>Share</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => toast.success('Post bookmarked!')} 
                          className="text-dark-400 hover:text-primary-600 text-sm transition-colors"
                          title="Bookmark"
                        >
                          <FaBookmark className="text-xs" />
                        </button>
                      </div>

                      {/* Comments section */}
                      <AnimatePresence>
                        {expandedComments[post._id] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }} 
                            className="overflow-hidden pt-4 border-t border-dark-800/40"
                          >
                            <div className="space-y-3">
                              {(comments[post._id] || []).map((c) => (
                                <div 
                                  key={c._id} 
                                  className={`flex gap-3 p-3 rounded-2xl ${
                                    c.isMuftiResponse 
                                      ? 'bg-primary-500/5 border border-primary-500/20' 
                                      : 'bg-dark-900/60'
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {c.author?.name?.charAt(0) || '?'}
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-semibold text-dark-100">{c.author?.name}</p>
                                      {c.isMuftiResponse && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary-600 text-white font-bold">
                                          🕌 Mufti
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-dark-300 leading-relaxed">{c.content}</p>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex gap-2 pt-2">
                                <input 
                                  type="text" 
                                  placeholder="Write a comment..."
                                  value={commentInput[post._id] || ''}
                                  onChange={(e) => setCommentInput(prev => ({ ...prev, [post._id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                  className="input-field !py-2 text-xs flex-1" 
                                />
                                <button 
                                  onClick={() => handleAddComment(post._id)} 
                                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Trending Topics, Contributors & Guidelines */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-4">Trending Topics</h3>
              <div className="space-y-4">
                {trendingTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setNewPost(prev => ({ ...prev, content: prev.content + ' ' + topic.tag }));
                      toast.success(`Added tag ${topic.tag} to post!`);
                    }}
                    className="w-full flex items-center justify-between hover:bg-dark-900 p-1.5 rounded-lg text-left transition-colors"
                  >
                    <span className="text-sm font-semibold text-primary-600 hover:underline">{topic.tag}</span>
                    <span className="text-xs text-dark-500">{topic.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-4">Top Contributors</h3>
              <div className="space-y-4">
                {topContributors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-dark-400 w-4">{i + 1}</span>
                    <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-100 truncate">{c.name}</p>
                      <p className="text-[10px] text-dark-500 truncate">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-4">Community Guidelines</h3>
              <div className="bg-dark-900/60 rounded-2xl p-4 border border-dark-800">
                <p className="text-xs text-dark-300 leading-relaxed">
                  Please be respectful, seek knowledge sincerely, and follow community guidelines when posting. All fatwa and rulings are moderated by verified Muftis.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Community;
