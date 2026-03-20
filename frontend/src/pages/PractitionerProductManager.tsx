import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Product, type Profile } from '../api'
import {
  Package, ArrowLeft, Trash2, Save, CloudUpload,
  Activity, AlertCircle, CheckCircle2, Star, ShoppingBag, Tag,
  RefreshCw, Plus
} from 'lucide-react'

export function PractitionerProductManager() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPercentage: '0',
    mainImage: null as File | null,
    additionalImages: [] as File[]
  })


  useEffect(() => {
    fetchData()
  }, [productId])

  const fetchData = async () => {
    try {
      const userProfile = await api.getProfile()
      setProfile(userProfile)

      if (productId) {
        const data = await api.getProductById(Number(productId))
        setProduct(data)

        setForm({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          discountPercentage: (data.discountPercentage ?? 0).toString(),
          mainImage: null,
          additionalImages: []
        })
      }

    } catch (err) {
      console.error(err)
      setMessage({ text: 'Failed to load product.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productId) return
    setSubmitting(true)

    const formData = new FormData()

    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('discountPercentage', form.discountPercentage || '0')

    if (form.mainImage) {
      formData.append('image', form.mainImage)
    }

    if (form.additionalImages.length > 0) {
      form.additionalImages.forEach(file => {
        formData.append('additionalImages', file)
      })
    }

    try {
      await api.updateProduct(Number(productId), formData)

      setMessage({ text: 'Product updated successfully!', type: 'success' })
      fetchData()

      setTimeout(() => setMessage(null), 3000)

    } catch (err) {
      setMessage({ text: 'Update failed.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!profile || !window.confirm('Remove this image?')) return

    try {
      await api.deleteProductImage(imageId, profile.id)

      setMessage({ text: 'Image removed.', type: 'success' })
      fetchData()

    } catch {
      setMessage({ text: 'Failed to remove image.', type: 'error' })
    }
  }

  const sidebarItems = [
    { label: 'Back to Dashboard', onClick: () => navigate('/practitioner'), icon: <ArrowLeft size={20} /> },
    { label: 'Product Manager', active: true, icon: <Package size={20} /> },
  ]

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Activity size={32} className="text-brand-600" />
        </motion.div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">
          Loading manager...
        </p>
      </div>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-10 pb-20"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight mb-2">
              Product <span className="text-brand-400">Editor</span>
            </h2>
            <p className="text-slate-400 font-medium">Refine your product details and manage visual assets.</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <Package size={24} className="text-brand-400" />
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-3xl border flex items-center gap-4 font-black text-sm shadow-xl
            ${message.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-500/10'
                : 'bg-rose-50 border-rose-100 text-rose-600 shadow-rose-500/10'
              }`}
          >
            {message.type === 'success'
              ? <CheckCircle2 size={24} />
              : <AlertCircle size={24} />}
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-8">
            <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-500/5 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Product Identity</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                      <Tag size={18} />
                    </div>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter product name..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Narrative & Description</label>
                  <textarea
                    required
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the benefits and details..."
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-medium placeholder:text-slate-300 min-h-[160px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Base Pricing (₹)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                        <ShoppingBag size={18} />
                      </div>
                      <input
                        type="number"
                        required
                        value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Promotional Discount (%)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                        <Star size={18} />
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.discountPercentage}
                        onChange={e => setForm({ ...form, discountPercentage: e.target.value })}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-600 hover:shadow-2xl hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <RefreshCw size={18} />
                      </motion.div>
                      Sycnronizing...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Commit Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Media & Assets Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Asset Upload */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-500/5 space-y-6 text-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Primary Visual Asset</label>
              
              <div className="relative group aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 hover:border-brand-300 hover:bg-brand-50 transition-all cursor-pointer overflow-hidden p-4">
                {form.mainImage ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img
                      src={URL.createObjectURL(form.mainImage)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest">Change Image</p>
                    </div>
                  </div>
                ) : product?.imageUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img
                      src={product.imageUrl}
                      alt="Current"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest">Update Primary Media</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-white text-slate-400 group-hover:text-brand-500 transition-colors shadow-sm">
                      <CloudUpload size={32} />
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-600">Upload Media</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG up to 10MB</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setForm({ ...form, mainImage: e.target.files?.[0] || null })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Gallery Assets */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-500/5">
              <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Gallery Assets</label>
                <div className="relative">
                   <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-brand-500 transition-colors">
                      <Plus size={16} />
                   </button>
                   <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e =>
                      setForm({
                        ...form,
                        additionalImages: [
                          ...form.additionalImages,
                          ...Array.from(e.target.files || [])
                        ]
                      })
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {product?.additionalImages?.map(img => (
                  <motion.div
                    key={img.imageId}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 shadow-sm"
                  >
                    <img src={img.imageUrl} className="w-full h-full object-cover" alt="Gallery" />
                    <button
                      onClick={() => handleDeleteImage(img.imageId)}
                      className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/40 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
                
                {form.additionalImages.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-50" alt="Pending" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white/80 px-2 py-1 rounded-full">Pending</p>
                    </div>
                  </div>
                ))}

                {(!product?.additionalImages || product.additionalImages.length === 0) && form.additionalImages.length === 0 && (
                   <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No additional assets</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}