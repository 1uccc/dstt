import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Tổng Quan', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
  ) },
  { to: '/admin/fields', label: 'Quản Lý Sân', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  ) },
  { to: '/admin/bookings', label: 'Đặt Sân', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ) },
  { to: '/admin/users', label: 'Người Dùng', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { to: '/admin/contacts', label: 'Liên Hệ', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  ) },
  { to: '/admin/settings', label: 'Cài Đặt', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const [usersRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        let notifs: any[] = [];
        if (usersRes.ok) {
          const users = await usersRes.json();
          const pendingUsers = users.filter((u: any) => u.status === 'pending');
          pendingUsers.forEach((u: any) => {
            notifs.push({
              id: `u-${u.id || u._id}`,
              title: 'Tài khoản cần duyệt',
              description: `${u.fullName} (${u.role === 'owner' ? 'Chủ sân' : 'Khách hàng'}) đang chờ duyệt.`,
              time: 'Gần đây',
              timestamp: new Date(u.createdAt || Date.now()).getTime(),
              read: false,
            });
          });
        }
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const recentBookings = bookings.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 10);
          recentBookings.forEach((b: any) => {
            if (b.status === 'paid' || b.status === 'confirmed') {
              notifs.push({
                id: `b-${b.id || b._id}`,
                title: 'Đơn đặt sân mới',
                description: `Đơn #SPB-${(b._id || b.id || 'xxxx').slice(-4).toUpperCase()} đã được thanh toán.`,
                time: 'Gần đây',
                timestamp: new Date(b.createdAt || Date.now()).getTime(),
                read: false,
              });
            } else if (b.status === 'cancelled') {
              notifs.push({
                id: `b-${b.id || b._id}`,
                title: 'Đơn đặt sân bị hủy',
                description: `Đơn #SPB-${(b._id || b.id || 'xxxx').slice(-4).toUpperCase()} đã bị hủy.`,
                time: 'Gần đây',
                timestamp: new Date(b.createdAt || Date.now()).getTime(),
                read: false,
              });
            }
          });
        }
        notifs.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(notifs.slice(0, 10));
      } catch (err) {
        console.error('Error fetching admin notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  const isActive = (to: string) => to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);
  const todayDateString = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-white font-bold text-sm uppercase tracking-wide">SportBook</div>
              <div className="text-gray-500 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">AD</div>
            <div>
              <div className="text-white text-xs font-medium">Admin</div>
              <div className="text-gray-500 text-xs">admin@sportbook.com</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="mt-3 w-full text-left text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {NAV_ITEMS.find(n => isActive(n.to))?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-500">{todayDateString}</p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button onClick={() => setNotificationOpen((open) => !open)} className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Thông báo">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">AD</div>
            {notificationOpen && (
              <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Thông báo</p>
                  <button onClick={() => { setNotificationOpen(false); setNotifications([]); }} className="text-xs font-medium text-green-700">Đánh dấu đã đọc</button>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-slate-50">
                        <div className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                          <div><p className="text-sm font-medium text-slate-800">{n.title}</p><p className="mt-0.5 text-xs text-slate-500">{n.description}</p><p className="mt-1 text-xs text-slate-400">{n.time}</p></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-slate-500">Không có thông báo mới.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
