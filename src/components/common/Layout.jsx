import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AIChatWidget from './AIChatWidget';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();
  const lang = user?.language || 'en';

  useEffect(() => {
    const isRtl = lang === 'ar' || lang === 'ur';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-screen bg-dark-950 pattern-overlay">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      {user && user.onboardingComplete && <AIChatWidget />}
    </div>
  );
};

export default Layout;
