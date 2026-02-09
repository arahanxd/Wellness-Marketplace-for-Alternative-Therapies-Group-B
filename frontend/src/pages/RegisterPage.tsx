import { useSearchParams } from 'react-router-dom'
import { TopNav } from '../components/TopNav'

export function RegisterPage() {
  const [params] = useSearchParams()
  const defaultRole = params.get('role') ?? 'PATIENT'

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        <div className="rounded-2xl bg-white p-6 shadow-soft-card md:p-8">
          <h1 className="text-xl font-semibold text-slate-900">Create your Wellness Hub account</h1>
          <p className="mt-1 text-xs text-slate-600">
            Choose your role to get a tailored dashboard experience.
          </p>

          <form className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="text-xs font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="text-xs font-medium text-slate-700">Role</label>
                <select
                  name="role"
                  defaultValue={defaultRole}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="PRACTITIONER">Practitioner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Specialization (for Practitioners)</label>
                <select
                  name="specialization"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select specialization</option>
                  <option value="Acupuncture">Acupuncture</option>
                  <option value="Massage Therapy">Massage Therapy</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Reiki">Reiki</option>
                  <option value="Chiropractic">Chiropractic</option>
                  <option value="Herbal Medicine">Herbal Medicine</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Location</label>
                <p className="mt-1 text-[11px] text-slate-500">
                  We&apos;ll use your location to suggest nearby practitioners.
                </p>
                <button
                  type="button"
                  className="mt-2 rounded-full border border-dashed border-brand-500/60 px-3 py-1 text-xs font-semibold text-brand-700 hover:border-brand-700"
                >
                  Use current location
                </button>
              </div>
              <div className="rounded-xl bg-brand-50 p-3 text-[11px] text-slate-700">
                <p className="font-semibold text-brand-800">Maps &amp; Location</p>
                <p className="mt-1">
                  In the final app this will use the{' '}
                  <span className="font-mono text-[10px]">Geolocation API</span> and{' '}
                  <span className="font-mono text-[10px]">Google Maps API</span> to show therapists
                  near you.
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft-card hover:bg-brand-700 md:w-auto"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

