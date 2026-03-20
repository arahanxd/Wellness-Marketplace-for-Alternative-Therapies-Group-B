import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type ForumQuestion, type Profile } from '../api'
import { ReportModal } from '../components/ReportModal'
import { 
  MessageSquare, Plus, Search, TrendingUp, Clock,
  ThumbsUp, User, ChevronRight, Package, AlertCircle, Flag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ForumPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<ForumQuestion[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab ] = useState<'latest' | 'trending' | 'name' | 'global'>('global')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  
  // New Question Form
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reportConfig, setReportConfig] = useState<{ entityType: string; entityId: number } | null>(null)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [qData, pData] = await Promise.all([
        api.getForumQuestions().catch(() => []),
        api.getProfile().catch(() => null)
      ])
      setQuestions(qData)
      setProfile(pData)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async (questionId: number) => {
    if (!profile) return
    try {
      await api.upvoteForumQuestion(questionId)
      fetchData()
    } catch (err) {
      // ignore
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSubmitting(true)
    try {
      await api.createForumQuestion({
        userId: profile.id,
        title: newTitle,
        content: newContent
      })
      setMessage({ text: 'Question posted successfully!', type: 'success' })
      setNewTitle('')
      setNewContent('')
      setIsAsking(false)
      fetchData()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to post question.', type: 'error' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReportClick = (type: string, entityId: number) => {
    setReportConfig({ entityType: type === 'FORUM_POST' ? 'FORUM_QUESTION' : type, entityId })
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
        alert('Thank you for your report. Our moderators will review it shortly.')
    } catch (err) {
        console.error(err)
        alert('Failed to submit report.')
    } finally {
        setReportConfig(null)
    }
  }

  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            q.content.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeTab === 'global') return !q.productId;
      return true;
    })
    .sort((a, b) => {
      if (activeTab === 'trending') return (b.answerCount || b.answers?.length || 0) - (a.answerCount || a.answers?.length || 0)
      if (activeTab === 'name') return a.title.localeCompare(b.title)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

  const sidebarItems = [
    { label: 'Find my Practitioner', path: '/marketplace', icon: <Package size={20} /> },
    { label: 'Community Forum', active: true, path: '/forum', icon: <MessageSquare size={20} /> },
  ]

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex flex-col items-center justify-center p-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4 text-brand-600">
            <MessageSquare size={32} />
          </motion.div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Forum...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        
        {/* Header */}
        <header className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-[3rem] p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              <MessageSquare size={14} /> Global Community
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">Wellness Forum</h1>
            <p className="text-brand-100 font-medium text-lg leading-relaxed">
              Ask questions, share experiences, and learn from our community of practitioners and wellness enthusiasts.
            </p>
          </div>
          <button 
            onClick={() => setIsAsking(!isAsking)}
            className="flex-shrink-0 bg-white text-brand-600 px-8 py-5 rounded-[2rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center gap-3"
          >
            {isAsking ? 'Cancel' : <><Plus size={24} /> Ask Question</>}
          </button>
        </header>

        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <AlertCircle size={20} /> {message.text}
          </motion.div>
        )}

        <AnimatePresence>
          {isAsking && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateQuestion}
              className="bg-white p-8 rounded-[3rem] shadow-xl border border-brand-100/50 space-y-6 overflow-hidden"
            >
              <h3 className="text-2xl font-black text-slate-900">Start a Discussion</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Title</label>
                <input 
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold focus:border-brand-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Details</label>
                <textarea 
                  required
                  rows={4}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Provide more details to help the community answer your question..."
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold focus:border-brand-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsAsking(false)} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-brand-600 text-white px-10 py-4 rounded-[2rem] font-black shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50">
                  {submitting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Filter and Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex bg-slate-100 p-1.5 rounded-full text-sm font-black w-full md:w-auto overflow-x-auto">
             <button 
              onClick={() => setActiveTab('global')} 
              className={`flex-1 md:flex-none px-8 py-3 rounded-full flex items-center gap-2 transition-all border-2 ${activeTab === 'global' ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg border-white/50' : 'text-brand-600 border-transparent hover:bg-white/50'}`}
            >
              <MessageSquare size={18} /> Community Forum
            </button>
             <button 
              onClick={() => setActiveTab('latest')} 
              className={`flex-1 md:flex-none px-8 py-3 rounded-full flex items-center gap-2 transition-all ${activeTab === 'latest' ? 'bg-white text-brand-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Clock size={18} /> Latest
            </button>
            <button 
              onClick={() => setActiveTab('trending')} 
              className={`flex-1 md:flex-none px-8 py-3 rounded-full flex items-center gap-2 transition-all ${activeTab === 'trending' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <TrendingUp size={18} /> Trending
            </button>
            <button 
              onClick={() => setActiveTab('name')} 
              className={`flex-1 md:flex-none px-8 py-3 rounded-full flex items-center gap-2 transition-all ${activeTab === 'name' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User size={18} /> Name
            </button>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-full font-bold text-slate-900 focus:border-brand-500 outline-none shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
            <motion.div 
              key={q.questionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-xl hover:border-brand-100 transition-all group flex flex-col md:flex-row gap-6"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpvote(q.questionId!)
                }}
                disabled={!profile}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl min-w-[5rem] transition-all ${
                  q.hasUpvoted ? 'bg-indigo-50 border-2 border-indigo-200 shadow-md' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                }`}
              >
                <ThumbsUp size={24} className={q.hasUpvoted ? "text-indigo-600 mb-1 fill-indigo-600" : (q.upvotes && q.upvotes > 0 ? "text-indigo-500 mb-1" : "text-slate-300 mb-1")} />
                <span className={`font-black text-xl ${q.hasUpvoted ? 'text-indigo-700' : (q.upvotes && q.upvotes > 0 ? 'text-indigo-600' : 'text-slate-400')}`}>{q.upvotes || 0}</span>
                <span className={`text-[9px] uppercase tracking-widest font-bold mt-1 ${q.hasUpvoted ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {q.hasUpvoted ? 'Upvoted' : 'Votes'}
                </span>
              </button>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                    {q.title}
                  </h3>
                  {q.productId && (
                    <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      Product Q&A
                    </span>
                  )}
                </div>
                <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed">{q.content}</p>
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={16} />
                    <span className="text-xs font-black text-slate-600">{q.userName || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Clock size={16} />
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Just now'}
                  </div>
                  <button 
                    onClick={() => q.questionId && handleReportClick('FORUM_POST', q.questionId)}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-red-500 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Flag size={12} /> Report
                  </button>
                  <div className="flex items-center gap-2 text-brand-600 text-xs font-bold bg-brand-50 px-3 py-1 rounded-lg ml-auto">
                    <MessageSquare size={14} />
                    {q.answerCount || q.answers?.length || 0} Answers
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button 
                  onClick={() => navigate(`/forum/${q.questionId}`)}
                  className="bg-brand-50 text-brand-600 p-4 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight size={24} />
                </button>
                </div>
              </motion.div>
            )) : null}
            {filteredQuestions.length === 0 && (
              <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-500/5">
                <div className="bg-slate-50 inline-block p-12 rounded-full mb-6">
                  <Search size={64} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 italic">No results found</h3>
                <p className="text-slate-500 font-medium italic">Try adjusting your search or filters.</p>
              </div>
            )}
        </div>

        {reportConfig && (
          <ReportModal 
            isOpen={!!reportConfig} 
            onClose={() => setReportConfig(null)} 
            onConfirm={handleReportSubmit}
            title={`Report ${reportConfig.entityType.replace('_', ' ').toLowerCase()}`}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
