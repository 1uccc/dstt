import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

type AuthMode = 'login' | 'register';
type Role = 'admin' | 'owner' | 'customer';

const DEMO_ACCOUNTS: Array<{
  role: Role;
  label: string;
  description: string;
  email: string;
  password: string;
  destination: string;
}> = [
  {
    role: 'admin',
    label: 'Quản trị viên',
    description: 'Quản lý hệ thống',
    email: 'admin@sportbook.vn',
    password: 'Admin@123',
    destination: '/admin',
  },
  {
    role: 'owner',
    label: 'Chủ sân',
    description: 'Vận hành sân & lịch đặt',
    email: 'owner@sportbook.vn',
    password: 'Owner@123',
    destination: '/owner',
  },
  {
    role: 'customer',
    label: 'Khách hàng',
    description: 'Tìm và đặt sân nhanh',
    email: 'customer@sportbook.vn',
    password: 'Customer@123',
    destination: '/',
  },
];

function BrandMark() {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-950/20">
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
        <path d="M3.5 12h17M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" strokeWidth="1.7" />
      </svg>
    </span>
  );
}

export function Auth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode: AuthMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectTo = searchParams.get('redirect');
  const checkoutRequired = searchParams.get('reason') === 'checkout';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    const nextParams: Record<string, string> = {};
    if (nextMode === 'register') nextParams.mode = 'register';
    if (redirectTo?.startsWith('/')) nextParams.redirect = redirectTo;
    if (checkoutRequired) nextParams.reason = 'checkout';
    setSearchParams(nextParams);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!fullName || !phone || !email || password.length < 8) {
        setError('Vui lòng nhập đủ thông tin và dùng mật khẩu từ 8 ký tự.');
        return;
      }
      localStorage.setItem('sportbook-session', JSON.stringify({ role: 'customer', email, name: fullName }));
      navigate(redirectTo?.startsWith('/') ? redirectTo : '/');
      return;
    }

    const account = DEMO_ACCOUNTS.find(
      (item) => item.email === email.trim().toLowerCase() && item.password === password,
    );
    if (!account) {
      setError('Email hoặc mật khẩu chưa đúng. Bạn có thể chọn tài khoản mẫu bên phải.');
      return;
    }
    localStorage.setItem('sportbook-session', JSON.stringify({ role: account.role, email: account.email, name: account.label }));
    navigate(account.role === 'customer' && redirectTo?.startsWith('/') ? redirectTo : account.destination);
  };

  const handleGoogleAuth = () => {
    setError('');
    localStorage.setItem('sportbook-session', JSON.stringify({ role: 'customer', email: 'google.customer@example.com', name: 'Khách hàng Google' }));
    navigate(redirectTo?.startsWith('/') ? redirectTo : '/');
  };

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-green-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full border border-green-500/20" />
        <div className="absolute -left-10 top-36 h-80 w-80 rounded-full border border-green-500/10" />
        <div className="absolute -bottom-40 -right-40 h-3/4 w-3/4 rounded-full bg-green-500/20 blur-3xl" />

        <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
          <BrandMark />
          <span className="font-display text-2xl font-bold uppercase tracking-wide">
            SportBook<span className="text-green-400">VN</span>
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-xl py-12">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-medium text-green-200">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Một tài khoản, trọn trải nghiệm thể thao
          </span>
          <h1 className="font-display text-6xl font-extrabold uppercase leading-none tracking-tight xl:text-7xl">
            Sân gần bạn.
            <br />
            <span className="text-green-400">Trận đấu của bạn.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-green-100/70">
            Kết nối người chơi, chủ sân và đội ngũ vận hành trên cùng một nền tảng đặt sân hiện đại.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ['500+', 'Sân thể thao'],
              ['50K+', 'Lượt đặt sân'],
              ['4.8/5', 'Điểm đánh giá'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="mt-1 text-xs text-green-100/60">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-green-100/40">© 2026 SportBookVN. Đặt sân dễ dàng, chơi hết mình.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <BrandMark />
              <span className="font-display text-xl font-bold uppercase tracking-wide text-slate-900">
                SportBook<span className="text-green-600">VN</span>
              </span>
            </Link>
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-green-700">Về trang chủ</Link>
          </div>

          <div className="mb-7">
            {checkoutRequired && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z" /></svg>
                <div><strong>Vui lòng đăng nhập hoặc đăng ký.</strong> Lựa chọn sân của bạn đã được lưu và sẽ tiếp tục sau khi xác thực.</div>
              </div>
            )}
            <p className="mb-2 text-sm font-semibold text-green-600">
              {mode === 'login' ? 'Chào mừng bạn trở lại' : 'Bắt đầu cùng SportBookVN'}
            </p>
            <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-slate-900">
              {mode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {mode === 'login'
                ? 'Hệ thống tự nhận diện tài khoản và đưa bạn đến đúng không gian làm việc.'
                : 'Đăng ký nhanh để tìm sân và bắt đầu hành trình thể thao của bạn.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => changeMode('login')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => changeMode('register')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">Họ và tên</label>
                  <input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nguyễn Minh Anh" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
                  <input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0901 234 567" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16v12H4V6Zm0 1 8 6 8-6" />
                </svg>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</label>
                {mode === 'login' && <button type="button" className="text-xs font-medium text-green-700 hover:text-green-800">Quên mật khẩu?</button>}
              </div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Z" />
                </svg>
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'register' ? 'Tối thiểu 8 ký tự' : 'Nhập mật khẩu'} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-20 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-green-700">
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20">
              {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">hoặc tiếp tục với</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
                <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z" />
                <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z" />
              </svg>
              {mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google'}
            </button>

            {mode === 'login' && (
              <details className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <summary className="cursor-pointer text-xs font-semibold text-slate-600">Xem tài khoản dùng thử</summary>
                <div className="mt-3 space-y-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <div key={account.role} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-slate-500">{account.label}</span>
                      <code className="text-right font-mono text-slate-700">{account.email} / {account.password}</code>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
            Bằng việc tiếp tục, bạn đồng ý với <button className="font-medium text-slate-600 hover:text-green-700">Điều khoản dịch vụ</button> và <button className="font-medium text-slate-600 hover:text-green-700">Chính sách bảo mật</button>.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900">
            <span>Bạn đang vận hành sân thể thao?</span>
            <Link to="/owner/register" className="font-semibold text-green-700 hover:text-green-800">
              Đăng ký chủ sân
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
