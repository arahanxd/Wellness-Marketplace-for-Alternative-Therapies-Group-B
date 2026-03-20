import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Order, type Profile } from '../api'
import { ClipboardList, Package, Activity, ShoppingBag, ChevronRight, Hash, Calendar, Truck, CheckCircle2, Clock } from 'lucide-react'
import { formatDateToIndian } from '../utils/date'
import { formatImageUrl } from '../utils/image'

class OrdersErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() { return { hasError: true } }
    componentDidCatch(error: unknown) { console.error('Error rendering orders:', error) }
    render() {
        if (this.state.hasError) {
            return (
                <div className="py-20 text-center">
                    <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Unable to display orders</p>
                </div>
            )
        }
        return this.props.children
    }
}

function DeliveryStatusBadge({ status }: { status: string }) {
    const s = (status || '').toUpperCase()
    if (s === 'DELIVERED') return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-50 border-emerald-200 text-emerald-600">
            <CheckCircle2 size={10} /> Delivered
        </span>
    )
    if (s === 'SHIPPED') return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-50 border-blue-200 text-blue-600">
            <Truck size={10} /> Shipped
        </span>
    )
    if (s === 'PROCESSING') return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-amber-50 border-amber-200 text-amber-600">
            <Clock size={10} /> Processing
        </span>
    )
    return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-50 border-slate-200 text-slate-500">
            <Clock size={10} /> {status || 'Pending'}
        </span>
    )
}

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function DeliveryTimeline({ status }: { status: string }) {
    const currentStatus = (status || 'PENDING').toUpperCase()
    const currentIndex = STATUS_STEPS.indexOf(currentStatus)
    
    return (
        <div className="relative pt-6 pb-2 px-2">
            <div className="absolute top-[34px] left-6 right-6 h-[1px] bg-slate-100 rounded-full" />
            <div 
                className="absolute top-[34px] left-6 h-[1px] bg-brand-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.3)]" 
                style={{ width: `calc(${(Math.max(0, currentIndex) / (STATUS_STEPS.length - 1)) * 100}% - 48px)` }}
            />
            <div className="relative flex justify-between items-center">
                {STATUS_STEPS.map((step, idx) => {
                    const isActive = idx <= currentIndex
                    const isCurrent = idx === currentIndex
                    return (
                        <div key={step} className="flex flex-col items-center gap-2 group/step">
                            <div className={`w-2.5 h-2.5 rounded-full border-[1.5px] z-10 transition-all duration-500 ${
                                isCurrent ? 'bg-brand-500 border-white scale-125 shadow-lg shadow-brand-500/40 ring-4 ring-brand-50' :
                                isActive ? 'bg-brand-500 border-brand-500' : 'bg-white border-slate-200'
                            }`} />
                            <span className={`text-[7px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                isActive ? 'text-brand-600' : 'text-slate-400'
                            }`}>
                                {step}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function ProductOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const navigate = useNavigate()

    useEffect(() => { fetchData() }, [])

    const sortedOrders = React.useMemo(() => {
        return [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    }, [orders])

    const groupedOrders = React.useMemo<[string, Order[]][]>(() => {
        const groups: Record<string, Order[]> = {}
        sortedOrders.forEach(o => {
            const gid = o.commonOrderId || `ID-${o.orderId}`
            if (!groups[gid]) groups[gid] = []
            groups[gid].push(o)
        })
        return Object.entries(groups)
    }, [sortedOrders])

    const sidebarItems = React.useMemo(() => {
        if (!profile) return []
        return profile.role === 'CLIENT' ? [
            { label: 'Dashboard', path: '/user', icon: <Activity size={20} /> },
            { label: 'Products', path: '/products', icon: <ShoppingBag size={20} /> },
            { label: 'My Orders', path: '/product-orders', active: true, icon: <ClipboardList size={20} /> },
        ] : [
            { label: 'Overview', path: '/practitioner', icon: <Activity size={20} /> },
            { label: 'My Products', path: '/my-products', icon: <Package size={20} /> },
            { label: 'Store Orders', path: '/product-orders', active: true, icon: <ClipboardList size={20} /> },
        ]
    }, [profile])

    const fetchData = async () => {
        try {
            const userProfile = await api.getProfile()
            setProfile(userProfile)
            let fetchedOrders: Order[] = []
            if (userProfile.role === 'CLIENT') {
                fetchedOrders = await api.getUserOrders(userProfile.id)
            } else if (userProfile.role === 'PROVIDER') {
                fetchedOrders = await api.getProviderOrders(userProfile.id)
            }
            setOrders(fetchedOrders)
        } catch (err) {
            console.error('Failed to fetch orders:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !profile) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                <Activity size={32} className="text-brand-600" />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading orders...</p>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <header className="bg-gradient-to-r from-brand-600 to-indigo-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-brand-500/20">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <ClipboardList size={36} /> {profile.role === 'CLIENT' ? 'My Orders' : 'Store Orders'}
                    </h1>
                    <p className="text-white/80 font-medium">
                        {profile.role === 'CLIENT'
                            ? 'Track all your purchases and delivery status in one place.'
                            : 'View and manage all incoming product orders.'}
                    </p>
                </header>

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <ShoppingBag size={24} className="text-brand-600" />
                        {profile.role === 'CLIENT' ? 'Order History' : 'All Orders'}
                    </h2>
                    <span className="bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                        {orders.length} Total Items
                    </span>
                </div>

                <OrdersErrorBoundary>
                    {groupedOrders.length > 0 ? (
                        <div className="space-y-6">
                            {groupedOrders.map(([groupId, groupItems]: [string, Order[]], gIdx: number) => {
                                const isGroup = groupId.startsWith('ORD-')
                                const firstItem = groupItems[0]
                                const totalGroupAmount = groupItems.reduce((sum: number, item: Order) => sum + (item.totalAmount || 0), 0)
                                const isSelected = selectedOrder?.commonOrderId === groupId || (!isGroup && selectedOrder?.orderId === firstItem.orderId)

                                return (
                                    <motion.div
                                        key={groupId}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: gIdx * 0.04 }}
                                        onClick={() => setSelectedOrder(isSelected ? null : firstItem)}
                                        className="bg-white rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 overflow-hidden group hover:border-brand-300 transition-all cursor-pointer"
                                    >
                                        <div className="p-6 md:p-8 flex items-center gap-6">
                                            <div className="flex -space-x-4">
                                                {groupItems.slice(0, 3).map((item, i) => (
                                                    <div key={i} className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                                                        <img src={formatImageUrl(item.productImage)} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {groupItems.length > 3 && (
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-black">
                                                        +{groupItems.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                                                        <Hash size={10} /> {isGroup ? groupId : `Order #${firstItem.orderId}`}
                                                    </span>
                                                    <span className="text-slate-200">·</span>
                                                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                                        <Calendar size={10} /> {formatDateToIndian(firstItem.orderDate)}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                                                    {isGroup ? `${groupItems.length} Products in this Order` : firstItem.name}
                                                </h3>
                                                <p className="text-sm font-bold text-slate-500">
                                                    Total Amount: <span className="text-brand-600">₹ {totalGroupAmount.toLocaleString()}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {groupItems.length === 1 && <DeliveryStatusBadge status={firstItem.deliveryStatus} />}
                                                <ChevronRight size={20} className={`text-slate-300 transition-transform duration-300 ${isSelected ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="border-t border-slate-50 bg-slate-50/30 overflow-hidden"
                                                >
                                                    <div className="p-4 md:p-8 space-y-6">
                                                        {groupItems.map((item, idx) => (
                                                            <div key={item.orderId || idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-6">
                                                                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                                                                    <img src={formatImageUrl(item.productImage)} alt={item.name} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                                                                            <p className="text-xs text-slate-400 font-bold">Qty: {item.quantity} · Item ID: #{item.orderId}</p>
                                                                        </div>
                                                                        <DeliveryStatusBadge status={item.deliveryStatus} />
                                                                    </div>
                                                                    
                                                                    <DeliveryTimeline status={item.deliveryStatus} />
                                                                    
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase text-slate-400">Unit Price</p>
                                                                            <p className="font-black text-slate-900">₹ {item.price?.toLocaleString()}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase text-slate-400">Total</p>
                                                                            <p className="font-black text-brand-600">₹ {item.totalAmount?.toLocaleString()}</p>
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <p className="text-[9px] font-black uppercase text-slate-400">Exp. Delivery</p>
                                                                            <p className="font-black text-slate-900">{formatDateToIndian(item.deliveryDate)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-32 text-center bg-white rounded-[4rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                            <div className="bg-slate-50 inline-block p-16 rounded-full mb-8">
                                <ShoppingBag size={80} className="text-slate-200" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-3">No orders yet</h2>
                            <p className="text-slate-500 text-lg font-medium mb-10">Your marketplace activity will appear here.</p>
                            {profile.role === 'CLIENT' && (
                                <button
                                    onClick={() => navigate('/products')}
                                    className="bg-brand-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:bg-brand-700 transition-all"
                                >
                                    Browse Products
                                </button>
                            )}
                        </div>
                    )}
                </OrdersErrorBoundary>
            </motion.div>
        </DashboardLayout>
    )
}
