import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Profile } from '../api'

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!profile) return <div className="p-6">Unable to load profile.</div>

  const status = profile.verificationStatus || 'PENDING'

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Dashboard', active: true },
        { label: 'Profile & Verification', to: '#' },
        { label: 'Session Requests', to: '#' },
        { label: 'Calendar', to: '#' },
        { label: 'Community Q&A', to: '#' },
        { label: 'Reviews', to: '#' },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[2fr,1.1fr]">
        <section className="space-y-5">

          {/* Stats + Verification */}
          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-white p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Pending Sessions
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">3</p>
              <p className="mt-1 text-xs text-slate-600">
                New requests awaiting your response.
              </p>
            </div>

            {/* Verification Panel */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Verification Status
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {status}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {status === 'APPROVED' &&
                  'Your account is verified and visible to clients.'}

                {status === 'PENDING' &&
                  'Your documents are under review by admin.'}

                {status === 'REJECTED' &&
                  'Your verification was rejected. Please re-upload valid documents.'}
              </p>

              {profile.degreeFile && (
                <a
                  href={`http://localhost:8080/${profile.degreeFile}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-3 text-xs text-blue-600 underline"
                >
                  View Uploaded Degree
                </a>
              )}
            </div>

          </div>

          {/* Session Requests */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              Session Requests
            </h2>

            <div className="mt-3 space-y-3">
              {[
                { name: 'Sarah M.', datetime: 'Fri · 10:00 AM' },
                { name: 'Alex T.', datetime: 'Fri · 3:00 PM' },
              ].map((req, idx) => (
                <article
                  key={`${req.name}-${idx}`}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-brand-800">
                      {req.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {req.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {req.datetime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-[11px]">
                    <button className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700">
                      Reject
                    </button>
                    <button className="rounded-full bg-brand-600 px-3 py-1 font-semibold text-white">
                      Accept
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </section>

        {/* Sidebar */}
        <aside className="space-y-4">

          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">
              Your Profile Info
            </h2>

            <div className="mt-3 text-xs text-slate-700 space-y-2">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>City:</strong> {profile.city || 'N/A'}</p>
              <p><strong>Country:</strong> {profile.country || 'N/A'}</p>
              <p><strong>Specialization:</strong> {profile.specialization || 'N/A'}</p>
            </div>
          </section>

        </aside>
      </div>
    </DashboardLayout>
  )
}
