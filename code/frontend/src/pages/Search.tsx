import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const PROVINCES = ['An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Cần Thơ', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Lâm Đồng', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'TP.HCM', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'];

const SPORT_OPTIONS = ['Tất cả', 'Bóng đá', 'Tennis', 'Cầu lông', 'Bóng rổ', 'Pickleball'];
const AMENITY_OPTIONS = ['Bãi đỗ xe', 'Phòng thay đồ & tắm', 'Đèn chiếu sáng', 'Wi-Fi', 'Cho thuê dụng cụ', 'Căn tin', 'Camera an ninh', 'Trọng tài'];

type SortKey = 'price-asc' | 'price-desc' | 'rating' | 'distance';

export function SearchPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialLocation = urlParams.get('location') || '';
  const initialSport = urlParams.get('sport') || '';

  const [priceRange, setPriceRange] = useState(600000);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [selectedSports, setSelectedSports] = useState<string[]>(initialSport && initialSport !== 'Tất cả' ? [initialSport] : []);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [fields, setFields] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/fields');
        if (res.ok) {
          const data = await res.json();
          setFields(data.filter((f: any) => f.active).map((f: any) => ({
            ...f,
            location: f.location || f.address,
            rating: f.rating || 0,
            reviews: f.reviews || 0,
            distance: f.distance || (Math.random() * 5 + 1).toFixed(1),
            slots: ['06:00', '08:00', '17:00', '19:00'], // dummy slots for now
          })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFields();
  }, []);

  const toggleSport = (sport: string) => setSelectedSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  const toggleAmenity = (a: string) => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const availableAmenities = AMENITY_OPTIONS;

  const filtered = fields
    .filter(f => selectedLocation === '' || (f.location || '').includes(selectedLocation))
    .filter(f => (f.price || 0) <= priceRange)
    .filter(f => selectedSports.length === 0 || selectedSports.includes(f.sport))
    .filter(f => selectedAmenities.every(a => (f.amenities || []).includes(a)))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distance - b.distance;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
            Kết Quả Tìm Kiếm
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Tìm thấy <strong>{filtered.length}</strong> sân {selectedLocation ? `tại ${selectedLocation}` : 'trên toàn quốc'}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="rating">Xếp theo: Đánh giá</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="distance">Khoảng cách</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {(['list', 'grid'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} className={`p-1.5 rounded-md transition-colors ${viewMode === m ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'list'
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wide">Bộ lọc</h2>

            {/* Location */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">Địa điểm</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Toàn quốc</option>
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">Giá tối đa / giờ</label>
              <input
                type="range"
                min={0} max={600000} step={10000}
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">0đ</span>
                <span className="text-xs font-semibold text-green-700">{priceRange.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Sport Type */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">Loại sân</label>
              <div className="space-y-2">
                {SPORT_OPTIONS.slice(1).map(sport => (
                  <label key={sport} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(sport)}
                      onChange={() => toggleSport(sport)}
                      className="w-4 h-4 rounded accent-green-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-green-700">{sport}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">Tiện ích</label>
              <div className="space-y-2">
                {availableAmenities.map(a => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                      className="w-4 h-4 rounded accent-green-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-green-700">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setSelectedSports([]); setSelectedAmenities([]); setPriceRange(600000); setSelectedLocation(''); }}
              className="w-full py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🏟️</div>
              <p className="text-lg font-medium">Không tìm thấy sân phù hợp</p>
              <p className="text-sm mt-1">Hãy thử điều chỉnh bộ lọc</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {filtered.map(field => (
                <div key={field.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row group">
                  <div className="w-full sm:w-52 h-44 sm:h-auto shrink-0 overflow-hidden bg-gray-100">
                    <img src={field.image} alt={field.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{field.name}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            {field.location} · {field.distance} km
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-bold text-xl">{field.price.toLocaleString('vi-VN')}đ</span>
                          <div className="text-gray-400 text-xs">/{field.schedule?.slotMinutes ?? 90} phút</div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-2">
                        {[1,2,3,4,5].map(i => <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(field.rating || 5) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                        <span className="text-sm font-semibold text-gray-700 ml-1">{field.rating}</span>
                        <span className="text-xs text-gray-400">({field.reviews} đánh giá)</span>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(field.amenities || []).map((a: string) => (
                          <span key={a} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-xs text-gray-600">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-500 font-medium">Khung giờ:</span>
                        {(field.slots || []).map((slot: string) => (
                          <button key={slot} className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white transition-colors">
                            {slot}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate(`/field/${field.id}`)}
                        className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
                      >
                        Xem & Đặt Sân
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(field => (
                <div
                  key={field.id}
                  onClick={() => navigate(`/field/${field.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden cursor-pointer group transition-all hover:-translate-y-0.5 flex flex-col h-full"
                >
                  <div className="h-44 shrink-0 overflow-hidden bg-gray-100">
                    <img src={field.image} alt={field.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{field.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{field.location}</p>
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-sm font-medium">{field.rating}</span>
                      </div>
                      <span className="text-green-600 font-bold">{(field.price || 0).toLocaleString('vi-VN')}đ/{field.schedule?.slotMinutes ?? 90} phút</span>
                    </div>
                    <button className="mt-3 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                      Đặt Ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
