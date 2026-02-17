import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Profile } from '../api'

export function AdminDashboard() {
  const [practitioners, setPractitioners] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getPractitioners()
      .then((data) => {
        setPractitioners(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const approve = async (id: number) => {
    await api.approvePractitioner(id)
    setPractitioners((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, verificationStatus: 'APPROVED' } : p
      )
    )
  }

  const reject = async (id: number) => {
    await api.rejectPractitioner(id)
    setPractitioners((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, verificationStatus: 'REJECTED' } : p
      )
    )
  }

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Practitioner Verification', active: true },
      ]}
    >
      <div className="space-y-4">

        <h1 className="text-xl font-semibold text-slate-900">
          Practitioner Verification Panel
        </h1>

        {loading && <p>Loading practitioners...</p>}

        {!loading && practitioners.length === 0 && (
          <p>No practitioners found.</p>
        )}

        {practitioners.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl bg-white p-4 shadow-soft-card"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {p.name}
                </p>
                <p className="text-xs text-slate-500">{p.email}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {p.city} {p.country && `• ${p.country}`}
                </p>
                <p className="text-xs mt-2">
                  Status:{' '}
                  <span className="font-semibold">
                    {p.verificationStatus || 'PENDING'}
                  </span>
                </p>

                {p.degreeFile && (
  <a
    href={`http://localhost:8080/api/user/degree/${p.id}`}
    target="_blank"
    rel="noreferrer"
    className="block mt-2 text-xs text-blue-600 underline"
  >
    View Degree File
  </a>
)}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approve(p.id)}
                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(p.id)}
                  className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
