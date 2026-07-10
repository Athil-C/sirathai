import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaMosque, FaQuran, FaPray } from 'react-icons/fa';
import { HiAcademicCap, HiShieldCheck } from 'react-icons/hi';

const pathData = [
  {
    slug: 'thareeq',
    name: 'Thareeq',
    icon: (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,75,57,0.25)] border border-primary-400/20">
        <FaMosque className="text-3xl sm:text-4xl" />
      </div>
    ),
    borderColor: 'border-primary-500/10 hover:border-primary-500/30',
    desc: 'Islamic way of life — daily Duas, Adhkar, Swalath, character building, and worship training with Salah & Wudu practice via webcam.',
    lessons: '40+',
    topics: ['Daily Duas', 'Adhkar', 'Salah Training', 'Wudu Practice', 'Character', 'Halal & Haram']
  },
  {
    slug: 'fiqh',
    name: 'Fiqh',
    icon: (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,75,57,0.25)] border border-primary-400/20">
        <HiShieldCheck className="text-3xl sm:text-4xl" />
      </div>
    ),
    borderColor: 'border-primary-500/10 hover:border-primary-500/30',
    desc: 'Islamic jurisprudence — Tahara, Salah rules, Fasting, Zakat, Hajj with worship practice levels.',
    lessons: '50+',
    topics: ['Tahara', 'Salah Rules', 'Fasting', 'Zakat', 'Hajj', 'Worship Practice']
  },
  {
    slug: 'quran',
    name: 'Quran',
    icon: (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,75,57,0.25)] border border-primary-400/20">
        <FaQuran className="text-3xl sm:text-4xl" />
      </div>
    ),
    borderColor: 'border-primary-500/10 hover:border-primary-500/30',
    desc: 'Quran recitation & memorization — Arabic alphabet, pronunciation, Tajweed, voice recording & audio comparison.',
    lessons: '50+',
    topics: ['Arabic Alphabet', 'Pronunciation', 'Tajweed', 'Reading', 'Voice Practice', 'Memorization']
  },
  {
    slug: 'aqeeda',
    name: 'Aqeeda',
    icon: (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,75,57,0.25)] border border-primary-400/20">
        <FaPray className="text-3xl sm:text-4xl" />
      </div>
    ),
    borderColor: 'border-primary-500/10 hover:border-primary-500/30',
    desc: 'Islamic creed & belief — Tawheed, Allah\'s Names, Prophets, Angels, Divine Books, and the Hereafter.',
    lessons: '40+',
    topics: ['Tawheed', 'Allah\'s Names', 'Prophets', 'Angels', 'Divine Books', 'Hereafter']
  },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

const LearningPaths = () => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-12">
          <h1 className="section-title mb-3 flex items-center justify-center gap-3">
            <HiAcademicCap /> Choose Your Path
          </h1>
          <p className="section-subtitle mx-auto">Select a learning path and progress through gamified levels from beginner to mastery</p>
        </motion.div>

        <div className="space-y-6">
          {pathData.map((path, i) => (
            <motion.div key={path.slug} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Link to={`/paths/${path.slug}`} className={`glass-card-hover p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 group border ${path.borderColor} block`}>
                <div className="group-hover:scale-110 transition-transform flex-shrink-0">{path.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-display font-bold text-dark-100 group-hover:text-primary-400 transition-colors">{path.name}</h2>
                    <span className="badge-success">{path.lessons} Lessons</span>
                  </div>
                  <p className="text-dark-400 text-sm mb-3">{path.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {path.topics.map((topic) => (
                      <span key={topic} className="px-3 py-1 rounded-lg bg-dark-700/50 text-dark-300 text-xs">{topic}</span>
                    ))}
                  </div>
                </div>
                <FaArrowRight className="text-dark-500 group-hover:text-primary-400 group-hover:translate-x-2 transition-all text-xl hidden md:block" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;
