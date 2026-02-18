import { useEffect, useState } from 'react';
import { api, type Profile, type Booking } from '../api/api';
import { SPECIALIZATIONS } from '../constants/specializations';
import { DashboardLayout } from '../components/DashboardLayout';
import { CheckCircle2, XCircle, FileText, Calendar, User, LayoutDashboard, Settings, CloudUpload, ArrowRight, ShieldCheck, Activity, MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const sidebarItems = [
    { label: 'Overview', path: '/practitioner', active: true, icon: <LayoutDashboard size={20} /> },
    { label: 'Profile', path: '#', icon: <User size={20} /> },
    { label: 'Verification', path: '#', icon: <ShieldCheck size={20} /> },
    { label: 'Settings', path: '#', icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res);
      if (res.id) {
        const bookingRes = await api.getPractitionerBookings(res.id);
        setBookings(bookingRes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const saveProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await api.updateProfile(profile);
      setMessage('Profile updated successfully');
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
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5"
        >
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
              Practitioner <span className="text-brand-600">Portal</span>
            </h2>
            <p className="text-slate-500 font-medium">Manage your professional credentials and bookings.</p>
          </div>
          <div className="flex items-center gap-2">
            {profile.verificationStatus === 'VERIFIED' ? (
              <span className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-sm font-black border border-emerald-100 shadow-sm shadow-emerald-500/10">
                <CheckCircle2 size={18} /> Verified Expert
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl text-sm font-black border border-amber-100 shadow-sm shadow-amber-500/10 uppercase tracking-wider">
                <XCircle size={18} /> {profile.verificationStatus}
              </span>
            )}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <User size={24} className="text-brand-600" /> Profile Information
            </h3>
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={profile.name || ''}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Specialization Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Specialization</label>
                <div className="relative group">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <select
                    name="specialization"
                    value={profile.specialization || ''}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all appearance-none font-medium"
                  >
                    <option value="">Select Specialization</option>
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">City</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="text"
                      name="city"
                      value={profile.city || ''}
                      onChange={handleProfileChange}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Country</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="text"
                      name="country"
                      value={profile.country || ''}
                      onChange={handleProfileChange}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={saveProfile}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {loading ? 'Updating...' : <>Save Changes <ArrowRight size={18} /></>}
              </button>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 h-fit">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <ShieldCheck size={24} className="text-brand-600" /> Professional Verification
            </h3>
            <div className="space-y-8">
              <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-brand-300 transition-all hover:bg-brand-50/30">
                <div className="p-5 rounded-3xl bg-white shadow-sm mb-6 text-slate-400 group-hover:text-brand-600 transition-colors">
                  <CloudUpload size={40} />
                </div>
                <h4 className="font-black text-slate-900 mb-2">Upload your credentials</h4>
                <p className="text-xs text-slate-500 font-medium mb-6">Attach your PDF degree or certificate for AI verification.</p>
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
                {loading ? 'Processing...' : <>Submit for AI Review <ShieldCheck size={18} /></>}
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
                      <p className="text-sm font-black text-emerald-900 leading-tight">Document Secured</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Pending AI Validation</p>
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
        </div>

        <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
              <Calendar size={24} className="text-brand-600" /> Upcoming Sessions
            </h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700">Detailed Schedule</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Patient Reference</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date/Time</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
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
                            UP
                          </div>
                          <span className="font-bold text-slate-900">USER_{booking.userId}</span>
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
                      <td className="py-6 text-slate-500 text-xs font-medium italic max-w-[200px] truncate">{booking.notes || 'No specific notes'}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No active bookings found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {message && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 font-black text-sm flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            {message}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
