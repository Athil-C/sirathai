import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiDownload, HiShare, HiAcademicCap, HiX, HiPrinter } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Certificates = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Student';
  const [selectedCert, setSelectedCert] = useState(null);

  const stats = [
    { label: 'EARNED', count: 3, color: 'text-primary-600' },
    { label: 'IN PROGRESS', count: 2, color: 'text-gold-600' },
    { label: 'AVAILABLE', count: 4, color: 'text-dark-400' },
  ];

  const earnedCerts = [
    {
      id: 1,
      title: 'Certificate 1',
      path: 'QURAN: TAJWEED BASICS',
      date: 'June 15, 2026',
      instructor: 'Mufti Yusuf',
    },
    {
      id: 2,
      title: 'Certificate 2',
      path: 'FIQH: SALAH',
      date: 'June 28, 2026',
      instructor: 'Sheikh Abdullah',
    },
    {
      id: 3,
      title: 'Certificate 3',
      path: 'AQEEDAH: FOUNDATIONS',
      date: 'July 05, 2026',
      instructor: 'Ustadha Aisha',
    },
  ];

  const inProgressCerts = [
    { title: 'Seerah: Life of the Prophet', progress: 60 },
    { title: 'Advanced Fiqh', progress: 60 },
  ];

  const handleShare = (certPath) => {
    navigator.clipboard.writeText(`${window.location.origin}/verify-certificate/mock-id`);
    toast.success(`Share link for ${certPath} copied!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-dark-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-wider text-primary-600 uppercase">Certificates — Gallery with Download</p>
          <h1 className="text-3xl font-display font-bold text-dark-100">My Certificates</h1>
          <p className="text-sm text-dark-400">Certificates earned by completing learning paths.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-1">
              <span className={`text-4xl font-extrabold font-display ${stat.color}`}>
                {stat.count}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-dark-400 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Certificate Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {earnedCerts.map((cert) => (
            <div key={cert.id} className="glass-card p-5 flex flex-col justify-between space-y-4 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all group">
              
              {/* Thumbnail Container */}
              <div 
                onClick={() => setSelectedCert(cert)}
                className="aspect-[4/3] bg-dark-900 border border-dark-800 rounded-xl flex flex-col items-center justify-center p-6 text-center relative cursor-pointer overflow-hidden group-hover:border-primary-500/30 transition-colors"
              >
                {/* Decorative border */}
                <div className="absolute inset-2 border border-dashed border-dark-700/60 rounded-lg pointer-events-none" />
                
                <div className="space-y-3 z-10">
                  <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto text-primary-600">
                    <HiAcademicCap className="text-xl" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold tracking-widest text-primary-600 uppercase">Certificate of Completion</p>
                    <div className="h-[2px] bg-dark-700 w-16 mx-auto my-1.5" />
                    <p className="text-[6px] text-dark-400 font-bold uppercase tracking-wide">Awarded To</p>
                    <p className="text-[10px] font-serif font-bold text-dark-100 truncate max-w-[150px]">{userName}</p>
                  </div>
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-dark-100">{cert.title}</h3>
                <p className="text-[10px] font-bold tracking-wider text-dark-400 uppercase">{cert.path}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 py-2 bg-white border border-dark-800 hover:border-primary-500/30 text-dark-200 hover:text-primary-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <HiDownload className="text-sm" />
                  Download
                </button>
                <button 
                  onClick={() => handleShare(cert.path)}
                  className="px-4 py-2 bg-white border border-dark-800 hover:bg-dark-900 text-dark-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Share
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* In Progress Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400">In Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressCerts.map((cert, i) => (
              <div key={i} className="glass-card p-4 flex items-center justify-between border-dashed border-dark-800 hover:border-solid hover:border-primary-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center text-dark-500 font-bold">
                    📖
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dark-100">{cert.title}</h4>
                    <p className="text-[9px] font-bold tracking-wider text-dark-400 uppercase">Complete path to unlock</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-primary-600">{cert.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-50/20 backdrop-blur-md print:bg-white print:p-0 print:inset-0"
          >
            <div className="absolute inset-0 print:hidden" onClick={() => setSelectedCert(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-dark-800 max-w-3xl w-full p-8 shadow-2xl relative flex flex-col space-y-6 overflow-hidden print:shadow-none print:border-none print:p-0 print:rounded-none print:max-w-none print:w-screen print:h-screen print:justify-center"
            >
              {/* Close & Print Buttons */}
              <div className="flex justify-end gap-2 print:hidden">
                <button 
                  onClick={handlePrint}
                  className="p-2 rounded-xl bg-dark-900 text-dark-200 hover:text-primary-600 transition-colors"
                  title="Print Certificate"
                >
                  <HiPrinter className="text-lg" />
                </button>
                <button 
                  onClick={() => setSelectedCert(null)}
                  className="p-2 rounded-xl bg-dark-900 text-dark-200 hover:text-red-500 transition-colors"
                  title="Close"
                >
                  <HiX className="text-lg" />
                </button>
              </div>

              {/* The Certificate Paper */}
              <div className="border-[12px] border-double border-primary-500/20 p-8 rounded-2xl bg-[#fafbf9] relative text-center space-y-8 flex flex-col justify-between aspect-[1.414/1] print:border-[16px] print:aspect-none print:h-[95vh] print:justify-center print:space-y-12">
                {/* Corners ornaments */}
                <div className="absolute top-4 left-4 text-primary-500/10 text-xl font-bold">🕌</div>
                <div className="absolute top-4 right-4 text-primary-500/10 text-xl font-bold">🕌</div>
                <div className="absolute bottom-4 left-4 text-primary-500/10 text-xl font-bold">🕌</div>
                <div className="absolute bottom-4 right-4 text-primary-500/10 text-xl font-bold">🕌</div>

                <div className="space-y-4">
                  <span className="text-2xl text-primary-600">🏆</span>
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-bold tracking-widest text-primary-600 uppercase">Certificate of Completion</h2>
                    <p className="text-[9px] font-bold text-dark-400 uppercase tracking-widest">SiratAI Platform</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs italic text-dark-300">This is to certify that</p>
                  <h3 className="text-2xl font-serif font-bold text-dark-100 tracking-wide border-b border-dark-800 pb-2 max-w-md mx-auto">{userName}</h3>
                  <p className="text-xs text-dark-300 max-w-lg mx-auto leading-relaxed pt-2">
                    has successfully completed the comprehensive curriculum and testing for the learning path
                  </p>
                  <h4 className="text-sm font-bold text-primary-600 tracking-wider uppercase mt-1">
                    {selectedCert.path}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 max-w-md mx-auto">
                  <div className="space-y-1 border-t border-dark-800 pt-2">
                    <p className="text-[10px] font-bold text-dark-100">{selectedCert.date}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-dark-400">Date Issued</p>
                  </div>
                  <div className="space-y-1 border-t border-dark-800 pt-2">
                    <p className="text-[10px] font-bold text-dark-100 font-serif italic">{selectedCert.instructor}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-dark-400">Authorized Signatory</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Certificates;
