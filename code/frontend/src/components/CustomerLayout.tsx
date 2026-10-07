import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';

export function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  const logout = () => {
    localStorage.removeItem('sportbook-session');
    sessionStorage.removeItem('sportbook-pending-checkout');
    setSession(null);
    setProfileOpen(false);
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
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
                      <button onClick={() => { setProfileOpen(false); navigate('/bookings'); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Lịch sử đặt sân
                      </button>
                      <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4m4-3 3-3-3-3m3 3H9" /></svg>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => navigate('/auth')} className="hidden sm:block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors">
                    Đăng nhập
                  </button>
                  <button onClick={() => navigate('/auth?mode=register')} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm">
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
            <div className="flex items-center gap-3">
              {['Facebook', 'Instagram', 'YouTube', 'TikTok'].map(s => (
                <button key={s} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">{s[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
