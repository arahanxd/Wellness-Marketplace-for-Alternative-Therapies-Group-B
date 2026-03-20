import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type ReportDTO } from '../api'
import {
    Flag,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Shield,
    MessageCircle,
    User,
    ExternalLink,
    AlertTriangle
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function AdminReportsPage() {
    const [reports, setReports] = useState<ReportDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const data = await api.getAllReports()
            setReports(data)
        } catch (err) {
            console.error('Failed to fetch reports:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleResolve = async (reportId: number, action: 'DELETE_CONTENT' | 'KEEP_CONTENT' | 'SUSPEND_USER') => {
        try {
            await api.resolveReport(reportId, action)
            setReports(prev => prev.map(r =>
                r.reportId === reportId ? { ...r, status: 'RESOLVED', resolutionAction: action } : r
            ))
            setFeedback({ message: `Content ${action.replace('_', ' ').toLowerCase()}ed successfully.`, type: 'success' })
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback({ message: 'Failed to resolve report.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        }
    }

    const sidebarItems = [
        { label: 'Admin Dashboard', path: '/admin', icon: <Shield size={20} /> },
        { label: 'Flagged Content', path: '/admin/reports', active: true, icon: <Flag size={20} /> },
    ]

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4 text-brand-600">
                <Flag size={32} />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading reports...</p>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div className="max-w-6xl mx-auto space-y-10">
                <header>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                        <Flag className="text-red-500" size={40} /> Flagged Content
                    </h1>
                    <p className="text-slate-500 font-medium italic">Manage questions flagged by the community for moderation.</p>
                </header>

                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-6 rounded-[1.5rem] border flex items-center gap-4 font-black shadow-xl ${feedback.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                        >
                            {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            {feedback.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-6">
                    {reports.length > 0 ? reports.map((report, idx) => (
                        <motion.div
                            key={report.reportId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[2.5rem] border border-brand-100 shadow-xl shadow-brand-500/5 overflow-hidden group hover:border-brand-300 transition-all flex flex-col md:flex-row"
                        >
                            <div className="p-8 md:w-3/4 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${report.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                        {report.status}
                                    </span>
                                    <span className="text-slate-300 ml-auto flex items-center gap-2 text-xs font-bold">
                                        <Clock size={14} /> {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Just now'}
                                    </span>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative quote-style">
                                    <MessageCircle className="absolute top-2 right-4 text-slate-200" size={40} />
                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 relative z-10">{report.reportedContent}</h3>
                                    <p className="text-xs font-black text-brand-600 uppercase tracking-widest flex items-center gap-2">
                                        {report.entityType} ID: #{report.reportedEntityId}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={12} /> Reported By
                                        </p>
                                        <p className="font-bold text-slate-700">{report.reporterName} (ID: #{report.reporterId})</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <AlertCircle size={12} /> Reason for Report
                                        </p>
                                        <p className="font-bold text-red-600 uppercase tracking-tighter">{report.reason}</p>
                                    </div>
                                </div>

                                {report.comment && (
                                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                        <p className="text-xs font-bold text-red-700 italic">" {report.comment} "</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 md:w-1/4 p-8 flex flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-100">
                                <Link
                                    to={
                                        report.entityType.includes('PRODUCT') ? `/product/${report.reportedEntityId}?readOnly=true&fromReports=true` :
                                            report.entityType.includes('FORUM') ? `/forum/${report.reportedEntityId}?readOnly=true&fromReports=true` :
                                                report.entityType === 'PRACTITIONER' ? `/marketplace?readOnly=true&fromReports=true` : '#'
                                    }
                                    className="w-full bg-white text-slate-600 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border border-slate-200 hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm"
                                >
                                    <ExternalLink size={14} /> View Context
                                </Link>
                                {report.status === 'RESOLVED' ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 size={12} /> Resolved
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 capitalize">
                                            Action: {report.resolutionAction?.replace('_', ' ').toLowerCase()}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => report.reportId && handleResolve(report.reportId, 'KEEP_CONTENT')}
                                            className="bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-3 rounded-2xl transition-all border border-slate-100"
                                            title="Keep Content"
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => report.reportId && handleResolve(report.reportId, 'DELETE_CONTENT')}
                                            className="bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-3 rounded-2xl transition-all border border-slate-100"
                                            title="Delete Content"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => report.reportId && handleResolve(report.reportId, 'SUSPEND_USER')}
                                            className="bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 p-3 rounded-2xl transition-all border border-slate-100"
                                            title="Suspend User"
                                        >
                                            <AlertTriangle size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )) : null}
                    {reports.length === 0 && (
                        <div className="py-24 text-center bg-white rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                            <div className="bg-slate-50 inline-block p-12 rounded-full mb-6">
                                <CheckCircle2 size={64} className="text-green-200" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2 italic">Clean Slate!</h2>
                            <p className="text-slate-500 font-medium italic">No new reports to handle. All quiet on the moderation front.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
