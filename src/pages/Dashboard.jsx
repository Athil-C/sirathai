import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getDashboard, getPaths, checkAchievements } from '../services/api';
import { FaFire, FaCoins, FaStar, FaTrophy, FaBook, FaArrowRight } from 'react-icons/fa';
import { HiAcademicCap, HiChartBar, HiLightningBolt, HiClock, HiCheckCircle } from 'react-icons/hi';
import { useTranslation } from '../utils/translations';
import toast from 'react-hot-toast';

const DAILY_TASKS = [
  { id: 'lesson', label: 'Complete 1 lesson', icon: '📖', xp: 10 },
  { id: 'community', label: 'Visit the Community', icon: '💬', xp: 5 },
  { id: 'practice', label: 'Practice flashcards', icon: '🃏', xp: 5 },
  { id: 'dua', label: 'Read morning Adhkar', icon: '🤲', xp: 5 },
];

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const t = useTranslation(user?.language);
  const [dashboard, setDashboard] = useState(null);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('siratai_daily_tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset if date changed
      const today = new Date().toDateString();
      if (parsed.date !== today) return { date: today, tasks: [] };
      return parsed;
    }
    return { date: new Date().toDateString(), tasks: [] };
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [dashRes, pathsRes] = await Promise.all([getDashboard(), getPaths()]);
      setDashboard(dashRes.data.dashboard);
      setPaths(pathsRes.data.paths || []);

      // Check achievements on load
      try {
        const { data } = await checkAchievements();
        if (data.newlyUnlocked?.length > 0) {
          data.newlyUnlocked.forEach(a => toast.success(`🏆 Achievement: ${a.title}!`, { duration: 4000 }));
        }
      } catch {}
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    setClaiming(true);
    try {
      const { claimDailyBonus } = await import('../services/api');
      const { data } = await claimDailyBonus();
      if (data.success) {
        updateUser(data.user);
        toast.success('🏆 Daily Goal Met! Claimed +50 XP and +10 Coins! Keep it up!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim daily bonus');
    } finally {
      setClaiming(false);
    }
  };

  const toggleTask = (taskId) => {
    const updated = { ...completedTasks };
    if (updated.tasks.includes(taskId)) {
      updated.tasks = updated.tasks.filter(t => t !== taskId);
    } else {
      updated.tasks = [...updated.tasks, taskId];
    }
    setCompletedTasks(updated);
    localStorage.setItem('siratai_daily_tasks', JSON.stringify(updated));
  };

  const pathIcons = { thareeq: '🟢', fiqh: '🔵', quran: '🟡', aqeeda: '🟣' };

  const xpInfo = user ? {
    currentLevelXp: (user.xp || 0) % 100,
    requiredXp: 100,
  } : { currentLevelXp: 0, requiredXp: 100 };

  const levelProgress = Math.round((xpInfo.currentLevelXp / xpInfo.requiredXp) * 100);
  const taskProgress = Math.round((completedTasks.tasks.length / DAILY_TASKS.length) * 100);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-dark-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-dark-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboard || {};

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-dark-100">
              Assalamu Alaikum, <span className="text-gradient-primary">{user?.name}</span> 👋
            </h1>
            <p className="text-dark-400 mt-1 text-sm sm:text-base">{t.welcome}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/80 border border-dark-800/80 px-4 py-2 rounded-2xl shadow-sm self-start md:self-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-dark-300">Level {stats.level || user?.level || 1} • Student</span>
          </div>
        </motion.div>

        {/* Bento Grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2-COLUMNS: Welcome, Stats & Learning Paths */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Sub-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <FaStar className="text-primary-600 text-lg" />, label: t.xp, value: stats.xp || user?.xp || 0, bg: 'border-primary-500/10 bg-white/70 hover:shadow-glow-emerald', iconBg: 'bg-primary-500/5 border-primary-500/10' },
                { icon: <FaFire className="text-orange-500 text-lg" />, label: t.streak, value: stats.streak || user?.streak || 0, bg: 'border-orange-500/10 bg-white/70 hover:shadow-glow-orange', iconBg: 'bg-orange-500/5 border-orange-500/10' },
                { icon: <FaCoins className="text-gold-600 text-lg" />, label: t.coins, value: stats.coins || user?.coins || 0, bg: 'border-gold-500/10 bg-white/70 hover:shadow-glow-gold', iconBg: 'bg-gold-500/5 border-gold-500/10' },
                { icon: <HiLightningBolt className="text-amber-500 text-lg" />, label: t.level, value: stats.level || user?.level || 1, bg: 'border-amber-500/10 bg-white/70 hover:shadow-glow-amber', iconBg: 'bg-amber-500/5 border-amber-500/10' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                  className={`glass-card p-5 border ${stat.bg} relative overflow-hidden group hover:scale-[1.02] duration-300 cursor-default`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.iconBg} transition-transform group-hover:scale-110`}>
                      {stat.icon}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-display font-black text-dark-100">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Level & XP Overview Card */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="glass-card p-6 border border-dark-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/20">
                    {stats.level || user?.level || 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-dark-100 text-lg">{t.level} {stats.level || user?.level || 1} Progress</h3>
                    <p className="text-xs text-dark-400">{xpInfo.currentLevelXp}/{xpInfo.requiredXp} XP to next level</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary-600 bg-primary-500/5 px-2.5 py-1 rounded-full border border-primary-500/10">{levelProgress}% Completed</span>
              </div>
              
              <div className="xp-bar !h-3 mb-6">
                <div className="xp-bar-fill" style={{ width: `${levelProgress}%` }} />
              </div>

              {/* Completed & In Progress mini summaries */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10 flex flex-col justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-dark-400 mb-1">{t.completedLessons}</p>
                  <p className="text-3xl font-display font-bold text-primary-600">{stats.totalCompleted || 0}</p>
                </div>
                <div className="p-4 bg-gold-500/5 rounded-2xl border border-gold-500/10 flex flex-col justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-dark-400 mb-1">{t.inProgress}</p>
                  <p className="text-3xl font-display font-bold text-gold-600">{stats.inProgress || 0}</p>
                </div>
              </div>
            </motion.div>

            {/* Learning Paths */}
            <div className="space-y-4">
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-dark-100 flex items-center gap-2">
                  <HiAcademicCap className="text-primary-500 text-2xl" /> {t.paths}
                </h2>
                <span className="text-xs text-dark-400 font-semibold">{paths.length} Active Paths</span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paths.map((path, i) => (
                  <motion.div key={path._id || path.slug} initial="hidden" animate="visible" variants={fadeUp} custom={i + 7}>
                    <Link to={`/paths/${path.slug}`} className="glass-card-hover p-5 flex items-center gap-4 group h-full">
                      <div className="text-4xl bg-dark-900/50 p-2.5 rounded-2xl border border-dark-800 shadow-sm">{pathIcons[path.slug] || path.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-dark-100 group-hover:text-primary-600 transition-colors truncate">{path.title}</h3>
                        <p className="text-xs text-dark-400 line-clamp-2 mt-0.5 leading-relaxed">{path.description}</p>
                        <div className="mt-3 xp-bar !h-1.5">
                          <div className="xp-bar-fill" style={{ width: `${path.progressPercent || 0}%` }} />
                        </div>
                        <p className="text-[10px] text-dark-400 font-bold uppercase tracking-wider mt-1.5">{path.completedLessons || 0}/{path.totalLessons || 0} Lessons • {path.progressPercent || 0}%</p>
                      </div>
                      <FaArrowRight className="text-dark-500 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 1-COLUMN: Daily Tasks, Goals, Streaks & Activity */}
          <div className="space-y-6">
            
            {/* Daily Goal & Streak Card */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5.2} className="glass-card p-6 border border-gold-500/25 bg-gradient-to-b from-gold-500/5 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-dark-100 flex items-center gap-2">
                  ⚡ {t.dailyGoal || 'Daily Goal'}
                </h3>
                <span className="text-xs text-gold-600 bg-gold-500/10 border border-gold-500/10 px-2 py-0.5 rounded-full font-bold">{user?.dailyStudyTime || 0} / {user?.dailyGoal || 15} mins</span>
              </div>
              
              <div className="xp-bar !h-3 mb-4">
                <div className="xp-bar-fill !bg-gradient-to-r !from-gold-600 !to-gold-400" 
                     style={{ width: `${Math.min(100, Math.round(((user?.dailyStudyTime || 0) / (user?.dailyGoal || 15)) * 100))}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs text-dark-300 mb-5 bg-white/50 border border-dark-800 p-2.5 rounded-xl">
                <span>Streak: <strong className="text-orange-500 font-extrabold">{user?.streak || 0} days</strong></span>
                <span>Longest: <strong className="text-gold-600 font-extrabold">{user?.longestStreak || 0} days</strong></span>
              </div>

              {/* Claim Button */}
              {user?.dailyStudyTime >= (user?.dailyGoal || 15) ? (
                user?.dailyBonusClaimed ? (
                  <div className="w-full text-center py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    ✅ Goal Bonus Claimed (+50 XP, +10 Coins)
                  </div>
                ) : (
                  <button onClick={handleClaimBonus} disabled={claiming} className="w-full btn-gold font-bold flex items-center justify-center gap-2 py-2.5 rounded-xl shadow-md">
                    {claiming ? 'Claiming...' : 'Claim Daily Streak Bonus! 🎉'}
                  </button>
                )
              ) : (
                <div className="w-full text-center py-2.5 bg-dark-800/40 border border-dark-700/30 text-dark-400 rounded-xl text-xs font-medium">
                  Study { Math.max(0, (user?.dailyGoal || 15) - (user?.dailyStudyTime || 0)) } more minutes to claim streak bonus!
                </div>
              )}
            </motion.div>

            {/* Daily Tasks Card */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5.5} className="glass-card p-6 border border-dark-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-dark-100 flex items-center gap-2">
                  <HiCheckCircle className="text-primary-500 text-xl" /> Daily Tasks
                </h3>
                <span className="text-xs text-dark-400 font-bold bg-dark-900/50 px-2 py-0.5 rounded-full">{completedTasks.tasks.length}/{DAILY_TASKS.length} Done</span>
              </div>
              
              <div className="xp-bar !h-2 mb-4">
                <div className="xp-bar-fill !bg-gradient-to-r !from-primary-500 !to-primary-400" style={{ width: `${taskProgress}%` }} />
              </div>

              <div className="space-y-2">
                {DAILY_TASKS.map(task => {
                  const done = completedTasks.tasks.includes(task.id);
                  return (
                    <motion.button key={task.id} whileTap={{ scale: 0.98 }} onClick={() => toggleTask(task.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        done 
                          ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' 
                          : 'bg-white border-dark-800 hover:border-primary-500/25 hover:bg-dark-900/10'
                      }`}>
                      <span className="text-xl bg-dark-900/50 p-1.5 rounded-lg border border-dark-800 shadow-sm">{task.icon}</span>
                      <span className={`flex-1 text-xs font-semibold ${done ? 'text-emerald-700 line-through' : 'text-dark-200'}`}>{task.label}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${done ? 'text-emerald-600' : 'text-primary-600'}`}>+{task.xp} XP</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        done 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-dark-700 bg-white'
                      }`}>
                        {done && <HiCheckCircle className="text-xs" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activity Feed */}
            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={11} className="space-y-4">
                <h2 className="text-lg font-display font-bold text-dark-100 flex items-center gap-2">
                  <HiClock className="text-gold-500" /> {t.recentActivity}
                </h2>
                <div className="glass-card overflow-hidden border border-dark-800">
                  {stats.recentActivity.slice(0, 4).map((activity, i) => (
                    <div key={activity._id || i} className={`flex items-center gap-4 px-5 py-3 ${i !== Math.min(stats.recentActivity.length, 4) - 1 ? 'border-b border-dark-800' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${activity.status === 'completed' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-gold-500/10 text-gold-700 border border-gold-500/20'}`}>
                        {activity.status === 'completed' ? '⭐' : '📖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-dark-100 truncate">{activity.lesson?.title || 'Lesson'}</p>
                        <p className="text-[10px] text-dark-400 uppercase tracking-wider font-bold mt-0.5">{activity.status?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={12} className="pt-4 border-t border-dark-800/80">
          <h2 className="text-xl font-display font-bold text-dark-100 flex items-center gap-2 mb-4">
            <HiChartBar className="text-gold-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/community" className="glass-card-hover p-6 text-center group flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent-500/5 border border-accent-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-accent-500/10 transition-all shadow-sm">
                <FaBook className="text-xl text-accent-500" />
              </div>
              <p className="font-bold text-dark-100 text-sm">{t.community}</p>
              <p className="text-xs text-dark-400 mt-1">Join Islamic discussion forums</p>
            </Link>
            <Link to="/leaderboard" className="glass-card-hover p-6 text-center group flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gold-500/5 border border-gold-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-gold-500/10 transition-all shadow-sm">
                <FaTrophy className="text-xl text-gold-600" />
              </div>
              <p className="font-bold text-dark-100 text-sm">{t.leaderboard}</p>
              <p className="text-xs text-dark-400 mt-1">See rankings and earn badges</p>
            </Link>
            <Link to="/paths" className="glass-card-hover p-6 text-center group flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary-500/5 border border-primary-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary-500/10 transition-all shadow-sm">
                <HiClock className="text-xl text-primary-600" />
              </div>
              <p className="font-bold text-dark-100 text-sm">{t.learn}</p>
              <p className="text-xs text-dark-400 mt-1">Pick up right where you left</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
