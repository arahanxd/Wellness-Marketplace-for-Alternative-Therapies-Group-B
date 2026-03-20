import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type ForumQuestion, type Profile } from '../api'
import { ReportModal } from '../components/ReportModal'
import { 
  ArrowLeft, ThumbsUp, User, Clock, MessageSquare, 
  Send, AlertCircle, CheckCircle2, Flag, Shield
} from 'lucide-react'
import { motion } from 'framer-motion'

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [question, setQuestion] = useState<ForumQuestion | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [answerContent, setAnswerContent] = useState('')
  const [commentContents, setCommentContents] = useState<{ [key: number]: string }>({})
  const [submitting, setSubmitting] = useState(false)
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [reportConfig, setReportConfig] = useState<{ entityType: string; entityId: number } | null>(null)
  
  // Read-only logic for Admin Reports
  const queryParams = new URLSearchParams(window.location.search)
  const isReadOnly = queryParams.get('readOnly') === 'true'
  const fromReports = queryParams.get('fromReports') === 'true'

  useEffect(() => {
    if (id) fetchData(parseInt(id))
  }, [id])

  const fetchData = async (questionId: number) => {
    try {
      const [qData, pData] = await Promise.all([
        api.getForumQuestionById(questionId),
        api.getProfile().catch(() => null)
      ])
      setQuestion(qData)
      setProfile(pData)
    } catch {
      setMessage({ text: 'Question not found.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpvoteQuestion = async () => {
    if (!profile || !question?.questionId) return
    try {
      await api.upvoteForumQuestion(question.questionId)
      fetchData(question.questionId)
    } catch (err) {
      // ignore
    }
  }

  const handleUpvoteAnswer = async (answerId: number) => {
    if (!profile || !question?.questionId) return
    try {
      await api.upvoteForumAnswer(answerId)
      fetchData(question.questionId)
    } catch (err) {
      // ignore
    }
  }

  const handleAcceptAnswer = async (answerId: number) => {
    if (!profile || !question?.questionId) return
    try {
      await api.acceptForumAnswer(answerId)
      fetchData(question.questionId)
    } catch (err) {
      // ignore
    }
  }

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !question?.questionId) return
    setSubmitting(true)
    try {
      await api.createForumAnswer({
        questionId: question.questionId,
        userId: profile.id,
        content: answerContent
      })
      setMessage({ text: 'Answer posted successfully!', type: 'success' })
      setAnswerContent('')
      fetchData(question.questionId)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to post answer.', type: 'error' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePostComment = async (answerId: number) => {
    if (!profile || !question?.questionId) return
    const content = commentContents[answerId]
    if (!content) return
    try {
      await api.createForumComment({ answerId, userId: profile.id, content })
      setCommentContents(prev => ({ ...prev, [answerId]: '' }))
      fetchData(question.questionId)
    } catch (err) {
      // ignore
    }
  }

  const handleReportClick = (entityType: 'question' | 'answer' | 'comment', entityId: number) => {
    let type = '';
    if (entityType === 'question') type = 'FORUM_QUESTION';
    else if (entityType === 'answer') type = 'FORUM_ANSWER';
    else if (entityType === 'comment') type = 'FORUM_COMMENT';
    
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
      alert('Report submitted to admins.')
    } catch {
      alert('Failed to report.')
    } finally {
      setReportConfig(null)
    }
  }

  const userRole = localStorage.getItem('userRole')
  const sidebarItems = userRole === 'ADMIN' ? [
    { label: 'Admin Dashboard', path: '/admin', icon: <Shield size={20} /> },
    { label: 'Flagged Content', path: '/admin/reports', icon: <Flag size={20} /> },
    { label: 'Community Forum', path: '/forum', icon: <MessageSquare size={20} /> },
  ] : [
    { label: 'Find my Practitioner', path: '/marketplace', icon: <MessageSquare size={20} /> },
    { label: 'Community Forum', active: true, path: '/forum', icon: <MessageSquare size={20} /> },
  ]

  if (loading) return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="flex justify-center p-20"><MessageSquare size={32} className="animate-bounce text-brand-600" /></div>
    </DashboardLayout>
  )

  if (!question) return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="text-center p-20">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900">Question Not Found</h2>
        <button onClick={() => navigate('/forum')} className="mt-6 text-brand-600 hover:underline font-bold">Return to Forum</button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <button 
          onClick={() => fromReports ? navigate('/admin/reports') : navigate('/forum')} 
          className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold transition-colors"
        >
          <ArrowLeft size={20} /> {fromReports ? 'Back to Flagged Content' : 'Back to Discussions'}
        </button>

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <CheckCircle2 size={20} /> {message.text}
          </motion.div>
        )}

        {/* Question Component */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
          {!isReadOnly && (
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleReportClick('question', question.questionId!)} className="text-slate-300 hover:text-red-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                <Flag size={14} /> Report
              </button>
            </div>
          )}
          {isReadOnly && (
            <div className="absolute top-4 right-8 px-4 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
              <Shield size={12} /> Read Only
            </div>
          )}
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-8 pr-20">{question.title}</h1>
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <button 
                onClick={() => !isReadOnly && handleUpvoteQuestion()}
                disabled={isReadOnly || !profile}
                className={`p-3 rounded-2xl transition-all border-2 ${
                  isReadOnly ? 'bg-slate-50 text-slate-200 cursor-not-allowed border-transparent' : 
                  question.hasUpvoted ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-md' : 
                  'bg-slate-50 hover:bg-brand-50 hover:text-brand-600 border-transparent'
                }`}
              >
                <ThumbsUp size={24} className={question.hasUpvoted ? "fill-indigo-600" : ""} />
              </button>
              <span className={`font-black text-xl ${question.hasUpvoted ? 'text-indigo-600' : 'text-slate-700'}`}>{question.upvotes || 0}</span>
            </div>
            <div className="flex-1 space-y-8">
              <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">{question.content}</p>
              
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-black text-slate-900">{question.userName || 'Anonymous'}</div>
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {question.createdAt ? new Date(question.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <MessageSquare className="text-brand-600" /> {question.answers?.length || 0} Answers
          </h3>

          {question.answers?.map(answer => (
            <div key={answer.answerId} className={`bg-white rounded-[2.5rem] p-8 border hover:shadow-lg transition-all relative group ${answer.isAccepted ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
              {!isReadOnly && (
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-4">
                  {profile?.id === question.userId && !answer.isAccepted && (
                    <button onClick={() => handleAcceptAnswer(answer.answerId!)} className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={14} /> Accept Answer
                    </button>
                  )}
                  <button onClick={() => handleReportClick('answer', answer.answerId!)} className="text-slate-300 hover:text-red-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                    <Flag size={14} /> Report
                  </button>
                </div>
              )}

              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={() => !isReadOnly && handleUpvoteAnswer(answer.answerId!)} 
                    disabled={isReadOnly || !profile}
                    className={`p-2 rounded-xl transition-all border-2 ${
                      isReadOnly ? 'bg-slate-50 text-slate-200 cursor-not-allowed border-transparent' : 
                      answer.hasUpvoted ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 
                      'bg-slate-50 hover:bg-brand-50 hover:text-brand-600 border-transparent'
                    }`}
                  >
                    <ThumbsUp size={20} className={answer.hasUpvoted ? "fill-indigo-600" : ""} />
                  </button>
                  <span className={`font-black text-sm ${answer.hasUpvoted ? 'text-indigo-600' : 'text-slate-700'}`}>{answer.upvotes || 0}</span>
                  {answer.isAccepted && (
                    <div className="mt-2 text-emerald-500 bg-emerald-100 p-2 rounded-full" title="Accepted Answer">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-6">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{answer.content}</p>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-black text-slate-900">{answer.userName || 'Anonymous'}</span>
                    <span className="text-slate-400 text-xs font-bold">• {answer.createdAt ? new Date(answer.createdAt).toLocaleString() : 'Just now'}</span>
                  </div>

                  {/* Comments */}
                  <div className="pl-6 border-l-2 border-slate-100 space-y-4 pt-4">
                    {answer.comments?.map(comment => (
                      <div key={comment.commentId} className="group/comment relative">
                        <p className="text-sm text-slate-600 leading-relaxed pr-10">
                          {comment.content} 
                          <span className="ml-2 font-bold text-brand-600">— {comment.userName}</span>
                        </p>
                        {!isReadOnly && (
                          <button onClick={() => handleReportClick('comment', comment.commentId!)} className="absolute right-0 top-0 opacity-0 group-hover/comment:opacity-100 text-slate-300 hover:text-red-500">
                            <Flag size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-3 pt-2">
                      <input 
                        type="text" 
                        placeholder="Add a comment..."
                        value={commentContents[answer.answerId!] || ''}
                        onChange={e => setCommentContents(prev => ({ ...prev, [answer.answerId!]: e.target.value }))}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-brand-300 outline-none"
                      />
                      <button onClick={() => handlePostComment(answer.answerId!)} className="text-brand-600 hover:text-brand-700 font-black text-[10px] uppercase tracking-widest px-4">
                        Reply
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {/* Answer Form */}
          {!isReadOnly ? (
            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 mt-10">
              <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Send size={20} className="text-brand-600" /> Your Answer
              </h4>
              <form onSubmit={handlePostAnswer} className="space-y-4">
                <textarea 
                  required
                  rows={5}
                  value={answerContent}
                  onChange={e => setAnswerContent(e.target.value)}
                  placeholder="Share your knowledge to help out..."
                  className="w-full bg-white border border-slate-200 p-6 rounded-3xl font-bold focus:border-brand-500 outline-none transition-all resize-none shadow-sm"
                />
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting} className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-black shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                    <Send size={18} /> Post Answer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-[2.5rem] p-12 border border-amber-100 mt-10 text-center space-y-4">
              <Shield size={48} className="text-amber-200 mx-auto" />
              <h4 className="text-xl font-black text-amber-900 italic">Moderator Mode</h4>
              <p className="text-amber-700 font-medium max-w-md mx-auto">This page is displayed for context only. All interaction is disabled for administrators reviewing flagged content.</p>
              <button 
                onClick={() => navigate('/admin/reports')}
                className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-amber-700 transition-all shadow-lg"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      <ReportModal 
        isOpen={!!reportConfig} 
        onClose={() => setReportConfig(null)} 
        onConfirm={handleReportSubmit}
        title={`Report ${reportConfig?.entityType.replace('_', ' ').toLowerCase()}`}
      />
    </DashboardLayout>
  )
}
