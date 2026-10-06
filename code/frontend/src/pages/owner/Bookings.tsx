import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';

const getWeekDays = (startDate: Date) => {
  const days = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push({
      day: dayNames[d.getDay()],
      date: d.getDate().toString(),
      fullDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    });
  }
  return days;
};

export interface Booking {
  id: string;
  time: string;
  date: string;
  customerName: string;
  phone: string;
  fieldName: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  reference?: string;
}

interface Field {
  id: string;
  name: string;
  owner?: string;
}

export function OwnerBookings() {
  const [weekStart, setWeekStart] = useState(() => new Date());
  const DAYS = getWeekDays(weekStart);
  
  const [selectedDay, setSelectedDay] = useState(DAYS[0].fullDate);
  const [filter, setFilter] = useState('Tất cả sân');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [currentUid, setCurrentUid] = useState<string>('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setCurrentUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const [bookingsRes, fieldsRes] = await Promise.all([
          fetch('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/fields')
        ]);
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (fieldsRes.ok) setFields(await fieldsRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const confirmBooking = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'confirmed' })
      });
      if (res.ok) {
        setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: 'confirmed' } : booking));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const myFields = fields.filter(f => f.owner === currentUid);
  const visible = bookings.filter(b => b.date === selectedDay && (filter === 'Tất cả sân' || b.fieldName === filter));
  
  const totalBookings = visible.length;
  const pendingBookings = visible.filter(b => b.status === 'pending').length;
  const totalRevenue = visible.filter(b => b.status !== 'pending').reduce((sum, b) => sum + Number(b.amount || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <div><p className="font-display text-2xl font-bold uppercase text-slate-900">Lịch vận hành</p><p className="text-sm text-slate-500">Theo dõi và xác nhận lịch đặt trên toàn bộ sân.</p></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-2">
          <p className="text-sm font-semibold text-slate-700">Lịch 7 ngày</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Chuyển đến ngày:</span>
            <input 
              type="date"
              className="text-sm border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:ring-1 focus:ring-green-500 focus:outline-none"
              onChange={(e) => {
                if (e.target.value) {
                  const d = new Date(e.target.value);
                  setWeekStart(d);
                  setSelectedDay(e.target.value);
                }
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((item) => {
            const dayPending = bookings.filter(b => b.date === item.fullDate && b.status === 'pending').length;
            return (
              <button key={item.fullDate} onClick={() => setSelectedDay(item.fullDate)} className={`relative rounded-xl py-3 text-center transition-colors ${selectedDay === item.fullDate ? 'bg-green-600 text-white shadow-md shadow-green-700/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                {dayPending > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-sm ring-1 ring-white"></span>}
                <span className="block text-xs font-medium">{item.day}</span>
                <span className="mt-1 block font-display text-2xl font-bold">{item.date}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [totalBookings.toString(), 'Tổng lịch'], 
          [pendingBookings.toString(), 'Chờ xác nhận'], 
          ['78%', 'Lấp đầy'], 
          [(totalRevenue / 1000000).toFixed(1) + 'tr', 'Doanh thu dự kiến']
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-display text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-bold uppercase text-slate-900">
              {new Date(selectedDay).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs text-slate-500">{visible.length} lịch đang hiển thị</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter('Tất cả sân')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === 'Tất cả sân' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-slate-500 hover:bg-slate-50'}`}>Tất cả sân</button>
            {myFields.map((field) => (
              <button key={field.id} onClick={() => setFilter(field.name)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === field.name ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-slate-500 hover:bg-slate-50'}`}>{field.name}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {visible.map((booking) => (
            <div key={booking.id} className="grid gap-4 p-5 hover:bg-slate-50 sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <div className="border-l-4 border-green-500 pl-3">
                <p className="font-mono text-lg font-bold text-slate-900">{booking.time}</p>
                <p className="font-mono text-xs text-slate-500">{booking.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">{(booking.customerName || 'U').split(' ').pop()?.[0]}</div>
                <div>
                  <p className="font-semibold text-slate-900">{booking.customerName}</p>
                  <p className="text-xs text-slate-500">{booking.phone} · {booking.fieldName}</p>
                  {booking.paymentMethod && <p className="mt-1 text-xs font-medium text-blue-600">{booking.paymentMethod} · #{booking.reference}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right"><p className="font-semibold text-slate-900">{(booking.amount || 0).toLocaleString('vi-VN')}đ</p><p className={`text-xs font-medium ${booking.status === 'pending' ? 'text-amber-600' : booking.status === 'paid' ? 'text-blue-600' : 'text-green-700'}`}>{booking.status === 'pending' ? 'Chờ xác nhận' : booking.status === 'paid' ? 'Đã thanh toán' : 'Đã xác nhận'}</p></div>
                {booking.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => confirmBooking(booking.id)} className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700">Xác nhận</button>
                    <button onClick={() => setSelectedBooking(booking)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100" aria-label="Xem chi tiết">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setSelectedBooking(booking)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100" aria-label="Xem chi tiết">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Chưa có lịch đặt nào.
            </div>
          )}
        </div>
      </div>
      
      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Chi tiết đặt sân</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                  {(selectedBooking.customerName || 'U').charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedBooking.customerName}</p>
                  <p className="text-sm text-slate-500">{selectedBooking.phone}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Sân:</span>
                  <span className="font-medium text-slate-900 text-sm">{selectedBooking.fieldName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Thời gian:</span>
                  <span className="font-medium text-slate-900 text-sm">{selectedBooking.time} · {selectedBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Thanh toán:</span>
                  <span className="font-medium text-slate-900 text-sm">{selectedBooking.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Mã đơn:</span>
                  <span className="font-mono text-slate-900 text-sm">#{selectedBooking.reference || selectedBooking.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
              
              <div className="border-t border-dashed border-slate-200 pt-4 mt-4 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Tổng tiền</span>
                <span className="font-bold text-xl text-green-600">{(selectedBooking.amount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setSelectedBooking(null)} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                Đóng
              </button>
              {selectedBooking.status === 'pending' && (
                <button 
                  onClick={() => {
                    confirmBooking(selectedBooking.id);
                    setSelectedBooking(null);
                  }} 
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                >
                  Xác nhận đơn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
