import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/api';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', language: 'en' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const { data } = await registerApi({ name: form.name, email: form.email, password: form.password, language: form.language });
      loginUser(data.token, data.user);
      toast.success('Welcome to SiratAI! 🌟');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-islamic" />
      <div className="absolute inset-0 pattern-overlay" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-emerald flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-glow">S</div>
            <h1 className="text-2xl font-display font-bold text-dark-100">Begin Your Journey</h1>
            <p className="text-dark-400 text-sm mt-1">Create your account and start learning Islam</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input id="register-name" type="text" placeholder="Full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field !pl-11" required />
            </div>
            <div className="relative">
              <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input id="register-email" type="email" placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field !pl-11" required />
            </div>
            <div className="relative">
              <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input id="register-password" type={showPass ? 'text' : 'password'} placeholder="Password (min 6 characters)" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field !pl-11 !pr-11" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                {showPass ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>
            <div className="relative">
              <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input id="register-confirm" type="password" placeholder="Confirm password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field !pl-11" required />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">🌐</span>
              <select id="register-language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="input-field !pl-11" required>
                <option value="en">English</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
