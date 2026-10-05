import { useState } from 'react';
import { useNavigate } from 'react-router';

type OwnerScheduleSettings = {
  field: string;
  slotMinutes: number;
  regularPrice: number;
  peakPrice: number;
  peakStart: string;
  days: Array<{ enabled: boolean; open: string; close: string }>;
  blockedDates: string[];
};

const IMAGES = [
  'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=900&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=900&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=900&h=600&fit=crop&auto=format',
];

const TIME_SLOTS = [
  { time: '05:00 - 06:30', status: 'booked' },
  { time: '06:30 - 08:00', status: 'available' },
  { time: '08:00 - 09:30', status: 'available' },
  { time: '09:30 - 11:00', status: 'booked' },
  { time: '11:00 - 12:30', status: 'available' },
  { time: '14:00 - 15:30', status: 'available' },
  { time: '15:30 - 17:00', status: 'booked' },
  { time: '17:00 - 18:30', status: 'available' },
  { time: '18:30 - 20:00', status: 'available' },
  { time: '20:00 - 21:30', status: 'booked' },
  { time: '21:30 - 23:00', status: 'available' },
];

const AMENITIES = [
  { icon: '🅿️', label: 'Bãi đỗ xe miễn phí' },
  { icon: '🚿', label: 'Phòng thay đồ & tắm' },
  { icon: '💡', label: 'Đèn chiếu sáng HD' },
  { icon: '📶', label: 'Wi-Fi tốc độ cao' },
  { icon: '🟢', label: 'Cỏ nhân tạo thế hệ mới' },
  { icon: '⚽', label: 'Cho thuê bóng & vest' },
  { icon: '🧑‍⚖️', label: 'Trọng tài chuyên nghiệp' },
  { icon: '📸', label: 'Camera an ninh 24/7' },
];

const REVIEWS = [
  { name: 'Nguyễn Văn A', avatar: 'NV', rating: 5, date: '18/09/2026', comment: 'Sân chất lượng rất tốt, cỏ mềm và bằng phẳng. Đặt sân online tiện lợi, staff nhiệt tình. Sẽ quay lại!' },
  { name: 'Trần Thị B', avatar: 'TB', rating: 4, date: '10/09/2026', comment: 'Giá cả hợp lý, cơ sở vật chất sạch sẽ. Chỉ hơi khó đỗ xe vào giờ cao điểm nhưng nhìn chung rất ổn.' },
  { name: 'Lê Minh C', avatar: 'LM', rating: 5, date: '02/09/2026', comment: 'Tuyệt vời! Đây là sân bóng tốt nhất mình từng chơi ở TP.HCM. Ánh sáng ban đêm rất tốt, không bị chói mắt.' },
];

