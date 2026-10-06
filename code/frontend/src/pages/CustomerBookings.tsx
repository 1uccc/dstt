import { useState, useEffect } from 'react';

interface Booking {
  id: string;
  bookingCode: string;
  fieldName: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  paymentMethod: string;
}

export function CustomerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const res = await fetch('http://localhost:5000/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy lịch sử đặt sân:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải lịch sử đặt sân...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch Sử Đặt Sân</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có lượt đặt sân nào</h3>
          <p className="text-gray-500 text-sm">Bạn chưa thực hiện bất kỳ giao dịch đặt sân nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Mã đơn</th>
                  <th className="p-4 font-semibold">Sân / Thời gian</th>
                  <th className="p-4 font-semibold">Tổng tiền</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-medium text-gray-600">{booking.bookingCode || booking.id.slice(-6).toUpperCase()}</span>
                      <div className="text-xs text-gray-400 mt-1">{booking.paymentMethod}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{booking.fieldName}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{booking.date}</span>
                        <span className="px-1.5">•</span>
                        <span>{booking.time}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {booking.amount?.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-4">
                      {booking.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Chờ xác nhận
                        </span>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Đã xác nhận
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Đã hủy
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
