import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Product, type Profile } from '../api'
import { formatImageUrl } from '../utils/image'
import { ShoppingBag, Search, Sparkles, ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle, Activity, ClipboardList, Package, Star, MessageSquare } from 'lucide-react'

function StarRating({ rating, count }: { rating: number; count: number }) {
    const full = Math.floor(rating)
    const hasHalf = rating - full >= 0.5
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        size={12}
                        className={i <= full ? 'text-amber-400' : i === full + 1 && hasHalf ? 'text-amber-300' : 'text-slate-200'}
                        fill={i <= full ? 'currentColor' : i === full + 1 && hasHalf ? 'currentColor' : 'none'}
                    />
                ))}
            </div>
            <span className="text-xs font-black text-slate-600">{rating > 0 ? rating.toFixed(1) : '—'}</span>
            <span className="text-[10px] text-slate-400 font-medium">({count})</span>
        </div>
    )
}

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
    const [purchaseStatus, setPurchaseStatus] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<number | null>(null)
    const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'name'>('latest')
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const userProfile = await api.getProfile()
            setProfile(userProfile)
            const allProducts = await api.getProducts()
            setProducts(allProducts)

            const initialQuantities: { [key: number]: number } = {}
            allProducts.forEach(p => {
                if (p.productId) initialQuantities[p.productId] = 1
            })
            setQuantities(initialQuantities)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleQuantityChange = (productId: number, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) + delta)
        }))
    }

    const handleAddToCart = async (product: Product) => {
        if (!product.productId) return
        
        setIsSubmitting(product.productId)
        try {
            const quantity = quantities[product.productId] || 1
            await api.addToCart(product.productId, quantity)
            setPurchaseStatus({ id: product.productId, message: 'Added to cart!', type: 'success' })
            setTimeout(() => setPurchaseStatus(null), 3000)
        } catch (err) {
            setPurchaseStatus({ id: product.productId!, message: 'Failed to add to cart.', type: 'error' })
            setTimeout(() => setPurchaseStatus(null), 3000)
        } finally {
            setIsSubmitting(null)
        }
    }

    const getDiscountedPrice = (product: Product) => {
        const disc = product.discountPercentage ?? 0
        if (disc <= 0) return null
        return product.price - (product.price * disc / 100)
    }

    const getSortedProducts = () => {
        const sorted = [...products]
        if (sortBy === 'latest') {
            return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        } else if (sortBy === 'trending') {
            return sorted.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0))
        } else if (sortBy === 'name') {
            return sorted.sort((a, b) => a.name.localeCompare(b.name))
        }
        return sorted
    }

    const sidebarItems = [
        { label: 'Dashboard', path: '/user', icon: <Activity size={20} /> },
        { label: 'Products', path: '/products', active: true, icon: <ShoppingBag size={20} /> },
        { label: 'Cart', path: '/cart', icon: <ShoppingCart size={20} /> },
        { label: 'Orders', path: '/product-orders', icon: <ClipboardList size={20} /> },
        { label: 'Community Forum', path: '/forum', icon: <MessageSquare size={20} /> },
    ]

    if (loading || !profile) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                <Activity size={32} className="text-brand-600" />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading marketplace...</p>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
            >
                <header className="bg-gradient-to-r from-brand-600 to-indigo-600 p-12 rounded-[3rem] text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-5xl font-black mb-4 flex items-center gap-4">
                            <ShoppingBag size={48} /> Wellness Store
                        </h1>
                        <p className="text-white/80 text-lg font-medium max-w-2xl">
                            Elevate your holistic journey with our curated selection of verified wellness products and gear.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 p-10 text-white pointer-events-none opacity-20">
                        <Sparkles size={180} />
                    </div>
                </header>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sort Marketplace:</span>
                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                            {(['latest', 'trending', 'name'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSortBy(s)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === s ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    {getSortedProducts().length > 0 ? (
                        getSortedProducts().map((product, idx) => {
                            const discountedPrice = getDiscountedPrice(product)
                            const discount = product.discountPercentage ?? 0
                            const rating = product.averageRating ?? 0
                            const reviewCount = product.reviewCount ?? 0

                            return (
                                <motion.div
                                    key={product.productId}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 overflow-hidden group hover:border-brand-300 transition-all flex flex-col"
                                >
                                    {/* Product Image — clickable navigates to detail page */}
                                    <div
                                        className="h-64 bg-slate-50 relative overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/product/${product.productId}`)}
                                    >
                                        {product.imageUrl ? (
                                            <img
                                                src={formatImageUrl(product.imageUrl)}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <Package size={80} />
                                            </div>
                                        )}
                                        {/* Price badges */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                            {discount > 0 ? (
                                                <>
                                                    <span className="bg-red-500 text-white px-3 py-1 rounded-2xl font-black text-xs shadow">
                                                        {discount}% OFF
                                                    </span>
                                                    <span className="bg-white/90 backdrop-blur-md text-brand-600 px-4 py-2 rounded-2xl font-black text-xs shadow-lg">
                                                        ₹ {Math.round(discountedPrice!).toLocaleString()}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="bg-white/90 backdrop-blur-md text-brand-600 px-4 py-2 rounded-2xl font-black text-xs shadow-lg">
                                                    ₹ {product.price.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <Link to={`/product/${product.productId}`}>
                                            <h3 className="text-xl font-black text-slate-900 mb-1 truncate group-hover:text-brand-600 transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        {/* Price display with strikethrough if discounted */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {discount > 0 ? (
                                                <>
                                                    <span className="text-brand-600 font-black text-sm">₹ {Math.round(discountedPrice!).toLocaleString()}</span>
                                                    <span className="text-slate-400 line-through text-xs font-medium">₹ {product.price.toLocaleString()}</span>
                                                </>
                                            ) : (
                                                <span className="text-brand-600 font-black text-sm">₹ {product.price.toLocaleString()}</span>
                                            )}
                                        </div>

                                        {/* Dynamic Ratings */}
                                        <div className="mb-3">
                                            <StarRating rating={rating} count={reviewCount} />
                                        </div>

                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                                            {product.description}
                                        </p>

                                        <div className="mt-auto space-y-6">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</span>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => product.productId && handleQuantityChange(product.productId, -1)}
                                                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-black text-slate-900 w-4 text-center">
                                                        {product.productId ? (quantities[product.productId] || 1) : 1}
                                                    </span>
                                                    <button
                                                        onClick={() => product.productId && handleQuantityChange(product.productId, 1)}
                                                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Add to Cart Button */}
                                            <div className="relative">
                                                <AnimatePresence>
                                                    {purchaseStatus?.id === product.productId ? (
                                                        <motion.div
                                                            key="status"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm border ${purchaseStatus?.type === 'success'
                                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                                : 'border-red-500 bg-red-50 text-red-700'
                                                                }`}
                                                        >
                                                            {purchaseStatus?.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                            {purchaseStatus?.message}
                                                        </motion.div>
                                                    ) : (
                                                        <motion.button
                                                            key="button"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={isSubmitting === product.productId}
                                                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-black hover:scale-[1.02] transition-all disabled:opacity-50"
                                                        >
                                                            {isSubmitting === product.productId ? (
                                                                <Activity size={18} className="animate-spin" />
                                                            ) : (
                                                                <ShoppingCart size={18} />
                                                            )}
                                                            {isSubmitting === product.productId ? 'Processing...' : 'Add to Cart'}
                                                        </motion.button>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                            <div className="bg-slate-50 inline-block p-12 rounded-full mb-6">
                                <Search size={64} className="text-slate-200" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">No Products Available</h2>
                            <p className="text-slate-500 font-medium">We're working on bringing more wellness items to the store.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </DashboardLayout>
    )
}
