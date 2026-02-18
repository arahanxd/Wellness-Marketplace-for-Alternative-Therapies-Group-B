import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Profile, type Booking } from '../api/api'
import { Calendar, LayoutDashboard, ShoppingBag, MessageSquare, Sparkles, Clock, Compass, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { User, Mail, MapPin, Globe, Shield, Save, Briefcase } from 'lucide-react'

const SPECIALIZATIONS = [
  'Acupuncture',
  'Ayurveda',
  'Chiropractic',
  'Homeopathy',
  'Naturopathy',
  'Yoga Therapy',
  'Massage Therapy',
  'Nutrition & Dietetics',
  'Reiki',
  'Hypnotherapy'
]

interface EditProfileForm {
  name?: string;
  email?: string;
  city?: string;
  country?: string;
  specialization?: string;
  password?: string;
  confirmPassword?: string;
}

export function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editForm, setEditForm] = useState<EditProfileForm>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userProfile = await api.getProfile()
      setProfile(userProfile)
      setEditForm(userProfile)
      if (userProfile.id) {
        const userBookings = await api.getUserBookings(userProfile.id)
        setBookings(userBookings)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setMessage('Passwords do not match!')
      return
    }
    setUpdateLoading(true)
    setMessage('')
    try {
      await api.updateProfile(editForm)
      setProfile({ ...profile, ...editForm } as Profile)
      setIsEditing(false)
      setMessage('Profile updated successfully!')
      setEditForm({ ...editForm, password: '', confirmPassword: '' })
    } catch (err) {
      setMessage('Failed to update profile.')
    } finally {
      setUpdateLoading(false)
    }
  }

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
        <Activity size={32} className="text-brand-600" />
      </motion.div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading your wellness journey...</p>
    </div>
  )

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Dashboard', active: activeTab === 'overview', path: '#', onClick: () => setActiveTab('overview'), icon: <LayoutDashboard size={20} /> },
        { label: 'Marketplace', path: '/marketplace', icon: <Compass size={20} /> },
        { label: 'My Sessions', path: '#', icon: <Calendar size={20} /> },
        { label: 'Profile', active: activeTab === 'profile', path: '#', onClick: () => setActiveTab('profile'), icon: <User size={20} /> },
        { label: 'Product Store', path: '#', icon: <ShoppingBag size={20} /> },
      ]}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 overflow-hidden relative group"
            >
              <div className="relative z-10">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                  Wellness <span className="text-brand-600">Overview</span>
                </h2>
                <p className="text-slate-500 flex items-center gap-2 font-medium">
                  <Sparkles size={16} className="text-brand-500" /> Track your activity and upcoming therapy sessions
                </p>
              </div>
              <Link to="/marketplace" className="relative z-10 bg-brand-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-brand-600/30 hover:scale-105 transition-all active:scale-95">
                Book New Session
              </Link>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
                        <Clock size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Session</span>
                    </div>
                    {bookings.length > 0 ? (
                      <div>
                        <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">
                          Session with Specialist
                        </h3>
                        <p className="text-sm text-slate-500 font-medium italic">
                          {bookings[0].bookingDate ? new Date(bookings[0].bookingDate).toLocaleDateString() : 'Date TBD'}
                        </p>
                        <div className="mt-6 flex items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                            {bookings[0].status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-400 font-medium italic">No sessions scheduled.</p>
                        <Link to="/marketplace" className="mt-4 text-brand-600 font-black text-sm flex items-center gap-1">
                          Find a practitioner <ArrowRight size={14} />
                        </Link>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
                        <Sparkles size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wellness Points</span>
                    </div>
                    <p className="text-5xl font-black text-slate-900 mb-1 tabular-nums">1,240</p>
                    <p className="text-sm text-slate-500 font-medium">You've earned 240 pts this month!</p>
                  </motion.div>
                </div>

                <section className="bg-white rounded-[3rem] border border-brand-100/50 p-10 shadow-xl shadow-brand-500/5">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <Calendar size={24} className="text-brand-600" /> Booking History
                    </h2>
                    <button className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700">View All</button>
                  </div>

                  <div className="space-y-5">
                    {bookings.length > 0 ? (
                      bookings.map((booking, idx) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-lg hover:shadow-brand-500/5 transition-all group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black group-hover:scale-110 transition-transform">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 leading-tight">Practitioner #{booking.practitionerId}</p>
                              <p className="text-xs text-slate-500 font-semibold">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleString() : 'Date Pending'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${booking.status === 'CONFIRMED' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                              booking.status === 'CANCELLED' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                                'border-brand-200 text-brand-600 bg-brand-50'
                              }`}>
                              {booking.status}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-16 text-center">
                        <div className="bg-slate-50 inline-block p-8 rounded-full mb-6 border border-slate-100">
                          <Calendar size={40} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No bookings found</p>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Your wellness journey starts with your first booking.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-10">
                <section className="bg-white rounded-[2.5rem] border border-brand-100/50 p-8 shadow-xl shadow-brand-500/5">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShoppingBag size={20} className="text-brand-600" /> Quick Store
                    </h2>
                  </div>
                  <div className="space-y-5">
                    {[
                      { name: 'Organic Lavender Oil', price: '$22', status: 'Delivered' },
                      { name: 'Meditation Cushion', price: '$45', status: 'In Transit' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100 transition-colors hover:bg-white">
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">
                            {item.price} · {item.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-brand-600 rounded-[2.5rem] p-8 shadow-xl shadow-brand-600/20 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <MessageSquare size={120} />
                  </div>
                  <h2 className="text-lg font-black mb-6 flex items-center gap-2 relative z-10">
                    <MessageSquare size={20} className="text-brand-100" /> Community
                  </h2>
                  <div className="space-y-6 relative z-10">
                    <p className="text-sm font-bold leading-relaxed italic border-l-4 border-white/20 pl-4 py-1">
                      "The acupuncture session last week completely cleared my chronic migraines. Highly recommend!"
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-white/10 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-white/10">#Acupuncture</span>
                      <span className="bg-white/10 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-white/10">#Wellness</span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-[3rem] border border-brand-100/50 shadow-2xl shadow-brand-500/5 overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-brand-600 to-indigo-600 relative">
                <div className="absolute -bottom-16 left-10">
                  <div className="h-32 w-32 rounded-[2rem] bg-white p-2 shadow-2xl">
                    <div className="h-full w-full rounded-[1.5rem] bg-brand-50 flex items-center justify-center text-brand-600 text-4xl font-black">
                      {profile.name[0]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-24 px-10 pb-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 mb-2">{profile.name}</h2>
                    <p className="text-slate-500 font-bold flex items-center gap-2">
                      <Shield size={16} className="text-brand-500" /> Member since 2024
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-brand-50 text-brand-600 px-6 py-3 rounded-2xl font-black hover:bg-brand-100 transition-all flex items-center gap-2"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>

                {message && (
                  <div className={`mb-8 p-4 rounded-2xl font-bold text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        disabled={!isEditing}
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        disabled
                        value={profile.email}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold opacity-50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Specialization</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        disabled={!isEditing}
                        value={editForm.specialization || ''}
                        onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none disabled:opacity-50 appearance-none"
                      >
                        <option value="">Select Specialization</option>
                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">City</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        disabled={!isEditing}
                        value={editForm.city || ''}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Country</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        disabled={!isEditing}
                        value={editForm.country || ''}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">New Password</label>
                        <div className="relative group">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={editForm.password || ''}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Confirm New Password</label>
                        <div className="relative group">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="password"
                            value={editForm.confirmPassword || ''}
                            onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {isEditing && (
                    <div className="md:col-span-2 pt-6">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="w-full bg-brand-600 text-white rounded-2xl py-5 font-black text-lg shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={20} /> {updateLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
const ArrowRight = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
)

