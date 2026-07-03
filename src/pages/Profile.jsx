import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getStats, getAchievements, updateProfile } from '../services/api';
import { HiUser, HiMail, HiStar, HiPencil, HiCheck } from 'react-icons/hi';
import { FaFire, FaCoins, FaTrophy, FaMedal } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', dailyGoal: 15 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    if (user) setForm({ name: user.name || '', dailyGoal: user.dailyGoal || 15 });
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, achRes] = await Promise.all([getStats(), getAchievements()]);
      setStats(statsRes.data.stats);
      setAchievements(achRes.data.achievements || []);
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      updateUser(form);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const s = stats || {};
  const unlocked = achievements.filter(a => a.unlocked);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Profile card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="glass-card p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-emerald flex items-center justify-center text-white font-bold text-3xl shadow-glow flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" />
                  <select value={form.dailyGoal} onChange={e => setForm({ ...form, dailyGoal: Number(e.target.value) })} className="input-field">
                    <option value={5}>5 min/day (Casual)</option>
                    <option value={15}>15 min/day (Regular)</option>
                    <option value={30}>30 min/day (Serious)</option>
                    <option value={60}>60 min/day (Intense)</option>
                  </select>
                  <div className="flex gap-3">
                    <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"><HiCheck /> Save</button>
                    <button onClick={() => setEditing(false)} className="btn-secondary !py-2 !px-4 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-display font-bold text-dark-100">{user?.name}</h1>
                    <button onClick={() => setEditing(true)} className="text-dark-400 hover:text-primary-400 transition-colors"><HiPencil /></button>
                  </div>
                  <p className="text-dark-400 text-sm flex items-center gap-2"><HiMail /> {user?.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="badge-success capitalize">{user?.role}</span>
                    <span className="badge-info">Level {s.level || user?.level || 1}</span>
                    {user?.journeyType && <span className="badge-warning capitalize">{user.journeyType.replace('_', ' ')}</span>}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <HiStar className="text-primary-400" />, label: 'Total XP', value: s.xp || 0, bg: 'bg-primary-500/10 border-primary-500/20' },
            { icon: <FaFire className="text-orange-400" />, label: 'Streak', value: s.streak || 0, bg: 'bg-orange-500/10 border-orange-500/20' },
            { icon: <FaCoins className="text-gold-400" />, label: 'Coins', value: s.coins || 0, bg: 'bg-gold-500/10 border-gold-500/20' },
            { icon: <FaTrophy className="text-accent-400" />, label: 'Completed', value: s.totalCompleted || 0, bg: 'bg-accent-500/10 border-accent-500/20' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
              className={`glass-card p-5 border ${stat.bg}`}>
              <div className="flex items-center gap-3 mb-2"><div className="text-xl">{stat.icon}</div><span className="text-sm text-dark-400">{stat.label}</span></div>
              <p className="text-2xl font-display font-bold text-dark-100">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Level progress */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white font-bold">{s.level || 1}</div>
              <div>
                <p className="font-semibold text-dark-100">Level {s.level || 1}</p>
                <p className="text-xs text-dark-400">{s.levelProgress || 0}/{s.xpToNextLevel ? s.levelProgress + s.xpToNextLevel : 100} XP</p>
              </div>
            </div>
            <span className="text-sm font-bold text-primary-400">{s.xpToNextLevel ? Math.round((s.levelProgress / (s.levelProgress + s.xpToNextLevel)) * 100) : 0}%</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${s.xpToNextLevel ? Math.round((s.levelProgress / (s.levelProgress + s.xpToNextLevel)) * 100) : 0}%` }} />
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <h2 className="text-xl font-display font-bold text-dark-100 flex items-center gap-2 mb-4">
            <FaMedal className="text-gold-400" /> Achievements ({unlocked.length}/{achievements.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(a => (
              <div key={a._id} className={`glass-card p-5 text-center transition-all ${a.unlocked ? 'border border-primary-500/30' : 'opacity-40 grayscale'}`}>
                <div className="text-3xl mb-2">{a.icon || '🏆'}</div>
                <p className="font-bold text-sm text-dark-100">{a.title}</p>
                <p className="text-xs text-dark-400 mt-1">{a.description}</p>
                {a.unlocked && <p className="text-xs text-primary-400 mt-2">✅ Unlocked</p>}
                {!a.unlocked && <p className="text-xs text-dark-500 mt-2">🔒 Locked</p>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
