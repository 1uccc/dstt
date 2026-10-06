import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router';
import { auth } from '../../config/firebase';
import { Booking } from './Bookings';

interface Field {
  id: string;
  name: string;
  owner?: string;
  bookings?: number;
}

function MetricIcon({ type }: { type: string }) {
  const path = type === 'wallet'
    ? 'M4 7h16v12H4V7zm0 3h16M16 14h.01M7 7V5h10v2'
    : type === 'calendar'
      ? 'M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 011 1v14H4V6a1 1 0 011-1z'
      : type === 'chart'
        ? 'M4 19V9m6 10V5m6 14v-7m4 7H2'
        : 'M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z';
  return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} /></svg>;
}

export function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [currentUid, setCurrentUid] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setCurrentUid(user.uid);
      const sessionStr = localStorage.getItem('sportbook-session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          setOwnerName(session.name || '');
        } catch (e) {}
      }
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

  const myFields = fields.filter(f => f.owner === currentUid);
  
  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.date === today);
  const revenueToday = todaysBookings.filter(b => b.status !== 'pending').reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const METRICS = [
    { label: 'Doanh thu hôm nay', value: `${(revenueToday / 1000000).toFixed(1)} triệu`, change: 'Mới nhất', icon: 'wallet' },
    { label: 'Lịch đặt hôm nay', value: todaysBookings.length.toString(), change: 'Cả ngày', icon: 'calendar' },
    { label: 'Tổng số sân', value: myFields.length.toString(), change: 'Hoạt động', icon: 'chart' },
    { label: 'Chờ xác nhận', value: pendingCount.toString(), change: 'Cần xử lý', icon: 'clock' },
  ];

  // Calculate revenue chart data
  const revenueByDay = { 'T2': 0, 'T3': 0, 'T4': 0, 'T5': 0, 'T6': 0, 'T7': 0, 'CN': 0 };
  bookings.filter(b => b.status !== 'pending').forEach(b => {
    if (!b.date) return;
    const d = new Date(b.date);
    const dayIndex = d.getDay();
    const dayNames: (keyof typeof revenueByDay)[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    revenueByDay[dayNames[dayIndex]] += Number(b.amount || 0);
  });
  const REVENUE = Object.keys(revenueByDay).map(day => ({ day, value: revenueByDay[day as keyof typeof revenueByDay] }));
  const totalRevenue = REVENUE.reduce((sum, item) => sum + item.value, 0);

  const topBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-green-700 to-green-500 p-6 text-white shadow-lg shadow-green-900/10 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-green-100">Chào buổi sáng, {ownerName}</p>
          <p className="font-display text-3xl font-bold uppercase tracking-tight">Sân đã sẵn sàng cho một ngày bận rộn</p>
          <p className="mt-2 text-sm text-green-100">Hôm nay có {todaysBookings.length} lượt đặt, doanh thu {(revenueToday / 1000000).toFixed(1)} triệu đồng.</p>
        </div>
        <Link to="/owner/bookings" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-green-700 shadow-sm transition-transform hover:-translate-y-0.5">
          Xem lịch hôm nay
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric, index) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${index === 3 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-700'}`}>
                <MetricIcon type={metric.icon} />
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${index === 3 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>{metric.change}</span>
            </div>
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="font-display text-xl font-bold uppercase text-slate-900">Tổng doanh thu</p>
              <p className="text-sm text-slate-500">{(totalRevenue / 1000000).toFixed(1)} triệu đồng từ các đơn đã thanh toán/xác nhận</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">19 – 25 Tháng 9</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={REVENUE} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ownerRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-green-primary)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-green-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-slate-200)" strokeDasharray="4 4" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-slate-500)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-slate-500)', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}tr`} />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')}đ`, 'Doanh thu']} contentStyle={{ borderRadius: 12, borderColor: 'var(--color-slate-200)' }} />
              <Area type="monotone" dataKey="value" stroke="var(--color-green-primary)" strokeWidth={3} fill="url(#ownerRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-bold uppercase text-slate-900">Hiệu suất sân</p>
              <p className="text-sm text-slate-500">Tỷ lệ lấp đầy hôm nay</p>
            </div>
            <Link to="/owner/fields" className="text-xs font-semibold text-green-700 hover:text-green-800">Chi tiết</Link>
          </div>
          <div className="space-y-5">
            {myFields.map((field) => {
              const maxBookings = Math.max(10, Math.max(...myFields.map(f => f.bookings || 0)));
              const value = Math.round(((field.bookings || 0) / maxBookings) * 100);
              return (
                <div key={field.name}>
                  <div className="mb-2 flex items-end justify-between">
                    <div><p className="text-sm font-semibold text-slate-800">{field.name}</p><p className="text-xs text-slate-500">{field.bookings || 0} lượt</p></div>
                    <span className="font-display text-xl font-bold text-slate-900">{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-500" style={{ width: `${value}%` }} /></div>
                </div>
              );
            })}
            {myFields.length === 0 && (
              <p className="text-sm text-slate-500">Chưa có sân nào</p>
            )}
          </div>
          <div className="mt-6 rounded-xl bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Khung giờ cao điểm</p>
            <p className="mt-1 text-sm font-medium text-green-950">17:00 – 21:00 · Lấp đầy 96%</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><p className="font-display text-xl font-bold uppercase text-slate-900">Lịch sân hôm nay</p><p className="text-sm text-slate-500">5 lượt đặt tiếp theo</p></div>
          <Link to="/owner/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">Xem tất cả <span aria-hidden="true">→</span></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Khách hàng</th><th className="px-5 py-3">Sân</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {topBookings.map((booking) => {
                const tone = booking.status === 'pending' ? 'amber' : booking.status === 'paid' ? 'blue' : 'green';
                const statusLabel = booking.status === 'pending' ? 'Chờ duyệt' : booking.status === 'paid' ? 'Đã thanh toán' : 'Đã xác nhận';
                return (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4"><p className="font-mono font-semibold text-slate-900">{booking.time}</p><p className="text-xs text-slate-500">{booking.date}</p></td>
                    <td className="px-5 py-4 font-medium text-slate-800">{booking.customerName}</td>
                    <td className="px-5 py-4 text-slate-600">{booking.fieldName}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{statusLabel}</span></td>
                    <td className="px-5 py-4 text-right"><button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Chi tiết</button></td>
                  </tr>
                );
              })}
              {topBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Chưa có lịch đặt nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
