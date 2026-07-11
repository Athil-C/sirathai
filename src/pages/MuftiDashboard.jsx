import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMuftiPending, evaluatePost, getConversations, getMessages, sendMessage, getMuftiStudents, assignGrade, adminGetAllLessons, adminCreateLesson, adminDeleteLesson, adminGetAllPaths, adminCreatePath } from '../services/api';
import { HiChat, HiCheck, HiX, HiRefresh, HiPaperAirplane, HiPlus, HiTrash, HiStar, HiVideoCamera, HiMicrophone, HiDesktopComputer, HiUsers, HiExclamation } from 'react-icons/hi';
import { FaMosque, FaBook, FaUserGraduate, FaVideo, FaChalkboardTeacher } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MuftiDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [convos, setConvos] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradeForm, setGradeForm] = useState({});
  const [gradeStudent, setGradeStudent] = useState(null);
  const [lessonForm, setLessonForm] = useState({});
  const [showLessonForm, setShowLessonForm] = useState(false);
  const scrollRef = useRef(null);

  // --- Video Call states ---
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [micActive, setMicActive] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const [studentStates, setStudentStates] = useState([
    { name: 'Abdullah', initial: 'A', micActive: true, cameraActive: false },
    { name: 'Fatima', initial: 'F', micActive: false, cameraActive: false },
    { name: 'Yusuf', initial: 'Y', micActive: false, cameraActive: false },
    { name: 'Aisha', initial: 'A', micActive: false, cameraActive: false },
  ]);

  const [callMessages, setCallMessages] = useState([
    { sender: 'Abdullah', text: 'Assalamu Alaikum Mufti, I have a question about the Salah postures.', time: '10:32 AM' },
    { sender: 'Fatima', text: 'Is screen sharing visible?', time: '10:33 AM' }
  ]);
  const [callMsgInput, setCallMsgInput] = useState('');
  const [showCallChat, setShowCallChat] = useState(false);

  useEffect(() => {
    if (localVideoRef.current) {
      if (stream && webcamActive) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.warn("Video play error:", e));
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [stream, webcamActive]);

  useEffect(() => {
    if (screenVideoRef.current) {
      if (screenStream && screenShareActive) {
        screenVideoRef.current.srcObject = screenStream;
        screenVideoRef.current.play().catch(e => console.warn("Screen video play error:", e));
      } else {
        screenVideoRef.current.srcObject = null;
      }
    }
  }, [screenStream, screenShareActive]);

  useEffect(() => {
    if (tab !== 'videocall') {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
      }
      setWebcamActive(false);
      setMicActive(false);
      setScreenShareActive(false);
    }
  }, [tab]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    };
  }, [stream, screenStream]);

  const toggleWebcam = async () => {
    try {
      if (webcamActive) {
        if (stream) {
          stream.getVideoTracks().forEach(track => {
            track.stop();
            stream.removeTrack(track);
          });
        }
        setWebcamActive(false);
        toast.success("Camera turned off");
      } else {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: micActive
        });
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        setStream(media);
        setWebcamActive(true);
        toast.success("Camera turned on");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not access camera");
    }
  };

  const toggleMic = async () => {
    try {
      if (micActive) {
        if (stream) {
          stream.getAudioTracks().forEach(track => {
            track.stop();
            stream.removeTrack(track);
          });
        }
        setMicActive(false);
        toast.success("Microphone muted");
      } else {
        const media = await navigator.mediaDevices.getUserMedia({
          video: webcamActive,
          audio: true
        });
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        setStream(media);
        setMicActive(true);
        toast.success("Microphone unmuted");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not access microphone");
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (screenShareActive) {
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        setScreenStream(null);
        setScreenShareActive(false);
        toast.success("Screen sharing stopped");
      } else {
        const media = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        media.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setScreenShareActive(false);
          toast.success("Screen sharing stopped");
        };
        setScreenStream(media);
        setScreenShareActive(true);
        toast.success("Screen sharing started");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not share screen");
    }
  };

  const stopAllStreams = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setWebcamActive(false);
    setMicActive(false);
    setScreenShareActive(false);
    toast.success("Video session ended");
  };

  const toggleStudentMic = (index) => {
    setStudentStates(prev => prev.map((s, idx) => idx === index ? { ...s, micActive: !s.micActive } : s));
    toast.success(`Toggled microphone for ${studentStates[index].name}`);
  };

  const toggleStudentCamera = (index) => {
    setStudentStates(prev => prev.map((s, idx) => idx === index ? { ...s, cameraActive: !s.cameraActive } : s));
    toast.success(`Toggled camera for ${studentStates[index].name}`);
  };

  const handleSendCallMsg = () => {
    if (!callMsgInput.trim()) return;
    const newMsg = {
      sender: user?.name || 'Mufti (Host)',
      text: callMsgInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCallMessages(prev => [...prev, newMsg]);
    setCallMsgInput('');
  };

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'posts') { const { data } = await getMuftiPending(); setPosts(data.posts || []); }
      if (tab === 'inbox') { const { data } = await getConversations(); setConvos(data.conversations || []); }
      if (tab === 'grading') { const { data } = await getMuftiStudents(); setStudents(data.students || []); }
      if (tab === 'content') { const [l, p] = await Promise.all([adminGetAllLessons(), adminGetAllPaths()]); setLessons(l.data.lessons || []); setPaths(p.data.paths || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Posts ──
  const handleEvaluate = async (postId, status) => {
    if (status !== 'flagged' && !response.trim()) return toast.error('Write a response');
    setSubmitting(true);
    try { await evaluatePost(postId, { status, response: response.trim() }); setPosts(p => p.filter(x => x._id !== postId)); setActivePost(null); setResponse(''); toast.success(`Post ${status}`); }
    catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  // ── Messaging ──
  const openConvo = async (convo) => {
    setActiveConvo(convo);
    try { const { data } = await getMessages(convo._id); setMsgs(data.messages || []); }
    catch { toast.error('Failed to load messages'); }
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs]);

  const handleSendMsg = async () => {
    if (!msgInput.trim() || !activeConvo) return;
    try {
      const { data } = await sendMessage(activeConvo._id, { content: msgInput.trim() });
      setMsgs(p => [...p, data.message]);
      setMsgInput('');
    } catch { toast.error('Failed to send'); }
  };

  // ── Grading ──
  const handleGrade = async () => {
    if (!gradeStudent || !gradeForm.grade) return toast.error('Select grade');
    try {
      await assignGrade({ studentId: gradeStudent, ...gradeForm });
      toast.success('Grade assigned!');
      setGradeStudent(null); setGradeForm({});
      fetchData();
    } catch { toast.error('Failed'); }
  };

  // ── Content ──
  const handleCreateLesson = async () => {
    try { await adminCreateLesson(lessonForm); toast.success('Lesson created!'); setShowLessonForm(false); setLessonForm({}); fetchData(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDeleteLesson = async (id) => {
    if (!confirm('Remove lesson?')) return;
    try { await adminDeleteLesson(id); toast.success('Removed'); fetchData(); } catch { toast.error('Failed'); }
  };

  const timeAgo = (d) => { if (!d) return ''; const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 60) return `${m}m`; if (m < 1440) return `${Math.floor(m/60)}h`; return `${Math.floor(m/1440)}d`; };

  const tabs = [
    { key: 'posts', label: 'Post Review', icon: HiChat },
    { key: 'inbox', label: 'Inbox', icon: HiPaperAirplane },
    { key: 'grading', label: 'Grading', icon: FaUserGraduate },
    { key: 'content', label: 'Content', icon: FaBook },
    { key: 'videocall', label: 'Video Call', icon: FaVideo },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-glow"><FaMosque className="text-white text-xl" /></div>
          <div><h1 className="text-3xl font-display font-bold text-dark-100">Mufti Dashboard</h1><p className="text-dark-400 text-sm">Mufti {user?.name} • {user?.muftiCategory || 'All'} community</p></div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => { const I = t.icon; return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'glass-card text-dark-300 hover:text-dark-100'}`}>
              <I className="text-sm" /> {t.label}
              {t.key === 'inbox' && convos.some(c => c.unreadMufti > 0) && <span className="w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          ); })}
        </div>

        {loading && tab !== 'videocall' ? <div className="glass-card p-12 text-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
          <>
            {/* ── POST REVIEW ── */}
            {tab === 'posts' && (
              posts.length === 0 ? <div className="glass-card p-12 text-center"><p className="text-4xl mb-4">✅</p><h3 className="font-bold text-dark-100">All caught up!</h3></div> :
              <div className="space-y-4">{posts.map(post => (
                <div key={post._id} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold">{post.author?.name?.charAt(0)}</div>
                    <div><p className="text-sm font-semibold text-dark-100">{post.author?.name}</p><p className="text-xs text-dark-500">{timeAgo(post.createdAt)} ago • {post.community}</p></div>
                    <span className="badge-warning ml-auto">Pending</span>
                  </div>
                  <h3 className="font-bold text-dark-100 mb-1">{post.title}</h3>
                  <p className="text-sm text-dark-400 mb-4">{post.content}</p>
                  {activePost === post._id ? (
                    <div className="space-y-3">
                      <textarea placeholder="Write Islamic response..." value={response} onChange={e => setResponse(e.target.value)} className="input-field min-h-[100px] resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => handleEvaluate(post._id, 'approved')} disabled={submitting} className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1"><HiCheck /> Approve</button>
                        <button onClick={() => handleEvaluate(post._id, 'corrected')} disabled={submitting} className="bg-gold-500/20 text-gold-400 border border-gold-500/30 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1"><HiExclamation /> Correct</button>
                        <button onClick={() => handleEvaluate(post._id, 'flagged')} disabled={submitting} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-xl text-sm font-semibold"><HiX /> Flag</button>
                        <button onClick={() => { setActivePost(null); setResponse(''); }} className="btn-secondary !py-2 !px-3 text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : <button onClick={() => setActivePost(post._id)} className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1"><HiChat /> Review</button>}
                </div>
              ))}</div>
            )}

            {/* ── INBOX ── */}
            {tab === 'inbox' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 500 }}>
                <div className="glass-card overflow-y-auto" style={{ maxHeight: 500 }}>
                  <div className="p-3 border-b border-dark-700"><h3 className="font-bold text-dark-100 text-sm">Conversations</h3></div>
                  {convos.length === 0 ? <p className="p-4 text-sm text-dark-400">No conversations yet</p> :
                  convos.map(c => (
                    <button key={c._id} onClick={() => openConvo(c)} className={`w-full p-3 text-left border-b border-dark-700/30 hover:bg-dark-800/50 transition-colors ${activeConvo?._id === c._id ? 'bg-primary-500/10' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold">{c.student?.name?.charAt(0)}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-dark-100 truncate">{c.student?.name}</p><p className="text-xs text-dark-500 truncate">{c.lastMessage || 'No messages'}</p></div>
                        {c.unreadMufti > 0 && <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">{c.unreadMufti}</span>}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="md:col-span-2 glass-card flex flex-col" style={{ height: 500 }}>
                  {!activeConvo ? <div className="flex-1 flex items-center justify-center text-dark-400 text-sm">Select a conversation</div> : (
                    <>
                      <div className="p-3 border-b border-dark-700 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold">{activeConvo.student?.name?.charAt(0)}</div><div><p className="text-sm font-bold text-dark-100">{activeConvo.student?.name}</p><p className="text-xs text-dark-500">{activeConvo.student?.email}</p></div></div>
                      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                        {msgs.map(m => (
                          <div key={m._id} className={`flex ${m.sender?._id === user?._id || m.sender === user?._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.sender?._id === user?._id || m.sender === user?._id ? 'bg-primary-500 text-white rounded-br-md' : 'bg-dark-700 text-dark-200 rounded-bl-md'}`}>{m.content}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-dark-700 flex gap-2">
                        <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMsg()} placeholder="Type a message..." className="input-field !py-2 text-sm flex-1" />
                        <button onClick={handleSendMsg} className="w-10 h-10 rounded-xl bg-gradient-emerald flex items-center justify-center text-white"><HiPaperAirplane className="rotate-90" /></button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── GRADING ── */}
            {tab === 'grading' && (
              <div className="space-y-4">
                {students.map(s => (
                  <div key={s._id} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white font-bold text-sm">{s.name?.charAt(0)}</div>
                        <div><p className="font-semibold text-dark-100">{s.name}</p><p className="text-xs text-dark-500">{s.email} • Level {s.level||1} • {s.xp||0} XP</p></div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-primary-400">📝 {s.completedLessons?.length||0} lessons</span>
                        <button onClick={() => setGradeStudent(gradeStudent === s._id ? null : s._id)} className={`btn-primary !py-1.5 !px-3 text-xs ${gradeStudent === s._id ? '!bg-dark-700' : ''}`}>{gradeStudent === s._id ? 'Close' : '📊 Grade'}</button>
                      </div>
                    </div>
                    {/* Recent progress */}
                    {s.recentProgress?.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">{s.recentProgress.slice(0,5).map(p => (
                        <span key={p._id} className={`text-xs px-2 py-1 rounded-lg ${p.status==='completed'?'bg-primary-500/10 text-primary-400':'bg-gold-500/10 text-gold-400'}`}>{p.lesson?.title?.substring(0,20)}: {p.quizScore||0}%</span>
                      ))}</div>
                    )}
                    {/* Grade form */}
                    <AnimatePresence>{gradeStudent === s._id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-dark-800/40 rounded-xl mt-2 space-y-3">
                          <select className="input-field !py-2 text-sm" value={gradeForm.category||''} onChange={e => setGradeForm({...gradeForm, category: e.target.value})}>
                            <option value="">Category</option><option value="quiz">Quiz</option><option value="recitation">Recitation</option><option value="salah_practice">Salah Practice</option><option value="wudu_practice">Wudu Practice</option><option value="overall">Overall</option>
                          </select>
                          <select className="input-field !py-2 text-sm" value={gradeForm.grade||''} onChange={e => setGradeForm({...gradeForm, grade: e.target.value})}>
                            <option value="">Select Grade</option><option value="excellent">⭐ Excellent</option><option value="good">✅ Good</option><option value="average">📝 Average</option><option value="needs_improvement">📌 Needs Improvement</option>
                          </select>
                          <input type="number" placeholder="Score (0-100)" className="input-field !py-2 text-sm" value={gradeForm.score||''} onChange={e => setGradeForm({...gradeForm, score: Number(e.target.value)})} />
                          <textarea placeholder="Written feedback..." className="input-field !py-2 text-sm min-h-[60px] resize-none" value={gradeForm.feedback||''} onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})} />
                          <button onClick={handleGrade} className="btn-primary !py-2 text-sm w-full">Submit Grade</button>
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                    {/* Recent grades */}
                    {s.recentGrades?.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">{s.recentGrades.map(g => (
                        <span key={g._id} className={`text-xs px-2 py-1 rounded-lg capitalize ${g.grade==='excellent'?'bg-primary-500/10 text-primary-400':g.grade==='good'?'bg-accent-500/10 text-accent-400':g.grade==='average'?'bg-gold-500/10 text-gold-400':'bg-red-500/10 text-red-400'}`}>{g.category}: {g.grade}</span>
                      ))}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── CONTENT MANAGEMENT ── */}
            {tab === 'content' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2"><FaBook className="text-primary-400" /> Lesson Management</h2>
                  <button onClick={() => { setLessonForm({ pathSlug: paths[0]?.slug }); setShowLessonForm(!showLessonForm); }} className="btn-primary !py-2 text-sm flex items-center gap-1"><HiPlus /> Add Lesson</button>
                </div>
                <AnimatePresence>{showLessonForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="glass-card p-5 space-y-3">
                      <input placeholder="Lesson Title" className="input-field" value={lessonForm.title||''} onChange={e=>setLessonForm({...lessonForm,title:e.target.value})} />
                      <textarea placeholder="Description" className="input-field min-h-[60px]" value={lessonForm.description||''} onChange={e=>setLessonForm({...lessonForm,description:e.target.value})} />
                      <div className="grid grid-cols-2 gap-3">
                        <select className="input-field" value={lessonForm.pathSlug||''} onChange={e=>setLessonForm({...lessonForm,pathSlug:e.target.value})}>{paths.map(p=><option key={p.slug} value={p.slug}>{p.title}</option>)}</select>
                        <select className="input-field" value={lessonForm.type||'theory'} onChange={e=>setLessonForm({...lessonForm,type:e.target.value})}><option value="theory">Theory</option><option value="worship_practice">Worship</option><option value="recitation">Recitation</option></select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleCreateLesson} className="btn-primary !py-2 text-sm">Create</button>
                        <button onClick={() => setShowLessonForm(false)} className="btn-secondary !py-2 text-sm">Cancel</button>
                      </div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
                <div className="glass-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-dark-700">{['#','Title','Subject','Type','XP',''].map(h=><th key={h} className="px-4 py-3 text-xs text-dark-400 font-semibold text-left">{h}</th>)}</tr></thead>
                    <tbody>{lessons.filter(l=>l.isActive!==false).map(l=>(
                      <tr key={l._id} className="border-b border-dark-700/30 hover:bg-dark-800/30">
                        <td className="px-4 py-2 text-dark-400">{l.order}</td>
                        <td className="px-4 py-2 text-dark-100">{l.title}</td>
                        <td className="px-4 py-2 text-dark-300 capitalize text-xs">{l.pathSlug}</td>
                        <td className="px-4 py-2"><span className="badge-info text-xs">{l.type}</span></td>
                        <td className="px-4 py-2 text-dark-300">{l.xpReward}</td>
                        <td className="px-4 py-2"><button onClick={() => handleDeleteLesson(l._id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><HiTrash /></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── VIDEO CALL (Demo UI) ── */}
            {tab === 'videocall' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-4">
                    <div className="glass-card p-6">
                      <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2 mb-4"><FaVideo className="text-primary-400" /> Group Video Session</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {/* Main video (Mufti) */}
                        <div className="md:col-span-2 aspect-video bg-dark-900 rounded-2xl border-2 border-primary-500/30 flex items-center justify-center relative overflow-hidden">
                          {webcamActive && stream ? (
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                          ) : screenShareActive && screenStream ? (
                            <video ref={screenVideoRef} autoPlay playsInline muted className="w-full h-full object-contain"></video>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-dark-800/80 to-dark-900/80" />
                              <div className="relative z-10 text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-emerald mx-auto mb-3 flex items-center justify-center text-3xl text-white font-bold">{user?.name?.charAt(0)}</div>
                                <p className="text-dark-100 font-semibold">{user?.name}</p>
                                <span className="badge-success text-xs mt-1">Host</span>
                              </div>
                            </>
                          )}
                          <div className="absolute top-3 left-3 badge-success text-xs flex items-center gap-1.5 shadow-md">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {screenShareActive ? "SCREEN SHARING" : webcamActive ? "LIVE (Camera)" : "LIVE"}
                          </div>
                          {!micActive && (
                            <div className="absolute top-3 right-3 bg-red-500/90 text-white rounded-full px-2.5 py-1 text-xs flex items-center justify-center shadow-md font-bold">
                              MUTED
                            </div>
                          )}
                        </div>
                        {/* Student tiles */}
                        {studentStates.map((student, idx) => (
                          <div key={student.name} className="aspect-video bg-dark-900 rounded-xl border border-dark-700 flex items-center justify-center relative overflow-hidden transition-all duration-300">
                            {student.cameraActive ? (
                              <div className="absolute inset-0 bg-gradient-to-tr from-primary-950/40 via-dark-900 to-primary-900/20 flex items-center justify-center">
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                                <div className="relative text-center">
                                  <div className="w-12 h-12 rounded-full bg-primary-500/20 border border-primary-500/40 mx-auto mb-2 flex items-center justify-center text-lg text-primary-300 font-bold animate-pulse">
                                    {student.initial}
                                  </div>
                                  <p className="text-[10px] text-emerald-400 tracking-wider font-semibold">CAM ACTIVE</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-dark-700 mx-auto mb-2 flex items-center justify-center text-lg text-dark-300 font-bold">{student.initial}</div>
                                <p className="text-xs text-dark-300">{student.name}</p>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                              <button 
                                onClick={() => toggleStudentMic(idx)} 
                                className={`p-1 rounded-md transition-all ${student.micActive ? 'bg-primary-500/20 text-primary-400' : 'bg-red-500/20 text-red-400'}`}
                                title={student.micActive ? "Mute student" : "Unmute student"}
                              >
                                <HiMicrophone className="text-xs" />
                              </button>
                              <button 
                                onClick={() => toggleStudentCamera(idx)} 
                                className={`p-1 rounded-md transition-all ${student.cameraActive ? 'bg-primary-500/20 text-primary-400' : 'bg-red-500/20 text-red-400'}`}
                                title={student.cameraActive ? "Turn off student camera" : "Turn on student camera"}
                              >
                                <HiVideoCamera className="text-xs" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Controls */}
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={toggleMic} 
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            micActive 
                              ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                          }`}
                          title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                        >
                          <HiMicrophone className="text-lg" />
                        </button>
                        <button 
                          onClick={toggleWebcam} 
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            webcamActive 
                              ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                          }`}
                          title={webcamActive ? "Turn Off Camera" : "Turn On Camera"}
                        >
                          <HiVideoCamera className="text-lg" />
                        </button>
                        <button 
                          onClick={toggleScreenShare} 
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            screenShareActive 
                              ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm' 
                              : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                          }`}
                          title={screenShareActive ? "Stop Sharing Screen" : "Share Screen"}
                        >
                          <HiDesktopComputer className="text-lg" />
                        </button>
                        <button 
                          onClick={stopAllStreams} 
                          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105"
                          title="End Session"
                        >
                          <HiX className="text-xl" />
                        </button>
                        <button 
                          onClick={() => toast.success("Attendance and user list is visible below")} 
                          className="w-12 h-12 rounded-full bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-200 transition-all"
                          title="Users List"
                        >
                          <HiUsers className="text-lg" />
                        </button>
                        <button 
                          onClick={() => setShowCallChat(!showCallChat)} 
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            showCallChat 
                              ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm' 
                              : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                          }`}
                          title="Toggle Live Chat"
                        >
                          <HiChat className="text-lg" />
                        </button>
                      </div>
                    </div>
                    {/* Attendance */}
                    <div className="glass-card p-5">
                      <h3 className="font-bold text-dark-100 text-sm mb-3 flex items-center gap-2"><HiUsers className="text-primary-400" /> Attendance (4/4 present)</h3>
                      <div className="space-y-2">
                        {studentStates.map(student => (
                          <div key={student.name} className="flex items-center gap-3 p-2 bg-dark-800/40 rounded-lg text-left">
                            <div className={`w-2 h-2 rounded-full ${student.micActive || student.cameraActive ? 'bg-primary-500 animate-pulse' : 'bg-dark-500'}`} />
                            <span className="text-sm text-dark-200 font-semibold">{student.name}</span>
                            <div className="ml-auto flex items-center gap-2">
                              {student.micActive && <span className="badge-success text-[8px] !px-1.5 !py-0.5">Audio On</span>}
                              {student.cameraActive && <span className="badge-success text-[8px] !px-1.5 !py-0.5">Video On</span>}
                              <span className="badge-success text-xs">Present</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chat sidebar panel */}
                  {showCallChat && (
                    <div className="glass-card flex flex-col h-full min-h-[500px] border border-dark-700 shadow-lg">
                      <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-900/10">
                        <h3 className="font-bold text-dark-100 text-sm flex items-center gap-2">
                          <HiChat className="text-primary-400" /> Live Session Chat
                        </h3>
                        <button onClick={() => setShowCallChat(false)} className="text-dark-400 hover:text-dark-200 text-xs">✕</button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
                        {callMessages.map((msg, idx) => (
                          <div key={idx} className="text-left bg-dark-900/40 p-2.5 rounded-xl border border-dark-700/30">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-xs font-bold text-primary-400">{msg.sender}</span>
                              <span className="text-[10px] text-dark-500 font-mono">{msg.time}</span>
                            </div>
                            <p className="text-xs text-dark-200 leading-relaxed">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 border-t border-dark-700 flex gap-2 bg-dark-900/10">
                        <input
                          value={callMsgInput}
                          onChange={e => setCallMsgInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendCallMsg()}
                          placeholder="Send message to group..."
                          className="input-field !py-2 !px-3 text-xs flex-1"
                        />
                        <button onClick={handleSendCallMsg} className="w-8 h-8 rounded-lg bg-gradient-emerald flex items-center justify-center text-white hover:scale-105 transition-transform">
                          <HiPaperAirplane className="rotate-90 text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MuftiDashboard;
