import { useState } from 'react';

const DAYS = [
  { day: 'T2', date: '21' }, { day: 'T3', date: '22' }, { day: 'T4', date: '23' },
  { day: 'T5', date: '24' }, { day: 'T6', date: '25' }, { day: 'T7', date: '26' }, { day: 'CN', date: '27' },
];

const SCHEDULE = [
  { id: 1, start: '06:00', end: '07:30', customer: 'Nguyễn Hải Nam', phone: '090 123 4567', field: 'Sân 5A', amount: '525.000đ', status: 'confirmed' },
  { id: 2, start: '08:00', end: '09:00', customer: 'Trần Hoàng Long', phone: '091 845 2026', field: 'Sân 7A', amount: '420.000đ', status: 'confirmed' },
  { id: 3, start: '15:30', end: '17:00', customer: 'Lê Minh Anh', phone: '098 274 1130', field: 'Sân 5B', amount: '525.000đ', status: 'pending' },
  { id: 4, start: '18:00', end: '20:00', customer: 'CLB Sao Mai', phone: '093 677 1250', field: 'Sân 7A', amount: '840.000đ', status: 'paid' },
  { id: 5, start: '20:30', end: '22:00', customer: 'Phạm Quốc Việt', phone: '090 889 7621', field: 'Sân 5A', amount: '630.000đ', status: 'confirmed' },
];

type Booking = (typeof SCHEDULE)[number] & {
  paymentMethod?: string;
  reference?: string;
};

function getPendingCustomerBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem('sportbook-owner-bookings') ?? '[]');
  } catch {
    return [];
  }
}

export function OwnerBookings() {
  const [selectedDay, setSelectedDay] = useState('25');
  const [filter, setFilter] = useState('Tất cả sân');
  const [bookings, setBookings] = useState<Booking[]>(() => [...getPendingCustomerBookings(), ...SCHEDULE]);

  const confirmBooking = (id: number) => {
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: 'confirmed' } : booking));
    const customerBookings = getPendingCustomerBookings().map((booking) =>
      booking.id === id ? { ...booking, status: 'confirmed' } : booking,
    );
    localStorage.setItem('sportbook-owner-bookings', JSON.stringify(customerBookings));
  };
  const visible = filter === 'Tất cả sân' ? bookings : bookings.filter((booking) => booking.field === filter);

  return (
    <div className="space-y-5">
      <div>
        <div><p className="font-display text-2xl font-bold uppercase text-slate-900">Lịch vận hành</p><p className="text-sm text-slate-500">Theo dõi và xác nhận lịch đặt trên toàn bộ sân.</p></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((item) => (
            <button key={item.date} onClick={() => setSelectedDay(item.date)} className={`rounded-xl py-3 text-center transition-colors ${selectedDay === item.date ? 'bg-green-600 text-white shadow-md shadow-green-700/20' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="block text-xs font-medium">{item.day}</span>
              <span className="mt-1 block font-display text-2xl font-bold">{item.date}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['18', 'Tổng lịch'], ['4', 'Chờ xác nhận'], ['78%', 'Lấp đầy'], ['12,4tr', 'Doanh thu dự kiến']].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-display text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div><p className="font-display text-xl font-bold uppercase text-slate-900">Thứ Sáu, 25 tháng 9</p><p className="text-xs text-slate-500">{visible.length} lịch đang hiển thị</p></div>
          <div className="flex gap-2">
            {['Tất cả sân', 'Sân 5A', 'Sân 5B', 'Sân 7A'].map((field) => (
              <button key={field} onClick={() => setFilter(field)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === field ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-slate-500 hover:bg-slate-50'}`}>{field}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {visible.map((booking) => (
            <div key={booking.id} className="grid gap-4 p-5 hover:bg-slate-50 sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <div className="border-l-4 border-green-500 pl-3">
                <p className="font-mono text-lg font-bold text-slate-900">{booking.start}</p>
                <p className="font-mono text-xs text-slate-500">đến {booking.end}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">{booking.customer.split(' ').pop()?.[0]}</div>
                <div>
                  <p className="font-semibold text-slate-900">{booking.customer}</p>
                  <p className="text-xs text-slate-500">{booking.phone} · {booking.field}</p>
                  {booking.paymentMethod && <p className="mt-1 text-xs font-medium text-blue-600">{booking.paymentMethod} · #{booking.reference}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right"><p className="font-semibold text-slate-900">{booking.amount}</p><p className={`text-xs font-medium ${booking.status === 'pending' ? 'text-amber-600' : booking.status === 'paid' ? 'text-blue-600' : 'text-green-700'}`}>{booking.status === 'pending' ? 'Chờ xác nhận' : booking.status === 'paid' ? 'Đã thanh toán' : 'Đã xác nhận'}</p></div>
                {booking.status === 'pending' ? (
                  <button onClick={() => confirmBooking(booking.id)} className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700">Xác nhận</button>
                ) : (
                  <button className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-white" aria-label="Xem chi tiết">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
