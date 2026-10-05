import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

const PAYMENT_METHODS = [
  { id: 'zalopay', name: 'ZaloPay', color: '#0068ff', emoji: '💳', desc: 'Thanh toán qua ví ZaloPay' },
  { id: 'momo', name: 'MoMo', color: '#ae2070', emoji: '💜', desc: 'Thanh toán qua ví MoMo' },
  { id: 'vnpay', name: 'VNPay', color: '#e31837', emoji: '🏦', desc: 'Thanh toán qua VNPay QR' },
  { id: 'card', name: 'Chuyển khoản', color: '#1a56db', emoji: '💰', desc: 'Chuyển thẳng đến chủ sân' },
];

type OwnerPaymentSettings = {
  bank: string;
  accountNumber: string;
  accountName: string;
  enabledMethods: string[];
  qrCodes: Record<string, string>;
};

function getOwnerPaymentSettings(): OwnerPaymentSettings {
  try {
    const saved = localStorage.getItem('sportbook-owner-payment');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        bank: parsed.bank ?? 'Vietcombank',
        accountNumber: parsed.accountNumber ?? '',
        accountName: parsed.accountName ?? '',
        enabledMethods: Array.isArray(parsed.enabledMethods) ? parsed.enabledMethods : PAYMENT_METHODS.map((method) => method.id),
        qrCodes: parsed.qrCodes ?? {},
      };
    }
  } catch {
    // Fall back to the prototype account below.
  }
  return {
    bank: 'Vietcombank',
    accountNumber: '0123456789',
    accountName: 'NGUYEN MINH HOANG',
    enabledMethods: PAYMENT_METHODS.map((method) => method.id),
    qrCodes: {},
  };
}

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingCheckout = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('sportbook-pending-checkout') ?? '{}');
    } catch {
      return {};
    }
  })();
  const state = (location.state as { slots?: string[]; date?: number; total?: number; field?: string }) || pendingCheckout;

  const fieldName = state.field || 'Sân Bóng Đá Phú Thọ';
  const slots = state.slots || ['17:00 - 18:30', '18:30 - 20:00'];
  const subtotal = state.total || 700000;
  const total = subtotal;

  const [ownerPayment] = useState(getOwnerPaymentSettings);
  const configuredMethods = PAYMENT_METHODS.filter((method) => ownerPayment.enabledMethods.includes(method.id));
  const availableMethods = configuredMethods.length > 0 ? configuredMethods : PAYMENT_METHODS.filter((method) => method.id === 'card');
  const [selectedMethod, setSelectedMethod] = useState(availableMethods[0].id);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paid, setPaid] = useState(false);
  const activeMethod = availableMethods.find((method) => method.id === selectedMethod) ?? availableMethods[0];
  const canConfirmTransfer = activeMethod.id === 'card' || Boolean(ownerPayment.qrCodes[activeMethod.id]);

  useEffect(() => {
    let isCustomer = false;
    try {
      isCustomer = JSON.parse(localStorage.getItem('sportbook-session') ?? '{}').role === 'customer';
    } catch {
      isCustomer = false;
    }
    if (!isCustomer) {
      navigate('/auth?redirect=/checkout&reason=checkout', { replace: true });
      return;
    }
    sessionStorage.removeItem('sportbook-pending-checkout');
  }, [navigate]);

  const discount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = total - discount;

  const handleApplyCode = () => {
    if (discountCode.toUpperCase() === 'SPORT10') setDiscountApplied(true);
    else alert('Mã giảm giá không hợp lệ. Hãy thử: SPORT10');
  };

  const confirmTransfer = () => {
    const [start = '17:00', end = '18:30'] = slots[0]?.split(' - ') ?? [];
    const pendingBooking = {
      id: Date.now(),
      start,
      end,
      customer: 'Khách hàng trực tuyến',
      phone: 'Đã xác thực',
      field: fieldName,
      amount: `${finalTotal.toLocaleString('vi-VN')}đ`,
      status: 'pending',
      paymentMethod: activeMethod.name,
      reference: 'SPB20260925',
    };
    try {
      const current = JSON.parse(localStorage.getItem('sportbook-owner-bookings') ?? '[]');
      localStorage.setItem('sportbook-owner-bookings', JSON.stringify([pendingBooking, ...current]));
    } catch {
      localStorage.setItem('sportbook-owner-bookings', JSON.stringify([pendingBooking]));
    }
    setPaid(true);
  };

  if (paid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
            Đã Gửi Xác Nhận!
          </h2>
          <p className="text-gray-500 text-sm mb-6">Chủ sân sẽ kiểm tra giao dịch và xác nhận lịch. Mã đặt sân: <strong className="text-green-700 font-mono">#SPB-20260925</strong></p>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-left text-sm mb-6 space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Sân:</span><span className="font-medium text-gray-900">{fieldName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Khung giờ:</span><span className="font-medium text-gray-900">{slots.join(', ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tổng tiền:</span><span className="font-bold text-green-700">{finalTotal.toLocaleString('vi-VN')}đ</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><span className="font-semibold text-amber-700">Chờ chủ sân xác nhận</span></div>
          </div>
          <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors">
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Quay lại
        </button>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
          Xác Nhận & Thanh Toán
        </h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          {[{ label: 'Chọn sân', done: true }, { label: 'Thanh toán', done: false, active: true }, { label: 'Xác nhận', done: false }].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 text-sm font-medium ${step.active ? 'text-green-700' : step.done ? 'text-gray-400' : 'text-gray-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.active ? 'bg-green-600 text-white' : step.done ? 'bg-gray-200 text-gray-500' : 'border-2 border-gray-200 text-gray-300'}`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block">{step.label}</span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Payment */}
        <div className="lg:col-span-3 space-y-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Phương Thức Thanh Toán</h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {availableMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{method.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{method.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">{method.desc}</div>
                  </div>
                  {selectedMethod === method.id && (
                    <svg className="w-4 h-4 text-green-600 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                  )}
                </button>
              ))}
            </div>

            <div className="border border-green-200 rounded-xl p-5 bg-green-50">
              <div className="grid items-center gap-5 sm:grid-cols-[10rem_1fr]">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-green-200 bg-white">
                  {activeMethod && ownerPayment.qrCodes[activeMethod.id] ? (
                    <img src={ownerPayment.qrCodes[activeMethod.id]} alt={`Mã QR ${activeMethod.name} của chủ sân`} className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="px-4 text-center">
                      <svg className="mx-auto h-10 w-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 0h2v2h-2v-2Zm3 0h2v5h-2v-5Z" /></svg>
                      <p className="mt-2 text-xs text-gray-500">Chủ sân chưa tải QR</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Chuyển thẳng đến chủ sân</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">Quét mã {activeMethod?.name}, nhập đúng số tiền và nội dung chuyển khoản.</p>
                  <div className="mt-3 space-y-1.5 rounded-lg bg-white p-3 text-xs">
                    {activeMethod?.id === 'card' ? (
                      <>
                        <div className="flex justify-between gap-3"><span className="text-gray-500">Ngân hàng</span><span className="font-semibold text-gray-800">{ownerPayment.bank}</span></div>
                        <div className="flex justify-between gap-3"><span className="text-gray-500">Số tài khoản</span><span className="font-mono font-semibold text-gray-800">{ownerPayment.accountNumber}</span></div>
                        <div className="flex justify-between gap-3"><span className="text-gray-500">Chủ tài khoản</span><span className="font-semibold text-gray-800">{ownerPayment.accountName}</span></div>
                      </>
                    ) : (
                      <div className="flex justify-between gap-3"><span className="text-gray-500">Người nhận</span><span className="font-semibold text-gray-800">{ownerPayment.accountName}</span></div>
                    )}
                    <div className="flex justify-between gap-3"><span className="text-gray-500">Nội dung</span><span className="font-mono font-semibold text-green-700">SPB20260925</span></div>
                  </div>
                  {!canConfirmTransfer && <p className="mt-2 text-xs font-medium text-amber-700">Phương thức này chưa có mã QR. Vui lòng chọn chuyển khoản hoặc phương thức khác.</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Discount Code */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">Mã Giảm Giá</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã giảm giá (thử: SPORT10)"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                disabled={discountApplied}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400 font-mono uppercase"
              />
              <button
                onClick={handleApplyCode}
                disabled={discountApplied || !discountCode}
                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {discountApplied ? '✓ Áp dụng' : 'Áp dụng'}
              </button>
            </div>
            {discountApplied && (
              <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                <span>✓</span> Đã áp dụng giảm 10% — tiết kiệm {discount.toLocaleString('vi-VN')}đ
              </p>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 py-4 flex-wrap">
            {[
              { icon: '🔒', text: 'SSL 256-bit' },
              { icon: '🛡️', text: 'Thanh toán bảo mật' },
              { icon: '↩️', text: 'Hoàn tiền 100%' },
              { icon: '📞', text: 'Hỗ trợ 24/7' },
            ].map(badge => (
              <div key={badge.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{badge.icon}</span>
                <span className="font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden sticky top-24">
            <div className="bg-gray-900 px-5 py-4">
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-xl font-bold text-white uppercase tracking-wide">Chi Tiết Đơn Hàng</h2>
            </div>

            <div className="p-5">
              {/* Field info */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1551854838-212c50b4c184?w=120&h=80&fit=crop&auto=format"
                  alt="Field"
                  className="w-16 h-12 rounded-xl object-cover bg-gray-100"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{fieldName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Quận 11, TP.HCM</p>
                  <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full border border-green-100">Bóng đá</span>
                </div>
              </div>

              {/* Booking details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày chơi</span>
                  <span className="font-medium text-gray-900">Thứ Sáu, 25/09/2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Khung giờ</span>
                  <div className="text-right">
                    {slots.map(s => <div key={s} className="font-medium text-gray-900">{s}</div>)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loại sân</span>
                  <span className="font-medium text-gray-900">Sân 7 người</span>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="text-gray-800">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-green-700">
                    <span>Giảm giá SPORT10 (-10%)</span>
                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-green-600 text-xl">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={confirmTransfer}
                disabled={!canConfirmTransfer}
                className="mt-5 w-full py-4 rounded-xl font-bold text-base text-white bg-green-600 hover:bg-green-700 transition-colors shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Tôi đã chuyển {finalTotal.toLocaleString('vi-VN')}đ
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Chủ sân sẽ kiểm tra giao dịch trước khi xác nhận lịch đặt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
