import { useMemo, useState } from 'react';

type BookingStatus = 'paid' | 'pending' | 'cancelled' | 'completed' | 'confirmed';

interface Booking {
  id: string;
  customer: string;
  phone: string;
  field: string;
  date: string;
  time: string;
  amount: number;
  status: BookingStatus;
}
import { useEffect } from 'react';

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  paid: { label: 'Đã thanh toán', className: 'border-green-200 bg-green-50 text-green-700' },
  pending: { label: 'Chờ thanh toán', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  cancelled: { label: 'Đã hủy', className: 'border-red-200 bg-red-50 text-red-600' },
  completed: { label: 'Hoàn thành', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  confirmed: { label: 'Đã xác nhận', className: 'border-blue-200 bg-blue-50 text-blue-700' },
};

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((b: any) => ({
            id: b._id || b.id,
            customer: b.customerName || 'Khách hàng',
            phone: b.phone || '09xx xxx xxx',
            field: b.fieldName || 'Sân thể thao',
            date: b.date,
            time: b.time,
            amount: b.amount,
            status: b.status
          }));
          setBookings(mapped);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    fetchBookings();
  }, []);

  const filtered = useMemo(() => bookings.filter((booking) => {
    const keyword = search.toLowerCase();
    const matchesSearch = booking.id.toLowerCase().includes(keyword)
      || booking.customer.toLowerCase().includes(keyword)
      || booking.field.toLowerCase().includes(keyword);
    return matchesSearch && (statusFilter === 'all' || booking.status === statusFilter);
  }), [bookings, search, statusFilter]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking));
        setSelected((current) => current?.id === id ? { ...current, status } : current);
        setNotice(`Đã cập nhật đơn #${id.slice(-4).toUpperCase()}.`);
      } else {
        const err = await res.json();
        setNotice(`Lỗi: ${err.message}`);
      }
    } catch (err) {
      setNotice('Lỗi kết nối khi cập nhật.');
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Mã đơn', 'Khách hàng', 'Sân', 'Ngày', 'Khung giờ', 'Giá', 'Trạng thái'],
      ...filtered.map((booking) => [
        booking.id, booking.customer, booking.field, booking.date, booking.time,
        String(booking.amount), STATUS[booking.status].label,
      ]),
    ];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh-sach-dat-san.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="font-semibold">Đóng</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Tổng đơn', bookings.length, 'text-slate-700 bg-slate-100'],
          ['Chờ xử lý', bookings.filter((item) => item.status === 'pending').length, 'text-amber-700 bg-amber-50'],
          ['Đã thanh toán', bookings.filter((item) => item.status === 'paid').length, 'text-green-700 bg-green-50'],
          ['Doanh thu', `${bookings.filter((item) => item.status !== 'cancelled').reduce((sum, item) => sum + item.amount, 0).toLocaleString('vi-VN')}đ`, 'text-blue-700 bg-blue-50'],
        ].map(([label, value, className]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Danh sách đặt sân</h2>
            <p className="mt-0.5 text-xs text-slate-500">{filtered.length} kết quả phù hợp</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" strokeWidth="2" /><path d="m16 16 4 4" strokeWidth="2" />
              </svg>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn, khách, sân..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-500 sm:w-64" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | BookingStatus)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-green-500">
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
            </select>
            <button onClick={exportCsv} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" /></svg>
              Xuất CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>{['Mã đơn', 'Khách hàng', 'Sân & thời gian', 'Giá', 'Trạng thái', 'Thao tác'].map((title) => <th key={title} className="whitespace-nowrap px-4 py-3 text-left font-semibold">{title}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">#{booking.id.slice(-4).toUpperCase()}</td>
                  <td className="px-4 py-4">
                    <p className="whitespace-nowrap font-medium text-slate-900">{booking.customer}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{booking.phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="whitespace-nowrap text-slate-700">{booking.field}</p>
                    <p className="mt-0.5 whitespace-nowrap text-xs text-slate-400">{booking.date} · {booking.time}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{booking.amount?.toLocaleString('vi-VN')}đ</td>
                  <td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS[booking.status]?.className || STATUS['pending'].className}`}>{STATUS[booking.status]?.label || 'Chờ xác nhận'}</span></td>
                  <td className="px-4 py-4">
                    <button onClick={() => setSelected(booking)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-10 text-center text-sm text-slate-500">Không tìm thấy đơn đặt sân phù hợp.</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div><p className="text-xs text-slate-400">Chi tiết đơn</p><h2 className="font-semibold text-slate-900">#{selected.id.slice(-4).toUpperCase()}</h2></div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Đóng"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="m6 6 12 12M18 6 6 18" /></svg></button>
            </div>
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-400">Khách hàng</p><p className="mt-1 font-medium text-slate-800">{selected.customer}</p><p className="text-xs text-slate-500">{selected.phone}</p></div>
                <div><p className="text-xs text-slate-400">Tổng thanh toán</p><p className="mt-1 text-lg font-bold text-slate-900">{selected.amount?.toLocaleString('vi-VN')}đ</p></div>
                <div className="col-span-2 rounded-xl bg-slate-50 p-4"><p className="font-medium text-slate-800">{selected.field}</p><p className="mt-1 text-xs text-slate-500">{selected.date} · {selected.time}</p></div>
              </div>
              <div>
                <label htmlFor="booking-status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Cập nhật trạng thái</label>
                <select id="booking-status" value={selected.status} onChange={(event) => updateStatus(selected.id, event.target.value as BookingStatus)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-500">
                  {Object.entries(STATUS).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
