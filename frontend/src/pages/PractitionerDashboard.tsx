import { useEffect, useState } from 'react';
import { api, type Profile, type Booking } from '../api/api';
import { SPECIALIZATIONS } from '../constants/specializations';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  CheckCircle2, XCircle, FileText, Calendar, User, LayoutDashboard, Settings,
  CloudUpload, ArrowRight, ShieldCheck, Activity, Globe, MessageSquare, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function VerificationStatusBadge({ status }: { status?: string }) {
  const s = (status || '').toUpperCase()
  if (s === 'APPROVED') return (
    <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-black border border-emerald-200 shadow-sm">
      <CheckCircle2 size={18} /> Verified Expert
    </span>
  )
  if (s === 'REJECTED') return (
    <span className="flex items-center gap-2 bg-rose-50 text-rose-700 px-6 py-3 rounded-2xl text-sm font-black border border-rose-200 shadow-sm">
      <XCircle size={18} /> Application Rejected
    </span>
  )
  if (s === 'REUPLOAD_REQUESTED') return (
    <span className="flex items-center gap-2 bg-orange-50 text-orange-700 px-6 py-3 rounded-2xl text-sm font-black border border-orange-200 shadow-sm">
      <RefreshCw size={18} /> Reupload Required
    </span>
  )
  if (s === 'PENDING_ADMIN_APPROVAL') return (
    <span className="flex items-center gap-2 bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl text-sm font-black border border-amber-200 shadow-sm uppercase tracking-wider">
      <Activity size={18} /> Pending Admin Review
    </span>
  )
  return (
    <span className="flex items-center gap-2 bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl text-sm font-black border border-slate-200 shadow-sm uppercase tracking-wider">
      <Activity size={18} /> {status || 'Pending'}
    </span>
  )
}

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'verification'>('overview');
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  const sidebarItems = [
    { label: 'Overview', onClick: () => setActiveTab('overview'), active: activeTab === 'overview', icon: <LayoutDashboard size={20} /> },
    { label: 'Marketplace', path: '/marketplace', icon: <Globe size={20} /> },
    { label: 'Profile', onClick: () => setActiveTab('profile'), active: activeTab === 'profile', icon: <User size={20} /> },
    { label: 'Verification', onClick: () => setActiveTab('verification'), active: activeTab === 'verification', icon: <ShieldCheck size={20} /> },
    { label: 'Settings', path: '#', icon: <Settings size={20} /> },
  ];

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res);
      setEditForm({
        name: res.name,
        city: res.city,
        country: res.country,
        specialization: res.specialization,
      });
      if (res.id) {
        const bookingRes = await api.getPractitionerBookings(res.id);
        setBookings(bookingRes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const saveProfile = async () => {
    if (!profile) return;
    if (editForm.password && editForm.password !== (editForm as any).confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const updated = await api.updateProfile(editForm);
      setMessage('Profile updated successfully');
      setProfile({ ...profile, ...updated });
      setEditForm({ ...editForm, password: '', confirmPassword: '' } as any);
      localStorage.setItem('userName', updated.name || profile.name || '');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDegreeFile(e.target.files[0]);
    }
  };

  const uploadDegree = async () => {
    if (!degreeFile || !profile) return;
    setLoading(true);
    try {
      await api.uploadDegree(degreeFile, profile.id);
      setMessage('Degree uploaded successfully');
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload degree');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
        <Activity size={32} className="text-brand-600" />
      </motion.div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading practitioner portal...</p>
    </div>
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-brand-600 to-violet-600 p-10 rounded-[2.5rem] shadow-xl shadow-brand-500/20 text-white"
        >
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">
              Practitioner <span className="text-white/80">Portal</span>
            </h2>
            <p className="text-white/70 font-medium">Manage your professional credentials and bookings.</p>
          </div>
          <VerificationStatusBadge status={profile.verificationStatus} />
        </motion.header>

        {/* Admin Comment Banner (shown when rejected or reupload requested) */}
        {profile.adminComment && (profile.verificationStatus === 'REJECTED' || profile.verificationStatus === 'REUPLOAD_REQUESTED') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border flex items-start gap-4 ${profile.verificationStatus === 'REJECTED'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-orange-50 border-orange-200'
              }`}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${profile.verificationStatus === 'REJECTED' ? 'bg-rose-100' : 'bg-orange-100'}`}>
              {profile.verificationStatus === 'REJECTED'
                ? <AlertCircle size={20} className="text-rose-600" />
                : <RefreshCw size={20} className="text-orange-600" />}
            </div>
            <div>
              <p className={`font-black text-sm mb-1 ${profile.verificationStatus === 'REJECTED' ? 'text-rose-800' : 'text-orange-800'}`}>
                {profile.verificationStatus === 'REJECTED' ? 'Rejection Reason' : 'Reupload Instructions'}
              </p>
              <p className={`text-sm font-medium ${profile.verificationStatus === 'REJECTED' ? 'text-rose-700' : 'text-orange-700'}`}>
                {profile.adminComment}
              </p>
              {profile.verificationStatus === 'REUPLOAD_REQUESTED' && (
                <button
                  onClick={() => setActiveTab('verification')}
                  className="mt-3 text-xs font-black text-orange-600 underline hover:text-orange-800"
                >
                  Go to Verification tab to reupload →
                </button>
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                    <Calendar size={24} className="text-brand-600" /> Upcoming Sessions
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Patient</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date/Time</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bookings.length > 0 ? (
                        bookings.map((booking, idx) => (
                          <motion.tr
                            key={booking.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-6 pl-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-xs">
                                  P
                                </div>
                                <span className="font-bold text-slate-900">Patient #{booking.userId}</span>
                              </div>
                            </td>
                            <td className="py-6 text-sm font-bold text-slate-600 tabular-nums">
                              {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                            </td>
                            <td className="py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${booking.status === 'CONFIRMED' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                                  booking.status === 'CANCELLED' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                                    'border-brand-200 text-brand-600 bg-brand-50'
                                }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-6 text-slate-500 text-xs font-medium italic max-w-[200px] truncate">{booking.notes || 'No notes'}</td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-20 text-center">
                            <Calendar size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No active bookings found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 max-w-4xl mx-auto">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                  <User size={24} className="text-brand-600" /> Profile Information
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          name="name"
                          value={editForm.name || ''}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                      <div className="relative group opacity-50">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={profile.email}
                          disabled
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Specialization</label>
                      <select
                        name="specialization"
                        value={editForm.specialization || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                      >
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">City</label>
                      <input
                        type="text"
                        name="city"
                        value={editForm.city || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={editForm.country || ''}
                        onChange={handleProfileChange}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 mt-6">
                    <h4 className="text-sm font-black text-slate-900 mb-4">Security</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">New Password</label>
                        <input
                          type="password"
                          name="password"
                          placeholder="Leave blank to keep current"
                          value={editForm.password || ''}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={(editForm as any).confirmPassword || ''}
                          onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value } as any)}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Updating...' : <><ArrowRight size={18} /> Save Changes</>}
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 max-w-2xl mx-auto">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                  <ShieldCheck size={24} className="text-brand-600" /> Professional Verification
                </h3>

                {/* Current Status */}
                <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Current Status</p>
                  <VerificationStatusBadge status={profile.verificationStatus} />
                  {profile.adminComment && (
                    <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                      <MessageSquare size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700 font-medium">{profile.adminComment}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-brand-300 transition-all hover:bg-brand-50/30">
                    <div className="p-5 rounded-3xl bg-white shadow-sm mb-6 text-slate-400 group-hover:text-brand-600 transition-colors">
                      <CloudUpload size={40} />
                    </div>
                    <h4 className="font-black text-slate-900 mb-2">Upload your credentials</h4>
                    <p className="text-xs text-slate-500 font-medium mb-6">Attach your PDF degree or certificate for admin verification.</p>
                    <input
                      type="file"
                      id="degree-upload"
                      accept="application/pdf"
                      onChange={handleDegreeChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="degree-upload"
                      className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                    >
                      {degreeFile ? degreeFile.name : 'Choose File'}
                    </label>
                  </div>

                  <button
                    onClick={uploadDegree}
                    disabled={loading || !degreeFile}
                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : <><ShieldCheck size={18} /> Submit for Review</>}
                  </button>

                  {profile.degreeFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-900 leading-tight">Document Uploaded</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Status: {profile.verificationStatus}</p>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:8080/api/degree/${profile.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-white transition-all shadow-sm"
                      >
                        <ArrowRight size={16} />
                      </a>
                    </motion.div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Message */}
        {message && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 font-black text-sm flex items-center gap-3"
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${message.includes('match') || message.includes('Failed') ? 'bg-red-500' : 'bg-brand-500'}`} />
            {message}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
