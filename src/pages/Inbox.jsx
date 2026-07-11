import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getConversations, startConversation, getMessages, sendMessage, getAvailableMuftis } from '../services/api';
import { HiPaperAirplane, HiPlus, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import { FaMosque } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Inbox = () => {
  const { user } = useAuth();
  const [convos, setConvos] = useState([]);
  const [muftis, setMuftis] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => { fetchConvos(); }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs]);

  const fetchConvos = async () => {
    try {
      const { data } = await getConversations();
      setConvos(data.conversations || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMuftis = async () => {
    try { const { data } = await getAvailableMuftis(); setMuftis(data.muftis || []); } catch {}
  };

  const openConvo = async (convo) => {
    setActiveConvo(convo);
    setShowNew(false);
    try { const { data } = await getMessages(convo._id); setMsgs(data.messages || []); } catch { toast.error('Failed to load messages'); }
  };

  const handleStartConvo = async (muftiId) => {
    try {
      const { data } = await startConversation({ muftiId });
      setShowNew(false);
      await fetchConvos();
      openConvo(data.conversation);
    } catch { toast.error('Failed to start conversation'); }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConvo) return;
    try {
      const { data } = await sendMessage(activeConvo._id, { content: input.trim() });
      setMsgs(p => [...p, data.message]);
      setInput('');
    } catch { toast.error('Failed to send'); }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSpecialization = (other) => {
    if (other?.role === 'mufti') {
      const cat = other?.muftiCategory || 'General';
      return `ONLINE • ${cat.toUpperCase()} SPECIALIST`;
    }
    return 'ONLINE • STUDENT';
  };

  // Filter conversations based on search query
  const filteredConvos = convos.filter(c => {
    const other = user?.role === 'mufti' ? c.student : c.mufti;
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-4rem)] bg-dark-950 flex flex-col overflow-hidden">
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-4 overflow-hidden">
        
        {/* Left Column: Sidebar (30% width) */}
        <div className={`${activeConvo ? 'hidden lg:flex' : 'flex'} w-full lg:w-[30%] glass-card flex-col overflow-hidden`}>
          {/* Search conversations & Start New Chat */}
          <div className="p-4 border-b border-dark-800/80 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-400 text-sm">
                🔍
              </span>
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-dark-800 rounded-xl pl-9 pr-4 py-2 text-xs text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <button 
              onClick={() => { setShowNew(!showNew); fetchMuftis(); }} 
              className="p-2 rounded-xl bg-primary-500/10 text-primary-600 hover:bg-primary-500/20 transition-all flex items-center justify-center"
              title="Start New Chat"
            >
              <HiPlus className="text-sm" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-dark-800/30">
            {showNew && (
              <div className="p-4 bg-dark-900/60 border-b border-dark-800/80 space-y-2">
                <p className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Select a Scholar:</p>
                {muftis.map(m => (
                  <button key={m._id} onClick={() => handleStartConvo(m._id)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-dark-800 text-left transition-all">
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-600 text-xs font-bold">{m.name?.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-dark-100 truncate">{m.name}</p>
                      <p className="text-[9px] text-dark-400 capitalize truncate">{m.muftiCategory} specialist</p>
                    </div>
                  </button>
                ))}
                <button onClick={() => setShowNew(false)} className="text-xs text-dark-400 hover:text-dark-200 mt-2 block">Cancel</button>
              </div>
            )}

            {filteredConvos.map(c => {
              const other = user?.role === 'mufti' ? c.student : c.mufti;
              const unread = user?.role === 'mufti' ? c.unreadMufti : c.unreadStudent;
              const isSelected = activeConvo?._id === c._id;
              
              return (
                <button 
                  key={c._id} 
                  onClick={() => openConvo(c)} 
                  className={`w-full p-4 text-left flex items-center gap-3 transition-all hover:bg-dark-900/65 ${
                    isSelected ? 'bg-dark-900 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {other?.name?.charAt(0)}
                    </div>
                    {/* Mock Online dot */}
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-dark-100 truncate">{other?.name}</p>
                      <span className="text-[10px] text-dark-400">{formatTime(c.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-dark-400 truncate pr-4">{c.lastMessage || 'Start chatting'}</p>
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-dark-100 text-white text-[9px] font-bold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {!loading && filteredConvos.length === 0 && !showNew && (
              <div className="p-8 text-center space-y-2">
                <p className="text-3xl">💬</p>
                <p className="text-xs text-dark-400">No conversations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window (70% width) */}
        <div className={`${!activeConvo ? 'hidden lg:flex' : 'flex'} w-full lg:w-[70%] glass-card flex-col overflow-hidden`}>
          {!activeConvo ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <FaMosque className="text-5xl text-dark-800" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-dark-100">Personal Guidance Chat</h3>
                <p className="text-xs text-dark-400 max-w-xs mx-auto">Select a Mufti or student from the left list to start a private consulting session.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-dark-800/80 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveConvo(null)} className="lg:hidden text-dark-300 hover:text-dark-100 p-1 rounded-lg">
                    <HiArrowLeft className="text-lg" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name?.charAt(0)}
                    </div>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-dark-100">
                        {(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name}
                      </p>
                      {(user?.role !== 'mufti') && (
                        <HiCheckCircle className="text-primary-500 text-xs" title="Verified Scholar" />
                      )}
                    </div>
                    <p className="text-[9px] text-dark-400 font-semibold tracking-wider">
                      {getSpecialization(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-950/20">
                {msgs.length === 0 && (
                  <p className="text-center text-dark-500 text-xs mt-12">Start the conversation with Assalamu alaikum...</p>
                )}
                {msgs.map(m => {
                  const isMe = m.sender?._id === user?._id;
                  return (
                    <motion.div 
                      key={m._id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-dark-205 text-white shadow-sm' 
                          : 'bg-white border border-dark-800 text-dark-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                      }`}>
                        {m.content}
                      </div>
                      <span className={`text-[9px] text-dark-500 mt-1.5 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {formatTime(m.createdAt)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-dark-800/80 bg-white/50 flex gap-2">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSend()} 
                  placeholder="Type your message here..." 
                  className="input-field !py-2.5 text-xs flex-1" 
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim()} 
                  className="w-10 h-10 rounded-xl bg-gradient-emerald flex items-center justify-center text-white disabled:opacity-30 active:scale-95 transition-all shadow-sm flex-shrink-0"
                >
                  <HiPaperAirplane className="rotate-90 text-sm" />
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Inbox;
