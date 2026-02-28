import { useMemo, useState } from 'react'
import type { SessionBooking } from '../api'
import { motion, AnimatePresence } from 'framer-motion'

interface SessionCalendarProps {
  sessions: SessionBooking[]
  perspective: 'CLIENT' | 'PROVIDER'
}

interface DayInfo {
  date: string
  count: number
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function SessionCalendar({ sessions, perspective }: SessionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const startOfMonth = new Date(currentYear, currentMonth, 1)
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const startWeekday = startOfMonth.getDay()
  const daysInMonth = endOfMonth.getDate()

  const daySessions: Record<string, DayInfo> = useMemo(() => {
    const map: Record<string, DayInfo> = {}
    sessions.forEach((s) => {
      if (!s.sessionDate) return
      const key = s.sessionDate
      if (!map[key]) {
        map[key] = { date: key, count: 0 }
      }
      map[key].count += 1
    })
    return map
  }, [sessions])

  const getColorForCount = (count: number) => {
    if (perspective === 'PROVIDER') {
      // Practitioner: Green → 0–1, Yellow → 2–3, Red → ≥4
      if (count <= 1) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      if (count < 4) return 'bg-amber-50 text-amber-700 border-amber-200'
      return 'bg-rose-50 text-rose-700 border-rose-200'
    } else {
      // Client: Green → 0, Yellow → 1, Red → >1
      if (count === 0) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      if (count === 1) return 'bg-amber-50 text-amber-700 border-amber-200'
      return 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }

  const selectedSessions = selectedDate
    ? sessions.filter((s) => s.sessionDate === selectedDate)
    : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Smart Calendar</p>
              <h3 className="text-lg font-black text-slate-900">
                {today.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {WEEK_DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 text-sm">
            {Array.from({ length: startWeekday }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0]
              const info = daySessions[dateStr]
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear()
              const isSelected = selectedDate === dateStr

              const baseClasses =
                'relative flex flex-col items-center justify-center aspect-square rounded-2xl border text-xs font-bold cursor-pointer transition-all'

              const colorClasses = info
                ? getColorForCount(info.count)
                : 'bg-slate-50 text-slate-500 border-slate-100'

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`${baseClasses} ${colorClasses} ${
                    isSelected ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50' : ''
                  }`}
                >
                  <span className="mb-1">{day}</span>
                  {isToday && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-500" />
                  )}
                  {info && (
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      {info.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-200" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-amber-200" />
              <span>Partially Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-rose-200" />
              <span>Busy</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm h-full flex flex-col">
          <h3 className="text-sm font-black text-slate-900 mb-3">
            {selectedDate
              ? `Sessions on ${new Date(selectedDate).toLocaleDateString()}`
              : 'Select a date'}
          </h3>
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {selectedDate && selectedSessions.length === 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-slate-400 font-medium mt-4"
                >
                  No sessions scheduled for this date.
                </motion.p>
              )}
              {selectedSessions.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-slate-900">
                      {perspective === 'PROVIDER' ? s.clientName ?? `Client #${s.clientId}` : s.providerName ?? `Provider #${s.providerId}`}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {s.startTime} – {s.endTime} · {s.duration} mins
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                    {s.issueDescription}
                  </p>
                  {s.providerMessage && (
                    <p className="mt-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-2 py-1">
                      {s.providerMessage}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

