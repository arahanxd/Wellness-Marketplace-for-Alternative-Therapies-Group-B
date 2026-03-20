import React from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Calendar,
    CreditCard,
    TrendingUp,
    User
} from 'lucide-react';
import { formatDateToIndian } from '../utils/date';
import { formatImageUrl } from '../utils/image';
import { type PatientAnalytics as AnalyticsData, type Booking, type Order } from '../api';

interface Props {
    data: AnalyticsData | null;
    loading: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const ActivityCard = ({ label, value, icon, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-brand-500/5 group hover:border-brand-300 transition-all"
    >
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 mb-6 w-fit transition-transform group-hover:scale-110`}>
            {React.cloneElement(icon, { className: color })}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
    </motion.div>
);

export const PatientActivity: React.FC<Props> = ({ data, loading }) => {
    if (loading || !data) {
        return (
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                    ))}
                </div>
                <div className="h-96 bg-slate-50 animate-pulse rounded-[3rem]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">

            {/* Activity Summary */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Activity Hub</h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Tracking your wellness journey and investments.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ActivityCard
                        label="Total Invested"
                        value={formatCurrency(data.totalSpent)}
                        icon={<CreditCard size={20} />}
                        color="text-brand-600"
                        delay={0.1}
                    />
                    <ActivityCard
                        label="Sessions Attended"
                        value={data.sessionsAttended.toString()}
                        icon={<Calendar size={20} />}
                        color="text-indigo-600"
                        delay={0.2}
                    />
                    <ActivityCard
                        label="Monthly Spend"
                        value={formatCurrency(data.monthlySpent)}
                        icon={<ShoppingBag size={20} />}
                        color="text-violet-600"
                        delay={0.3}
                    />
                    <ActivityCard
                        label="Yearly Spend"
                        value={formatCurrency(data.yearlySpent)}
                        icon={<TrendingUp size={20} />}
                        color="text-emerald-600"
                        delay={0.4}
                    />
                </div>
            </section>
            
            {/* Spend Distribution Graph */}
            <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-brand-500/5 overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-500/20">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Spend Distribution</h2>
                        <p className="text-xs text-slate-500 font-medium">Breakdown of wellness investments</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        {/* Session Spend Bar */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Session Costs</p>
                                    <p className="text-2xl font-black text-slate-900">{formatCurrency(data.totalSessionSpent)}</p>
                                </div>
                                <p className="text-xs font-black text-brand-600">
                                    {data.totalSpent > 0 ? Math.round((data.totalSessionSpent / data.totalSpent) * 100) : 0}%
                                </p>
                            </div>
                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.totalSpent > 0 ? (data.totalSessionSpent / data.totalSpent) * 100 : 0}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-brand-500 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Product Spend Bar */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Product Spend</p>
                                    <p className="text-2xl font-black text-slate-900">{formatCurrency(data.totalProductSpent)}</p>
                                </div>
                                <p className="text-xs font-black text-violet-600">
                                    {data.totalSpent > 0 ? Math.round((data.totalProductSpent / data.totalSpent) * 100) : 0}%
                                </p>
                            </div>
                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.totalSpent > 0 ? (data.totalProductSpent / data.totalSpent) * 100 : 0}%` }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                    className="h-full bg-violet-500 rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Wellness Investment</h4>
                            <p className="text-5xl font-black text-brand-400 mb-6">{formatCurrency(data.totalSpent)}</p>
                            <div className="flex items-center gap-3 text-brand-400 bg-brand-400/10 w-fit px-4 py-2 rounded-xl text-xs font-black">
                                <TrendingUp size={16} /> +12.5% vs last year
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-500/10 rounded-full blur-[60px] group-hover:bg-brand-500/20 transition-all duration-700" />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Recent Sessions */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-brand-500/5"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Calendar className="text-brand-500" />
                        Recent Sessions
                    </h3>

                    <div className="space-y-4">
                        {data.recentSessions && data.recentSessions.length > 0 ? (
                            data.recentSessions.map((session: Booking, idx: number) => (
                                <div
                                    key={session.id || idx}
                                    className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:bg-brand-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">

                                        {/* Profile Image */}
                                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shadow-sm transition-transform group-hover:scale-110">
                                            {session.providerProfileImage ? (
                                                <img
                                                    src={formatImageUrl(session.providerProfileImage)}
                                                    alt={session.providerName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-brand-600">
                                                    <User size={18} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Practitioner Info */}
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {session.providerName || 'Practitioner'}
                                            </p>

                                            <p className="text-[10px] font-bold text-slate-400">
                                                {session.providerSpecialization}
                                            </p>

                                            <p className="text-[10px] font-bold text-slate-400">
                                                {formatDateToIndian(session.sessionDate)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fee + Status */}
                                    <div className="text-right">
                                        <p className="text-sm font-black text-brand-600">
                                            {formatCurrency(session.sessionFee || 0)}
                                        </p>

                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded-full">
                                            {session.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-10 text-slate-400 font-medium italic">
                                No sessions found
                            </p>
                        )}
                    </div>
                </motion.section>

                {/* Recent Orders */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-brand-500/5"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <ShoppingBag className="text-violet-500" />
                        Product Purchases
                    </h3>

                    <div className="space-y-4">
                        {data.recentOrders && data.recentOrders.length > 0 ? (
                            data.recentOrders.map((order: Order, idx: number) => (
                                <div
                                    key={order.orderId || idx}
                                    className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:bg-violet-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shadow-sm transition-transform group-hover:scale-110">
                                            {order.productImage ? (
                                                <img
                                                    src={formatImageUrl(order.productImage)}
                                                    alt={order.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-violet-600">
                                                    <ShoppingBag size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {order.name}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400">
                                                Qty: {order.quantity}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-black text-violet-600">
                                            {formatCurrency(order.totalAmount)}
                                        </p>

                                        <p className="text-[10px] font-bold text-slate-400">
                                            {formatDateToIndian(order.orderDate)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-10 text-slate-400 font-medium italic">
                                No orders found
                            </p>
                        )}
                    </div>
                </motion.section>

            </div>
        </div>
    );
};