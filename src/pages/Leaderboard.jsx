import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaFire, FaStar } from 'react-icons/fa';
import { getLeaderboard } from '../services/api';

const Leaderboard = () => {
  const [period, setPeriod] = useState('weekly');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const medals = ['🥇', '🥈', '🥉'];

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await getLeaderboard(period);
      setUsers(data.leaderboard || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="section-title mb-2 flex items-center justify-center gap-3"><FaTrophy /> Leaderboard</h1>
          <p className="section-subtitle mx-auto">See who's leading the path of knowledge</p>
        </div>

        {/* Period tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {['daily', 'weekly', 'monthly', 'global'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                period === p ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-dark-400 hover:text-dark-200 glass-card'
              }`}>
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="glass-card p-4 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-dark-700" />
                <div className="flex-1"><div className="h-4 bg-dark-700 rounded w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-4">🏆</p>
            <h3 className="text-lg font-bold text-dark-100 mb-2">No learners yet</h3>
            <p className="text-dark-400 text-sm">Start learning to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Top 3 */}
            {users.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-10">
                {[1, 0, 2].map((idx) => {
                  const u = users[idx];
                  if (!u) return null;
                  const isFirst = idx === 0;
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                      className={`text-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                      <div className={`relative mx-auto mb-3 ${isFirst ? 'w-20 h-20' : 'w-16 h-16'} rounded-full ${isFirst ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow-gold' : 'bg-gradient-emerald'} flex items-center justify-center`}>
                        <span className={`font-bold text-white ${isFirst ? 'text-2xl' : 'text-xl'}`}>{u.name?.charAt(0)}</span>
                        <span className="absolute -bottom-1 text-2xl">{medals[idx]}</span>
                      </div>
                      <p className={`font-bold ${isFirst ? 'text-lg text-dark-100' : 'text-sm text-dark-200'}`}>{u.name}</p>
                      <p className="text-xs text-primary-400 font-bold">{(u.xp || 0).toLocaleString()} XP</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="glass-card overflow-hidden">
              {users.map((u, i) => (
                <motion.div key={u._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 px-6 py-4 ${i !== users.length - 1 ? 'border-b border-dark-700/50' : ''} ${i < 3 ? 'bg-primary-500/5' : ''}`}>
                  <span className={`w-8 text-center font-bold ${i < 3 ? 'text-primary-400' : 'text-dark-500'}`}>
                    {i < 3 ? medals[i] : i + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center text-white font-bold text-sm">
                    {u.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark-100 text-sm">{u.name}</p>
                    <p className="text-xs text-dark-400">Level {u.level || 1}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-orange-400 text-xs font-bold"><FaFire /> {u.streak || 0}</div>
                    <div className="flex items-center gap-1 text-primary-400 text-sm font-bold"><FaStar /> {(u.xp || 0).toLocaleString()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
