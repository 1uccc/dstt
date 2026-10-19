import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCreatedAt } from '../utils/date';
import { apiClient } from '../utils/apiClient';
import { Booking } from '../types';

export function CustomerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('sportbook-session') ?? '{}');
      if (session.role === 'owner') {
        navigate('/owner/bookings', { replace: true });
        return;
      }
    } catch {}

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await apiClient.get<Booking[]>('/api/bookings');
        setBookings(data || []);
      } catch (err) {
        console.error('Lỗi lấy danh sách booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này?')) return;
    try {
      await apiClient.put(`/api/bookings/${bookingId}/status`, { status: 'cancelled' });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể hủy đơn đặt sân.';
      alert(msg);
    }
  };

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
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-medium text-gray-600">{booking.bookingCode || booking.reference || `#${booking.id.slice(-6).toUpperCase()}`}</span>
                      <div className="text-xs text-gray-400 mt-1">{booking.paymentMethod || 'Tại sân'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{booking.fieldName}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{booking.date}</span>
                        <span className="px-1.5">•</span>
                        <span>{booking.time}</span>
                      </div>
                      {booking.note && (
                        <div className="mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-1 max-w-[260px]">
                          <span className="font-semibold text-amber-800 shrink-0">Ghi chú:</span>
                          <span className="truncate">{booking.note}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {booking.amount?.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            Hủy đơn
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal for Customer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Chi tiết đặt sân</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                  {(selectedBooking.customerName || 'K').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedBooking.customerName || 'Khách hàng'}</p>
                  {selectedBooking.phone && <p className="text-sm text-slate-500">{selectedBooking.phone}</p>}
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Sân:</span>
                  <span className="font-semibold text-slate-900 text-sm text-right">{selectedBooking.fieldName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Thời gian:</span>
                  <span className="font-medium text-slate-900 text-sm">{selectedBooking.time} · {selectedBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Thời gian đặt:</span>
                  <span className="font-semibold text-blue-600 text-sm">{formatCreatedAt(selectedBooking.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Thanh toán:</span>
                  <span className="font-medium text-slate-900 text-sm">{selectedBooking.paymentMethod || 'Tại sân'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Mã đơn:</span>
                  <span className="font-mono text-slate-900 text-sm">#{selectedBooking.bookingCode || selectedBooking.reference || selectedBooking.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Trạng thái:</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              {/* Customer Note Section */}
              {selectedBooking.note ? (
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span>Ghi chú của bạn:</span>
                  </div>
                  <p className="text-slate-800 font-medium bg-white/90 p-2.5 rounded-lg border border-amber-100 whitespace-pre-wrap leading-relaxed shadow-xs">
                    {selectedBooking.note}
                  </p>
                </div>
              ) : null}
              
              <div className="border-t border-dashed border-slate-200 pt-4 mt-4 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Tổng tiền</span>
                <span className="font-bold text-xl text-green-600">{(selectedBooking.amount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              {selectedBooking.status === 'pending' && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Hủy đơn
                </button>
              )}
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="flex-1 py-2.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
