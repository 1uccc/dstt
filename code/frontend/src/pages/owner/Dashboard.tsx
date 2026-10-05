import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router';

const REVENUE = [
  { day: 'T2', value: 4200000 }, { day: 'T3', value: 5800000 }, { day: 'T4', value: 4900000 },
  { day: 'T5', value: 7200000 }, { day: 'T6', value: 8600000 }, { day: 'T7', value: 11400000 }, { day: 'CN', value: 9800000 },
];

const BOOKINGS = [
  { time: '06:00', duration: '90 phút', customer: 'Nguyễn Hải Nam', field: 'Sân 5A', status: 'Đã xác nhận', tone: 'green' },
  { time: '08:00', duration: '60 phút', customer: 'Trần Hoàng Long', field: 'Sân 7A', status: 'Đã xác nhận', tone: 'green' },
  { time: '15:30', duration: '90 phút', customer: 'Lê Minh Anh', field: 'Sân 5B', status: 'Chờ duyệt', tone: 'amber' },
  { time: '18:00', duration: '120 phút', customer: 'CLB Sao Mai', field: 'Sân 7A', status: 'Đã thanh toán', tone: 'blue' },
  { time: '20:30', duration: '90 phút', customer: 'Phạm Quốc Việt', field: 'Sân 5A', status: 'Đã xác nhận', tone: 'green' },
];

const METRICS = [
  { label: 'Doanh thu hôm nay', value: '9,8 triệu', change: '+12,5%', icon: 'wallet' },
  { label: 'Lịch đặt hôm nay', value: '18', change: '5 sắp tới', icon: 'calendar' },
  { label: 'Tỷ lệ lấp đầy', value: '78%', change: '+6,2%', icon: 'chart' },
  { label: 'Chờ xác nhận', value: '4', change: 'Cần xử lý', icon: 'clock' },
];

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
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-green-700 to-green-500 p-6 text-white shadow-lg shadow-green-900/10 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-green-100">Chào buổi sáng, Minh Hoàng</p>
          <p className="font-display text-3xl font-bold uppercase tracking-tight">Sân đã sẵn sàng cho một ngày bận rộn</p>
          <p className="mt-2 text-sm text-green-100">Hôm nay có 18 lượt đặt, dự kiến doanh thu 12,4 triệu đồng.</p>
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
              <p className="font-display text-xl font-bold uppercase text-slate-900">Doanh thu tuần này</p>
              <p className="text-sm text-slate-500">47,7 triệu đồng · tăng 14,2% so với tuần trước</p>
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
            {[
              { name: 'Sân 7A', bookings: '7 lượt', value: 92 },
              { name: 'Sân 5A', bookings: '6 lượt', value: 84 },
              { name: 'Sân 5B', bookings: '5 lượt', value: 67 },
            ].map((field) => (
              <div key={field.name}>
                <div className="mb-2 flex items-end justify-between">
                  <div><p className="text-sm font-semibold text-slate-800">{field.name}</p><p className="text-xs text-slate-500">{field.bookings}</p></div>
                  <span className="font-display text-xl font-bold text-slate-900">{field.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-500" style={{ width: `${field.value}%` }} /></div>
              </div>
            ))}
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
              {BOOKINGS.map((booking) => (
                <tr key={`${booking.time}-${booking.field}`} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><p className="font-mono font-semibold text-slate-900">{booking.time}</p><p className="text-xs text-slate-500">{booking.duration}</p></td>
                  <td className="px-5 py-4 font-medium text-slate-800">{booking.customer}</td>
                  <td className="px-5 py-4 text-slate-600">{booking.field}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${booking.tone === 'amber' ? 'bg-amber-50 text-amber-700' : booking.tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{booking.status}</span></td>
                  <td className="px-5 py-4 text-right"><button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Chi tiết</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
