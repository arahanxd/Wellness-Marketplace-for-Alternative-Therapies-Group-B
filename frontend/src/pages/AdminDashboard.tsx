import { DashboardLayout } from '../components/DashboardLayout'

export function AdminDashboard() {
  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Overview', active: true },
        { label: 'Users & Roles', to: '#' },
        { label: 'Therapy Catalog', to: '#' },
        { label: 'Orders & Payments', to: '#' },
        { label: 'Reports', to: '#' },
        { label: 'System Settings', to: '#' },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Total Users
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">2,431</p>
              <p className="mt-1 text-[11px] text-emerald-600">+8% this month</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Active Practitioners
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">184</p>
              <p className="mt-1 text-[11px] text-emerald-600">12 pending verification</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Monthly Revenue
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">$18,420</p>
              <p className="mt-1 text-[11px] text-emerald-600">+12% vs last month</p>
            </div>
          </div>

          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">Recent Registrations</h2>
            <div className="mt-3 divide-y divide-slate-100 text-xs text-slate-700">
              {['Patient', 'Practitioner', 'Admin'].map((role, idx) => (
                <div key={role} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                      U{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">New {role}</p>
                      <p className="text-[11px] text-slate-500">Joined 5 min ago</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">Live System Status</h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-700">
              <li className="flex items-center justify-between">
                <span>API</span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                  Healthy
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>WebSocket Gateway</span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                  Connected
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Database</span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                  Online
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">Real-time Chat Monitor</h2>
            <p className="mt-2 text-[11px] text-slate-600">
              In the final app this panel will be powered by a WebSocket (Spring WebSocket + STOMP)
              channel to monitor live support conversations.
            </p>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}

