import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <TopNav />
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center">
        <section className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage your wellness sessions, track orders, and connect with practitioners.
          </p>
        </section>
        <section className="flex-1">
          <div className="rounded-2xl bg-white p-6 shadow-soft-card">
            <form className="space-y-4">
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
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Role</label>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                  <option value="PATIENT">Patient</option>
                  <option value="PRACTITIONER">Practitioner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft-card hover:bg-brand-700"
              >
                Sign in
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-600">
              New to Wellness Hub?{' '}
              <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-900">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

