import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChat, HiX, HiPaperAirplane, HiSparkles } from 'react-icons/hi';
import { FaMosque } from 'react-icons/fa';

const ISLAMIC_RESPONSES = {
  greetings: [
    "Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh! 🌙 How can I help you today?",
    "Welcome, dear seeker of knowledge! What would you like to learn about Islam?",
  ],
  salah: [
    "Salah is the second pillar of Islam and is performed 5 times daily:\n\n🌅 **Fajr** — Before sunrise (2 rak'ah)\n☀️ **Dhuhr** — After midday (4 rak'ah)\n🌤️ **Asr** — Afternoon (4 rak'ah)\n🌆 **Maghrib** — After sunset (3 rak'ah)\n🌙 **Isha** — Nighttime (4 rak'ah)\n\nWould you like to learn about the steps of salah?",
  ],
  wudu: [
    "Wudu (ablution) has these steps:\n\n1️⃣ **Intention** (Niyyah) in your heart\n2️⃣ Say **Bismillah**\n3️⃣ Wash **hands** 3 times\n4️⃣ Rinse **mouth** 3 times\n5️⃣ Clean **nose** 3 times\n6️⃣ Wash **face** 3 times\n7️⃣ Wash **arms** to elbows 3 times\n8️⃣ Wipe **head** once\n9️⃣ Wipe **ears** once\n🔟 Wash **feet** to ankles 3 times\n\nWant to practice with our animated guide?",
  ],
  quran: [
    "The Quran is the holy book of Islam, revealed to Prophet Muhammad ﷺ over 23 years. It has 114 surahs and over 6,000 verses.\n\nI recommend starting with:\n📖 Surah Al-Fatiha (The Opening)\n📖 Surah Al-Ikhlas (Sincerity)\n📖 Surah Al-Falaq (The Daybreak)\n📖 Surah An-Nas (Mankind)\n\nWould you like help with recitation or tajweed?",
  ],
  shahada: [
    "The Shahada is the declaration of faith:\n\n🕌 **Arabic:** أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله\n\n🇬🇧 **Translation:** \"I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.\"\n\nThis is the first pillar of Islam and the foundation of a Muslim's faith.",
  ],
  pillars: [
    "The 5 Pillars of Islam are:\n\n1️⃣ **Shahada** — Declaration of faith\n2️⃣ **Salah** — 5 daily prayers\n3️⃣ **Zakat** — Obligatory charity (2.5%)\n4️⃣ **Sawm** — Fasting in Ramadan\n5️⃣ **Hajj** — Pilgrimage to Mecca (once)\n\nWhich pillar would you like to learn more about?",
  ],
  dua: [
    "Here are some essential daily duas:\n\n🌅 **Before eating:** بسم الله (Bismillah)\n🍽️ **After eating:** الحمد لله (Alhamdulillah)\n🚪 **Entering home:** بسم الله ولجنا (Bismillahi walajna)\n😴 **Before sleep:** باسمك اللهم أموت وأحيا (Bismika Allahumma amootu wa ahya)\n\nWould you like more duas for specific occasions?",
  ],
  default: [
    "That's a wonderful question! Islam encourages seeking knowledge. Here are some resources that might help:\n\n📚 Check our **Learning Paths** for structured lessons\n🕌 Visit the **Community** to ask scholars\n📖 Explore the **Quran** path for recitation practice\n\nIs there anything specific you'd like to know?",
    "SubhanAllah, great curiosity! Let me help you with that.\n\nI suggest exploring our structured courses where you can learn step-by-step. You can also ask in our **Community** section where verified Muftis respond to questions.\n\nWhat topic interests you most?",
  ],
};

function getResponse(message) {
  const msg = message.toLowerCase();
  if (msg.match(/salam|hello|hi |hey|assalam/)) return ISLAMIC_RESPONSES.greetings[Math.floor(Math.random() * ISLAMIC_RESPONSES.greetings.length)];
  if (msg.match(/salah|prayer|pray|namaz/)) return ISLAMIC_RESPONSES.salah[0];
  if (msg.match(/wudu|wudhu|ablution|wash/)) return ISLAMIC_RESPONSES.wudu[0];
  if (msg.match(/quran|surah|recit/)) return ISLAMIC_RESPONSES.quran[0];
  if (msg.match(/shahada|declaration|faith|convert/)) return ISLAMIC_RESPONSES.shahada[0];
  if (msg.match(/pillar|arkan|5 pillar/)) return ISLAMIC_RESPONSES.pillars[0];
  if (msg.match(/dua|supplicat|dhikr|remembr/)) return ISLAMIC_RESPONSES.dua[0];
  return ISLAMIC_RESPONSES.default[Math.floor(Math.random() * ISLAMIC_RESPONSES.default.length)];
}

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Assalamu Alaikum! 🌙 I\'m your SiratAI assistant. Ask me anything about Islam — salah, wudu, Quran, duas, or any Islamic topic!', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', content: text, time: new Date() }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages(prev => [...prev, { role: 'assistant', content: response, time: new Date() }]);
      setTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const formatContent = (text) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-emerald shadow-glow flex items-center justify-center text-white"
      >
        {open ? <HiX className="text-xl" /> : <HiChat className="text-xl" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] glass-card flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-emerald flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FaMosque className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">SiratAI Assistant</h3>
                <p className="text-white/70 text-xs flex items-center gap-1"><HiSparkles /> Ask anything about Islam</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-dark-700/80 text-dark-200 rounded-bl-md'
                  }`}>
                    {formatContent(msg.content)}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-dark-700/80 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-dark-700/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about Islam..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="input-field !py-2.5 !rounded-xl text-sm flex-1"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-emerald flex items-center justify-center text-white disabled:opacity-30 hover:shadow-glow transition-shadow"
                >
                  <HiPaperAirplane className="rotate-90" />
                </button>
              </div>
              <p className="text-[10px] text-dark-500 mt-2 text-center">For detailed fatwa, please ask in the Community section</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
