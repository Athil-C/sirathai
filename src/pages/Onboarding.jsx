import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { HiArrowRight, HiArrowLeft, HiCheck, HiStar, HiHeart, HiSparkles } from 'react-icons/hi';
import { FaMosque, FaPray, FaQuran, FaHandsHelping } from 'react-icons/fa';
import toast from 'react-hot-toast';

const STEPS = [
  { key: 'welcome' },
  { key: 'journey' },
  { key: 'goals' },
  { key: 'language' },
  { key: 'ready' },
];

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ journeyType: null, dailyGoal: 15, language: 'en' });
  const [saving, setSaving] = useState(false);

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const complete = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...form, onboardingComplete: true });
      updateUser({ onboardingComplete: true, ...form });
      toast.success('Welcome to the family! 🌟');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const canNext = step === 0 || step === 4 ||
    (step === 1 && form.journeyType) ||
    (step === 2 && form.dailyGoal) ||
    (step === 3 && form.language);

  const renderStep = () => {
    switch (STEPS[step].key) {
      case 'welcome':
        return (
          <div className="text-center space-y-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.2 }}>
              <div className="w-28 h-28 rounded-3xl bg-gradient-emerald mx-auto flex items-center justify-center shadow-glow mb-6">
                <FaMosque className="text-5xl text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-4xl font-display font-black text-dark-100 mb-4">
                Assalamu Alaikum, <span className="text-gradient-primary">{user?.name}</span>! 🌙
              </h1>
              <p className="text-lg text-dark-300 max-w-lg mx-auto leading-relaxed">
                Welcome to SiratAI — your personal guide on the straight path.
              </p>
            </div>
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-sm text-primary-300 italic">"Whoever follows a path in pursuit of knowledge, Allah will make easy for them a path to Paradise."</p>
              <p className="text-xs text-dark-500 mt-3">— Prophet Muhammad ﷺ (Sahih Muslim)</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-dark-400">
              <div className="flex items-center gap-2"><HiStar className="text-primary-400" /> Gamified Learning</div>
              <div className="flex items-center gap-2"><FaPray className="text-accent-400" /> Worship Training</div>
              <div className="flex items-center gap-2"><FaQuran className="text-gold-400" /> Quran Recitation</div>
              <div className="flex items-center gap-2"><FaHandsHelping className="text-purple-400" /> Community</div>
            </div>
          </div>
        );

      case 'journey':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-dark-100 mb-3">Tell Us About Your Journey</h2>
              <p className="text-dark-400">This helps us personalize your learning experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { type: 'new_muslim', icon: <HiSparkles className="text-3xl" />, title: 'New Muslim', desc: "Recently embraced Islam", color: 'from-emerald-500 to-emerald-600' },
                { type: 'exploring', icon: <HiHeart className="text-3xl" />, title: 'Exploring Islam', desc: "Curious and want to learn", color: 'from-blue-500 to-blue-600' },
                { type: 'returning', icon: <FaPray className="text-3xl" />, title: 'Returning to Faith', desc: "Strengthening my knowledge", color: 'from-purple-500 to-purple-600' },
              ].map(opt => (
                <motion.button key={opt.type} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setForm({ ...form, journeyType: opt.type })}
                  className={`p-6 rounded-2xl text-left transition-all border-2 ${form.journeyType === opt.type ? 'bg-primary-500/10 border-primary-500 shadow-glow-sm' : 'bg-dark-800/60 border-dark-600 hover:border-dark-400'}`}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${opt.color} flex items-center justify-center text-white mb-4`}>{opt.icon}</div>
                  <h3 className="text-lg font-bold text-dark-100 mb-1">{opt.title}</h3>
                  <p className="text-sm text-dark-400">{opt.desc}</p>
                  {form.journeyType === opt.type && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3"><HiCheck className="text-primary-400 text-xl" /></motion.div>}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-dark-100 mb-3">Set Your Daily Goal</h2>
              <p className="text-dark-400">How much time can you dedicate each day?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
              {[
                { mins: 5, label: 'Casual', emoji: '🌱' },
                { mins: 10, label: 'Light', emoji: '🌿' },
                { mins: 15, label: 'Regular', emoji: '☀️' },
                { mins: 30, label: 'Serious', emoji: '🌳' },
                { mins: 45, label: 'Advanced', emoji: '⚡' },
                { mins: 60, label: 'Intense', emoji: '🔥' },
              ].map(goal => (
                <motion.button key={goal.mins} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setForm({ ...form, dailyGoal: goal.mins })}
                  className={`p-5 rounded-2xl transition-all border-2 ${form.dailyGoal === goal.mins ? 'bg-primary-500/10 border-primary-500 shadow-glow-sm' : 'bg-dark-800/60 border-dark-600 hover:border-dark-400'}`}>
                  <div className="text-3xl mb-2">{goal.emoji}</div>
                  <p className="font-bold text-dark-100 text-sm">{goal.label}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{goal.mins} min/day</p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-dark-100 mb-3">Preferred Language</h2>
              <p className="text-dark-400">Choose your most comfortable language</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                { code: 'en', name: 'English', flag: '🇬🇧' },
                { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
                { code: 'ur', name: 'اردو', flag: '🇵🇰' },
                { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
                { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
                { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
                { code: 'ms', name: 'Bahasa', flag: '🇲🇾' },
              ].map(lang => (
                <motion.button key={lang.code} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setForm({ ...form, language: lang.code })}
                  className={`p-4 rounded-2xl transition-all border-2 ${form.language === lang.code ? 'bg-primary-500/10 border-primary-500 shadow-glow-sm' : 'bg-dark-800/60 border-dark-600 hover:border-dark-400'}`}>
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <p className="font-bold text-dark-100 text-sm">{lang.name}</p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="text-center space-y-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
              <div className="w-28 h-28 rounded-full bg-gradient-emerald mx-auto flex items-center justify-center shadow-glow">
                <HiCheck className="text-5xl text-white" />
              </div>
            </motion.div>
            <div>
              <h2 className="text-3xl font-display font-bold text-dark-100 mb-3">You're All Set! 🎉</h2>
              <p className="text-dark-400 max-w-md mx-auto">Your personalized learning journey awaits. May Allah bless your pursuit of knowledge.</p>
            </div>
            <div className="glass-card p-6 max-w-sm mx-auto text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400"><HiStar /></div>
                <div><p className="text-sm font-semibold text-dark-100">Journey</p><p className="text-xs text-dark-400 capitalize">{form.journeyType?.replace('_', ' ') || 'Not set'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400"><FaPray /></div>
                <div><p className="text-sm font-semibold text-dark-100">Daily Goal</p><p className="text-xs text-dark-400">{form.dailyGoal} minutes/day</p></div>
              </div>
            </div>
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-sm text-primary-300 italic">"Indeed, with hardship comes ease."</p>
              <p className="text-xs text-dark-500 mt-2">— Quran 94:6</p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-gradient-islamic" />
      <div className="absolute inset-0 pattern-overlay" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-primary-500 text-white' : i === step ? 'bg-primary-500/30 border-2 border-primary-500 text-primary-400' : 'bg-dark-700 text-dark-500'}`}>
                {i < step ? <HiCheck /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 mx-1 ${i < step ? 'bg-primary-500' : 'bg-dark-700'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8 md:p-12 min-h-[420px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="flex-1">
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700/50">
            <button onClick={prev} disabled={step === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-30"><HiArrowLeft /> Back</button>
            {step === STEPS.length - 1 ? (
              <button onClick={complete} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Start Learning <HiArrowRight /></>}
              </button>
            ) : (
              <button onClick={next} disabled={!canNext} className="btn-primary flex items-center gap-2 disabled:opacity-30">Continue <HiArrowRight /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
