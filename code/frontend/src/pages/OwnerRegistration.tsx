import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const STEPS = [
  { number: 1, title: 'Tài khoản', detail: 'Thông tin người đại diện' },
  { number: 2, title: 'Đơn vị kinh doanh', detail: 'Thông tin pháp lý cơ bản' },
  { number: 3, title: 'Cơ sở thể thao', detail: 'Thiết lập sân đầu tiên' },
];

const AMENITIES = ['Bãi đỗ xe', 'Phòng thay đồ & tắm', 'Đèn chiếu sáng', 'Wi-Fi', 'Cho thuê dụng cụ', 'Căn tin', 'Camera an ninh', 'Trọng tài'];

type FormData = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  businessName: string;
  taxCode: string;
  city: string;
  district: string;
  address: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  sport: string;
  fieldCount: string;
  openTime: string;
  closeTime: string;
  slotMinutes: string;
  regularPrice: string;
  peakPrice: string;
  peakStart: string;
  operatingDays: string[];
  amenities: string[];
  agreed: boolean;
};

const INITIAL_FORM: FormData = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  businessName: '',
  taxCode: '',
  city: 'TP. Hồ Chí Minh',
  district: '',
  address: '',
  venueName: '',
  venueAddress: '',
  mapUrl: '',
  sport: 'Bóng đá',
  fieldCount: '1',
  openTime: '06:00',
  closeTime: '22:00',
  slotMinutes: '90',
  regularPrice: '',
  peakPrice: '',
  peakStart: '17:00',
  operatingDays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  amenities: [],
  agreed: false,
};

function Brand() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-green-950/20" />
      <span>
        <span className="block font-display text-xl font-bold uppercase tracking-wide text-white">SportBook</span>
        <span className="block text-xs text-green-300">Cổng đối tác sân</span>
      </span>
    </Link>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
      />
    </div>
  );
}

