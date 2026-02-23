import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '../api/api';
import { TopNav } from '../components/TopNav';

export function VerifyEmailLanding() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (token) {
            api.verifyEmail(token)
                .then(() => setStatus('success'))
                .catch(() => setStatus('error'));
        } else {
            setStatus('error');
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <TopNav />
            <main className="mx-auto max-w-2xl px-4 pt-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.5rem] bg-white p-12 shadow-xl shadow-brand-500/5 border border-brand-100"
                >
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <Loader2 size={64} className="animate-spin text-brand-600 mb-6" />
                            <h2 className="text-2xl font-bold text-slate-900">Verifying your email...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <CheckCircle2 size={64} className="text-emerald-500 mb-6" />
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Verification Successful!</h2>
                            <p className="text-slate-600 mb-8 font-medium italic">
                                Your email has been verified. You can now login and access your dashboard.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full rounded-2xl bg-brand-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <XCircle size={64} className="text-red-500 mb-6" />
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Verification Failed</h2>
                            <p className="text-slate-600 mb-8 font-medium">
                                The verification link is invalid or has expired. Please try registering again.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800"
                            >
                                Back to Registration
                            </button>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
