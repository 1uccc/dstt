import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { PaymentContext, PaymentResult } from '../patterns/strategy/payment';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { PaymentModal } from '../components/checkout/PaymentModal';
import { AlertModal, AlertModalProps } from '../components/common/AlertModal';
import { apiClient } from '../utils/apiClient';
import { Field, OwnerPaymentSettings, UserSession, Booking } from '../types';

const DEFAULT_PAYMENT: OwnerPaymentSettings = {
  bank: 'Vietcombank',
  accountNumber: '0123456789',
  accountName: 'NGUYEN MINH HOANG',
  momoPhone: '',
  momoName: '',
  enabledMethods: ['card', 'momo', 'vnpay', 'zalopay'],
  qrCodes: {},
};

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Khởi tạo Strategy Context
  const paymentContext = useMemo(() => new PaymentContext('card'), []);

  // Lấy dữ liệu đặt sân từ router state hoặc storage
  const [bookingState] = useState<{
    slots?: string[];
    date?: string | number;
    total?: number;
    field?: string;
    fieldId?: string;
    customerName?: string;
    customerPhone?: string;
  } | null>(() => {
    if (location.state && typeof location.state === 'object' && Object.keys(location.state).length > 0) {
      const s = location.state as any;
      if (s.slots && s.slots.length > 0) {
        try {
          localStorage.setItem('sportbook-pending-checkout', JSON.stringify(s));
          sessionStorage.setItem('sportbook-pending-checkout', JSON.stringify(s));
        } catch {}
        return s;
      }
    }
    try {
      const stored = localStorage.getItem('sportbook-pending-checkout') || sessionStorage.getItem('sportbook-pending-checkout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.slots && parsed.slots.length > 0) return parsed;
      }
    } catch {}
    return null;
  });

  const fieldName = bookingState?.field || '';
  const fieldId = bookingState?.fieldId || '';
  const slots = bookingState?.slots || [];
  const dateObj = new Date();
  const dateString = bookingState?.date
    ? String(bookingState.date)
    : `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  const total = bookingState?.total || 0;

  const [fieldData, setFieldData] = useState<Field | null>(null);
  const [ownerPayment, setOwnerPayment] = useState<OwnerPaymentSettings>(DEFAULT_PAYMENT);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [session, setSession] = useState<UserSession | null>(null);
  const [transferReference] = useState(() => 'SPB' + Date.now().toString().slice(-6).toUpperCase());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paid, setPaid] = useState(false);
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [alertConfig, setAlertConfig] = useState<Omit<AlertModalProps, 'onClose'> | null>(null);

  // 1. Kiểm tra quyền truy cập (Chỉ Khách hàng mới được đặt sân) & Nạp thông tin người đặt
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sportbook-session') ?? '{}');
      if (stored.role === 'owner') {
        setAlertConfig({
          isOpen: true,
          type: 'warning',
          title: 'Tài Khoản Không Phù Hợp',
          message: 'Tài khoản Chủ sân không thể thực hiện đặt sân.\nVui lòng đăng nhập bằng tài khoản Khách hàng để tiếp tục.',
          primaryButtonText: 'Đăng Nhập Khách Hàng',
          onPrimary: () => navigate('/auth?redirect=/checkout&reason=checkout', { replace: true }),
        });
        return;
      }
      if (stored.role !== 'customer') {
        navigate('/auth?redirect=/checkout&reason=checkout', { replace: true });
        return;
      }
      setSession(stored);
      
      const initialName = bookingState?.customerName || stored.name || '';
      const initialPhone = bookingState?.customerPhone || stored.phone || '';
      if (initialName) setCustomerName(initialName);
      if (initialPhone) setCustomerPhone(initialPhone);

      // Tự động gọi API lấy profile mới nhất từ server để nạp đầy đủ Tên & Số điện thoại
      apiClient.get<any>('/api/users/profile')
        .then((profile) => {
          if (profile) {
            if (profile.fullName && (!initialName || initialName === stored.email)) {
              setCustomerName(profile.fullName);
            }
            if (profile.phone) {
              setCustomerPhone(profile.phone);
              const updated = { ...stored, phone: profile.phone, name: profile.fullName || stored.name };
              localStorage.setItem('sportbook-session', JSON.stringify(updated));
            }
          }
        })
        .catch(() => {});
    } catch {
      navigate('/auth?redirect=/checkout&reason=checkout', { replace: true });
    }
  }, [navigate, bookingState]);

  // 2. Tải thông tin sân và cấu hình thanh toán của chủ sân
  useEffect(() => {
    if (!fieldId) return;

    async function loadFieldAndOwner() {
      try {
        const field = await apiClient.get<Field>(`/api/fields/${fieldId}`);
        setFieldData(field);

        if (field?.owner) {
          const settings = await apiClient.get<OwnerPaymentSettings>(`/api/settings/payment/${field.owner}`).catch(() => DEFAULT_PAYMENT);
          setOwnerPayment(settings || DEFAULT_PAYMENT);
        }
      } catch (err) {
        console.error('Lỗi tải thông tin thanh toán:', err);
      }
    }

    loadFieldAndOwner();
  }, [fieldId]);

  // 3. Cập nhật Strategy khi người dùng chọn phương thức
  const handleSelectStrategy = (methodId: string) => {
    setSelectedMethod(methodId);
    paymentContext.setStrategy(methodId);
  };

  // 4. Sinh dữ liệu thanh toán thông qua Strategy Pattern
  const paymentResult: PaymentResult = useMemo(() => {
    paymentContext.setStrategy(selectedMethod);
    return paymentContext.executePayment({
      amount: total,
      bookingCode: transferReference,
      fieldId,
      fieldName,
      customerName: customerName || session?.name || 'Khách hàng',
      phone: customerPhone || session?.phone || '',
      ownerSettings: ownerPayment,
    });
  }, [paymentContext, selectedMethod, total, transferReference, fieldId, fieldName, customerName, session, customerPhone, ownerPayment]);

  // Mở modal thanh toán có kiểm tra dữ liệu bắt buộc
  const handleOpenPayment = () => {
    if (!customerName.trim()) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu Thông Tin Người Đặt',
        message: 'Vui lòng nhập Họ và tên người đặt sân trước khi thanh toán.',
        primaryButtonText: 'Đã hiểu',
      });
      return;
    }
    if (!customerPhone.trim()) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu Số Điện Thoại',
        message: 'Vui lòng nhập Số điện thoại liên hệ để chủ sân có thể xác nhận đơn đặt sân.',
        primaryButtonText: 'Đã hiểu',
      });
      return;
    }
    setIsModalOpen(true);
  };

  // 5. Xác nhận hoàn tất thanh toán & Lưu Booking
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName || session?.name || 'Khách hàng',
        phone: customerPhone || session?.phone || '',
        fieldId,
        date: dateString,
        time: slots.join(', '),
        amount: total,
        paymentMethod: paymentContext.getStrategy().name,
        reference: transferReference,
        note: customerNote,
      };

      const res = await apiClient.post<{ message: string; booking: Booking }>('/api/bookings', payload);
      setBookingResult(res.booking);
      setPaid(true);
      setIsModalOpen(false);

      try {
        localStorage.removeItem('sportbook-pending-checkout');
        sessionStorage.removeItem('sportbook-pending-checkout');
      } catch {}
    } catch (err: any) {
      setIsModalOpen(false);
      const msg = err.message || 'Lỗi khi đặt sân. Vui lòng thử lại.';
      const isConflict = msg.includes('đã được đặt') || msg.includes('chờ xác nhận') || msg.includes('SLOT_ALREADY_BOOKED');

      setAlertConfig({
        isOpen: true,
        type: isConflict ? 'warning' : 'error',
        title: isConflict ? 'Khung Giờ Đã Có Người Đặt' : 'Không Thể Đặt Sân',
        message: isConflict
          ? 'Khung giờ bạn vừa chọn đã có khách hàng khác đặt hoặc đang chờ xác nhận.\nVui lòng chọn khung giờ khác hoặc đổi ngày đặt.'
          : msg,
        primaryButtonText: isConflict ? 'Chọn Khung Giờ Khác' : 'Thử Lại',
        secondaryButtonText: isConflict ? 'Đóng' : undefined,
        onPrimary: isConflict ? () => navigate(`/field/${fieldId}`) : () => setAlertConfig(null),
        onSecondary: () => setAlertConfig(null),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingState || slots.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 uppercase mb-2">Chưa có thông tin đặt sân</h2>
          <p className="text-sm text-gray-500 mb-6">Bạn chưa chọn sân hoặc khung giờ nào để thanh toán. Vui lòng chọn sân trước khi tiếp tục.</p>
          <Link
            to="/search"
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition shadow-lg shadow-green-600/30"
          >
            Tìm Sân Thể Thao →
          </Link>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
            Đã Gửi Đơn Đặt Sân!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Chủ sân sẽ kiểm tra giao dịch và xác nhận lịch. Mã đơn:{' '}
            <strong className="text-green-700 font-mono">#{bookingResult?.bookingCode || transferReference}</strong>
          </p>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-left text-sm mb-6 space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Sân:</span><span className="font-semibold text-gray-900">{fieldName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Ngày thi đấu:</span><span className="font-medium text-gray-900">{dateString}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Khung giờ:</span><span className="font-medium text-gray-900">{slots.join(', ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tổng thanh toán:</span><span className="font-bold text-green-700">{total.toLocaleString('vi-VN')}đ</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><span className="font-bold text-amber-600">Chờ xác nhận</span></div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/bookings')}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors shadow-sm"
            >
              Xem Lịch Sử Đặt Sân
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Xác Nhận & Thanh Toán</h1>
        <p className="text-sm text-gray-500 mt-1">Hoàn tất thông tin đặt sân và thanh toán tiện lợi qua cổng trực tuyến</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          {/* Thông tin người đặt */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Thông tin người đặt sân
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú cho chủ sân</label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Yêu cầu mang thêm áo pitch, chuẩn bị bóng..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Lựa chọn phương thức thanh toán (Strategy Selector) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
            <PaymentMethodSelector
              strategies={paymentContext.getAllStrategies()}
              selectedId={selectedMethod}
              onSelect={handleSelectStrategy}
              enabledMethods={ownerPayment.enabledMethods}
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Action */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <OrderSummary
            field={fieldData}
            slots={slots}
            dateStr={dateString}
            total={total}
          />

          <button
            type="button"
            onClick={handleOpenPayment}
            className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-base shadow-lg shadow-green-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Tiến Hành Thanh Toán</span>
            <span>→</span>
          </button>
          <p className="text-center text-xs text-gray-400">
            🔒 Giao dịch an toàn & được bảo vệ bởi SportBook
          </p>
        </div>
      </div>

      {/* Payment Modal hiển thị QR & thông tin chuyển khoản từ Strategy */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBooking}
        isSubmitting={isSubmitting}
        paymentResult={paymentResult}
        amount={total}
      />

      {/* Modal Thông Báo / Cảnh Báo Hiện Đại */}
      {alertConfig && (
        <AlertModal
          {...alertConfig}
          isOpen={Boolean(alertConfig.isOpen)}
          onClose={() => setAlertConfig(null)}
        />
      )}
    </div>
  );
}
