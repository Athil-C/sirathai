import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLockClosed, HiCheck, HiStar, HiArrowLeft } from 'react-icons/hi';
import { FaTrophy } from 'react-icons/fa';
import { getPathBySlug } from '../services/api';

const pathInfo = {
  thareeq: { name: 'Thareeq', icon: '🟢', color: 'primary', gradient: 'from-emerald-500 to-emerald-600' },
  fiqh: { name: 'Fiqh', icon: '🔵', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
  quran: { name: 'Quran', icon: '🟡', color: 'yellow', gradient: 'from-yellow-500 to-amber-600' },
  aqeeda: { name: 'Aqeeda', icon: '🟣', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
};

const PathRoadmap = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const path = pathInfo[slug] || pathInfo.thareeq;
  const [lessons, setLessons] = useState([]);
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPath();
  }, [slug]);

  const fetchPath = async () => {
    setLoading(true);
    try {
      const { data } = await getPathBySlug(slug);
      setPathData(data.path);
      setLessons(data.lessons || []);
    } catch (err) {
      console.error('Failed to fetch path:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (lesson) => {
    if (lesson.progress?.status === 'completed') return 'completed';
    if (lesson.isUnlocked && lesson.progress?.status !== 'completed') return 'current';
    return 'locked';
  };

  const getNodeStyle = (lesson) => {
    const status = getStatus(lesson);
    const size = lesson.nodeType === 'milestone' ? 'w-20 h-20' : 'w-16 h-16';
    if (status === 'completed') return `${size} path-node-completed`;
    if (status === 'current') return `${size} path-node-current`;
    return `${size} path-node-locked`;
  };

  const getNodeIcon = (lesson) => {
    const status = getStatus(lesson);
    if (status === 'completed') return <HiCheck className="text-xl" />;
    if (status === 'locked') return <HiLockClosed className="text-lg" />;
    if (lesson.nodeType === 'milestone') return <FaTrophy className="text-lg" />;
    return <HiStar className="text-lg" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4 justify-center">
              <div className="w-16 h-16 rounded-full bg-dark-700 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <Link to="/paths" className="flex items-center gap-2 text-dark-400 hover:text-primary-400 text-sm mb-4 transition-colors">
            <HiArrowLeft /> Back to Paths
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{path.icon}</div>
            <div>
              <h1 className="text-3xl font-display font-bold text-dark-100">{pathData?.title || path.name} Path</h1>
              <p className="text-dark-400">Progress through levels to master {pathData?.title || path.name}</p>
              <p className="text-xs text-dark-500 mt-1">{lessons.filter(l => getStatus(l) === 'completed').length}/{lessons.length} lessons completed</p>
            </div>
          </div>
        </motion.div>

        {/* Roadmap */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-dark-700 -translate-x-1/2 rounded-full" />

          <div className="space-y-8">
            {lessons.map((lesson, i) => {
              const isLeft = i % 2 === 0;
              const status = getStatus(lesson);
              return (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Info card */}
                  <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block glass-card p-4 ${status === 'current' ? 'border-gold-500/50 shadow-glow-gold' : ''} ${status === 'completed' ? 'border-primary-500/30' : ''}`}>
                      <p className="font-semibold text-sm text-dark-100">{lesson.title}</p>
                      <p className="text-xs text-dark-500 mt-0.5">{lesson.description}</p>
                      <div className="flex items-center gap-2 mt-1 justify-end flex-wrap">
                        {lesson.type === 'worship_practice' && <span className="text-xs px-2 py-0.5 rounded bg-accent-500/20 text-accent-400">🎬 Worship</span>}
                        {lesson.type === 'recitation' && <span className="text-xs px-2 py-0.5 rounded bg-gold-500/20 text-gold-400">🎙️ Recitation</span>}
                        {lesson.nodeType === 'milestone' && <span className="text-xs px-2 py-0.5 rounded bg-primary-500/20 text-primary-400">🏆 Milestone</span>}
                        <span className="text-xs text-dark-500">+{lesson.xpReward} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.button
                      whileHover={status !== 'locked' ? { scale: 1.15 } : {}}
                      whileTap={status !== 'locked' ? { scale: 0.9 } : {}}
                      className={getNodeStyle(lesson)}
                      disabled={status === 'locked'}
                      onClick={() => status !== 'locked' && navigate(`/paths/${slug}/lesson/${lesson._id}`)}
                    >
                      {getNodeIcon(lesson)}
                    </motion.button>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathRoadmap;
