import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, X, AlertCircle, Shield, MessageCircle } from 'lucide-react'

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string, comment: string) => void
    title?: string
}

export function ReportModal({ isOpen, onClose, onConfirm, title = "Report Content" }: ReportModalProps) {
    const [reason, setReason] = useState('SPAM')
    const [comment, setComment] = useState('')

    const reasons = [
        { id: 'SPAM', label: 'Spam or Misleading', icon: <AlertCircle size={18} /> },
        { id: 'OFFENSIVE', label: 'Inappropriate or Offensive', icon: <Shield size={18} /> },
        { id: 'OTHER', label: 'Other Issues', icon: <MessageCircle size={18} /> },
    ]

    const handleSubmit = () => {
        onConfirm(reason, comment)
        setReason('SPAM')
        setComment('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-slate-100"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                    <Flag size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">{title}</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                                    Why are you reporting this?
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {reasons.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setReason(r.id)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                                reason === r.id 
                                                    ? 'border-red-500 bg-red-50/30 text-red-900' 
                                                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                            }`}
                                        >
                                            <div className={`${reason === r.id ? 'text-red-500' : 'text-slate-400'}`}>
                                                {r.icon}
                                            </div>
                                            <span className="font-bold">{r.label}</span>
                                            {reason === r.id && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell our moderators more..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-medium h-32 focus:outline-none focus:border-red-500/30 transition-all placeholder:text-slate-300 resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-0">
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <Flag size={18} /> Submit Report
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
