import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getConversations, startConversation, getMessages, sendMessage, getAvailableMuftis } from '../services/api';
import { HiPaperAirplane, HiPlus, HiArrowLeft, HiCheckCircle, HiVideoCamera, HiMicrophone, HiDesktopComputer, HiX } from 'react-icons/hi';
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

  // --- Video Call State ---
  const [inVideoCall, setInVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [micActive, setMicActive] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) {
      if (stream && webcamActive) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.warn("Local video play error:", e));
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [stream, webcamActive, inVideoCall]);

  useEffect(() => {
    if (screenVideoRef.current) {
      if (screenStream && screenShareActive) {
        screenVideoRef.current.srcObject = screenStream;
        screenVideoRef.current.play().catch(e => console.warn("Screen video play error:", e));
      } else {
        screenVideoRef.current.srcObject = null;
      }
    }
  }, [screenStream, screenShareActive, inVideoCall]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    };
  }, [stream, screenStream]);

  const startVideoCall = async () => {
    setInVideoCall(true);
    toast.success("Starting video call session...");
    try {
      const { data } = await sendMessage(activeConvo._id, { content: "📞 SYSTEM_CALL_STARTED" });
      setMsgs(p => [...p, data.message]);
    } catch (e) {
      console.error("Failed to send call start signal:", e);
    }
  };

  const acceptCall = () => {
    setInVideoCall(true);
    setIncomingCall(false);
    toast.success("Joining call...");
  };

  const endVideoCall = async () => {
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
    setInVideoCall(false);
    setIncomingCall(false);
    toast.success("Call ended");

    try {
      const { data } = await sendMessage(activeConvo._id, { content: "📞 SYSTEM_CALL_ENDED" });
      setMsgs(p => [...p, data.message]);
    } catch (e) {
      console.error("Failed to send call end signal:", e);
    }
  };

  useEffect(() => {
    if (inVideoCall) {
      endVideoCall();
    }
  }, [activeConvo]);

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

  useEffect(() => {
    fetchConvos();
    const convoInterval = setInterval(fetchConvos, 5000);
    return () => clearInterval(convoInterval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  useEffect(() => {
    if (!activeConvo) return;

    const pollMessages = async () => {
      try {
        const { data } = await getMessages(activeConvo._id);
        const newMsgs = data.messages || [];
        
        if (JSON.stringify(newMsgs) !== JSON.stringify(msgs)) {
          setMsgs(newMsgs);
        }

        if (newMsgs.length > 0) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          const isSenderMe = lastMsg.sender?._id === user?._id;
          
          if (lastMsg.content === "📞 SYSTEM_CALL_STARTED") {
            if (!isSenderMe && !inVideoCall) {
              setIncomingCall(true);
            }
          } else if (lastMsg.content === "📞 SYSTEM_CALL_ENDED") {
            setIncomingCall(false);
            if (inVideoCall) {
              if (stream) stream.getTracks().forEach(t => t.stop());
              if (screenStream) screenStream.getTracks().forEach(t => t.stop());
              setStream(null);
              setScreenStream(null);
              setWebcamActive(false);
              setMicActive(false);
              setScreenShareActive(false);
              setInVideoCall(false);
              toast.error("Call ended by the other user");
            }
          }
        }
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    };

    pollMessages();
    const msgInterval = setInterval(pollMessages, 3000);
    return () => clearInterval(msgInterval);
  }, [activeConvo, msgs, inVideoCall, stream, screenStream, user?._id]);

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
    setIncomingCall(false);
    try {
      const { data } = await getMessages(convo._id);
      setMsgs(data.messages || []);
    } catch {
      toast.error('Failed to load messages');
    }
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
                  <button onClick={() => { setActiveConvo(null); if (inVideoCall) endVideoCall(); }} className="lg:hidden text-dark-300 hover:text-dark-100 p-1 rounded-lg">
                    <HiArrowLeft className="text-lg" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name?.charAt(0)}
                    </div>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-left">
                      <p className="text-xs font-bold text-dark-100">
                        {(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name}
                      </p>
                      {(user?.role !== 'mufti') && (
                        <HiCheckCircle className="text-primary-500 text-xs" title="Verified Scholar" />
                      )}
                    </div>
                    <p className="text-[9px] text-dark-400 font-semibold tracking-wider text-left">
                      {getSpecialization(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)}
                    </p>
                  </div>
                </div>

                {/* Video Call Toggle Button */}
                <button
                  onClick={() => {
                    if (inVideoCall) {
                      endVideoCall();
                    } else {
                      startVideoCall();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    inVideoCall
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-primary-500/20 text-primary-600 border border-primary-500/30 hover:bg-primary-500/30'
                  }`}
                >
                  <HiVideoCamera className="text-sm" />
                  {inVideoCall ? "End Call" : "Video Call"}
                </button>
              </div>

              {/* Incoming Call Banner */}
              {incomingCall && !inVideoCall && (
                <div className="bg-primary-500/10 border-b border-primary-500/20 p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold animate-bounce">
                      📞
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-dark-100">Incoming Video Call...</p>
                      <p className="text-[10px] text-dark-400">The other user is calling. Click join to connect.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIncomingCall(false)} 
                      className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] font-semibold transition-all"
                    >
                      Ignore
                    </button>
                    <button 
                      onClick={acceptCall} 
                      className="px-3.5 py-1 bg-gradient-emerald text-white rounded-lg text-[10px] font-bold shadow-md hover:scale-105 transition-all"
                    >
                      Join Call
                    </button>
                  </div>
                </div>
              )}

              {inVideoCall ? (
                /* Video Call Section inside Inbox */
                <div className="flex-1 flex flex-col p-6 bg-dark-950/40 relative justify-between overflow-y-auto min-h-[450px]">
                  <div className="relative flex-1 w-full bg-dark-900 rounded-2xl border-2 border-primary-500/30 overflow-hidden flex items-center justify-center min-h-[300px] mb-4 shadow-inner">
                    {/* Active Streams */}
                    {screenShareActive && screenStream ? (
                      <video ref={screenVideoRef} autoPlay playsInline muted className="w-full h-full object-contain"></video>
                    ) : webcamActive && stream ? (
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                    ) : (
                      <div className="text-center z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 shadow-md">
                          {user?.name?.charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-dark-100">{user?.name}</p>
                        <p className="text-xs text-dark-400 mt-1">Connecting to video feed...</p>
                      </div>
                    )}

                    {/* Picture-in-Picture / Remote preview */}
                    <div className="absolute bottom-4 right-4 w-28 md:w-36 aspect-video bg-dark-950 rounded-xl border border-dark-700 overflow-hidden shadow-2xl flex items-center justify-center z-20">
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold mx-auto mb-1 animate-pulse">
                          {(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name?.charAt(0)}
                        </div>
                        <p className="text-[9px] text-dark-300">
                          {(user?.role === 'mufti' ? activeConvo.student : activeConvo.mufti)?.name}
                        </p>
                      </div>
                      <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    </div>

                    {/* Overlay badges */}
                    <div className="absolute top-4 left-4 badge-success text-[10px] flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {screenShareActive ? "SCREEN SHARING" : webcamActive ? "CAM ON" : "CONNECTING"}
                    </div>

                    {!micActive && (
                      <div className="absolute top-4 right-4 bg-red-500/90 text-white text-[10px] font-bold rounded-full px-2.5 py-0.5 shadow-md">
                        MUTED
                      </div>
                    )}
                  </div>

                  {/* Call Controls */}
                  <div className="flex items-center justify-center gap-4 py-3 bg-dark-900/10 rounded-2xl">
                    <button
                      onClick={toggleMic}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
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
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
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
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        screenShareActive
                          ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm'
                          : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                      }`}
                      title={screenShareActive ? "Stop Sharing Screen" : "Share Screen"}
                    >
                      <HiDesktopComputer className="text-lg" />
                    </button>
                    <button
                      onClick={endVideoCall}
                      className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105"
                      title="End Call"
                    >
                      <HiX className="text-lg" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Thread */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-950/20">
                    {msgs.length === 0 && (
                      <p className="text-center text-dark-500 text-xs mt-12">Start the conversation with Assalamu alaikum...</p>
                    )}
                    {msgs.map(m => {
                      const isMe = m.sender?._id === user?._id;
                      if (m.content === "📞 SYSTEM_CALL_STARTED") {
                        return (
                          <div key={m._id} className="flex flex-col items-center p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl my-2 max-w-[85%] mx-auto text-center space-y-2">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center animate-bounce text-sm">
                              📞
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-dark-100">Video Call Started</p>
                              <p className="text-[10px] text-dark-400">Click join to connect with the host</p>
                            </div>
                            {!inVideoCall && (
                              <button 
                                onClick={acceptCall}
                                className="px-4 py-1.5 bg-gradient-emerald text-white rounded-lg text-xs font-semibold shadow-md hover:scale-105 active:scale-95 transition-all"
                              >
                                Join Video Call
                              </button>
                            )}
                          </div>
                        );
                      }
                      if (m.content === "📞 SYSTEM_CALL_ENDED") {
                        return (
                          <div key={m._id} className="flex items-center gap-2 p-2 bg-dark-900/40 border border-dark-700/30 rounded-xl my-2 max-w-[80%] mx-auto justify-center text-[10px] text-dark-400 font-medium">
                            <span>📞 Call ended • {formatTime(m.createdAt)}</span>
                          </div>
                        );
                      }
                      return (
                        <motion.div
                          key={m._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs leading-relaxed text-left ${
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
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Inbox;
