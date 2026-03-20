import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Product, type ProductReview, type ProductQuestion, type Profile, type Order, type Wishlist } from '../api'
import { formatImageUrl } from '../utils/image'
import { ReportModal } from '../components/ReportModal'
import {
    ShoppingBag,
    ShoppingCart,
    Plus,
    Minus,
    CheckCircle2,
    AlertCircle,
      Share2, Star, HelpCircle,
    MessageCircle,
    ArrowLeft,
    Clock,
    User,
    ChevronRight,
    Send,
    Flag,
    Shield
} from 'lucide-react'

export function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>()
    const navigate = useNavigate()

    const [product, setProduct] = useState<Product | null>(null)
    const [reviews, setReviews] = useState<ProductReview[]>([])
    const [questions, setQuestions] = useState<ProductQuestion[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<Order[]>([])
    const [showShareCopied, setShowShareCopied] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState<string>('')
    const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'qna'>('description')

    // Form states
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', description: '' })
    const [questionContent, setQuestionContent] = useState('')
    const [answerContent, setAnswerContent] = useState<Record<number, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

    // Wishlist Modal
    const [wishlists, setWishlists] = useState<Wishlist[]>([])
    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false)
    const [newWishlistName, setNewWishlistName] = useState('')
    const [isCreatingWishlist, setIsCreatingWishlist] = useState(false)
    const [qaSort, setQaSort] = useState<'latest' | 'trending' | 'name'>('latest')
    const [reportConfig, setReportConfig] = useState<{ entityType: string; entityId: number } | null>(null)

    // Read-only logic for Admin Reports
    const queryParams = new URLSearchParams(window.location.search)
    const isReadOnly = queryParams.get('readOnly') === 'true'
    const fromReports = queryParams.get('fromReports') === 'true'

    useEffect(() => {
        if (productId) {
            fetchData(parseInt(productId))
        }
    }, [productId])

    const fetchData = async (id: number) => {
        setLoading(true)
        try {
            const numericId = id; // Ensure id is treated as a number
            const prod = await api.getProductById(numericId);
            setProduct(prod);
            if (prod.imageUrl) setActiveImage(prod.imageUrl);

            const userProfile = await api.getProfile();
            setProfile(userProfile);

            if (userProfile?.id) {
                const [reviewsRes, qRes, ordersRes] = await Promise.all([
                    api.getReviews(numericId),
                    api.getQuestions(numericId),
                    api.getUserOrders(userProfile.id)
                ]);
                setReviews(reviewsRes);
                setQuestions(qRes);
                setOrders(ordersRes);
            } else {
                const [reviewsRes, qRes] = await Promise.all([
                    api.getReviews(numericId),
                    api.getQuestions(numericId)
                ]);
                setReviews(reviewsRes);
                setQuestions(qRes);
            }
        } catch (err: any) {
            console.error('Failed to fetch product details:', err);
            // Handle specific errors like 404 for product not found
            if (err.response && err.response.status === 404) {
                navigate('/404'); // Or show a "Product not found" message
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product?.productId) return
        setIsSubmitting(true)
        try {
            await api.addToCart(product.productId, quantity)
            setFeedback({ message: 'Added to cart!', type: 'success' })
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback({ message: 'Failed to add to cart.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchWishlists = async () => {
        try {
            const lists = await api.getWishlists()
            setWishlists(lists)
        } catch (err) {
            console.error('Failed to fetch wishlists:', err)
        }
    }

    const handleOpenWishlistModal = async () => {
        await fetchWishlists()
        setIsWishlistModalOpen(true)
    }

    const handleAddToWishlist = async (wishlistId: number) => {
        if (!product?.productId) return
        setIsSubmitting(true)
        try {
            await api.addItemToWishlist(wishlistId, product.productId)
            setFeedback({ message: 'Added to wishlist!', type: 'success' })
            setIsWishlistModalOpen(false)
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback({ message: 'Failed to add to wishlist.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCreateWishlist = async () => {
        if (!newWishlistName.trim() || !product?.productId) return
        setIsSubmitting(true)
        try {
            const newList = await api.createWishlist(newWishlistName)
            await api.addItemToWishlist(newList.wishlistId, product.productId)
            setFeedback({ message: 'Wishlist created and product added!', type: 'success' })
            setNewWishlistName('')
            setIsCreatingWishlist(false)
            fetchWishlists()
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback({ message: 'Failed to create wishlist.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        setShowShareCopied(true)
        setTimeout(() => setShowShareCopied(false), 2000)
    }

    const hasUserReviewed = reviews.some(r => r.userId === profile?.id)
    const hasBeenDelivered = orders.some(o => o.productId === product?.productId && (o.status === 'DELIVERED' || o.deliveryStatus === 'DELIVERED'))
    const canReview = profile && !hasUserReviewed && hasBeenDelivered

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile || !product?.productId) return
        setIsSubmitting(true)
        try {
            await api.addReview({
                productId: product.productId,
                userId: profile.id,
                ...reviewForm
            })
            setFeedback({ message: 'Review posted!', type: 'success' })
            const updatedRevs = await api.getReviews(product.productId)
            setReviews(updatedRevs)
            setReviewForm({ rating: 5, title: '', description: '' })
            setTimeout(() => setFeedback(null), 3000)
        } catch (err: any) {
            setFeedback({ message: err.response?.data?.message || 'Failed to post review.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile || !product?.productId) return
        setIsSubmitting(true)
        try {
            await api.askQuestion({
                productId: product.productId,
                userId: profile.id,
                content: questionContent
            })
            setFeedback({ message: 'Question posted!', type: 'success' })
            const updatedQas = await api.getQuestions(product.productId)
            setQuestions(updatedQas)
            setQuestionContent('')
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback({ message: 'Failed to post question.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePostAnswer = async (questionId: number) => {
        if (!profile) return
        const content = answerContent[questionId]
        if (!content) return
        setIsSubmitting(true)
        try {
            await api.postAnswer({
                questionId,
                userId: profile.id,
                content
            })
            setFeedback({ message: 'Answer posted!', type: 'success' })
            const updatedQas = await api.getQuestions(product!.productId!)
            setQuestions(updatedQas)
            setAnswerContent(prev => ({ ...prev, [questionId]: '' }))
            setTimeout(() => setFeedback(null), 3000)
        } catch (err: any) {
            setFeedback({ message: err.response?.data?.message || 'Failed to post answer.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReportClick = (type: string, entityId: number) => {
        setReportConfig({ entityType: type, entityId })
    }

    const handleReportSubmit = async (reason: string, comment: string) => {
        if (!profile || !reportConfig) return;
        try {
            await api.reportContent({
                reportedEntityId: reportConfig.entityId,
                reporterId: profile.id,
                reason,
                comment,
                entityType: reportConfig.entityType
            })
            setFeedback({ message: 'Report submitted successfully.', type: 'success' })
            setTimeout(() => setFeedback(null), 3000)
        } catch (err) {
            setFeedback({ message: 'Failed to submit report.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
        } finally {
            setReportConfig(null)
            setIsSubmitting(false)
        }
    }

    const handleUpvoteReview = async (reviewId: number) => {
        if (!profile) {
            setFeedback({ message: 'Please login to vote.', type: 'error' })
            setTimeout(() => setFeedback(null), 3000)
            return
        }
        try {
            await api.upvoteReview(reviewId, profile.id)
            const updatedRevs = await api.getReviews(product!.productId!)
            setReviews(updatedRevs)
            // No need for "Marked as helpful" toast every time if it's a toggle
        } catch (err) {
            console.error('Failed to upvote review:', err)
        }
    }

    const getSortedQuestions = () => {
        const sorted = [...questions]
        if (qaSort === 'latest') {
            return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        } else if (qaSort === 'trending') {
            return sorted.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0))
        } else if (qaSort === 'name') {
            return sorted.sort((a, b) => a.content.localeCompare(b.content))
        }
        return sorted
    }

    const userRole = localStorage.getItem('userRole')
    const sidebarItems = userRole === 'ADMIN' ? [
        { label: 'Admin Dashboard', path: '/admin', icon: <Shield size={20} /> },
        { label: 'Flagged Content', path: '/admin/reports', icon: <Flag size={20} /> },
    ] : [
        { label: 'Dashboard', path: userRole === 'PROVIDER' ? '/practitioner' : '/user', icon: <Clock size={20} /> },
        { label: 'Products', path: '/products', active: true, icon: <ShoppingBag size={20} /> },
    ]

    if (loading || !product) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4 text-brand-600">
                <ShoppingBag size={32} />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading product...</p>
        </div>
    )

    const additionalUrls = (product.additionalImages || []).map(img => typeof img === 'string' ? img : img.imageUrl);
    const allImages = [product.imageUrl, ...additionalUrls].filter(Boolean) as string[]

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Back Link */}
                <button
                    onClick={() => fromReports ? navigate('/admin/reports') : navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold transition-all"
                >
                    <ArrowLeft size={20} /> {fromReports ? 'Back to Flagged Content' : 'Back to Products'}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[3rem] p-4 shadow-xl shadow-brand-500/5 border border-brand-100/50 aspect-square flex items-center justify-center overflow-hidden">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={formatImageUrl(activeImage)}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 px-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden ${activeImage === img ? 'border-brand-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={formatImageUrl(img)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-brand-50 text-brand-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Premium Selection</span>
                                <div className="flex items-center gap-1 text-amber-500 ml-auto">
                                    {product.averageRating && product.averageRating > 0 ? (
                                        <>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} size={14} fill={i <= Math.round(product.averageRating!) ? 'currentColor' : 'none'} />
                                            ))}
                                            <span className="text-sm font-black ml-1">{product.averageRating.toFixed(1)}</span>
                                            <span className="text-slate-400 font-medium text-xs">({product.reviewCount} reviews)</span>
                                        </>
                                    ) : (
                                        <>
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-slate-200" />)}
                                            <span className="text-slate-400 font-medium text-xs ml-1">No reviews yet</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">{product.name}</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2 text-sm italic">
                                by <span className="text-brand-600 not-italic font-black">{product.providerName || `Holistic Practitioner #${product.providerId}`}</span>
                            </p>
                        </div>

                        <div className="flex items-end gap-3 pb-8 border-b border-slate-100">
                            {(() => {
                                const disc = product.discountPercentage ?? 0
                                if (disc > 0) {
                                    const discPrice = product.price - (product.price * disc / 100)
                                    return (
                                        <>
                                            <span className="text-4xl font-black text-brand-600">₹ {Math.round(discPrice).toLocaleString()}</span>
                                            <span className="text-slate-400 line-through mb-1 text-lg font-medium">₹ {product.price.toLocaleString()}</span>
                                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-black mb-1 ml-auto">{disc}% OFF</span>
                                        </>
                                    )
                                }
                                return <span className="text-4xl font-black text-brand-600">₹ {product.price.toLocaleString()}</span>
                            })()}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Quantity</span>
                                    <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">
                                            <Minus size={16} />
                                        </button>
                                        <span className="text-lg font-black text-slate-900 w-6 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 relative">
                                    <button
                                        onClick={handleShare}
                                        className="p-4 bg-white border-2 border-slate-100 rounded-3xl text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm group relative"
                                        title="Share Product"
                                    >
                                        <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <AnimatePresence>
                                        {showShareCopied && (
                                            <motion.span
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 whitespace-nowrap"
                                            >
                                                COPIED!
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {!isReadOnly && (
                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={isSubmitting}
                                            className="col-span-2 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <ShoppingCart size={24} /> Add to Cart
                                        </button>
                                        <button
                                            onClick={handleOpenWishlistModal}
                                            className="col-span-2 bg-white border-2 border-brand-100 text-brand-600 py-4 rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-brand-50 hover:border-brand-200 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <Plus size={20} /> Add to Wishlist
                                        </button>
                                    </>
                                )}
                                {isReadOnly && (
                                    <div className="col-span-2 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-700 font-black text-center text-sm flex flex-col items-center gap-2">
                                        <Shield size={24} />
                                        ADMIN MODERATOR VIEW (READ-ONLY)
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Actions must be taken from the Flagged Content dashboard</p>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm border ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                                    >
                                        {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                        {feedback.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-brand-500/5 border border-brand-100/50 overflow-hidden">
                    <div className="flex border-b border-slate-100 px-8">
                        {(['description', 'reviews', 'qna'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-6 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-12">
                        <AnimatePresence>
                            {activeTab === 'description' && (
                                <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="prose prose-slate max-w-none">
                                    <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">{product.description}</p>
                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <motion.div key="revs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                    {hasUserReviewed ? (
                                        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-center">
                                            <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
                                            <p className="text-emerald-800 font-black">You have already reviewed this product.</p>
                                        </div>
                                    ) : canReview && !isReadOnly ? (
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 italic">
                                                <Star size={24} className="text-amber-500" /> Share your experience
                                            </h3>
                                            <form onSubmit={handleAddReview} className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-black text-slate-500">Rating:</span>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                                                                className={`p-1 transition-all ${reviewForm.rating >= star ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-300'}`}
                                                            >
                                                                <Star size={24} fill={reviewForm.rating >= star ? 'currentColor' : 'none'} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Review Title (e.g., Amazing results!)"
                                                        className="bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-brand-600 outline-none transition-all shadow-sm"
                                                        value={reviewForm.title}
                                                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                                                        required
                                                    />
                                                    <textarea
                                                        placeholder="Tell us more about the product..."
                                                        rows={4}
                                                        className="bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-brand-600 outline-none transition-all shadow-sm resize-none"
                                                        value={reviewForm.description}
                                                        onChange={e => setReviewForm(f => ({ ...f, description: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    Submit Review
                                                </button>
                                            </form>
                                        </div>
                                    ) : (!hasBeenDelivered && profile && !isReadOnly) ? (
                                        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-8 flex items-start gap-4">
                                            <AlertCircle className="text-amber-600 mt-1" size={20} />
                                            <div>
                                                <p className="font-black text-amber-900 text-sm">Review Restriction</p>
                                                <p className="text-amber-700 text-xs font-medium">You can only review this product after it has been delivered to you.</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Review List */}
                                    <div className="space-y-8">
                                        {reviews.length > 0 ? reviews.map(review => (
                                            <div key={review.reviewId} className="border-b border-slate-100 pb-8 last:border-0">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                                        <User size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900">{review.userName || 'Verified User'}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex text-amber-500">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                                                                ))}
                                                            </div>
                                                            <span className="text-slate-400 text-xs font-medium">• {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                        <CheckCircle2 size={12} /> Verified Purchase
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h5 className="font-black text-slate-800 mb-2">{review.title}</h5>
                                                        <p className="text-slate-500 font-medium leading-relaxed mb-4">{review.description}</p>

                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => review.reviewId && handleUpvoteReview(review.reviewId)}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border group ${review.hasUpvoted ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20' : 'bg-white text-slate-500 border-slate-100 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600'}`}
                                                            >
                                                                <Star size={14} className={review.hasUpvoted ? 'fill-amber-400 text-amber-500' : 'group-hover:fill-current'} />
                                                                <span className="text-xs font-black uppercase tracking-wider">
                                                                    {review.hasUpvoted ? 'Helpful' : 'Mark Helpful'}
                                                                </span>
                                                                {review.helpfulVotes! > 0 && (
                                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${review.hasUpvoted ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600'}`}>
                                                                        {review.helpfulVotes}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => review.reviewId && handleReportClick('PRODUCT_REVIEW', review.reviewId)}
                                                        className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-wider transition-all pt-1"
                                                    >
                                                        <Flag size={12} /> Report
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                <MessageCircle size={48} className="text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-bold italic">No reviews yet. Be the first to share your experience!</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'qna' && (
                                <motion.div key="qna" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                    {/* Question Form */}
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                                                <HelpCircle size={24} className="text-brand-600" /> Have a question?
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort by:</span>
                                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                                    {(['latest', 'trending', 'name'] as const).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setQaSort(s)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${qaSort === s ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {!isReadOnly ? (
                                            <form onSubmit={handleAskQuestion} className="flex gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Ask something about this product..."
                                                    className="flex-1 bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-brand-600 outline-none transition-all shadow-sm"
                                                    value={questionContent}
                                                    onChange={e => setQuestionContent(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-slate-900 text-white px-8 rounded-2xl font-black text-sm shadow-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    Ask <Send size={18} />
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 font-bold italic text-center">
                                                Asking questions is disabled in moderator view
                                            </div>
                                        )}
                                    </div>

                                    {/* Questions & Answers */}
                                    <div className="space-y-10">
                                        {getSortedQuestions().length > 0 ? getSortedQuestions().map(q => (
                                            <div key={q.questionId} className="group">
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                                                        <HelpCircle size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-black text-slate-900 leading-tight">{q.content}</h4>
                                                            <button
                                                                onClick={() => q.questionId && handleReportClick('PRODUCT_QUESTION', q.questionId)}
                                                                className="opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-red-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                                                            >
                                                                <Flag size={12} /> Report
                                                            </button>
                                                        </div>
                                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                            by {q.userName || 'User'} • {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Recent'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="ml-14 space-y-6">
                                                    {q.answers?.map(ans => (
                                                        <div key={ans.answerId} className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 relative">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="text-slate-900 font-black text-sm">{ans.userName}</span>
                                                                {ans.userRole === 'PROVIDER' && (
                                                                    <span className="bg-brand-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Owner</span>
                                                                )}
                                                                <span className="text-slate-300 text-xs">• {ans.createdAt ? new Date(ans.createdAt).toLocaleDateString() : 'Recent'}</span>
                                                            </div>
                                                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{ans.content}</p>
                                                            <div className="absolute top-4 right-4 group-hover:block transition-all">
                                                                <button
                                                                    onClick={() => ans.answerId && handleReportClick('PRODUCT_ANSWER', ans.answerId)}
                                                                    className="text-slate-300 hover:text-red-500 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider"
                                                                >
                                                                    <Flag size={10} /> Report
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Answer Form */}
                                                    {!isReadOnly && (
                                                        <div className="flex gap-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Add an answer..."
                                                                className="flex-1 bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm focus:border-brand-600 outline-none transition-all shadow-sm"
                                                                value={answerContent[q.questionId!] || ''}
                                                                onChange={e => setAnswerContent(prev => ({ ...prev, [q.questionId!]: e.target.value }))}
                                                            />
                                                            <button
                                                                onClick={() => q.questionId && handlePostAnswer(q.questionId)}
                                                                disabled={isSubmitting}
                                                                className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 transition-all shadow-lg active:scale-95 flex-shrink-0"
                                                            >
                                                                <ChevronRight size={20} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                <HelpCircle size={48} className="text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-bold italic">No questions yet. Have a doubt? Ask away!</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Wishlist Selection Modal */}
            <AnimatePresence>
                {isWishlistModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWishlistModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <Plus className="text-red-500" /> Save to...
                                </h3>
                                <button
                                    onClick={() => setIsWishlistModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                                {wishlists.length > 0 ? wishlists.map(list => (
                                    <button
                                        key={list.wishlistId}
                                        onClick={() => handleAddToWishlist(list.wishlistId)}
                                        className="w-full p-6 rounded-2xl border-2 border-slate-100 hover:border-brand-600 hover:bg-brand-50 transition-all text-left flex items-center justify-between group"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900">{list.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{list.items.length} items</p>
                                        </div>
                                        <Plus className="text-slate-300 group-hover:text-brand-600 transition-colors" size={20} />
                                    </button>
                                )) : (
                                    <div className="text-center py-8">
                                        <Plus size={48} className="text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold italic">You don't have any wishlists yet.</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100">
                                {isCreatingWishlist ? (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Wishlist name..."
                                            className="w-full bg-white border-2 border-brand-100 p-4 rounded-2xl font-bold focus:border-brand-600 outline-none transition-all"
                                            value={newWishlistName}
                                            onChange={e => setNewWishlistName(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsCreatingWishlist(false)}
                                                className="flex-1 bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-sm hover:bg-slate-300 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreateWishlist}
                                                disabled={isSubmitting || !newWishlistName.trim()}
                                                className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50"
                                            >
                                                Create
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsCreatingWishlist(true)}
                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all"
                                    >
                                        <Plus size={18} /> Create New Wishlist
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ReportModal
                isOpen={!!reportConfig}
                onClose={() => setReportConfig(null)}
                onConfirm={handleReportSubmit}
                title={`Report ${reportConfig?.entityType.replace('_', ' ').toLowerCase()}`}
            />
        </DashboardLayout>
    )
}
