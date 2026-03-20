import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Wishlist, type Profile } from '../api'
import { formatImageUrl } from '../utils/image'
import { 
    Heart, 
    Trash2, 
    ShoppingBag, 
    Activity, 
    ClipboardList,
    ShoppingCart,
    MoreVertical,
    FolderPlus,
    Tag
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export function WishlistPage() {
    const navigate = useNavigate()
    const [wishlists, setWishlists] = useState<Wishlist[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [newWishlistName, setNewWishlistName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setError(null)
            const [userProfile, lists] = await Promise.all([
                api.getProfile(),
                api.getWishlists()
            ])
            setProfile(userProfile)
            setWishlists(lists)
        } catch (err) {
            console.error('Failed to fetch wishlists:', err)
            setError('Could not load your wishlists. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateWishlist = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWishlistName.trim()) return
        try {
            await api.createWishlist(newWishlistName)
            const updatedLists = await api.getWishlists()
            setWishlists(updatedLists)
            setNewWishlistName('')
            setIsCreating(false)
        } catch (err) {
            console.error('Failed to create wishlist:', err)
        }
    }

    const handleDeleteWishlist = async (wishlistId: number) => {
        if (!window.confirm('Delete this wishlist?')) return
        try {
            await api.deleteWishlist(wishlistId)
            setWishlists(prev => prev.filter(l => l.wishlistId !== wishlistId))
            setMenuOpenId(null)
        } catch (err) {
            console.error('Failed to delete wishlist:', err)
        }
    }

    const handleRenameWishlist = async (wishlistId: number) => {
        if (!editName.trim()) return
        try {
            await api.renameWishlist(wishlistId, editName)
            setWishlists(prev => prev.map(l => l.wishlistId === wishlistId ? { ...l, name: editName } : l))
            setEditingId(null)
            setMenuOpenId(null)
        } catch (err) {
            console.error('Failed to rename wishlist:', err)
        }
    }

    const handleRemoveItem = async (itemId: number) => {
        try {
            await api.removeItemFromWishlist(itemId)
            fetchData() // Refresh everything for simplicity
        } catch (err) {
            console.error('Failed to remove item:', err)
        }
    }

    const handleAddToCart = async (productId: number) => {
        try {
            await api.addToCart(productId, 1)
            alert('Added to cart!')
        } catch (err) {
            alert('Failed to add to cart.')
        }
    }

    const sidebarItems = [
        { label: 'Dashboard', path: '/user', icon: <Activity size={20} /> },
        { label: 'Products', path: '/products', icon: <ShoppingBag size={20} /> },
        { label: 'Cart', path: '/cart', icon: <ShoppingCart size={20} /> },
        { label: 'Wishlist', path: '/wishlist', active: true, icon: <Heart size={20} /> },
        { label: 'Product Orders', path: '/product-orders', icon: <ClipboardList size={20} /> },
    ]

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4 text-brand-600">
                <ClipboardList size={32} />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading your wishlists...</p>
        </div>
    )

    if (error && !profile) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC] p-10 text-center">
            <div className="bg-rose-50 p-8 rounded-full mb-6">
                <ClipboardList size={48} className="text-rose-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 italic">Oops! Something went wrong</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">{error}</p>
            <button 
                onClick={fetchData}
                className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-brand-700 transition-all"
            >
                Retry
            </button>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">My Wishlists</h1>
                        <p className="text-slate-500 font-medium italic">Keep track of items you <span className="text-brand-600 font-black not-italic">love</span></p>
                    </div>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200"
                    >
                        <FolderPlus size={20} /> New Wishlist
                    </button>
                </header>

                <AnimatePresence>
                    {isCreating && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-8 rounded-[2rem] border border-brand-200 shadow-2xl"
                        >
                            <form onSubmit={handleCreateWishlist} className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter wishlist name (e.g., Summer Wellness, Daily Essentials)..." 
                                    autoFocus
                                    className="flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold focus:border-brand-600 outline-none transition-all"
                                    value={newWishlistName}
                                    onChange={e => setNewWishlistName(e.target.value)}
                                />
                                <button type="submit" className="bg-brand-600 text-white px-8 rounded-xl font-black">Create</button>
                                <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 font-bold px-4">Cancel</button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-16">
                    {wishlists.length > 0 ? wishlists.map((list, idx) => (
                        <motion.section 
                            key={list.wishlistId} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-lg border border-brand-50">
                                        <Tag size={20} />
                                    </div>
                                    <div>
                                        {editingId === list.wishlistId ? (
                                            <div className="flex gap-2 items-center">
                                                <input 
                                                    type="text" 
                                                    className="bg-slate-50 border-2 border-brand-200 p-2 rounded-xl font-black text-xl italic uppercase outline-none focus:border-brand-600 w-64"
                                                    value={editName}
                                                    autoFocus
                                                    onChange={e => setEditName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleRenameWishlist(list.wishlistId)}
                                                />
                                                <button onClick={() => handleRenameWishlist(list.wishlistId)} className="text-emerald-600 font-black text-xs uppercase bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">Save</button>
                                                <button onClick={() => setEditingId(null)} className="text-slate-400 font-bold text-xs uppercase">Cancel</button>
                                            </div>
                                        ) : (
                                            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">{list.name}</h2>
                                        )}
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{list.items.length} Items • Created {new Date(list.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative">
                                    <button 
                                        onClick={() => setMenuOpenId(menuOpenId === list.wishlistId ? null : list.wishlistId)}
                                        className={`p-3 rounded-xl transition-all ${menuOpenId === list.wishlistId ? 'bg-brand-50 text-brand-600' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {menuOpenId === list.wishlistId && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute right-0 top-14 w-48 bg-white rounded-2xl shadow-2xl border border-brand-100 z-50 overflow-hidden"
                                            >
                                                <div className="p-2 space-y-1">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingId(list.wishlistId);
                                                            setEditName(list.name);
                                                            setMenuOpenId(null);
                                                        }}
                                                        className="w-full text-left p-3 rounded-xl hover:bg-brand-50 text-slate-600 hover:text-brand-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all"
                                                    >
                                                        <Activity size={14} /> Rename List
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteWishlist(list.wishlistId)}
                                                        className="w-full text-left p-3 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all"
                                                    >
                                                        <Trash2 size={14} /> Delete List
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {list.items.length > 0 ? list.items.map(item => (
                                    <div key={item.id} className="bg-white rounded-[2rem] border border-brand-100 p-5 shadow-xl shadow-brand-500/5 group hover:border-brand-300 transition-all flex flex-col">
                                        <div 
                                            className="h-48 bg-slate-50 rounded-2xl overflow-hidden mb-4 relative cursor-pointer"
                                            onClick={() => navigate(`/product/${item.productId}`)}
                                        >
                                            <img src={formatImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveItem(item.id);
                                                }}
                                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-xl text-slate-400 hover:text-red-500 shadow-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <Link to={`/product/${item.productId}`}>
                                            <h4 className="font-black text-slate-900 mb-1 truncate group-hover:text-brand-600 transition-colors uppercase tracking-widest text-xs px-2">{item.name}</h4>
                                        </Link>
                                        <div className="flex items-center justify-between mt-4 px-2">
                                            <div className="flex flex-col">
                                                <span className="text-brand-600 font-black">₹ {item.price.toLocaleString()}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleAddToCart(item.productId)}
                                                className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-lg active:scale-90"
                                            >
                                                <ShoppingCart size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold italic">This list is empty. Start adding items you love!</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )) : (
                        <div className="py-24 text-center bg-white rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                            <div className="bg-slate-50 inline-block p-12 rounded-full mb-6">
                                <Heart size={64} className="text-slate-200" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2 italic">No wishlists found</h2>
                            <p className="text-slate-500 font-medium mb-8">Organize your favorite wellness products into custom wishlists.</p>
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-brand-700 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Create First Wishlist
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
