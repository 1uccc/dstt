import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';

function GridIcon() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" /></svg>;
}

function CalendarIcon() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3m8-3v3M4 10h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>;
}

function FieldIcon() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4v10l-9 4-9-4V7zm0 0l9 4m9-4l-9 4m0 10V11" /></svg>;
}

function PaymentIcon() {
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18v12H3V7Zm0 4h18M16 15h2" /></svg>;
}

const NAV_ITEMS = [
  { to: '/owner', label: 'Tổng quan', icon: <GridIcon /> },
  { to: '/owner/bookings', label: 'Lịch đặt sân', icon: <CalendarIcon /> },
  { to: '/owner/fields', label: 'Sân của tôi', icon: <FieldIcon /> },
  { to: '/owner/payment', label: 'Thanh toán', icon: <PaymentIcon /> },
];

export function OwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/owner' ? location.pathname === '/owner' : location.pathname.startsWith(to);
  const activeLabel = NAV_ITEMS.find((item) => isActive(item.to))?.label ?? 'Cổng chủ sân';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-green-950 text-white transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-white/10 px-5 py-5">
          <Link to="/owner" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white shadow-lg shadow-green-950/30">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18V6l8-3 8 3v12l-8 3-8-3zm0-12l8 3 8-3M12 9v12" /></svg>
            </span>
            <span>
              <span className="block font-display text-xl font-bold uppercase tracking-wide">SportBookVN</span>
              <span className="block text-xs text-green-300">Cổng dành cho chủ sân</span>
            </span>
          </Link>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <img className="h-10 w-10 rounded-xl object-cover" src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=96&h=96&fit=crop&auto=format" alt="Sân thể thao Phú Thọ" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Phú Thọ Sports</p>
                <p className="text-xs text-green-300">3 sân đang hoạt động</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-green-500">Vận hành</p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive(item.to) ? 'bg-green-500 text-white shadow-lg shadow-green-950/20' : 'text-green-100/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-950">MH</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Minh Hoàng</p>
              <p className="truncate text-xs text-green-300">Chủ sân</p>
            </div>
          </div>
          <button onClick={() => navigate('/auth')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-green-200 transition-colors hover:bg-white/10 hover:text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-2-10h6m0 0v6m0-6L10 14" /></svg>
            Xem trang khách hàng
          </button>
        </div>
      </aside>

      {sidebarOpen && <button aria-label="Đóng menu" className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button aria-label="Mở menu" onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <p className="font-display text-xl font-bold uppercase tracking-wide text-slate-900">{activeLabel}</p>
              <p className="text-xs text-slate-500">Thứ Sáu, 25 tháng 9 năm 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Thông báo">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h11zm0 0v1a3 3 0 11-6 0v-1h6z" /></svg>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">Minh Hoàng</p>
              <p className="text-xs text-slate-500">Tài khoản chủ sân</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
