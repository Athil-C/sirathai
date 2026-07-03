import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvailableMuftis, submitReport } from '../services/api';
import { HiFlag, HiArrowLeft, HiExclamation, HiShieldCheck, HiInformationCircle, HiLockClosed, HiDocumentText, HiUser } from 'react-icons/hi';
import toast from 'react-hot-toast';

const REASONS = [
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
  { value: 'wrong_information', label: 'Providing Wrong Information' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam / Irrelevant Content' },
  { value: 'other', label: 'Other' },
];

const ReportMufti = () => {
  const navigate = useNavigate();
  const [muftis, setMuftis] = useState([]);
  const [form, setForm] = useState({ reportedUserId: '', reason: '', description: '', evidence: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try { const { data } = await getAvailableMuftis(); setMuftis(data.muftis || []); } catch {}
    })();
  }, []);

  const handleSubmit = async () => {
    if (!form.reportedUserId || !form.reason || !form.description.trim()) {
      return toast.error('Please fill all required fields');
    }
    setSubmitting(true);
    try {
      await submitReport({ ...form, evidence: form.evidence ? [form.evidence] : [] });
      toast.success('Report submitted. Admin will review it shortly.');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit report');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative pattern-overlay bg-dark-950">
      {/* Decorative background glow blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-400 hover:text-primary-400 font-medium text-sm mb-8 transition-all hover:translate-x-[-4px]"
        >
          <HiArrowLeft className="text-base" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Guidelines & Security */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="glass-card p-8 border-l-4 border-l-red-500/50 relative overflow-hidden bg-gradient-to-br from-dark-800/80 to-dark-900/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20">
                <HiShieldCheck className="text-red-400 text-2xl" />
              </div>
              
              <h2 className="text-2xl font-display font-bold text-dark-100 mb-3">Safe & Verified</h2>
              <p className="text-dark-300 text-sm leading-relaxed mb-6">
                SiratAI is dedicated to keeping the learning space safe, authentic, and respectful. All reports are treated with the highest priority and discretion.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-primary-400"><HiLockClosed className="text-lg" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-dark-100">Strict Confidentiality</h4>
                    <p className="text-xs text-dark-400 mt-0.5">Your identity is completely hidden from the Mufti you report. Only administrators can view this report.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 text-primary-400"><HiInformationCircle className="text-lg" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-dark-100">Fair & Just Evaluation</h4>
                    <p className="text-xs text-dark-400 mt-0.5">Admin staff reviews conversation logs, provided details, and evidence objectively before taking any regulatory action.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 text-primary-400"><HiFlag className="text-lg" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-dark-100">Moderation Actions</h4>
                    <p className="text-xs text-dark-400 mt-0.5">Depending on findings, actions range from formal warnings, category suspension, to permanent removal.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-gold-500/5 border border-gold-500/20 rounded-2xl flex gap-3">
              <HiExclamation className="text-gold-400 text-2xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gold-300">Important Policy</h4>
                <p className="text-xs text-gold-400/80 leading-relaxed mt-1">
                  Please submit accurate and honest accounts of the incident. False or malicious reporting violates our guidelines and can lead to immediate account suspension.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Reporting Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="glass-card p-8 md:p-10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-dark-800/80 to-dark-900/80">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
              
              <div className="mb-8">
                <span className="text-xs font-semibold tracking-wider text-red-400 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 inline-block mb-3">Moderation Request</span>
                <h1 className="text-3xl font-display font-bold text-dark-100">Submit a Report</h1>
                <p className="text-dark-400 text-sm mt-1">Provide clear information to help our administrators review the case.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-dark-200 mb-2 flex items-center gap-2">
                    <HiUser className="text-dark-400" /> Select Mufti <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="input-field appearance-none cursor-pointer pr-10 focus:border-red-500/60 focus:ring-red-500/10"
                      value={form.reportedUserId}
                      onChange={e => setForm({ ...form, reportedUserId: e.target.value })}
                    >
                      <option value="">Choose a Mufti</option>
                      {muftis.map(m => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.muftiCategory ? m.muftiCategory.toUpperCase() : 'General'})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-dark-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-dark-200 mb-2 flex items-center gap-2">
                    <HiInformationCircle className="text-dark-400" /> Reason for Report <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="input-field appearance-none cursor-pointer pr-10 focus:border-red-500/60 focus:ring-red-500/10"
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                    >
                      <option value="">Select reason</option>
                      {REASONS.map(r => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-dark-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                      <HiDocumentText className="text-dark-400" /> Description <span className="text-red-400">*</span>
                    </label>
                    <span className="text-xs text-dark-400">{form.description.length} characters</span>
                  </div>
                  <textarea
                    className="input-field min-h-[140px] resize-none focus:border-red-500/60 focus:ring-red-500/10"
                    placeholder="Provide clear details on what transpired, including dates or messages if applicable..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-dark-200 mb-2 flex items-center gap-2">
                    <HiShieldCheck className="text-dark-400" /> Supporting Evidence <span className="text-dark-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <textarea
                    className="input-field min-h-[70px] resize-none focus:border-red-500/60 focus:ring-red-500/10"
                    placeholder="Paste relevant chat history transcript, links, or text logs..."
                    value={form.evidence}
                    onChange={e => setForm({ ...form, evidence: e.target.value })}
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 !py-4 shadow-lg hover:shadow-red-500/10 transition-all active:scale-[0.98] !from-red-600 !to-red-700 hover:!from-red-500 hover:!to-red-600"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <HiFlag className="text-lg" /> Submit Report Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReportMufti;
