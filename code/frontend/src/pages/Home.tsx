import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';


const SPORT_TYPES = ['Tất cả', 'Bóng đá', 'Tennis', 'Cầu lông', 'Bóng rổ', 'Pickleball'];

const PROVINCES = ['An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Cần Thơ', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Lâm Đồng', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'TP.HCM', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'];

const STATS = [
  { value: '500+', label: 'Sân thể thao' },
  { value: '50,000+', label: 'Lượt đặt sân' },
  { value: '4.8★', label: 'Đánh giá trung bình' },
  { value: '24/7', label: 'Hỗ trợ khách hàng' },
];

export function Home() {
  const navigate = useNavigate();
  const [locationStr, setLocationStr] = useState('');
  const [sport, setSport] = useState('Bóng đá');
  const [date, setDate] = useState('');
  const [activeSport, setActiveSport] = useState('Tất cả');
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/fields');
        if (res.ok) {
          const data = await res.json();
          setFields(data.filter((f: any) => f.active));
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách sân:', err);
      }
    };
    fetchFields();
  }, []);

  const filteredFields = activeSport === 'Tất cả'
    ? fields
    : fields.filter(f => f.sport === activeSport);

  const handleSearch = () => {
    navigate(`/search?location=${locationStr}&sport=${sport}&date=${date}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&h=900&fit=crop&auto=format"
          alt="Football field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/80" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-sm font-medium">Đặt sân nhanh chóng — Thanh toán an toàn</span>
          </div>

          <h1
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            className="text-5xl sm:text-7xl font-extrabold text-white uppercase tracking-tight mb-4 leading-none"
          >
            Tìm & Đặt Sân<br />
            <span className="text-green-400">Thể Thao</span> Ngay Hôm Nay
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Hơn 500 sân thể thao tại TP.HCM — bóng đá, tennis, cầu lông, bóng rổ và nhiều hơn nữa.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Địa điểm</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <select
                    value={locationStr}
                    onChange={e => setLocationStr(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                  >
                    <option value="">Toàn quốc</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Loại sân</label>
                <select
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {['Bóng đá', 'Tennis', 'Cầu lông', 'Bóng rổ', 'Pickleball'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Ngày chơi</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full mt-3 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Tìm Sân Ngay
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-4xl font-extrabold text-white uppercase tracking-wide">{stat.value}</div>
                <div className="text-green-100 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Fields */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-green-600 text-sm font-semibold uppercase tracking-widest mb-1">Được đặt nhiều nhất</p>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
              Sân Nổi Bật
            </h2>
          </div>
          <button onClick={() => navigate('/search')} className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 whitespace-nowrap">
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Sport Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {SPORT_TYPES.map(s => (
            <button
              key={s}
              onClick={() => setActiveSport(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeSport === s
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-green-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Field Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map(field => (
            <div
              key={field.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all hover:-translate-y-1 group cursor-pointer flex flex-col h-full"
              onClick={() => navigate(`/field/${field.id}`)}
            >
              <div className="relative h-52 shrink-0 bg-gray-100 overflow-hidden">
                <img
                  src={field.image}
                  alt={field.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {field.badge && (
                  <span className={`absolute top-3 left-3 ${field.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}>
                    {field.badge}
                  </span>
                )}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-base leading-tight">{field.name}</h3>
                </div>
                <div className="flex items-start gap-1 text-gray-500 text-sm mb-3">
                  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  <span className="line-clamp-2">{field.location}</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(field.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({field.reviews || 0})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 font-bold text-base">{(field.price || 0).toLocaleString('vi-VN')}đ</span>
                    <span className="text-gray-400 text-xs">/giờ</span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/field/${field.id}`); }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Đặt Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-10">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Đơn giản & Nhanh chóng</p>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-4xl font-extrabold text-white uppercase tracking-tight">
            Đặt Sân Chỉ 3 Bước
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Tìm Kiếm', desc: 'Chọn loại sân, địa điểm và ngày chơi phù hợp với lịch của bạn.', icon: '🔍' },
            { step: '02', title: 'Chọn Sân', desc: 'Xem thông tin chi tiết, hình ảnh và chọn khung giờ còn trống.', icon: '📋' },
            { step: '03', title: 'Thanh Toán', desc: 'Thanh toán nhanh qua ZaloPay, MoMo, VNPay hoặc thẻ ngân hàng.', icon: '✅' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-600/20 border border-green-600/30 flex items-center justify-center text-2xl mx-auto mb-4">
                {item.icon}
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">{item.step}</div>
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-2xl font-bold text-white uppercase mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540747913346-19212a4d5efb?w=1400&h=500&fit=crop&auto=format"
          alt="Sports field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-green-700/85" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-5xl font-extrabold text-white uppercase tracking-tight mb-4">
            Bạn Sở Hữu Sân Thể Thao?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-lg mx-auto">
            Đăng ký miễn phí và bắt đầu tiếp nhận đặt sân trực tuyến từ hàng nghìn khách hàng.
          </p>
          <button
            onClick={() => navigate('/owner/register')}
            className="px-8 py-3.5 rounded-xl bg-white text-green-700 font-bold text-sm hover:bg-green-50 transition-colors shadow-xl"
          >
            Đăng Ký Chủ Sân Ngay →
          </button>
        </div>
      </section>
    </div>
  );
}
