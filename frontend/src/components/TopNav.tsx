import { Link } from 'react-router-dom'

export function TopNav() {
  return (
    <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft-card">
            <span className="text-lg font-semibold">W</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-brand-800">Wellness Hub</div>
            <div className="text-xs text-slate-500">Holistic Therapy Marketplace</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link to="/" className="hover:text-brand-600">
            Home
          </Link>
          <a href="#therapies" className="hover:text-brand-600">
            Therapies
          </a>
          <a href="#products" className="hover:text-brand-600">
            Products
          </a>
          <a href="#reviews" className="hover:text-brand-600">
            Reviews
          </a>
          <Link to="/login" className="text-brand-700 hover:text-brand-900">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-600 px-4 py-2 text-white shadow-soft-card hover:bg-brand-700"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  )
}

