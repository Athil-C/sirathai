import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiLightningBolt, HiUserGroup, HiStar, HiPlay, HiShieldCheck } from 'react-icons/hi';
import { FaMosque, FaQuran, FaPray, FaHandsHelping } from 'react-icons/fa';
import logo from '../assets/logo.png';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const Landing = () => {
    const features = [
      { icon: <HiAcademicCap className="text-3xl" />, title: '4 Learning Paths', desc: 'Thareeq, Fiqh, Quran & Aqeeda — structured from beginner to mastery', color: 'from-primary-600 to-primary-500' },
      { icon: <FaPray className="text-3xl" />, title: 'Worship Training', desc: 'Learn Salah & Wudu with animated guides and AI webcam feedback', color: 'from-primary-600 to-primary-400' },
      { icon: <FaQuran className="text-3xl" />, title: 'Quran Recitation', desc: 'Listen, record, and compare your voice against reference audio', color: 'from-primary-500 to-primary-400' },
      { icon: <HiLightningBolt className="text-3xl" />, title: 'Gamified Journey', desc: 'Earn XP, coins, badges, and maintain streaks like Duolingo', color: 'from-primary-600 to-primary-500' },
      { icon: <HiShieldCheck className="text-3xl" />, title: 'Ask a Mufti', desc: 'Get answers from verified Islamic scholars in each community', color: 'from-primary-600 to-primary-400' },
      { icon: <HiUserGroup className="text-3xl" />, title: '4 Communities', desc: 'Join path-specific communities moderated by expert Muftis', color: 'from-primary-500 to-primary-400' },
    ];

  const paths = [
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-glow">
          <FaMosque className="text-3xl" />
        </div>
      ),
      name: 'Thareeq',
      desc: 'Islamic way of life, daily duas, Salah & Wudu training',
      lessons: '40+'
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-glow">
          <HiShieldCheck className="text-3xl" />
        </div>
      ),
      name: 'Fiqh',
      desc: 'Islamic jurisprudence, worship rules, practical guidance',
      lessons: '50+'
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-glow">
          <FaQuran className="text-3xl" />
        </div>
      ),
      name: 'Quran',
      desc: 'Arabic alphabet, Tajweed, recitation & memorization',
      lessons: '50+'
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-glow">
          <FaPray className="text-3xl" />
        </div>
      ),
      name: 'Aqeeda',
      desc: 'Islamic creed, Tawheed, Prophets, Hereafter',
      lessons: '40+'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-islamic" />
        <div className="absolute inset-0 pattern-overlay" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
              <HiStar /> AI-Powered Islamic Learning Platform
            </div>
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl sm:text-6xl md:text-7xl font-display font-black mb-6 leading-tight"
          >
            Learn Islam Like
            <br />
            <span className="text-gradient-primary">Never Before</span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10"
          >
            SiratAI combines AI technology with traditional Islamic knowledge to create a
            personalized, gamified learning experience for new Muslims and seekers of knowledge.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2">
              <HiPlay /> Start Your Journey
            </Link>
            <Link to="/login" className="btn-secondary text-lg !px-8 !py-4">
              I Have an Account
            </Link>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="flex flex-wrap items-center justify-center gap-8 mt-16"
          >
            {[
              { value: '180+', label: 'Lessons' },
              { value: '4', label: 'Learning Paths' },
              { value: 'AI', label: 'Powered' },
              { value: '∞', label: 'Knowledge' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-display font-bold text-gradient-primary">{stat.value}</p>
                <p className="text-sm text-dark-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 pattern-overlay opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Everything You Need to Learn Islam</h2>
            <p className="section-subtitle mx-auto">From structured lessons to AI evaluation — SiratAI provides a complete learning ecosystem</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-dark-100 mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Paths */}
      <section className="py-24 px-4 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">4 Paths to Knowledge</h2>
            <p className="section-subtitle mx-auto">Choose your path and progress through gamified levels — from beginner to confident Muslim</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paths.map((path, i) => (
              <motion.div
                key={path.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="glass-card-hover p-6 text-center group"
              >
                <div className="mb-6 flex justify-center">{path.icon}</div>
                <h3 className="text-xl font-bold text-dark-100 mb-2">{path.name}</h3>
                <p className="text-dark-400 text-sm mb-4">{path.desc}</p>
                <span className="badge-success">{path.lessons} Lessons</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-islamic opacity-80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FaMosque className="text-6xl text-primary-500/50 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Begin Your Journey on the
            <span className="text-gradient-primary"> Straight Path</span>
          </h2>
          <p className="text-lg text-dark-300 mb-10">
            Join thousands of learners discovering Islam through AI-powered, gamified education.
          </p>
          <Link to="/register" className="btn-primary text-lg !px-10 !py-4">
            Start Learning — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SiratAI Logo" className="w-12 h-12 object-contain" />
            <span className="text-xl font-display font-bold text-gradient-primary">SiratAI</span>
          </div>
          <p className="text-dark-500 text-sm">© 2026 SiratAI. Built with ❤️ for the Muslim Ummah.</p>
          <div className="flex gap-4">
            <FaHandsHelping className="text-dark-500 hover:text-primary-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
