import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getUsers, adminGetReports, adminCreateUser, adminDeleteUser, adminUserStatus, adminReviewReport } from '../services/api';
import { HiUsers, HiShieldCheck, HiSearch, HiPlus, HiTrash, HiX, HiExclamation, HiCheck, HiFlag, HiBan, HiMail, HiEye, HiClock, HiDocumentText } from 'react-icons/hi';
import { FaStar, FaFire, FaTrophy, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>{open && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-display font-bold text-dark-100">{title}</h3><button onClick={onClose} className="text-dark-400 hover:text-white"><HiX /></button></div>
        {children}
      </motion.div>
    </motion.div>
  )}</AnimatePresence>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [roleFilter, setRoleFilter] = useState('');
  const [reportFilter, setReportFilter] = useState('');
  const [viewReport, setViewReport] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [u, r] = await Promise.all([getUsers(), adminGetReports()]);
      setUsers(u.data.users || []);
      setReports(r.data.reports || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const students = users.filter(u => u.role === 'student');
  const muftis = users.filter(u => u.role === 'mufti');
  const suspended = users.filter(u => u.isSuspended);
  const pendingReports = reports.filter(r => r.status === 'pending');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredReports = reportFilter ? reports.filter(r => r.status === reportFilter) : reports;

  // ── Actions ──
  const handleCreateUser = async () => {
    try {
      await adminCreateUser(form);
      toast.success(`${form.role === 'mufti' ? 'Mufti' : 'User'} created!`);
      setModal(null); setForm({});
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Remove ${name}? This action cannot be undone.`)) return;
    try { await adminDeleteUser(id); setUsers(p => p.filter(u => u._id !== id)); toast.success('User removed'); } catch { toast.error('Failed'); }
  };

  const handleStatus = async (id, action) => {
    try { await adminUserStatus(id, { action }); toast.success(`Account ${action}d successfully`); fetchAll(); } catch { toast.error('Failed'); }
  };

  const handleReport = async (id, status, actionTaken, notes) => {
    try { await adminReviewReport(id, { status, actionTaken, adminNotes: notes }); toast.success('Report updated'); fetchAll(); setViewReport(null); } catch { toast.error('Failed'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  if (loading) return <div className="min-h-screen py-8 px-4"><div className="max-w-6xl mx-auto space-y-4">{[1,2,3].map(i=><div key={i} className="glass-card p-6 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3 mb-3"/><div className="h-4 bg-dark-700 rounded w-1/2"/></div>)}</div></div>;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-glow"><HiShieldCheck className="text-white text-xl" /></div>
          <div><h1 className="text-3xl font-display font-bold text-dark-100">Admin Dashboard</h1><p className="text-dark-400 text-sm">Platform Management • {user?.name}</p></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users.length, icon: <HiUsers className="text-primary-400" />, bg: 'border-primary-500/20' },
            { label: 'Students', value: students.length, icon: <FaStar className="text-gold-400" />, bg: 'border-gold-500/20' },
            { label: 'Muftis', value: muftis.length, icon: <FaTrophy className="text-accent-400" />, bg: 'border-accent-500/20' },
            { label: 'Suspended', value: suspended.length, icon: <HiBan className="text-orange-400" />, bg: 'border-orange-500/20' },
            { label: 'Pending Reports', value: pendingReports.length, icon: <HiFlag className="text-red-400" />, bg: 'border-red-500/20' },
          ].map(s => (
            <div key={s.label} className={`glass-card p-4 border ${s.bg}`}>
              <div className="flex items-center gap-2 mb-1"><span className="text-lg">{s.icon}</span><span className="text-xs text-dark-400">{s.label}</span></div>
              <p className="text-2xl font-display font-bold text-dark-100">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'users', label: 'User Management', icon: '👥' },
            { key: 'reports', label: 'Report Management', icon: '🚩' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'glass-card text-dark-300 hover:text-dark-100'}`}>
              <span>{t.icon}</span> {t.label}
              {t.key === 'reports' && pendingReports.length > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{pendingReports.length}</span>}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-dark-100 mb-4 flex items-center gap-2"><FaTrophy className="text-gold-400" /> Top Learners</h3>
                <div className="space-y-2">
                  {[...students].sort((a,b) => (b.xp||0) - (a.xp||0)).slice(0,5).map((u,i) => (
                    <div key={u._id} className="flex items-center gap-3 p-3 bg-dark-800/40 rounded-xl">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${i===0?'bg-gold-500 text-dark-900':i===1?'bg-dark-300 text-dark-900':'bg-dark-700 text-dark-300'}`}>{i+1}</span>
                      <span className="flex-1 text-sm text-dark-100">{u.name}</span>
                      <span className="text-xs text-dark-400">{u.email}</span>
                      <span className="text-xs text-primary-400 flex items-center gap-1"><FaStar />{u.xp||0}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-bold text-dark-100 mb-4 flex items-center gap-2"><FaUserShield className="text-accent-400" /> Active Muftis</h3>
                <div className="space-y-2">
                  {muftis.map(m => (
                    <div key={m._id} className="flex items-center gap-3 p-3 bg-dark-800/40 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">{m.name?.charAt(0)}</div>
                      <div className="flex-1"><p className="text-sm text-dark-100 font-medium">{m.name}</p><p className="text-xs text-dark-500">{m.email}</p></div>
                      <span className="text-xs px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 capitalize">{m.muftiCategory || 'General'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${m.isSuspended ? 'bg-red-500/10 text-red-400' : 'bg-primary-500/10 text-primary-400'}`}>{m.isSuspended ? 'Suspended' : 'Active'}</span>
                    </div>
                  ))}
                  {muftis.length === 0 && <p className="text-sm text-dark-400 text-center py-4">No muftis registered yet</p>}
                </div>
              </div>
            </div>
            {pendingReports.length > 0 && (
              <div className="glass-card p-6 border border-red-500/30">
                <h3 className="font-bold text-dark-100 mb-3 flex items-center gap-2"><HiExclamation className="text-red-400" /> Pending Reports ({pendingReports.length})</h3>
                <p className="text-sm text-dark-400 mb-3">There are unreviewed reports that require attention.</p>
                <button onClick={() => setTab('reports')} className="btn-primary !py-2 !px-4 text-sm">Review Reports</button>
              </div>
            )}
          </div>
        )}

        {/* ── USER MANAGEMENT ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]"><HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" /><input type="text" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} className="input-field !pl-11" /></div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field !w-auto">
                <option value="">All Roles</option><option value="student">Students</option><option value="mufti">Muftis</option><option value="admin">Admins</option>
              </select>
              <button onClick={() => { setForm({ role: 'student' }); setModal('addUser'); }} className="btn-primary flex items-center gap-2 !py-2"><HiPlus /> Add User</button>
              <button onClick={() => { setForm({ role: 'mufti' }); setModal('addUser'); }} className="bg-gold-500/20 text-gold-400 border border-gold-500/30 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gold-500/30 transition-all"><HiPlus /> Add Mufti</button>
            </div>
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-dark-700">{['User','Email (Gmail)','Role','Status','Registered','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs text-dark-400 font-semibold">{h}</th>)}</tr></thead>
                <tbody>{filteredUsers.map(u=>(
                  <tr key={u._id} className="border-b border-dark-700/30 hover:bg-dark-800/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role==='mufti'?'bg-gradient-to-r from-gold-500 to-gold-600':'bg-gradient-emerald'}`}>{u.name?.charAt(0)}</div><span className="text-dark-100 font-medium">{u.name}</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-dark-300"><HiMail className="text-dark-500" />{u.email}</div></td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${u.role==='admin'?'bg-red-500/20 text-red-400 border-red-500/30':u.role==='mufti'?'bg-gold-500/20 text-gold-400 border-gold-500/30':'bg-primary-500/20 text-primary-400 border-primary-500/30'}`}>{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${u.isSuspended?'bg-red-500/20 text-red-400 border-red-500/30':'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>{u.isSuspended?'Suspended':'Active'}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-dark-400 text-xs"><HiClock />{fmtDate(u.createdAt)}</div></td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && <div className="flex gap-1">
                        <button onClick={() => handleStatus(u._id, u.isSuspended ? 'activate' : 'suspend')} className={`p-1.5 rounded-lg text-xs ${u.isSuspended ? 'text-primary-400 hover:bg-primary-500/10' : 'text-orange-400 hover:bg-orange-500/10'}`} title={u.isSuspended?'Activate':'Suspend'}>{u.isSuspended?<HiCheck />:<HiBan />}</button>
                        <button onClick={() => handleDeleteUser(u._id, u.name)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10" title="Remove"><HiTrash /></button>
                      </div>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {filteredUsers.length === 0 && <div className="p-8 text-center text-dark-400 text-sm">No users found</div>}
            </div>
          </div>
        )}

        {/* ── REPORT MANAGEMENT ── */}
        {tab === 'reports' && (
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2"><FaExclamationTriangle className="text-red-400" /> Report Management</h2>
              <div className="ml-auto">
                <select value={reportFilter} onChange={e => setReportFilter(e.target.value)} className="input-field !w-auto !py-2 text-sm">
                  <option value="">All Reports</option><option value="pending">Pending</option><option value="action_taken">Action Taken</option><option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>
            {filteredReports.length === 0 ? (
              <div className="glass-card p-12 text-center"><p className="text-4xl mb-4">✅</p><h3 className="text-lg font-bold text-dark-100">No Reports</h3><p className="text-dark-400 text-sm">No reports match your filter.</p></div>
            ) : filteredReports.map(r => (
              <div key={r._id} className={`glass-card p-5 border ${r.status==='pending'?'border-red-500/30':'border-dark-700/50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-dark-100">Report against: <span className="text-red-400">{r.reportedUser?.name}</span> ({r.reportedUser?.role})</p>
                    <p className="text-xs text-dark-400">By: {r.reporter?.name} • {r.reporter?.email} • {fmtDate(r.createdAt)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${r.status==='pending'?'bg-red-500/20 text-red-400 border-red-500/30':r.status==='action_taken'?'bg-gold-500/20 text-gold-400 border-gold-500/30':'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>{r.status?.replace('_',' ')}</span>
                </div>
                <p className="text-sm text-dark-200 mb-1"><strong>Reason:</strong> {r.reason?.replace(/_/g,' ')}</p>
                <p className="text-sm text-dark-400 mb-3">{r.description}</p>
                {r.evidence?.length > 0 && (
                  <div className="mb-3 p-3 bg-dark-800/40 rounded-lg border border-dark-700/50">
                    <p className="text-xs text-dark-400 font-semibold mb-1 flex items-center gap-1"><HiDocumentText /> Evidence / Messages:</p>
                    {r.evidence.map((e,i)=><p key={i} className="text-sm text-dark-300 pl-4 border-l-2 border-primary-500/30 my-1">{e}</p>)}
                  </div>
                )}
                {r.adminNotes && <p className="text-sm text-primary-400 mb-3 flex items-center gap-1"><HiDocumentText /> Admin Notes: {r.adminNotes}</p>}
                {r.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setForm({ reportId: r._id, reportedName: r.reportedUser?.name, reportedRole: r.reportedUser?.role }); setModal('reviewReport'); }} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1"><HiEye /> Review & Take Action</button>
                    <button onClick={() => handleReport(r._id, 'dismissed', 'none', 'Dismissed after review')} className="btn-secondary !py-2 !px-4 text-sm">Dismiss</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── MODALS ── */}
        <Modal open={modal==='addUser'} onClose={() => setModal(null)} title={form.role === 'mufti' ? '🕌 Add New Mufti' : '👤 Add New User'}>
          <div className="space-y-3">
            <input placeholder="Full Name" className="input-field" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} />
            <input placeholder="Email (Gmail)" type="email" className="input-field" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} />
            <input placeholder="Password" type="password" className="input-field" value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})} />
            <select className="input-field" value={form.role||'student'} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="student">Student</option><option value="mufti">Mufti</option>
            </select>
            {form.role === 'mufti' && (
              <select className="input-field" value={form.muftiCategory||''} onChange={e=>setForm({...form,muftiCategory:e.target.value})}>
                <option value="">Select Specialization</option><option value="thareeq">Thareeq</option><option value="fiqh">Fiqh</option><option value="quran">Quran</option><option value="aqeeda">Aqeeda</option>
              </select>
            )}
            <button onClick={handleCreateUser} className="btn-primary w-full">{form.role === 'mufti' ? 'Create Mufti Account' : 'Create User Account'}</button>
          </div>
        </Modal>

        <Modal open={modal==='reviewReport'} onClose={() => setModal(null)} title="⚖️ Review Report">
          <div className="space-y-3">
            <div className="p-3 bg-dark-800/40 rounded-lg">
              <p className="text-sm text-dark-200">Reported: <span className="font-bold text-red-400">{form.reportedName}</span> ({form.reportedRole})</p>
            </div>
            <textarea placeholder="Admin notes / response..." className="input-field min-h-[80px]" value={form.adminNotes||''} onChange={e=>setForm({...form,adminNotes:e.target.value})} />
            <select className="input-field" value={form.actionTaken||'warning'} onChange={e=>setForm({...form,actionTaken:e.target.value})}>
              <option value="warning">⚠️ Send Warning</option>
              <option value="suspension">🚫 Suspend Account</option>
              <option value="removal">❌ Remove Account</option>
              <option value="none">✅ No Action Needed</option>
            </select>
            <button onClick={() => { handleReport(form.reportId, 'action_taken', form.actionTaken, form.adminNotes); setModal(null); }} className="btn-primary w-full">Take Action</button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
