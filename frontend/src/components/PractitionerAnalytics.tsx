import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown,
    Calendar, CreditCard, PieChart, Activity
} from 'lucide-react';
import { type PractitionerAnalytics as AnalyticsData } from '../api';

interface Props {
    data: AnalyticsData | null;
    loading: boolean;
}

const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(numericAmount || 0);
};

const GrowthIndicator = ({ percent }: { percent: number | string }) => {
    const numericPercent = typeof percent === 'string' ? parseFloat(percent) : percent;
    const isPositive = (numericPercent || 0) >= 0;
    return (
        <div className={`flex items-center gap-1 text-xs font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{isPositive ? '+' : ''}{(numericPercent || 0).toFixed(1)}%</span>
        </div>
    );
};

const StatCard = ({ label, value, growth, icon, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-brand-500/5 group hover:border-brand-300 transition-all"
    >
        <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-2xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-110">
                {icon}
            </div>
            <GrowthIndicator percent={growth} />
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
    </motion.div>
);

export const PractitionerAnalytics: React.FC<Props> = ({ data, loading }) => {
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

    // Ensure all values are treated as numbers to avoid string concatenation
    const parseNum = (val: any) => {
        if (typeof val === 'number') return val;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
    };

    const sessionRevAllTime = parseNum(data.totalSessionRevenue ?? data.sessionRevenueAllTime);
    const productRevAllTime = parseNum(data.totalProductRevenue ?? data.productRevenueAllTime);
    const accumulatedWorth = sessionRevAllTime + productRevAllTime;

    const sessionRevMonthly = parseNum(data.sessionRevenueMonthly);
    const productRevMonthly = parseNum(data.productRevenueMonthly);
    const totalMonthly = sessionRevMonthly + productRevMonthly;

    const noData = accumulatedWorth === 0 &&
        parseNum(data.dailyRevenue) === 0 &&
        parseNum(data.weeklyRevenue) === 0 &&
        parseNum(data.monthlyRevenue) === 0;

    if (noData) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-brand-500/5">
                <div className="p-8 rounded-full bg-slate-50 border border-slate-100 mb-6 text-slate-300">
                    <PieChart size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Performance Metrics</h3>
                <p className="text-slate-500 font-medium max-w-sm text-center">
                    Metrics will populate automatically once you start accepting sessions and processing product orders.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Revenue Overview Cards */}
            <section>
                <div className="flex items-center gap-4 mb-8 pl-1">
                    <div className="p-3 bg-slate-900 rounded-2xl text-brand-400 shadow-xl shadow-slate-900/20">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Revenue Intelligence</h2>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Real-time performance metrics</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Daily Revenue"
                        value={formatCurrency(data.dailyRevenue)}
                        growth={data.dailyGrowthPercent ?? 0}
                        icon={<Calendar size={20} />}
                        delay={0.1}
                    />
                    <StatCard
                        label="Weekly Revenue"
                        value={formatCurrency(data.weeklyRevenue)}
                        growth={data.weeklyGrowthPercent ?? 0}
                        icon={<Activity size={20} />}
                        delay={0.2}
                    />
                    <StatCard
                        label="Monthly Revenue"
                        value={formatCurrency(data.monthlyRevenue)}
                        growth={data.monthlyGrowthPercent ?? 0}
                        icon={<PieChart size={20} />}
                        delay={0.3}
                    />
                    <StatCard
                        label="Yearly Revenue"
                        value={formatCurrency(data.yearlyRevenue)}
                        growth={data.yearlyGrowthPercent ?? 0}
                        icon={<TrendingUp size={20} />}
                        delay={0.4}
                    />
                </div>
            </section>

            {/* Split Views */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* distribution Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <CreditCard className="text-brand-400" /> Revenue Distribution
                            </h3>
                            <div className="px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-widest border border-brand-500/20">
                                All-Time Metrics
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session Income</p>
                                    <p className="text-xs font-black text-brand-400">
                                        {accumulatedWorth > 0 ? ((sessionRevAllTime / accumulatedWorth) * 100).toFixed(0) : 0}%
                                    </p>
                                </div>
                                <p className="text-4xl font-black">{formatCurrency(sessionRevAllTime)}</p>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${accumulatedWorth > 0 ? (sessionRevAllTime / accumulatedWorth) * 100 : 0}%` }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Income</p>
                                    <p className="text-xs font-black text-violet-400">
                                        {accumulatedWorth > 0 ? ((productRevAllTime / accumulatedWorth) * 100).toFixed(0) : 0}%
                                    </p>
                                </div>
                                <p className="text-4xl font-black">{formatCurrency(productRevAllTime)}</p>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${accumulatedWorth > 0 ? (productRevAllTime / accumulatedWorth) * 100 : 0}%` }}
                                        transition={{ duration: 1, delay: 1 }}
                                        className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Gross Accumulated Worth</p>
                                <p className="text-6xl font-black text-white group-hover:text-brand-400 transition-colors tabular-nums">{formatCurrency(accumulatedWorth)}</p>
                            </div>
                            <div className="text-left md:text-right bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Lifetime Gross</p>
                                <p className="text-2xl font-black text-white/70 tabular-nums">{formatCurrency(parseNum(data.allTimeRevenue))}</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />
                </motion.div>

                {/* Monthly Split Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-500/5 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-10">
                         <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <PieChart className="text-brand-500" /> Monthly Split
                        </h3>
                        <div className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">Current Month</div>
                    </div>

                    <div className="space-y-10 flex-1 flex flex-col justify-center">
                        <div className="group">
                            <div className="flex items-center justify-between mb-3 text-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 rounded-full bg-brand-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-black">Sessions</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(sessionRevMonthly)}</span>
                            </div>
                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalMonthly > 0 ? (sessionRevMonthly / totalMonthly) * 100 : 0}%` }}
                                    className="h-full bg-brand-500"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <div className="flex items-center justify-between mb-3 text-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 rounded-full bg-violet-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-black">Products</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(productRevMonthly)}</span>
                            </div>
                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalMonthly > 0 ? (productRevMonthly / totalMonthly) * 100 : 0}%` }}
                                    className="h-full bg-violet-500"
                                />
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className="relative pt-4">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 text-center">Relative Balance</p>
                            <div className="h-6 bg-slate-50 rounded-2xl flex overflow-hidden border border-slate-100 p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalMonthly > 0 ? (sessionRevMonthly / totalMonthly) * 100 : 0}%` }}
                                    transition={{ duration: 1, delay: 1.2 }}
                                    className="h-full bg-brand-500 rounded-l-xl"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalMonthly > 0 ? (productRevMonthly / totalMonthly) * 100 : 100}%` }}
                                    transition={{ duration: 1, delay: 1.4 }}
                                    className="h-full bg-violet-500 rounded-r-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100 shadow-sm">
                        <p className="text-[11px] text-brand-800 font-bold leading-relaxed text-center">
                            {totalMonthly > 0 ? (
                                <>Performance optimized. Session revenue contributes {((sessionRevMonthly / totalMonthly) * 100).toFixed(0)}% to your current profile volume.</>
                            ) : (
                                <>No active revenue sources identified for the selected reporting period.</>
                            )}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
