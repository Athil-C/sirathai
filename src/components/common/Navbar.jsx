import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX, HiLogout, HiUser, HiAcademicCap, HiHome, HiUserGroup, HiChartBar, HiCog, HiMail } from 'react-icons/hi';
import { FaFire, FaCoins, FaStar } from 'react-icons/fa';
import { useTranslation } from '../../utils/translations';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const t = useTranslation(user?.language);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'mufti') {
      return [
        { to: '/mufti', label: t.muftiPanel, icon: <HiCog /> },
        { to: '/community', label: t.community, icon: <HiUserGroup /> },
        { to: '/inbox', label: 'Inbox', icon: <HiMail /> },
      ];
    }
    if (user.role === 'admin') {
      return [
        { to: '/dashboard', label: t.dashboard, icon: <HiHome /> },
        { to: '/admin', label: t.adminPanel, icon: <HiCog /> },
        { to: '/community', label: t.community, icon: <HiUserGroup /> },
        { to: '/leaderboard', label: t.leaderboard, icon: <HiChartBar /> },
      ];
    }
    return [
      { to: '/dashboard', label: t.dashboard, icon: <HiHome /> },
      { to: '/paths', label: t.learn, icon: <HiAcademicCap /> },
      { to: '/community', label: t.community, icon: <HiUserGroup /> },
      { to: '/leaderboard', label: t.leaderboard, icon: <HiChartBar /> },
      { to: '/inbox', label: 'Inbox', icon: <HiMail /> },
    ];
  };
  const navLinks = getNavLinks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-xl border-b border-dark-800/50 rounded-b-[20px] shadow-[0_4px_24px_rgba(0,75,57,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <img src={logo} alt="SiratAI Logo" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-300" />
            <span className="text-2xl font-display font-bold text-gradient-primary hidden sm:block">
              SiratAI
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'text-primary-500 font-semibold' : 'text-dark-300 hover:text-primary-500 hover:bg-dark-900/50'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 shadow-glow rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 mr-2">
                  <div className="flex items-center gap-1 text-orange-500 text-sm font-bold bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10" title="Streak">
                    <FaFire className="animate-pulse" /> {user.streak || 0}
                  </div>
                  <div className="flex items-center gap-1 text-gold-600 text-sm font-bold bg-gold-500/5 px-2.5 py-1 rounded-full border border-gold-500/10" title="Coins">
                    <FaCoins /> {user.coins || 0}
                  </div>
                  <div className="flex items-center gap-1 text-primary-600 text-sm font-bold bg-primary-500/5 px-2.5 py-1 rounded-full border border-primary-500/10" title="XP">
                    <FaStar /> {user.xp || 0}
                  </div>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-dark-800 hover:border-primary-500/30 transition-all shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-emerald flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-dark-200 hidden sm:block">{user.name}</span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-xl border border-dark-800/80"
                      >
                        <div className="px-3 py-2 border-b border-dark-800 mb-1">
                          <p className="text-sm font-semibold text-dark-100">{user.name}</p>
                          <p className="text-xs text-dark-400">{t.level} {user.level || 1} • {user.role}</p>
                        </div>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-primary-500 hover:bg-dark-900/50 transition-all">
                          <HiUser /> {t.profile}
                        </Link>
                        {user.role === 'student' && (
                          <>
                            <Link to="/inbox" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-primary-500 hover:bg-dark-900/50 transition-all">
                              💬 {t.inbox}
                            </Link>
                            <Link to="/report-mufti" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-red-500 hover:bg-red-500/10 transition-all">
                              🚩 {t.reportMufti}
                            </Link>
                          </>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-all">
                          <HiLogout /> {t.logout}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile toggle */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-dark-300 hover:text-primary-500">
                  {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && user && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-dark-800/80 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {/* Mobile stats */}
              <div className="flex items-center justify-center gap-6 pb-3 mb-3 border-b border-dark-800">
                <div className="flex items-center gap-1 text-orange-500 text-sm font-bold bg-orange-500/5 px-2.5 py-1 rounded-full"><FaFire /> {user.streak || 0}</div>
                <div className="flex items-center gap-1 text-gold-600 text-sm font-bold bg-gold-500/5 px-2.5 py-1 rounded-full"><FaCoins /> {user.coins || 0}</div>
                <div className="flex items-center gap-1 text-primary-600 text-sm font-bold bg-primary-500/5 px-2.5 py-1 rounded-full"><FaStar /> {user.xp || 0}</div>
              </div>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-primary-500 hover:bg-dark-900/50 transition-all">
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
