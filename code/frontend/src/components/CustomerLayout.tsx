import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';

export function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/search', label: 'Tìm Sân' },
    { to: '/contact', label: 'Liên Hệ' },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-xl font-800 text-gray-900 tracking-wide uppercase">
                SportBook<span className="text-green-600">VN</span>
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
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
              <button onClick={() => navigate('/auth')} className="hidden sm:block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors">
                Đăng nhập
              </button>
              <button onClick={() => navigate('/auth?mode=register')} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm">
                Đăng ký
              </button>
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
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                </div>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-white font-bold text-lg uppercase tracking-wide">SportBookVN</span>
              </div>
              <p className="text-sm leading-relaxed">Nền tảng đặt sân thể thao trực tuyến hàng đầu Việt Nam.</p>
            </div>
            {[
              { title: 'Dịch vụ', links: ['Sân bóng đá', 'Sân tennis', 'Sân cầu lông', 'Sân bóng rổ'] },
              { title: 'Hỗ trợ', links: ['Câu hỏi thường gặp', 'Chính sách hoàn tiền', 'Điều khoản dịch vụ', 'Bảo mật'] },
              { title: 'Liên hệ', links: ['support@sportbookvn.com', '1800 1234 (Miễn phí)', 'TP. Hồ Chí Minh, VN'] },
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
            <p className="text-xs">© 2026 SportBookVN. Bảo lưu mọi quyền.</p>
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
