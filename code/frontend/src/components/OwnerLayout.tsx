import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';

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
  { to: '/owner/profile', label: 'Hồ sơ', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export function OwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [ownerName, setOwnerName] = useState('Chủ sân');
  const [businessName, setBusinessName] = useState('Đơn vị đối tác');
  const [fieldCount, setFieldCount] = useState(0);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('sportbook-session');
      navigate('/auth');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  useEffect(() => {
    // Lấy thông tin session
    const sessionStr = localStorage.getItem('sportbook-session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setOwnerName(session.name || 'Chủ sân');
      } catch (e) {}
    }

    const fetchFieldsAndProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch profile
        const profileRes = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.businessInfo?.businessName) {
            setBusinessName(profile.businessInfo.businessName);
          }
        }

        // Fetch fields & bookings for notifications
        const [fieldsRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:5000/api/fields'),
          fetch('http://localhost:5000/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (fieldsRes.ok) {
          const fields = await fieldsRes.json();
          const uid = auth.currentUser?.uid;
          if (uid) {
            setFieldCount(fields.filter((f: any) => f.owner === uid).length);
          }
        }

        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const pendingBookings = bookings.filter((b: any) => b.status === 'pending');
          setNotifications(pendingBookings);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchFieldsAndProfile();
      }
    });

    return () => unsubscribe();
  }, []);

  const isActive = (to: string) =>
    to === '/owner' ? location.pathname === '/owner' : location.pathname.startsWith(to);
  const activeLabel = NAV_ITEMS.find((item) => isActive(item.to))?.label ?? 'Cổng chủ sân';
  
  const todayDateString = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-green-950 text-white transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-white/10 px-5 py-5">
          <Link to="/owner" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-green-950/30" />
            <span>
              <span className="block font-display text-xl font-bold uppercase tracking-wide">SportBook</span>
              <span className="block text-xs text-green-300">Cổng dành cho chủ sân</span>
            </span>
          </Link>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white">
                {businessName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{businessName}</p>
                <p className="text-xs text-green-300">{fieldCount} sân đang hoạt động</p>
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-950">
              {ownerName.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{ownerName}</p>
              <p className="truncate text-xs text-green-300">Chủ sân</p>
            </div>
          </div>
          <div className="space-y-1">
            <button onClick={() => navigate('/')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-green-200 transition-colors hover:bg-white/10 hover:text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-2-10h6m0 0v6m0-6L10 14" /></svg>
              Xem trang khách hàng
            </button>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-950/50 hover:text-red-200">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Đăng xuất
            </button>
          </div>
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
              <p className="text-xs text-slate-500">{todayDateString}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative rounded-xl border p-2.5 transition-colors ${showNotifications ? 'bg-slate-100 border-slate-300' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`} 
                aria-label="Thông báo"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h11zm0 0v1a3 3 0 11-6 0v-1h6z" /></svg>
                {notifications.length > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="mb-2 flex items-center justify-between px-3 pt-2">
                    <p className="font-display font-bold uppercase text-slate-900">Thông báo</p>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">{notifications.length} mới</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(noti => (
                        <Link 
                          key={noti.id} 
                          to="/owner/bookings" 
                          onClick={() => setShowNotifications(false)}
                          className="block rounded-xl p-3 hover:bg-slate-50"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            Đơn đặt sân mới từ <span className="text-green-700">{noti.customerName}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {noti.fieldName} · {noti.time} ngày {noti.date}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        Bạn không có thông báo mới.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden text-right sm:block ml-2">
              <p className="text-sm font-semibold text-slate-800">{ownerName}</p>
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
