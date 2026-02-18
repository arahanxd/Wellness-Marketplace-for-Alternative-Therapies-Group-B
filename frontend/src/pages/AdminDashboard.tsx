import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Profile } from '../api/api'
import { ShieldCheck, UserCheck, UserX, FileText, LayoutDashboard, Settings, Activity, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminDashboard() {
  const [practitioners, setPractitioners] = useState<Profile[]>([])
  const [systemUsers, setSystemUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [confirmingAction, setConfirmingAction] = useState<{ id: number, type: 'APPROVE' | 'REJECT' } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pracData, allUserData] = await Promise.all([
        api.getPractitioners(),
        api.getAllUsers()
      ])
      setPractitioners(pracData)
      setSystemUsers(allUserData)
    } catch (err) {
      console.error('FETCH DATA ERROR:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (id: number) => {
    setProcessingId(id)
    try {
      await api.approvePractitioner(id)
      await fetchData()
      setConfirmingAction(null)
    } catch (err: any) {
      console.error('ADMIN APPROVE ERROR:', err.response?.data || err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: number) => {
    setProcessingId(id)
    try {
      await api.rejectPractitioner(id)
      await fetchData()
      setConfirmingAction(null)
    } catch (err: any) {
      console.error('ADMIN REJECT ERROR:', err.response?.data || err)
    } finally {
      setProcessingId(null)
    }
  }

  const sidebarItems = [
    { label: 'Overview', onClick: () => setActiveTab('overview'), active: activeTab === 'overview', icon: <LayoutDashboard size={20} /> },
    { label: 'Users', onClick: () => setActiveTab('users'), active: activeTab === 'users', icon: <UserCheck size={20} /> },
    { label: 'Reports', path: '#', icon: <Activity size={20} /> },
    { label: 'Settings', path: '#', icon: <Settings size={20} /> },
  ]

  const Statistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {[
        { label: 'Total Users', value: systemUsers.length, icon: <UserCheck className="text-blue-500" /> },
        { label: 'Practitioners', value: practitioners.length, icon: <ShieldCheck className="text-brand-500" /> },
        { label: 'Pending Approval', value: practitioners.filter(p => p.verificationStatus === 'PENDING_ADMIN_APPROVAL').length, icon: <Activity className="text-amber-500" /> },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
        </div>
      ))}
    </div>
  )

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">Control Panel</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
            Admin <span className="text-brand-600">{activeTab === 'overview' ? 'Verification' : 'Management'}</span>
          </h2>
          <p className="text-slate-500 font-medium italic">
            {activeTab === 'overview' ? 'Validate practitioner credentials and manage platform access.' : 'View and manage all registered accounts on the platform.'}
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Statistics />
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <ShieldCheck size={24} className="text-brand-600" /> Practitioners
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {practitioners.length} Applications Total
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                        <Activity size={32} className="text-brand-600" />
                      </motion.div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing records...</p>
                    </div>
                  ) : practitioners.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No practitioners found</p>
                    </div>
                  ) : (
                    practitioners.map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-500/5 hover:border-brand-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                      >
                        <div className="flex items-start gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 text-2xl font-black shadow-inner shadow-brand-500/5">
                            {p.name[0]}
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900 mb-1">{p.name}</h4>
                            <p className="text-sm font-bold text-slate-400 mb-3">{p.email}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
                                {p.city} · {p.country}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${p.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                p.verificationStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                  'bg-brand-50 text-brand-600 border border-brand-100'
                                }`}>
                                {p.verificationStatus === 'APPROVED' && <CheckCircle2 size={12} />}
                                {p.verificationStatus === 'REJECTED' && <XCircle size={12} />}
                                {p.verificationStatus || 'PENDING'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 lg:pl-10 lg:border-l border-slate-100">
                          {p.degreeFile && (
                            <a
                              href={`http://localhost:8080/api/degree/${p.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 bg-brand-50 text-brand-600 px-6 py-4 rounded-2xl text-sm font-black hover:bg-brand-100 transition-all shadow-sm"
                            >
                              <FileText size={18} /> Credentials
                            </a>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2">
                            {confirmingAction?.id === p.id ? (
                              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 px-2">
                                  Confirm {confirmingAction!.type}?
                                </span>
                                <button
                                  onClick={() => confirmingAction!.type === 'APPROVE' ? handleApprove(p.id) : handleReject(p.id)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-lg transition-all ${confirmingAction!.type === 'APPROVE' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                                >
                                  {processingId === p.id ? '...' : 'Yes'}
                                </button>
                                <button onClick={() => setConfirmingAction(null)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-white text-slate-400 border border-slate-200">No</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setConfirmingAction({ id: p.id, type: 'APPROVE' })}
                                  className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
                                >
                                  <UserCheck size={20} />
                                </button>
                                <button
                                  onClick={() => setConfirmingAction({ id: p.id, type: 'REJECT' })}
                                  className="p-4 bg-rose-500 text-white rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all"
                                >
                                  <UserX size={20} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <UserCheck size={24} className="text-brand-600" /> Platform Multi-User Directory
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Name</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Status</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {systemUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 pl-4 font-bold text-slate-900">{user.name}</td>
                          <td className="py-6 text-sm text-slate-500">{user.email}</td>
                          <td className="py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                              user.role === 'PROVIDER' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${user.emailVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {user.emailVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${user.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              user.verificationStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                user.verificationStatus === 'PENDING_ADMIN_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                              {user.verificationStatus || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
