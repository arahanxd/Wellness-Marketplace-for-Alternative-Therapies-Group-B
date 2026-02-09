import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <TopNav />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-semibold leading-snug text-slate-900 sm:text-4xl">
              Find the Right Therapy
              <span className="block text-brand-700">for Your Wellness</span>
            </h1>
            <p className="mt-4 text-sm text-slate-600">
              Connecting you with trusted holistic health practitioners, wellness products, and
              community support in one serene experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register?role=PATIENT"
                className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-soft-card hover:bg-brand-700"
              >
                Book a Session
              </Link>
              <Link
                to="/register?role=PRACTITIONER"
                className="rounded-full border border-brand-600/40 bg-white px-6 py-2 text-sm font-semibold text-brand-700 shadow-sm hover:border-brand-700/60"
              >
                Join as Practitioner
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-soft-card">
                <p className="font-semibold text-slate-800">Verified Practitioners</p>
                <p className="mt-1 text-slate-500">Trusted experts in holistic care.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-soft-card">
                <p className="font-semibold text-slate-800">Easy Online Booking</p>
                <p className="mt-1 text-slate-500">Schedule your sessions in minutes.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-soft-card">
                <p className="font-semibold text-slate-800">Wellness Products</p>
                <p className="mt-1 text-slate-500">Shop natural remedies &amp; tools.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[url('https://images.pexels.com/photos/3738341/pexels-photo-3738341.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center shadow-soft-card">
            <div className="flex min-h-[320px] items-end justify-between rounded-3xl bg-gradient-to-t from-black/60 to-black/5 p-6 text-xs text-white sm:min-h-[380px]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                  Popular Therapy
                </p>
                <p className="mt-1 text-lg font-semibold">Acupuncture for Stress</p>
                <p className="mt-2 max-w-xs text-[11px] text-emerald-100">
                  Restore your body&apos;s natural balance with our trusted practitioners.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 text-[11px] text-slate-800 shadow-soft-card">
                <p className="font-semibold text-slate-900">Community Q&amp;A</p>
                <p className="mt-1 text-slate-600">
                  &quot;How effective is acupuncture for back pain?&quot;
                </p>
                <button className="mt-3 w-full rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                  Read Answers
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="therapies" className="mt-14">
          <h2 className="text-lg font-semibold text-slate-900">Popular Therapies</h2>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            {['Acupuncture', 'Ayurveda', 'Chiropractic'].map((therapy) => (
              <div
                key={therapy}
                className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-soft-card"
              >
                <div>
                  <p className="font-semibold text-slate-800">{therapy}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Learn how {therapy.toLowerCase()} can support your wellness goals.
                  </p>
                </div>
                <button className="mt-4 w-full rounded-full border border-brand-600/40 px-3 py-1 text-xs font-semibold text-brand-700 hover:border-brand-700/70">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

