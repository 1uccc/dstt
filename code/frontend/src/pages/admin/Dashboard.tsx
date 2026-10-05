import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router';

const REVENUE_DATA = [
  { date: '1/9', revenue: 12400000 }, { date: '3/9', revenue: 15800000 }, { date: '5/9', revenue: 14200000 },
  { date: '7/9', revenue: 18600000 }, { date: '9/9', revenue: 21000000 }, { date: '11/9', revenue: 17400000 },
  { date: '13/9', revenue: 23800000 }, { date: '15/9', revenue: 26200000 }, { date: '17/9', revenue: 22100000 },
  { date: '19/9', revenue: 28900000 }, { date: '21/9', revenue: 32400000 }, { date: '23/9', revenue: 29800000 },
  { date: '25/9', revenue: 35600000 },
];

const SPORT_DATA = [
  { name: 'Bóng đá', value: 52 },
  { name: 'Tennis', value: 21 },
  { name: 'Cầu lông', value: 14 },
  { name: 'Bóng rổ', value: 8 },
  { name: 'Pickleball', value: 5 },
];

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

const RECENT_BOOKINGS = [
  { id: '#SPB-1091', user: 'Nguyễn Văn An', field: 'Sân Bóng Đá Phú Thọ', datetime: '25/09/2026 · 17:00', price: 350000, status: 'paid' },
  { id: '#SPB-1090', user: 'Trần Thị Bích', field: 'Tennis Center Thảo Điền', datetime: '25/09/2026 · 15:30', price: 280000, status: 'pending' },
  { id: '#SPB-1089', user: 'Lê Minh Cường', field: 'Cầu Lông SportZone', datetime: '25/09/2026 · 07:00', price: 150000, status: 'paid' },
  { id: '#SPB-1088', user: 'Phạm Thu Dung', field: 'Sân Bóng Rổ Landmark', datetime: '24/09/2026 · 20:00', price: 200000, status: 'cancelled' },
  { id: '#SPB-1087', user: 'Hoàng Văn Em', field: 'Sân 7 Người Hòa Bình', datetime: '24/09/2026 · 19:00', price: 420000, status: 'paid' },
  { id: '#SPB-1086', user: 'Vũ Thị Phương', field: 'Sân Pickleball Sky Garden', datetime: '24/09/2026 · 16:00', price: 180000, status: 'pending' },
];

const STATUS_CONFIG = {
  paid: { label: 'Đã thanh toán', cls: 'bg-green-100 text-green-700 border border-green-200' },
  pending: { label: 'Chờ thanh toán', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-600 border border-red-200' },
};

const METRICS = [
  {
    label: 'Doanh Thu Tháng 9',
    value: '248,600,000đ',
    change: '+18.4%',
    positive: true,
    icon: '💰',
    sub: 'so với tháng trước',
    sparkData: [12, 19, 14, 25, 22, 30, 28, 36],
  },
  {
    label: 'Đặt Sân Đang Hoạt Động',
    value: '143',
    change: '+23',
    positive: true,
    icon: '📋',
    sub: 'hôm nay',
    sparkData: [40, 55, 48, 70, 65, 80, 90, 143],
  },
  {
    label: 'Tổng Số Sân',
    value: '42',
    change: '+3',
    positive: true,
    icon: '🏟️',
    sub: 'sân mới tháng này',
    sparkData: [30, 32, 33, 35, 36, 38, 40, 42],
  },
  {
    label: 'Người Dùng Mới',
    value: '1,284',
    change: '+12.1%',
    positive: true,
    icon: '👥',
    sub: 'trong 30 ngày qua',
    sparkData: [800, 900, 950, 1050, 1100, 1180, 1240, 1284],
  },
];

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 36;
  const width = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#16a34a' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatRevenue(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{m.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 leading-none">{m.value}</p>
              </div>
              <div className="text-2xl">{m.icon}</div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-xs font-semibold ${m.positive ? 'text-green-600' : 'text-red-500'}`}>{m.change}</span>
                <span className="text-xs text-gray-400 ml-1">{m.sub}</span>
              </div>
              <Sparkline data={m.sparkData} positive={m.positive} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Line Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Doanh Thu 30 Ngày Qua</h2>
              <p className="text-xs text-gray-500 mt-0.5">Cập nhật theo ngày</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-green-500">
              <option>Tháng 9, 2026</option>
              <option>Tháng 8, 2026</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatRevenue} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#16a34a' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900">Đặt Sân Theo Môn</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tỷ lệ phần trăm</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={SPORT_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {SPORT_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {SPORT_DATA.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Đặt Sân Gần Đây</h2>
            <p className="text-xs text-gray-500 mt-0.5">6 giao dịch mới nhất</p>
          </div>
          <Link to="/admin/bookings" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
            Xem tất cả
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Mã ĐS', 'Khách Hàng', 'Sân', 'Ngày/Giờ', 'Giá', 'Trạng Thái'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_BOOKINGS.map((b, i) => {
                const status = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === RECENT_BOOKINGS.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-gray-500">{b.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
                          {b.user.split(' ').pop()![0]}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">{b.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{b.field}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap font-mono text-xs">{b.datetime}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">{b.price.toLocaleString('vi-VN')}đ</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
