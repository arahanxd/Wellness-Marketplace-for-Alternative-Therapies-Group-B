import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type CartItem, type Profile, type Order } from '../api'
import { formatImageUrl } from '../utils/image'
import { validateIndianPhone, normalizeIndianPhone } from '../utils/validation'
import { 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight, 
    ShoppingBag, 
    Activity, 
    ClipboardList,
    CreditCard,
    Info,
    CheckCircle2,
    Lock,
    ArrowLeft,
    Package,
    Truck,
    MapPin,
    User
} from 'lucide-react'
import { Link } from 'react-router-dom'

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation'

export function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<CheckoutStep>('cart')
    const [isProcessing, setIsProcessing] = useState(false)
    const [placedOrders, setPlacedOrders] = useState<Order[]>([])

    // Payment form state
    const [payForm, setPayForm] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: ''
    })
    const [payError, setPayError] = useState<string | null>(null)
    const [useSavedShipping, setUseSavedShipping] = useState(true)
    const [saveShippingToProfile, setSaveShippingToProfile] = useState(false)
    const [saveCardToProfile, setSaveCardToProfile] = useState(false)
    const [shippingForm, setShippingForm] = useState({
        name: '',
        address: '',
        phone: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [userProfile, items] = await Promise.all([
                api.getProfile(),
                api.getCart()
            ])
            setProfile(userProfile)
            setCartItems(items)
            
            // Pre-fill card form with saved details if available
            if (userProfile.savedCardNumber) {
                setPayForm({
                    cardNumber: userProfile.savedCardNumber,
                    expiry: userProfile.savedCardExpiry || '',
                    cvv: '',
                    name: userProfile.savedCardHolder || userProfile.name || ''
                })
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateQuantity = async (productId: number, newQty: number) => {
        if (newQty < 1) return
        try {
            await api.updateCartQuantity(productId, newQty)
            setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: newQty, subtotal: item.price * newQty } : item))
        } catch (err) {
            console.error('Failed to update quantity:', err)
        }
    }

    const handleRemove = async (productId: number) => {
        try {
            await api.removeFromCart(productId)
            setCartItems(prev => prev.filter(item => item.productId !== productId))
        } catch (err) {
            console.error('Failed to remove item:', err)
        }
    }

    const handleProceedToShipping = () => {
        if (cartItems.length === 0) return
        setStep('shipping')
    }

    const handleProceedToPayment = () => {
        if (!validateIndianPhone(shippingForm.phone)) {
            setPayError('Please enter a valid 10-digit Indian phone number starting with 6-9.')
            return
        }
        setPayError(null)
        setStep('payment')
    }

    const formatCardNumber = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 16)
        return digits.replace(/(.{4})/g, '$1 ').trim()
    }

    const formatExpiry = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 4)
        if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
        return digits
    }

    const handlePayNow = async (e: React.FormEvent) => {
        e.preventDefault()
        setPayError(null)

        const rawCard = payForm.cardNumber.replace(/\s/g, '')
        if (rawCard.length < 16) { setPayError('Enter a valid 16-digit card number.'); return }
        if (payForm.expiry.length < 5) { setPayError('Enter a valid expiry date (MM/YY).'); return }
        if (payForm.cvv.length < 3) { setPayError('Enter a valid CVV.'); return }
        if (!payForm.name.trim()) { setPayError('Enter the cardholder name.'); return }

        setIsProcessing(true)
        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            const commonOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

            // Create orders from cart items with shipping details
            const orders = await api.createOrderBatch(
                cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    totalPrice: item.subtotal,
                    shippingName: shippingForm.name,
                    shippingAddress: shippingForm.address,
                    shippingPhone: normalizeIndianPhone(shippingForm.phone),
                    commonOrderId
                }))
            )
            
            // Save shipping to profile if requested
            if (saveShippingToProfile) {
                await api.updateProfile({
                    address: shippingForm.address,
                    phoneNumber: normalizeIndianPhone(shippingForm.phone)
                })
            }

            // Save card to profile if requested
            if (saveCardToProfile) {
                await api.updateProfile({
                    savedCardNumber: payForm.cardNumber,
                    savedCardExpiry: payForm.expiry,
                    savedCardHolder: payForm.name
                })
            }

            setPlacedOrders(orders)
            await api.clearCart()
            setCartItems([])
            setStep('confirmation')
        } catch (err) {
            setPayError('Payment processing failed. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0)
    const shipping = subtotal > 0 ? 50 : 0
    const tax = subtotal * 0.18
    const total = subtotal + shipping + tax

    const sidebarItems = [
        { label: 'Dashboard', path: '/user', icon: <Activity size={20} /> },
        { label: 'Products', path: '/products', icon: <ShoppingBag size={20} /> },
        { label: 'Cart', path: '/cart', active: true, icon: <ShoppingCart size={20} /> },
        { label: 'Wishlist', path: '/wishlist', icon: <ClipboardList size={20} /> },
        { label: 'Product Orders', path: '/product-orders', icon: <ClipboardList size={20} /> },
    ]

    if (loading || !profile) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4 text-brand-600">
                <ShoppingCart size={32} />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading your cart...</p>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div className="max-w-6xl mx-auto space-y-10">

                {/* ──────────────── ORDER CONFIRMATION ──────────────── */}
                <AnimatePresence mode="wait">
                    {step === 'confirmation' && (
                        <motion.div
                            key="confirmation"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-500/5 overflow-hidden"
                        >
                            {/* Success Banner */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-12 text-white text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-6"
                                >
                                    <CheckCircle2 size={52} />
                                </motion.div>
                                <h1 className="text-4xl font-black mb-2">Payment Successful!</h1>
                                <p className="text-white/80 text-lg font-medium">Your order has been placed and is being processed.</p>
                            </div>

                            {/* Order Details */}
                            <div className="p-10 space-y-8">
                                {placedOrders.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                            <Package size={22} className="text-brand-600" /> Ordered Items
                                        </h2>
                                        <div className="space-y-3">
                                            {placedOrders.map((order, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        {order.productImage && (
                                                            <img src={order.productImage} alt={order.name} className="w-14 h-14 rounded-xl object-cover" />
                                                        )}
                                                        <div>
                                                            <p className="font-black text-slate-900">{order.name}</p>
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                                Order #{order.orderId} • Qty: {order.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="font-black text-brand-600 text-lg">₹ {order.totalAmount?.toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center py-6 border-t border-slate-100">
                                            <span className="text-lg font-black text-slate-500 uppercase tracking-widest">Total Paid</span>
                                            <span className="text-3xl font-black text-emerald-600">
                                                ₹ {placedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Link
                                        to="/product-orders"
                                        className="flex-1 bg-brand-600 text-white py-5 rounded-[2rem] font-black text-center text-sm shadow-xl hover:bg-brand-700 hover:scale-[1.02] transition-all"
                                    >
                                        View My Orders
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-5 rounded-[2rem] font-black text-center text-sm hover:border-brand-300 hover:scale-[1.02] transition-all"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ──────────────── PAYMENT SIMULATION ──────────────── */}
                    {step === 'payment' && (
                        <motion.div
                            key="payment"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 mb-1">Secure Payment</h1>
                                    <p className="text-slate-500 font-medium italic">Simulated — no real charges applied</p>
                                </div>
                                <button
                                    onClick={() => setStep('cart')}
                                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold transition-all"
                                >
                                    <ArrowLeft size={20} /> Back to Cart
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Payment Form */}
                                <div className="lg:col-span-8">
                                    <div className="bg-white rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-500/5 p-10">
                                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                            <CreditCard size={22} className="text-brand-600" /> Card Details
                                            <span className="ml-auto flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
                                                <Lock size={12} /> SSL Secured
                                            </span>
                                        </h2>

                                        <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                    <Truck size={18} className="text-brand-600" /> Shipping to:
                                                </h4>
                                                <button onClick={() => setStep('shipping')} className="text-brand-600 text-xs font-bold hover:underline">Change</button>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">{shippingForm.name}</p>
                                            <p className="text-xs text-slate-500">{shippingForm.address}</p>
                                            <p className="text-xs text-slate-500 mt-1">{shippingForm.phone}</p>
                                        </div>

                                        <form onSubmit={handlePayNow} className="space-y-6">
                                            {/* Card Visual */}
                                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-2xl">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-600/20 rounded-full translate-y-1/2 -translate-x-1/2" />
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <CreditCard size={28} className="text-brand-400" />
                                                        <div className="flex gap-1">
                                                            <div className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur" />
                                                            <div className="w-8 h-8 rounded-full bg-amber-400/80 backdrop-blur -ml-4" />
                                                        </div>
                                                    </div>
                                                    <p className="text-2xl font-black tracking-[0.15em] mb-6">
                                                        {payForm.cardNumber || '•••• •••• •••• ••••'}
                                                    </p>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Card Holder</p>
                                                            <p className="font-black text-sm">{payForm.name || 'YOUR NAME'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Expires</p>
                                                            <p className="font-black text-sm">{payForm.expiry || 'MM/YY'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cardholder Name</label>
                                                <input
                                                    value={payForm.name}
                                                    onChange={e => setPayForm(f => ({ ...f, name: e.target.value }))}
                                                    placeholder="John Doe"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Card Number</label>
                                                <input
                                                    value={payForm.cardNumber}
                                                    onChange={e => setPayForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none tracking-widest"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Expiry Date</label>
                                                    <input
                                                        value={payForm.expiry}
                                                        onChange={e => setPayForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CVV</label>
                                                    <input
                                                        value={payForm.cvv}
                                                        onChange={e => setPayForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                        placeholder="•••"
                                                        maxLength={4}
                                                        type="password"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-white transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={saveCardToProfile}
                                                    onChange={e => setSaveCardToProfile(e.target.checked)}
                                                    className="w-5 h-5 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">Save card details for future use</span>
                                            </label>

                                            <AnimatePresence>
                                                {payError && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl font-bold text-sm"
                                                    >
                                                        {payError}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="w-full bg-brand-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Activity className="animate-spin" size={22} /> Processing Payment…
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={22} /> Pay ₹ {Math.round(total).toLocaleString()}
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Order Summary Sidebar */}
                                <div className="lg:col-span-4">
                                    <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl sticky top-8">
                                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                            <ShoppingCart size={22} className="text-brand-400" /> Order Summary
                                        </h3>
                                        <div className="space-y-4 pb-6 border-b border-white/10">
                                            {cartItems.map(item => (
                                                <div key={item.id} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                                                            <img src={formatImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black truncate max-w-[120px]">{item.name}</p>
                                                            <p className="text-[10px] text-white/40">× {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-brand-400">₹ {item.subtotal.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="py-6 space-y-3">
                                            <div className="flex justify-between text-white/60 text-sm">
                                                <span>Subtotal</span><span className="font-black text-white">₹ {subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-white/60 text-sm">
                                                <span>Shipping</span><span className="font-black text-white">₹ {shipping}</span>
                                            </div>
                                            <div className="flex justify-between text-white/60 text-sm">
                                                <span>GST (18%)</span><span className="font-black text-brand-400">+ ₹ {Math.round(tax).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-white/10 pt-6 flex justify-between items-end">
                                            <span className="text-white/40 uppercase tracking-widest text-xs font-black">Total</span>
                                            <span className="text-3xl font-black text-brand-400">₹ {Math.round(total).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ──────────────── SHIPPING VIEW ──────────────── */}
                    {step === 'shipping' && (
                        <motion.div
                            key="shipping"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-white rounded-[3rem] border border-brand-100 shadow-2xl overflow-hidden p-10">
                                <header className="mb-10">
                                    <h1 className="text-4xl font-black text-slate-900 mb-2">Shipping Details</h1>
                                    <p className="text-slate-500 font-medium italic">Tell us where to send your wellness package</p>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <button
                                        onClick={() => {
                                            setUseSavedShipping(true)
                                            setShippingForm({
                                                name: profile?.name || '',
                                                address: profile?.address || '',
                                                phone: profile?.phoneNumber || ''
                                            })
                                        }}
                                        className={`p-8 rounded-[2rem] border-2 text-left transition-all ${useSavedShipping ? 'border-brand-600 bg-brand-50/50' : 'border-slate-100 hover:border-brand-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${useSavedShipping ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <User size={24} />
                                            </div>
                                            {useSavedShipping && <CheckCircle2 size={24} className="text-brand-600" />}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">Saved Profile</h3>
                                        <p className="text-sm text-slate-500 font-medium">Use address and phone from your profile</p>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setUseSavedShipping(false)
                                            setShippingForm({ name: '', address: '', phone: '' })
                                        }}
                                        className={`p-8 rounded-[2rem] border-2 text-left transition-all ${!useSavedShipping ? 'border-brand-600 bg-brand-50/50' : 'border-slate-100 hover:border-brand-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${!useSavedShipping ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <MapPin size={24} />
                                            </div>
                                            {!useSavedShipping && <CheckCircle2 size={24} className="text-brand-600" />}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">Temporary Details</h3>
                                        <p className="text-sm text-slate-500 font-medium">Ordering for a friend or different location</p>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Recipient Name</label>
                                            <input
                                                value={shippingForm.name}
                                                onChange={e => setShippingForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder="Enter full name"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number</label>
                                            <input
                                                value={shippingForm.phone}
                                                onChange={e => setShippingForm(f => ({ ...f, phone: e.target.value }))}
                                                placeholder="Enter phone number"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Shipping Address</label>
                                        <textarea
                                            rows={3}
                                            value={shippingForm.address}
                                            onChange={e => setShippingForm(f => ({ ...f, address: e.target.value }))}
                                            placeholder="Enter complete address..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    {!useSavedShipping && (
                                        <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-white transition-all">
                                            <input
                                                type="checkbox"
                                                checked={saveShippingToProfile}
                                                onChange={e => setSaveShippingToProfile(e.target.checked)}
                                                className="w-5 h-5 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-bold text-slate-700">Save these details to my profile for future use</span>
                                        </label>
                                    )}

                                    {payError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl font-bold text-sm">
                                            {payError}
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            onClick={() => setStep('cart')}
                                            className="px-10 py-5 rounded-[2rem] font-black text-slate-500 hover:bg-slate-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleProceedToPayment}
                                            className="flex-1 bg-brand-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ──────────────── CART VIEW ──────────────── */}
                    {step === 'cart' && (
                        <motion.div
                            key="cart"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-10"
                        >
                            <header className="flex items-end justify-between">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 mb-2">Shopping Cart</h1>
                                    <p className="text-slate-500 font-medium italic">You have <span className="text-brand-600 font-black not-italic">{cartItems.length} items</span> in your cart</p>
                                </div>
                                <Link to="/products" className="text-brand-600 font-black flex items-center gap-2 hover:gap-3 transition-all">
                                    Continue Shopping <ArrowRight size={20} />
                                </Link>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Cart Items */}
                                <div className="lg:col-span-8 space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {cartItems.length > 0 ? cartItems.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-white p-6 rounded-[2rem] border border-brand-100 shadow-xl shadow-brand-500/5 flex items-center gap-6 group hover:border-brand-300 transition-all"
                                            >
                                                <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                                                    <img src={formatImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link to={`/product/${item.productId}`}>
                                                        <h3 className="text-lg font-black text-slate-900 mb-1 truncate group-hover:text-brand-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                                                    </Link>
                                                    <p className="text-slate-400 font-bold text-sm mb-4 italic">₹ {item.price.toLocaleString()} per unit</p>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                                            <button 
                                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                                className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="text-sm font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                                                            <button 
                                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                                className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemove(item.productId)}
                                                            className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                                                    <p className="text-xl font-black text-brand-600">₹ {item.subtotal.toLocaleString()}</p>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="py-24 text-center bg-white rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                                                <div className="bg-slate-50 inline-block p-12 rounded-full mb-6">
                                                    <ShoppingCart size={64} className="text-slate-200" />
                                                </div>
                                                <h2 className="text-3xl font-black text-slate-900 mb-2 italic">Your cart is empty</h2>
                                                <p className="text-slate-500 font-medium mb-8">Looks like you haven't added anything to your cart yet.</p>
                                                <Link to="/products" className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all">
                                                    Start Shopping
                                                </Link>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Summary */}
                                <div className="lg:col-span-4">
                                    <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl sticky top-8">
                                        <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                            <CreditCard size={28} className="text-brand-400" /> Order Summary
                                        </h3>
                                        
                                        <div className="space-y-6 pb-8 border-b border-white/10">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/60 font-medium">Subtotal</span>
                                                <span className="font-black">₹ {subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/60 font-medium">Shipping Fee</span>
                                                <span className="font-black">₹ {shipping.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/60 font-medium">Gst (18%)</span>
                                                <span className="font-black text-brand-400">+ ₹ {Math.round(tax).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="py-8 space-y-8">
                                            <div className="flex justify-between items-end">
                                                <span className="text-lg font-black uppercase tracking-widest text-white/40">Total</span>
                                                <span className="text-4xl font-black text-brand-400">₹ {Math.round(total).toLocaleString()}</span>
                                            </div>

                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                                                <Info size={18} className="text-brand-400 mt-1 flex-shrink-0" />
                                                <p className="text-[10px] text-white/40 font-medium leading-relaxed">
                                                    Holistic wellness products are non-refundable after opening. By proceeding you agree to our terms of service.
                                                </p>
                                            </div>

                                            <button 
                                                onClick={handleProceedToShipping}
                                                disabled={cartItems.length === 0}
                                                className="w-full bg-brand-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                            >
                                                <CreditCard size={24} /> Proceed to Payment
                                            </button>
                                        </div>
                                        
                                        <div className="flex justify-center gap-6 opacity-30">
                                            <span className="text-[10px] font-black">VISA</span>
                                            <span className="text-[10px] font-black">MASTERCARD</span>
                                            <span className="text-[10px] font-black">UPI</span>
                                            <span className="text-[10px] font-black">STRIPE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    )
}
