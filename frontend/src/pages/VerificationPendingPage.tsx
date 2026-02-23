import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { TopNav } from '../components/TopNav';

export function VerificationPendingPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <TopNav />
            <main className="mx-auto max-w-2xl px-4 pt-20 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2.5rem] bg-white p-12 shadow-xl shadow-brand-500/5 border border-brand-100"
                >
                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Mail size={48} className="animate-bounce" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Check your email</h1>
                    <p className="text-lg text-slate-600 mb-8 font-medium">
                        We've sent a verification link to your email address. Please click the link to activate your account.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-95"
                        >
                            Back to Login <ArrowRight size={20} />
                        </button>
                        <p className="text-sm text-slate-500 pt-4">
                            Didn't receive the email? Check your spam folder or try registering again.
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
