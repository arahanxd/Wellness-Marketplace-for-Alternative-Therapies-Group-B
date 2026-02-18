import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { api } from '../api/api'
import type { RegisterRequest } from '../api/api'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, School, MapPin, Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { SPECIALIZATIONS } from '../constants/specializations'

export function RegisterPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const defaultRole = (params.get('role') === 'PRACTITIONER') ? 'PRACTITIONER' : 'PATIENT'

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    city: '',
    country: ''
  })

  const [dropdownRole, setDropdownRole] = useState<'PATIENT' | 'PRACTITIONER'>(defaultRole as 'PATIENT' | 'PRACTITIONER')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const roleMap: Record<string, 'CLIENT' | 'PROVIDER'> = {
    PATIENT: 'CLIENT',
    PRACTITIONER: 'PROVIDER'
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (formData.fullName.length < 2) newErrors.fullName = 'Full name must be at least 2 characters'
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address'
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (dropdownRole === 'PRACTITIONER' && !formData.specialization) newErrors.specialization = 'Specialization is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'role') setDropdownRole(value as 'PATIENT' | 'PRACTITIONER')
    else setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const payload: RegisterRequest = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: roleMap[dropdownRole],
        specialization: formData.specialization,
        city: formData.city,
        country: formData.country
      }

      await api.register(payload)
      localStorage.setItem('userEmail', formData.email)
      navigate('/otp-verification', { state: { email: formData.email } })
    } catch (err: any) {
      console.error('REGISTRATION ERROR:', err.response?.data || err)
      setErrors({ general: err.response?.data?.error || 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopNav />
      <main className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 pb-24 pt-16 lg:flex-row lg:items-start">
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-1/2 space-y-6 lg:pt-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1 text-sm font-bold text-brand-700">
            <Sparkles size={16} /> <span>Join the Wellness Hub Community</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">
            Elevate your <span className="text-brand-600">Well-being</span> journey today.
          </h1>
          <p className="text-xl text-slate-600 max-w-lg font-medium">
            Connect with verified practitioners and explore alternative therapies designed for your unique needs.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-emerald-600 font-bold">
              <CheckCircle2 size={24} /> <span>Verified Practitioners</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-600 font-bold">
              <CheckCircle2 size={24} /> <span>Secure & Privacy First</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl lg:w-1/2"
        >
          <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-brand-500/10 border border-brand-100/50">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Create Account</h2>
              <p className="text-slate-500 font-medium">Manage your wellness sessions with ease.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setDropdownRole('PATIENT')}
                  className={`py-2.5 rounded-xl text-sm font-black transition-all ${dropdownRole === 'PATIENT' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  As Patient
                </button>
                <button
                  type="button"
                  onClick={() => setDropdownRole('PRACTITIONER')}
                  className={`py-2.5 rounded-xl text-sm font-black transition-all ${dropdownRole === 'PRACTITIONER' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  As Practitioner
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-600 font-bold ml-4">{errors.fullName}</p>}
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600 font-bold ml-4">{errors.email}</p>}
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password (min. 8 characters)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-600 font-bold ml-4">{errors.password}</p>}
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-bold ml-4">{errors.confirmPassword}</p>}
                </div>

                <AnimatePresence>
                  {dropdownRole === 'PRACTITIONER' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      <div className="relative group">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-black"
                        >
                          <option value="">Select Specialization</option>
                          {SPECIALIZATIONS.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                        {errors.specialization && <p className="mt-1 text-xs text-red-600 font-bold ml-4">{errors.specialization}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Continue'}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-sm font-medium text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-600 font-black hover:text-brand-700">Login here</Link>
              </p>
            </form>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