export function OwnerRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName || !form.phone || !form.email || form.password.length < 8) {
        setError('Vui lòng nhập đầy đủ thông tin và dùng mật khẩu từ 8 ký tự.');
        return false;
      }
    }
    if (step === 1 && (!form.businessName || !form.city || !form.district || !form.address)) {
      setError('Vui lòng hoàn tất thông tin đơn vị kinh doanh.');
      return false;
    }
    if (step === 2 && (!form.venueName || !form.venueAddress || !form.fieldCount || !form.regularPrice || !(form.operatingDays ?? []).length || !form.agreed)) {
      setError('Vui lòng nhập đầy đủ thông tin sân, lịch hoạt động và đồng ý điều khoản hợp tác.');
      return false;
    }
    return true;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep()) return;
    
    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      const res = await fetch('http://localhost:5000/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          role: 'owner',
          phone: form.phone,
          businessInfo: {
            businessName: form.businessName,
            taxCode: form.taxCode,
            city: form.city,
            district: form.district,
            address: form.address,
          },
          fieldInfo: {
            venueName: form.venueName,
            venueAddress: form.venueAddress,
            mapUrl: form.mapUrl,
            sport: form.sport,
            fieldCount: form.fieldCount,
            openTime: form.openTime,
            closeTime: form.closeTime,
            slotMinutes: form.slotMinutes,
            regularPrice: form.regularPrice,
            peakPrice: form.peakPrice,
            peakStart: form.peakStart,
            operatingDays: form.operatingDays,
            amenities: form.amenities,
          }
        })
      });

      if (!res.ok) {
        throw new Error('Lỗi đồng bộ dữ liệu với server');
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được đăng ký. Vui lòng đăng nhập.');
      } else {
        setError(err.message || 'Đã xảy ra lỗi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = form.amenities ?? [];
    update(
      'amenities',
      currentAmenities.includes(amenity)
        ? currentAmenities.filter((item) => item !== amenity)
        : [...currentAmenities, amenity],
    );
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="bg-green-950 px-6 py-5 sm:px-8">
            <Brand />
          </div>
          <div className="px-6 py-10 text-center sm:px-12 sm:py-14">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" />
              </svg>
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-green-600">Đăng ký thành công</p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-slate-900 sm:text-5xl">
              Hồ sơ đang được xét duyệt
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
              Cảm ơn {form.fullName}. Hồ sơ của <strong className="font-semibold text-slate-700">{form.venueName}</strong> đã được ghi nhận.
              Chuyên viên đối tác sẽ liên hệ qua {form.phone} trong vòng 1–2 ngày làm việc.
            </p>
            <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-3">
              {['Tiếp nhận hồ sơ', 'Xác minh thông tin', 'Kích hoạt gian hàng'].map((item, index) => (
                <div key={item} className={`rounded-xl border p-3 ${index === 0 ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                  <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {index + 1}
                  </span>
                  <p className="text-xs font-semibold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={() => navigate('/')} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Về trang chủ
              </button>
              <button onClick={() => navigate('/auth')} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700">
                Đến trang đăng nhập
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[22rem_1fr]">
      <aside className="relative overflow-hidden bg-green-950 px-6 py-6 text-white lg:flex lg:min-h-screen lg:flex-col lg:px-8 lg:py-8">
        <div className="absolute -left-28 top-1/3 h-72 w-72 rounded-full border border-green-400/15" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-green-500/10 blur-3xl" />
        <div className="relative z-10">
          <Brand />
          <div className="mt-8 hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-400">Trở thành đối tác</p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-none">
              Đưa sân của bạn đến gần người chơi hơn
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-green-100/60">
              Quản lý lịch đặt, doanh thu và khách hàng trên một nền tảng duy nhất.
            </p>
          </div>
        </div>

        <ol className="relative z-10 mt-6 flex gap-2 lg:my-auto lg:block lg:space-y-2">
          {STEPS.map((item, index) => (
            <li key={item.title} className={`flex flex-1 items-center gap-3 rounded-xl p-2.5 transition lg:p-3 ${step === index ? 'bg-white/10' : ''}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step > index ? 'bg-green-500 text-white' : step === index ? 'bg-white text-green-800' : 'border border-white/20 text-green-100/50'
              }`}>
                {step > index ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" /></svg>
                ) : item.number}
              </span>
              <span className="hidden lg:block">
                <span className={`block text-sm font-semibold ${step < index ? 'text-green-100/50' : 'text-white'}`}>{item.title}</span>
                <span className="block text-xs text-green-100/40">{item.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="relative z-10 hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4m0 4h.01M4.9 19h14.2a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0L3.2 16a2 2 0 0 0 1.7 3Z" /></svg>
            <div>
              <p className="text-sm font-semibold">Cần hỗ trợ?</p>
              <p className="mt-1 text-xs leading-relaxed text-green-100/50">Gọi 1800 1234 để được hướng dẫn đăng ký đối tác.</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-8 sm:px-8 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-green-600">Bước {step + 1} / {STEPS.length}</p>
              <h2 className="mt-1 font-display text-4xl font-bold uppercase tracking-tight text-slate-900">
                {step === 0 ? 'Tạo tài khoản chủ sân' : step === 1 ? 'Thông tin kinh doanh' : 'Thiết lập cơ sở đầu tiên'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {step === 0
                  ? 'Thông tin này được dùng để liên hệ và quản trị tài khoản.'
                  : step === 1
                    ? 'Cung cấp thông tin chính xác để quá trình xác minh nhanh hơn.'
                    : 'Thiết lập thông tin, vị trí, lịch và tiện ích cho sân đầu tiên của bạn.'}
              </p>
            </div>
            <Link to="/auth" className="hidden shrink-0 text-sm font-semibold text-slate-500 transition hover:text-green-700 sm:block">
              Đã có tài khoản?
            </Link>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="owner-name" label="Họ và tên" value={form.fullName} onChange={(value) => update('fullName', value)} placeholder="Nguyễn Minh Hoàng" />
                <Field id="owner-phone" label="Số điện thoại" type="tel" value={form.phone} onChange={(value) => update('phone', value)} placeholder="0901 234 567" />
                <div className="sm:col-span-2">
                  <Field id="owner-email" label="Email công việc" type="email" value={form.email} onChange={(value) => update('email', value)} placeholder="owner@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <Field id="owner-password" label="Mật khẩu" type="password" value={form.password} onChange={(value) => update('password', value)} placeholder="Tối thiểu 8 ký tự" />
                  <p className="mt-1.5 text-xs text-slate-400">Sử dụng ít nhất 8 ký tự, gồm chữ và số.</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field id="business-name" label="Tên đơn vị / hộ kinh doanh" value={form.businessName} onChange={(value) => update('businessName', value)} placeholder="Công ty TNHH Thể thao Phú Thọ" />
                </div>
                <Field id="tax-code" label="Mã số thuế" value={form.taxCode} onChange={(value) => update('taxCode', value)} placeholder="0312345678" required={false} />
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-slate-700">Tỉnh / thành phố <span className="text-red-500">*</span></label>
                  <select id="city" value={form.city} onChange={(event) => update('city', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10">
                    <option>TP. Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                    <option>Cần Thơ</option>
                    <option>Bình Dương</option>
                  </select>
                </div>
                <Field id="district" label="Quận / huyện" value={form.district} onChange={(value) => update('district', value)} placeholder="Quận 11" />
                <Field id="business-address" label="Địa chỉ đăng ký" value={form.address} onChange={(value) => update('address', value)} placeholder="219 Lý Thường Kiệt" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field id="venue-name" label="Tên cơ sở thể thao" value={form.venueName} onChange={(value) => update('venueName', value)} placeholder="Sân thể thao Phú Thọ" />
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="venue-address" label="Địa chỉ sân" value={form.venueAddress} onChange={(value) => update('venueAddress', value)} placeholder="123 Tô Hiến Thành, Quận 11, TP.HCM" />
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="venue-map" label="Link Google Maps" type="url" value={form.mapUrl} onChange={(value) => update('mapUrl', value)} placeholder="https://maps.app.goo.gl/..." required={false} />
                    <p className="mt-1.5 text-xs text-slate-400">Mở vị trí trên Google Maps, chọn “Chia sẻ” rồi dán liên kết vào đây.</p>
                  </div>
                  <div>
                    <label htmlFor="sport" className="mb-1.5 block text-sm font-medium text-slate-700">Môn thể thao chính</label>
                    <select id="sport" value={form.sport} onChange={(event) => update('sport', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10">
                      <option>Bóng đá</option>
                      <option>Cầu lông</option>
                      <option>Tennis</option>
                      <option>Pickleball</option>
                      <option>Bóng rổ</option>
                    </select>
                  </div>
                  <Field id="field-count" label="Số sân đang vận hành" type="number" value={form.fieldCount} onChange={(value) => update('fieldCount', value)} />
                  <div>
                    <label htmlFor="slot-minutes" className="mb-1.5 block text-sm font-medium text-slate-700">Độ dài khung giờ</label>
                    <select id="slot-minutes" value={form.slotMinutes} onChange={(event) => update('slotMinutes', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10">
                      <option value="30">30 phút</option>
                      <option value="60">60 phút</option>
                      <option value="90">90 phút</option>
                      <option value="120">120 phút</option>
                    </select>
                  </div>
                  <Field id="regular-price" label="Giá giờ thường (VNĐ)" type="number" value={form.regularPrice} onChange={(value) => update('regularPrice', value)} placeholder="350000" />
                  <Field id="open-time" label="Giờ mở cửa" type="time" value={form.openTime} onChange={(value) => update('openTime', value)} />
                  <Field id="close-time" label="Giờ đóng cửa" type="time" value={form.closeTime} onChange={(value) => update('closeTime', value)} />
                  <Field id="peak-start" label="Bắt đầu giờ cao điểm" type="time" value={form.peakStart} onChange={(value) => update('peakStart', value)} />
                  <Field id="peak-price" label="Giá giờ cao điểm (VNĐ)" type="number" value={form.peakPrice} onChange={(value) => update('peakPrice', value)} placeholder="450000" required={false} />
                </div>

                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-slate-700">Ngày hoạt động <span className="text-red-500">*</span></legend>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                      const operatingDays = form.operatingDays ?? [];
                      const selected = operatingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => update('operatingDays', selected ? operatingDays.filter((item) => item !== day) : [...operatingDays, day])}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${selected ? 'border-green-500 bg-green-50 text-green-800' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-slate-700">Tiện ích hiện có</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {AMENITIES.map((amenity) => (
                      <label key={amenity} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                        (form.amenities ?? []).includes(amenity) ? 'border-green-300 bg-green-50 text-green-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                        <input type="checkbox" checked={(form.amenities ?? []).includes(amenity)} onChange={() => toggleAmenity(amenity)} className="accent-green-600" />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <input type="checkbox" checked={form.agreed} onChange={(event) => update('agreed', event.target.checked)} className="mt-0.5 accent-green-600" />
                  <span className="text-xs leading-relaxed text-slate-600">
                    Tôi xác nhận thông tin cung cấp là chính xác và đồng ý với <span className="font-semibold text-green-700">Điều khoản hợp tác dành cho chủ sân</span>.
                  </span>
                </label>
              </div>
            )}

            {error && <p role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
              {step > 0 ? (
                <button type="button" onClick={() => { setStep((current) => current - 1); setError(''); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <span aria-hidden="true">←</span> Quay lại
                </button>
              ) : <span />}
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:opacity-50">
                {loading ? 'Đang xử lý...' : (step === STEPS.length - 1 ? 'Gửi hồ sơ đăng ký' : 'Tiếp tục')}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
          <p className="mt-5 text-center text-xs text-slate-400 sm:hidden">
            Đã có tài khoản? <Link to="/auth" className="font-semibold text-green-700">Đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
