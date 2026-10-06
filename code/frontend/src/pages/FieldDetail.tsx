import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

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
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [field, setField] = useState<any>(null);
  const [fieldBookings, setFieldBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const today = new Date();
  const [calMonth] = useState(today.getMonth());
  const [calYear] = useState(today.getFullYear());

  useEffect(() => {
    const fetchField = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/fields/${id}`);
        if (res.ok) {
          const data = await res.json();
          setField(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/fields/${id}/bookings`);
        if (res.ok) setFieldBookings(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/fields/${id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const checkCanReview = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:5000/api/fields/${id}/can-review`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCanReview(data.canReview);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      fetchField();
      fetchBookings();
      fetchReviews();
      checkCanReview();
    }
  }, [id]);

  const ownerSchedule: OwnerScheduleSettings | null = field?.schedule ? {
    field: field.name,
    ...field.schedule
  } : null;

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
  
  const isSelectedDateToday = selectedDateValue === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  const displayedSlots = ownerSchedule && selectedDaySchedule?.enabled && !selectedDateBlocked
    ? Array.from(
        { length: Math.max(0, Math.floor((timeToMinutes(selectedDaySchedule.close) - timeToMinutes(selectedDaySchedule.open)) / ownerSchedule.slotMinutes)) },
        (_, index) => {
          const start = timeToMinutes(selectedDaySchedule.open) + index * ownerSchedule.slotMinutes;
          const timeStr = `${minutesToTime(start)} - ${minutesToTime(start + ownerSchedule.slotMinutes)}`;
          let status = 'available';
          const isBooked = fieldBookings.some(b => b.date === selectedDateValue && b.time.includes(timeStr));
          if (isBooked || (isSelectedDateToday && start <= currentMinutes)) status = 'booked';
          return { time: timeStr, status };
        },
      )
    : ownerSchedule && selectedDate
      ? []
      : TIME_SLOTS.map(slot => {
          let status = slot.status;
          const startMinutes = timeToMinutes(slot.time.split(' - ')[0]);
          const isBooked = fieldBookings.some(b => b.date === selectedDateValue && b.time.includes(slot.time));
          if (isBooked || (isSelectedDateToday && startMinutes <= currentMinutes)) status = 'booked';
          return { ...slot, status };
      });
  const priceForSlot = (slot: string) =>
    ownerSchedule && slot.slice(0, 5) >= ownerSchedule.peakStart ? ownerSchedule.peakPrice : ownerSchedule?.regularPrice ?? PRICE_PER_SLOT;
  const total = selectedSlots.reduce((sum, slot) => sum + priceForSlot(slot), 0);
  
  let isCustomer = false;
  let customerName = 'Khách hàng';
  try {
    const sessionStr = localStorage.getItem('sportbook-session');
    if (sessionStr) {
      const sessionObj = JSON.parse(sessionStr);
      isCustomer = sessionObj.role === 'customer';
      customerName = sessionObj.user?.displayName || sessionObj.user?.fullName || 'Khách hàng';
    }
  } catch {}

  const handleCheckout = () => {
    const checkoutState = { slots: selectedSlots, date: selectedDateValue, total, field: field?.name || 'Sân bóng', fieldId: field?.id };
    if (!isCustomer) {
      sessionStorage.setItem('sportbook-pending-checkout', JSON.stringify(checkoutState));
      navigate('/auth?redirect=/checkout&reason=checkout');
      return;
    }
    navigate('/checkout', { state: checkoutState });
  };
  
  const submitReview = async () => {
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/fields/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment, customerName })
      });
      if (res.ok) {
        const data = await res.json();
        setReviews([data.review, ...reviews]);
        setShowReviewForm(false);
        setReviewComment('');
        // Update local rating optimistically if we want, or just wait for next fetch
      } else {
        alert('Có lỗi xảy ra khi gửi đánh giá');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!field) return <div className="p-8 text-center text-gray-500">Đang tải thông tin sân...</div>;

  const displayImages = field.images && field.images.length > 0 ? field.images : (field.image ? [field.image] : IMAGES);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-green-600 transition-colors">Trang chủ</button>
        <span>/</span>
        <button onClick={() => navigate('/search')} className="hover:text-green-600 transition-colors">Tìm sân</button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{field.name}</span>
      </nav>

      {/* Image Gallery */}
      <div className="grid grid-cols-4 gap-2 mb-8 rounded-2xl overflow-hidden h-80 sm:h-96">
        <div className="col-span-4 sm:col-span-3 relative overflow-hidden bg-gray-100">
          <img src={displayImages[activeImg] || displayImages[0]} alt="Field" className="w-full h-full object-cover" />
          {displayImages.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                onClick={() => setActiveImg(i => (i - 1 + displayImages.length) % displayImages.length)}
              >‹</button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                onClick={() => setActiveImg(i => (i + 1) % displayImages.length)}
              >›</button>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {activeImg + 1} / {displayImages.length}
              </div>
            </>
          )}
        </div>
        {displayImages.length > 1 && (
          <div className="hidden sm:flex flex-col gap-2 col-span-1">
            {displayImages.slice(0, 3).map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-1 cursor-pointer overflow-hidden rounded-lg bg-gray-100 border-2 transition-colors ${activeImg === i ? 'border-green-500' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        )}
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
                  {field.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  <span>{field.location || field.address || 'Đang cập nhật'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-amber-600">{Number(field.rating || 0).toFixed(1)}</div>
                  <div className="flex items-center gap-0.5 justify-center">
                    {[1,2,3,4,5].map(i => <svg key={i} className={`w-3 h-3 ${i <= Math.floor(field.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{field.reviews || 0} đánh giá</div>
                </div>
              </div>
            </div>

            {/* Map Snippet */}
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              <iframe
                title={`Bản đồ ${field.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(field.location || field.address || field.name)}&output=embed`}
                className="h-48 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21s7-5.5 7-12A7 7 0 1 0 5 9c0 6.5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                  <span className="truncate">{field.location || field.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>
                {field.mapUrl && (
                  <a href={field.mapUrl} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-800">
                    Mở Google Maps ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-3">Mô Tả Sân</h2>
            <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
              {field.description || 'Chưa có thông tin mô tả chi tiết cho sân này.'}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-3">Tiện Ích</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(field.amenities || []).length > 0 ? (
                field.amenities.map((a: string) => {
                  const label = { parking: 'Bãi đỗ xe', wifi: 'Wi-Fi', referee: 'Trọng tài', lights: 'Đèn chiếu sáng', showers: 'Phòng thay đồ' }[a] || a;
                  const icon = { parking: '🅿️', wifi: '📶', referee: '🧑‍⚖️', lights: '💡', showers: '🚿' }[a] || '✅';
                  return (
                    <div key={a} className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-xs text-gray-700 font-medium leading-tight">{label}</div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 text-sm text-gray-500">Chưa có thông tin tiện ích.</div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Đánh Giá Từ Khách Hàng</h2>
              {isCustomer && canReview && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)} className="text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  + Viết đánh giá
                </button>
              )}
            </div>
            
            {showReviewForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Viết đánh giá của bạn</h3>
                  <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600">×</button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Chất lượng:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                        <svg className={`w-6 h-6 ${star <= reviewRating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sân bóng này..."
                  className="w-full h-24 rounded-lg border border-gray-200 p-3 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none mb-3 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Hủy
                  </button>
                  <button 
                    onClick={submitReview}
                    disabled={submittingReview || !reviewComment.trim()}
                    className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={r.id || i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold shrink-0 uppercase">
                      {r.avatar || (r.customerName || 'KH').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">{r.name || r.customerName}</span>
                        <span className="text-xs text-gray-400">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : r.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5 mb-2">
                        {[1,2,3,4,5].map(i => <svg key={i} className={`w-3 h-3 ${i <= r.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl">
                  Chưa có đánh giá nào cho sân này.
                </div>
              )}
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
                      const dateObj = new Date(calYear, calMonth, day);
                      const isPast = dateObj.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
                      const isSelected = selectedDate === day;
                      const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                      const dateValue = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayClosed = ownerSchedule
                        ? !ownerSchedule.days[dateObj.getDay()]?.enabled || ownerSchedule.blockedDates?.includes(dateValue)
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
