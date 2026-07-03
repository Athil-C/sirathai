import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getConversations, startConversation, getMessages, sendMessage, getAvailableMuftis } from '../services/api';
import { HiPaperAirplane, HiPlus, HiArrowLeft } from 'react-icons/hi';
import { FaMosque } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Inbox = () => {
  const { user } = useAuth();
  const [convos, setConvos] = useState([]);
  const [muftis, setMuftis] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
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

  const timeAgo = (d) => { if (!d) return ''; const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 60) return `${m}m`; if (m < 1440) return `${Math.floor(m/60)}h`; return `${Math.floor(m/1440)}d`; };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <FaMosque className="text-2xl text-primary-400" />
          <div><h1 className="text-2xl font-display font-bold text-dark-100">Personal Guidance</h1><p className="text-dark-400 text-sm">Private communication with Muftis</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 520 }}>
          {/* Sidebar */}
          <div className="glass-card flex flex-col overflow-hidden" style={{ maxHeight: 520 }}>
            <div className="p-3 border-b border-dark-700 flex items-center justify-between">
              <h3 className="font-bold text-dark-100 text-sm">Conversations</h3>
              <button onClick={() => { setShowNew(true); fetchMuftis(); }} className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"><HiPlus className="text-sm" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {showNew && (
                <div className="p-3 border-b border-dark-700 bg-dark-800/50">
                  <p className="text-xs text-dark-400 mb-2 font-semibold">Select a Mufti:</p>
                  {muftis.map(m => (
                    <button key={m._id} onClick={() => handleStartConvo(m._id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-dark-700/50 text-left mb-1">
                      <div className="w-7 h-7 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">{m.name?.charAt(0)}</div>
                      <div><p className="text-xs font-semibold text-dark-100">{m.name}</p><p className="text-[10px] text-dark-500 capitalize">{m.muftiCategory}</p></div>
                    </button>
                  ))}
                  <button onClick={() => setShowNew(false)} className="text-xs text-dark-400 mt-1">Cancel</button>
                </div>
              )}
              {convos.map(c => {
                const other = user?.role === 'mufti' ? c.student : c.mufti;
                const unread = user?.role === 'mufti' ? c.unreadMufti : c.unreadStudent;
                return (
                  <button key={c._id} onClick={() => openConvo(c)} className={`w-full p-3 text-left border-b border-dark-700/30 hover:bg-dark-800/50 transition-colors ${activeConvo?._id === c._id ? 'bg-primary-500/10' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold">{other?.name?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark-100 truncate">{other?.name}</p>
                        <p className="text-xs text-dark-500 truncate">{c.lastMessage || 'Start chatting'}</p>
                      </div>
                      {unread > 0 && <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">{unread}</span>}
                    </div>
                  </button>
                );
              })}
              {!loading && convos.length === 0 && !showNew && <p className="p-4 text-sm text-dark-400 text-center">No conversations yet. Click + to start one.</p>}
            </div>
          </div>

          {/* Chat area */}
          <div className="md:col-span-2 glass-card flex flex-col" style={{ height: 520 }}>
            {!activeConvo ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div><FaMosque className="text-4xl text-dark-600 mx-auto mb-3" /><p className="text-dark-400 text-sm">Select a conversation or start a new one</p></div>
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-dark-700 flex items-center gap-3">
                  <button onClick={() => setActiveConvo(null)} className="md:hidden text-dark-400"><HiArrowLeft /></button>
                  <div className="w-8 h-8 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold">
                    {(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-100">{(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name}</p>
                    <p className="text-xs text-dark-500 capitalize">{user?.role === 'mufti' ? 'Student' : activeConvo.mufti?.muftiCategory + ' Mufti'}</p>
                  </div>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgs.length === 0 && <p className="text-center text-dark-500 text-sm mt-8">Start the conversation...</p>}
                  {msgs.map(m => (
                    <motion.div key={m._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.sender?._id === user?._id ? 'bg-primary-500 text-white rounded-br-md' : 'bg-dark-700 text-dark-200 rounded-bl-md'}`}>
                        {m.content}
                        <p className={`text-[10px] mt-1 ${m.sender?._id === user?._id ? 'text-white/50' : 'text-dark-500'}`}>{timeAgo(m.createdAt)} ago</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 border-t border-dark-700 flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type your message..." className="input-field !py-2 text-sm flex-1" />
                  <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 rounded-xl bg-gradient-emerald flex items-center justify-center text-white disabled:opacity-30"><HiPaperAirplane className="rotate-90" /></button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