const PRICE_PER_SLOT = 350000;
const FIELD_MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Nhà+thi+đấu+Phú+Thọ,+Quận+11,+TP.HCM';
const FIELD_MAP_EMBED = 'https://www.google.com/maps?q=Nhà+thi+đấu+Phú+Thọ,+Quận+11,+TP.HCM&output=embed';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function loadOwnerSchedule(field: string): OwnerScheduleSettings | null {
  try {
    const value = localStorage.getItem('sportbook-owner-schedule');
    if (!value) return null;
    const parsed = JSON.parse(value);
    const schedule = parsed.days ? (parsed.field === field ? parsed : null) : parsed[field];
    if (!schedule) return null;
    return {
      ...schedule,
      blockedDates: schedule.blockedDates ?? [],
      days: schedule.days ?? [],
    };
  } catch {
    return null;
  }
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function FieldDetail() {
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const today = new Date();
  const [calMonth] = useState(today.getMonth());
  const [calYear] = useState(today.getFullYear());
  const [ownerSchedule] = useState<OwnerScheduleSettings | null>(() => loadOwnerSchedule('Sân Bóng Đá Phú Thọ'));

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const selectedDateValue = selectedDate
    ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : '';
  const selectedDaySchedule = selectedDate
    ? ownerSchedule?.days[new Date(calYear, calMonth, selectedDate).getDay()]
    : null;
  const selectedDateBlocked = Boolean(selectedDateValue && ownerSchedule?.blockedDates?.includes(selectedDateValue));
  const displayedSlots = ownerSchedule && selectedDaySchedule?.enabled && !selectedDateBlocked
    ? Array.from(
        { length: Math.max(0, Math.floor((timeToMinutes(selectedDaySchedule.close) - timeToMinutes(selectedDaySchedule.open)) / ownerSchedule.slotMinutes)) },
        (_, index) => {
          const start = timeToMinutes(selectedDaySchedule.open) + index * ownerSchedule.slotMinutes;
          return { time: `${minutesToTime(start)} - ${minutesToTime(start + ownerSchedule.slotMinutes)}`, status: 'available' };
        },
      )
    : ownerSchedule && selectedDate
      ? []
      : TIME_SLOTS;
  const priceForSlot = (slot: string) =>
    ownerSchedule && slot.slice(0, 5) >= ownerSchedule.peakStart ? ownerSchedule.peakPrice : ownerSchedule?.regularPrice ?? PRICE_PER_SLOT;
  const total = selectedSlots.reduce((sum, slot) => sum + priceForSlot(slot), 0);

  const handleCheckout = () => {
    const checkoutState = { slots: selectedSlots, date: selectedDate, total, field: 'Sân Bóng Đá Phú Thọ' };
    let isCustomer = false;
    try {
      isCustomer = JSON.parse(localStorage.getItem('sportbook-session') ?? '{}').role === 'customer';
    } catch {
      isCustomer = false;
    }
    if (!isCustomer) {
      sessionStorage.setItem('sportbook-pending-checkout', JSON.stringify(checkoutState));
      navigate('/auth?redirect=/checkout&reason=checkout');
      return;
    }
    navigate('/checkout', { state: checkoutState });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-green-600 transition-colors">Trang chủ</button>
        <span>/</span>
        <button onClick={() => navigate('/search')} className="hover:text-green-600 transition-colors">Tìm sân</button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Sân Bóng Đá Phú Thọ</span>
      </nav>

      {/* Image Gallery */}
      <div className="grid grid-cols-4 gap-2 mb-8 rounded-2xl overflow-hidden h-80 sm:h-96">
        <div className="col-span-4 sm:col-span-3 relative overflow-hidden bg-gray-100">
          <img src={IMAGES[activeImg]} alt="Field" className="w-full h-full object-cover" />
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
            onClick={() => setActiveImg(i => (i - 1 + IMAGES.length) % IMAGES.length)}
          >‹</button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
            onClick={() => setActiveImg(i => (i + 1) % IMAGES.length)}
          >›</button>
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {activeImg + 1} / {IMAGES.length}
          </div>
        </div>
        <div className="hidden sm:flex flex-col gap-2 col-span-1">
          {IMAGES.slice(0, 3).map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveImg(i)}
              className={`flex-1 cursor-pointer overflow-hidden rounded-lg bg-gray-100 border-2 transition-colors ${activeImg === i ? 'border-green-500' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Field Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
                  Sân Bóng Đá Phú Thọ
                </h1>
                <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  <span>123 Đường Tô Hiến Thành, Phường 15, Quận 11, TP.HCM</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-amber-600">4.8</div>
                  <div className="flex items-center gap-0.5 justify-center">
                    {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">124 đánh giá</div>
                </div>
              </div>
            </div>

            {/* Map Snippet */}
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              <iframe
                title="Bản đồ Sân Bóng Đá Phú Thọ"
                src={FIELD_MAP_EMBED}
                className="h-48 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21s7-5.5 7-12A7 7 0 1 0 5 9c0 6.5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                  <span className="truncate">123 Tô Hiến Thành, Quận 11, TP.HCM</span>
                </div>
                <a href={FIELD_MAP_URL} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-800">
                  Mở Google Maps ↗
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-3">Mô Tả Sân</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Sân bóng đá Phú Thọ là một trong những sân cỏ nhân tạo chất lượng cao tại TP.HCM, với diện tích 7.500 m²
              đạt tiêu chuẩn FIFA Quality Pro. Sân được lắp đặt hệ thống đèn chiếu sáng 800 lux, phù hợp để tổ chức
              các giải đấu đêm. Với khuôn viên rộng rãi, bãi giữ xe miễn phí và đội ngũ nhân viên chuyên nghiệp,
              đây là lựa chọn hàng đầu cho các trận đấu phong trào và giải đấu cộng đồng.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm mt-3">
              Sân có khả năng bố trí cho bóng 5 người, 7 người và 11 người tùy theo yêu cầu.
              Đặt sân trước ít nhất 2 tiếng để đảm bảo khung giờ theo ý muốn.
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-3">Tiện Ích</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AMENITIES.map(a => (
                <div key={a.label} className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{a.icon}</div>
                  <div className="text-xs text-gray-700 font-medium leading-tight">{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">Đánh Giá Từ Khách Hàng</h2>
            <div className="space-y-4">
              {REVIEWS.map((r, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {r.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5 mb-2">
                        {[1,2,3,4,5].map(i => <svg key={i} className={`w-3 h-3 ${i <= r.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Sticky Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-green-600 px-5 py-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-2xl font-bold">{(ownerSchedule?.regularPrice ?? PRICE_PER_SLOT).toLocaleString('vi-VN')}đ</span>
                  <span className="text-green-200 text-sm">/1.5 giờ</span>
                </div>
                <p className="text-green-100 text-xs mt-0.5">Đặt cọc 50% khi xác nhận</p>
              </div>

              <div className="p-5">
                {/* Calendar */}
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Chọn Ngày</h3>
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">{monthNames[calMonth]} {calYear}</span>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">‹</button>
                      <button className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">›</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
                      <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                    ))}
                    {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array(daysInMonth).fill(null).map((_, i) => {
                      const day = i + 1;
                      const isPast = day < today.getDate();
                      const isSelected = selectedDate === day;
                      const isToday = day === today.getDate();
                      const dateValue = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayClosed = ownerSchedule
                        ? !ownerSchedule.days[new Date(calYear, calMonth, day).getDay()]?.enabled || ownerSchedule.blockedDates?.includes(dateValue)
                        : false;
                      return (
                        <button
                          key={day}
                          disabled={isPast || dayClosed}
                          onClick={() => { setSelectedDate(day); setSelectedSlots([]); }}
                          className={`text-center text-xs py-1.5 rounded-lg transition-colors font-medium ${
                            isSelected ? 'bg-green-600 text-white' :
                            isToday ? 'bg-green-50 text-green-700 border border-green-200' :
                            isPast || dayClosed ? 'text-gray-300 cursor-not-allowed line-through' :
                            'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Chọn Khung Giờ</h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {displayedSlots.map(slot => (
                    <button
                      key={slot.time}
                      disabled={slot.status === 'booked'}
                      onClick={() => slot.status === 'available' && toggleSlot(slot.time)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        slot.status === 'booked'
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : selectedSlots.includes(slot.time)
                            ? 'bg-green-600 text-white border-green-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-700'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                  {selectedDate && displayedSlots.length === 0 && (
                    <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                      Sân không nhận lịch vào ngày này. Vui lòng chọn ngày khác.
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> Đã chọn</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block" /> Đã đặt</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block" /> Trống</span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-500">{selectedSlots.length} khung giờ đã chọn</span>
                    <span className="text-gray-800 font-medium">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t border-gray-100">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedSlots.length === 0 || !selectedDate}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none shadow-green-600/30"
                >
                  {selectedSlots.length === 0 || !selectedDate ? 'Chọn ngày & khung giờ' : 'Tiến Hành Thanh Toán →'}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Thanh toán bảo mật · Hoàn tiền 100% nếu hủy trước 24h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
