import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';

const CUSTOMER_NOTIF_READ_KEY = 'sportbook-customer-read-notifs';
const CUSTOMER_NOTIF_CLEARED_KEY = 'sportbook-customer-cleared-timestamp';

function getCustomerReadNotifIds(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_NOTIF_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getCustomerClearedTimestamp(): number {
  try {
    const raw = localStorage.getItem(CUSTOMER_NOTIF_CLEARED_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function formatTimeAgo(dateInput?: string | number | Date) {
  if (!dateInput) return 'Gần đây';
  try {
    const past = new Date(dateInput).getTime();
    if (isNaN(past)) return 'Gần đây';
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return new Date(past).toLocaleDateString('vi-VN');
  } catch {
    return 'Gần đây';
  }
}

export function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [session, setSession] = useState<{ role: string; email: string; name: string } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('sportbook-session') ?? 'null');
    } catch {
      return null;
    }
  });

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/search', label: 'Tìm Sân' },
    { to: '/contact', label: 'Liên Hệ' },
  ];

  const isActive = (to: string) => location.pathname === to;
  const initials = session?.name
    ?.split(' ')
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'KH';

  useEffect(() => {
    if (!session) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const bookings = await res.json();
        const readIds = getCustomerReadNotifIds();
        const clearedTimestamp = getCustomerClearedTimestamp();

        let notifs: any[] = [];
        bookings.forEach((b: any) => {
          const timestamp = new Date(b.createdAt || Date.now()).getTime();
          if (timestamp > clearedTimestamp) {
            const id = `b-${b.id || b._id}`;
            const code = b.bookingCode || (b.id ? b.id.slice(-6).toUpperCase() : '');
            let title = 'Cập nhật đơn đặt sân';
            let description = `Đơn đặt sân #${code} tại ${b.fieldName || 'sân'} (${b.date} · ${b.time}).`;

            if (b.status === 'confirmed') {
              title = 'Đơn đặt sân đã được xác nhận';
              description = `Chủ sân đã xác nhận đơn #${code} tại ${b.fieldName}. Vui lòng đến đúng giờ!`;
            } else if (b.status === 'paid') {
              title = 'Thanh toán thành công';
              description = `Đơn #${code} (${(Number(b.amount) || 0).toLocaleString('vi-VN')}đ) tại ${b.fieldName} đã ghi nhận thanh toán.`;
            } else if (b.status === 'cancelled') {
              title = 'Đơn đặt sân đã bị hủy';
              description = `Đơn #${code} tại ${b.fieldName} ngày ${b.date} đã bị hủy.`;
            } else if (b.status === 'completed') {
              title = 'Hoàn tất buổi thi đấu';
              description = `Trận đấu tại ${b.fieldName} đã kết thúc. Hãy để lại đánh giá nhé!`;
            } else if (b.status === 'pending') {
              title = 'Đơn đặt sân đang chờ xác nhận';
              description = `Đơn #${code} tại ${b.fieldName} (${b.date} · ${b.time}) đang chờ chủ sân duyệt.`;
            }

            notifs.push({
              id,
              title,
              description,
              time: formatTimeAgo(b.createdAt),
              timestamp,
              read: readIds.includes(id),
              link: session.role === 'customer' ? '/bookings' : '/owner/bookings'
            });
          }
        });

        notifs.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(notifs.slice(0, 15));
      } catch (err) {
        console.error('Error fetching customer notifications:', err);
      }
    };

    fetchNotifications();
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    const currentIds = notifications.map(n => n.id);
    try {
      const existing = getCustomerReadNotifIds();
      const updated = Array.from(new Set([...existing, ...currentIds]));
      localStorage.setItem(CUSTOMER_NOTIF_READ_KEY, JSON.stringify(updated));
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    try {
      localStorage.setItem(CUSTOMER_NOTIF_CLEARED_KEY, String(Date.now()));
    } catch {}
    setNotifications([]);
  };

  const handleNotificationClick = (n: any) => {
    try {
      const existing = getCustomerReadNotifIds();
      if (!existing.includes(n.id)) {
        localStorage.setItem(CUSTOMER_NOTIF_READ_KEY, JSON.stringify([...existing, n.id]));
      }
    } catch {}
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    setNotificationOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error', error);
    }
    localStorage.removeItem('sportbook-session');
    localStorage.removeItem('token');
    localStorage.removeItem('sportbook-pending-checkout');
    sessionStorage.removeItem('sportbook-pending-checkout');
    setSession(null);
    setProfileOpen(false);
    setNotificationOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-xl font-800 text-gray-900 tracking-wide uppercase">
                SportBook
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.to)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Authentication */}
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen((open) => !open);
                        setProfileOpen(false);
                      }}
                      aria-label="Thông báo"
                      className={`relative p-2 rounded-xl border transition-colors ${
                        notificationOpen
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-white"></span>
                        </span>
                      )}
                    </button>

                    {notificationOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                        <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-900/15">
                          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/70">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900">Thông báo</p>
                              {unreadCount > 0 ? (
                                <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-bold">
                                  {unreadCount} mới
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-400 font-medium">Đã đọc hết</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {unreadCount > 0 && (
                                <button
                                  onClick={handleMarkAllAsRead}
                                  className="text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
                                >
                                  Đánh dấu đã đọc
                                </button>
                              )}
                              {notifications.length > 0 && (
                                <button
                                  onClick={handleClearAll}
                                  className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                                  title="Xóa tất cả thông báo"
                                >
                                  Xóa hết
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() => handleNotificationClick(n)}
                                  className={`px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                                    n.read ? 'opacity-70 bg-white' : 'bg-green-50/25'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span
                                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                        n.read ? 'bg-gray-300' : 'bg-green-500 ring-2 ring-green-100'
                                      }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <p
                                          className={`text-sm leading-tight ${
                                            n.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'
                                          }`}
                                        >
                                          {n.title}
                                        </p>
                                        {!n.read && (
                                          <span className="shrink-0 text-[10px] font-bold text-green-700 bg-green-100/70 px-1.5 py-0.2 rounded-full">
                                            Mới
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-1 text-xs text-gray-600 leading-normal">{n.description}</p>
                                      <p className="mt-1 text-[11px] text-gray-400">{n.time}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span>Bạn chưa có thông báo nào.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Profile Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen((open) => !open);
                        setNotificationOpen(false);
                      }}
                      aria-expanded={profileOpen}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 pr-2.5 transition hover:border-green-300 hover:bg-green-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-xs font-bold text-white">{initials}</span>
                      <span className="hidden max-w-32 truncate text-left sm:block">
                        <span className="block truncate text-xs font-semibold text-gray-800">{session.name}</span>
                        <span className="block text-[10px] text-gray-400">{session.role === 'customer' ? 'Khách hàng' : session.role === 'owner' ? 'Chủ sân' : 'Quản trị viên'}</span>
                      </span>
                      <svg className={`h-4 w-4 text-gray-400 transition ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-900/10">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-900">{session.name}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{session.email}</p>
                      </div>
                      {session.role === 'owner' && (
                        <button onClick={() => { setProfileOpen(false); navigate('/owner'); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Đến cổng Chủ sân
                        </button>
                      )}
                      {session.role === 'admin' && (
                        <button onClick={() => { setProfileOpen(false); navigate('/admin'); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Đến trang Quản trị
                        </button>
                      )}
                      <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Thông tin tài khoản
                      </button>
                      {session.role === 'customer' && (
                        <button onClick={() => { setProfileOpen(false); navigate('/bookings'); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Lịch sử đặt sân
                        </button>
                      )}
                      {session.role === 'owner' && (
                        <button onClick={() => { setProfileOpen(false); navigate('/owner/bookings'); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Lịch đặt sân của khách
                        </button>
                      )}
                      <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4m4-3 3-3-3-3m3 3H9" /></svg>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
                <>
                  <button onClick={() => navigate('/auth')} className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors whitespace-nowrap">
                    Đăng nhập
                  </button>
                  <button onClick={() => navigate('/auth?mode=register')} className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap">
                    Đăng ký
                  </button>
                </>
              )}
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-gray-100">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-green-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-white font-bold text-lg uppercase tracking-wide">SportBook</span>
              </div>
              <p className="text-sm leading-relaxed">Nền tảng đặt sân thể thao trực tuyến hàng đầu Việt Nam.</p>
            </div>
            {[
              { title: 'Dịch vụ', links: ['Sân bóng đá', 'Sân tennis', 'Sân cầu lông', 'Sân bóng rổ'] },
              { title: 'Hỗ trợ', links: ['Câu hỏi thường gặp', 'Chính sách hoàn tiền', 'Điều khoản dịch vụ', 'Bảo mật'] },
              { title: 'Liên hệ', links: ['bachtuocndl@gmail.com', '082348003(Miễn phí)', 'Việt Nam'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l} className="text-sm hover:text-green-400 cursor-pointer transition-colors">{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2026 SportBook.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
