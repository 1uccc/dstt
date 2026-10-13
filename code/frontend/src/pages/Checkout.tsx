import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { generateVietQRUrl } from '../utils/vietqr';
import { generateMoMoLink, generateMoMoQRUrl } from '../utils/momo';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Chuyển khoản (VietQR)', color: '#1a56db', emoji: '⚡', desc: 'Tự điền số tiền sân & mã đơn' },
  { id: 'momo', name: 'Ví MoMo (Tự động)', color: '#ae2070', emoji: '💜', desc: 'Tự điền số tiền sân & mở MoMo' },
  { id: 'vnpay', name: 'VNPay', color: '#e31837', emoji: '🏦', desc: 'Thanh toán qua VNPay QR' },
  { id: 'zalopay', name: 'ZaloPay', color: '#0068ff', emoji: '💳', desc: 'Thanh toán qua ví ZaloPay' },
];

type OwnerPaymentSettings = {
  bank: string;
  accountNumber: string;
  accountName: string;
  momoPhone?: string;
  momoName?: string;
  enabledMethods: string[];
  qrCodes: Record<string, string>;
};

interface FieldData {
  id?: string;
  name?: string;
  location?: string;
  address?: string;
  sport?: string;
  price?: number;
  image?: string;
  images?: string[];
  owner?: string;
  [key: string]: any;
}

interface SessionData {
  role?: string;
  name?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

interface BookingResult {
  bookingCode?: string;
  id?: string;
  [key: string]: any;
}

const DEFAULT_PAYMENT: OwnerPaymentSettings = {
  bank: 'Vietcombank',
  accountNumber: '0123456789',
  accountName: 'NGUYEN MINH HOANG',
  momoPhone: '',
  momoName: '',
  enabledMethods: PAYMENT_METHODS.map((method) => method.id),
  qrCodes: {},
};

async function fetchOwnerPaymentSettings(uid: string): Promise<OwnerPaymentSettings> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/payment/${uid}`);
    if (res.ok) {
      const parsed = await res.json();
      return {
        bank: parsed.bank || 'Vietcombank',
        accountNumber: parsed.accountNumber || '',
        accountName: parsed.accountName || '',
        momoPhone: parsed.momoPhone || '',
        momoName: parsed.momoName || '',
        enabledMethods: Array.isArray(parsed.enabledMethods) && parsed.enabledMethods.length > 0 ? parsed.enabledMethods : DEFAULT_PAYMENT.enabledMethods,
        qrCodes: parsed.qrCodes || {},
      };
    }
  } catch {}
  return DEFAULT_PAYMENT;
}

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookingState] = useState<{
    slots?: string[];
    date?: string | number;
    total?: number;
    field?: string;
    fieldId?: string;
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
      const stored = localStorage.getItem('sportbook-pending-checkout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.slots && parsed.slots.length > 0) return parsed;
      }
    } catch {}
    try {
      const storedSession = sessionStorage.getItem('sportbook-pending-checkout');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed.slots && parsed.slots.length > 0) return parsed;
      }
    } catch {}
    return null;
  });

  const fieldName = bookingState?.field || '';
  const fieldId = bookingState?.fieldId || '';
  const slots = bookingState?.slots || [];
  const dateObj = new Date();
  
  // state.date is now a YYYY-MM-DD string, if not provided, fallback to today
  const dateString = bookingState?.date 
    ? String(bookingState.date) 
    : `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  const subtotal = bookingState?.total || 0;
  const total = subtotal;

  const [ownerPayment, setOwnerPayment] = useState<OwnerPaymentSettings>(DEFAULT_PAYMENT);
  const [fieldData, setFieldData] = useState<FieldData | null>(null);
  
  useEffect(() => {
    async function fetchOwner() {
      if (fieldId) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fields/${fieldId}`);
          if (res.ok) {
            const data = await res.json();
            setFieldData(data);
            if (data.owner) {
              const paymentSettings = await fetchOwnerPaymentSettings(data.owner);
              setOwnerPayment(paymentSettings);
            }
          }
        } catch (e) {}
      }
    }
    fetchOwner();
  }, [fieldId]);

  const configuredMethods = PAYMENT_METHODS.filter((method) => ownerPayment.enabledMethods.includes(method.id));
  const availableMethods = configuredMethods.length > 0 ? configuredMethods : PAYMENT_METHODS.filter((method) => method.id === 'card');
  const [selectedMethod, setSelectedMethod] = useState(availableMethods[0].id);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paid, setPaid] = useState(false);
  const activeMethod = availableMethods.find((method) => method.id === selectedMethod) ?? availableMethods[0];
  const [session, setSession] = useState<SessionData | null>(null);
  const [transferReference] = useState('SPB' + Date.now().toString().slice(-6).toUpperCase());
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    let isCustomer = false;
    let role: string | null = null;
    try {
      const stored = JSON.parse(localStorage.getItem('sportbook-session') ?? '{}');
      role = stored.role || null;
      isCustomer = stored.role === 'customer';
      setSession(stored);
    } catch {
      isCustomer = false;
    }
    if (role === 'owner') {
      alert('Tài khoản Chủ sân không thể thực hiện đặt sân. Vui lòng đăng nhập bằng tài khoản Khách hàng.');
      navigate('/', { replace: true });
      return;
    }
    if (!isCustomer) {
      navigate('/auth?redirect=/checkout&reason=checkout', { replace: true });
      return;
    }
  }, [navigate]);

  const discount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = total - discount;

  const isBankTransfer = activeMethod.id === 'card';
  const isMoMo = activeMethod.id === 'momo';
  const hasValidCardAccount = Boolean(ownerPayment.accountNumber?.trim());
  const hasValidMoMo = Boolean(ownerPayment.momoPhone?.trim());

  const canConfirmTransfer = isBankTransfer
    ? hasValidCardAccount
    : isMoMo
      ? hasValidMoMo || Boolean(ownerPayment.qrCodes['momo'])
      : Boolean(ownerPayment.qrCodes[activeMethod.id]);

  const dynamicVietQrUrl = isBankTransfer && hasValidCardAccount
    ? generateVietQRUrl({
        bank: ownerPayment.bank,
        accountNumber: ownerPayment.accountNumber,
        accountName: ownerPayment.accountName,
        amount: finalTotal,
        description: transferReference,
        template: 'compact2',
      })
    : '';

  const dynamicMoMoUrl = isMoMo && hasValidMoMo
    ? generateMoMoQRUrl({
        phone: ownerPayment.momoPhone!,
        amount: finalTotal,
        note: transferReference,
        name: ownerPayment.momoName || ownerPayment.accountName,
      })
    : (ownerPayment.qrCodes['momo'] || '');

  const moMoDirectLink = isMoMo && hasValidMoMo
    ? generateMoMoLink({
        phone: ownerPayment.momoPhone!,
        amount: finalTotal,
        note: transferReference,
      })
    : '';

  const handleApplyCode = () => {
    if (discountCode.toUpperCase() === 'SPORT10') setDiscountApplied(true);
    else alert('Mã giảm giá không hợp lệ. Hãy thử: SPORT10');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmTransfer = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập.');
      setIsSubmitting(false);
      return;
    }

    if (session?.role === 'owner') {
      alert('Tài khoản Chủ sân không thể thực hiện đặt sân. Vui lòng sử dụng tài khoản Khách hàng.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      customerName: session?.name || 'Khách hàng',
      phone: session?.phone || '',
      fieldId: fieldId,
      date: dateString,
      time: slots.join(', '),
      amount: finalTotal,
      paymentMethod: activeMethod.name,
      reference: transferReference,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setBookingResult(data.booking);
        setPaid(true);
        try {
          localStorage.removeItem('sportbook-pending-checkout');
          sessionStorage.removeItem('sportbook-pending-checkout');
        } catch {}
      } else {
        const data = await res.json();
        alert('Lỗi đặt sân: ' + data.message);
      }
    } catch (err) {
      alert('Lỗi kết nối.');
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
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-2xl font-bold text-gray-900 uppercase mb-2">Chưa có thông tin đặt sân</h2>
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
          <p className="text-gray-500 text-sm mb-6">Chủ sân sẽ kiểm tra giao dịch và xác nhận lịch. Mã đặt sân: <strong className="text-green-700 font-mono">#{bookingResult?.bookingCode || transferReference}</strong></p>
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

            <div className={`border rounded-2xl p-5 ${
              isMoMo ? 'border-pink-200 bg-pink-50/70' : 'border-green-200 bg-green-50/70'
            }`}>
              <div className="grid items-center gap-6 sm:grid-cols-[11.5rem_1fr]">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border bg-white p-2 shadow-sm border-gray-200">
                    {isBankTransfer ? (
                      dynamicVietQrUrl ? (
                        <img
                          src={dynamicVietQrUrl}
                          alt="Mã VietQR chuyển khoản"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="px-3 text-center">
                          <svg className="mx-auto h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <p className="mt-1 text-xs font-semibold text-gray-700">Chưa có STK</p>
                        </div>
                      )
                    ) : isMoMo ? (
                      dynamicMoMoUrl ? (
                        <img
                          src={dynamicMoMoUrl}
                          alt="Mã QR MoMo thanh toán"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="px-3 text-center">
                          <svg className="mx-auto h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <p className="mt-1 text-xs font-semibold text-gray-700">Chưa có SĐT MoMo</p>
                        </div>
                      )
                    ) : ownerPayment.qrCodes[activeMethod.id] ? (
                      <img
                        src={ownerPayment.qrCodes[activeMethod.id]}
                        alt={`Mã QR ${activeMethod.name} của chủ sân`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="px-3 text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 0h2v2h-2v-2Zm3 0h2v5h-2v-5Z" /></svg>
                        <p className="mt-1 text-xs text-gray-500">Chủ sân chưa tải QR</p>
                      </div>
                    )}
                  </div>

                  {isBankTransfer && dynamicVietQrUrl && (
                    <a
                      href={dynamicVietQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 hover:underline"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Mở / Tải ảnh QR
                    </a>
                  )}

                  {isMoMo && (
                    <div className="mt-2.5 flex flex-col items-center gap-1.5 w-full">
                      {moMoDirectLink && (
                        <a
                          href={moMoDirectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-pink-700 transition"
                        >
                          <span>Mở App MoMo</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}
                      {dynamicMoMoUrl && (
                        <a
                          href={dynamicMoMoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 hover:underline"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Tải ảnh QR
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      {isBankTransfer
                        ? 'Chuyển khoản VietQR 24/7'
                        : isMoMo
                          ? 'Ví MoMo (Tự động điền tiền)'
                          : `Chuyển thẳng đến chủ sân (${activeMethod?.name})`}
                    </p>
                    {isBankTransfer && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                        Napas 247
                      </span>
                    )}
                    {isMoMo && (
                      <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-pink-700">
                        MoMo Tự động
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    {isBankTransfer
                      ? 'Quét mã bằng App ngân hàng bất kỳ. Số tiền và nội dung đã được điền tự động chính xác!'
                      : isMoMo
                        ? 'Quét mã để app MoMo tự mở và điền sẵn số tiền cùng mã đơn hàng.'
                        : `Quét mã ${activeMethod?.name}, nhập đúng số tiền và nội dung chuyển khoản bên dưới.`}
                  </p>

                  <div className="mt-3 space-y-2 rounded-xl bg-white p-3.5 text-xs shadow-xs border border-gray-100">
                    {isBankTransfer ? (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Ngân hàng</span>
                          <span className="font-semibold text-gray-800">{ownerPayment.bank}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Số tài khoản</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-gray-900">{ownerPayment.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(ownerPayment.accountNumber, 'acc')}
                              className="rounded px-2 py-0.5 text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                            >
                              {copiedField === 'acc' ? '✓ Đã chép' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Chủ tài khoản</span>
                          <span className="font-semibold text-gray-800 uppercase">{ownerPayment.accountName}</span>
                        </div>
                      </>
                    ) : isMoMo ? (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Số điện thoại MoMo</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-gray-900">{ownerPayment.momoPhone || 'Chưa cài đặt'}</span>
                            {ownerPayment.momoPhone && (
                              <button
                                type="button"
                                onClick={() => handleCopy(ownerPayment.momoPhone!, 'momoPhone')}
                                className="rounded px-2 py-0.5 text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                              >
                                {copiedField === 'momoPhone' ? '✓ Đã chép' : 'Sao chép'}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Tên chủ ví</span>
                          <span className="font-semibold text-gray-800 uppercase">{ownerPayment.momoName || ownerPayment.accountName}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">Người nhận</span>
                        <span className="font-semibold text-gray-800 uppercase">{ownerPayment.accountName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-dashed border-gray-200 pt-2">
                      <span className="text-gray-500">Số tiền</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-green-700">{finalTotal.toLocaleString('vi-VN')}đ</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(String(finalTotal), 'amount')}
                          className="rounded px-2 py-0.5 text-[10px] font-medium bg-green-50 hover:bg-green-100 text-green-700 transition"
                        >
                          {copiedField === 'amount' ? '✓ Đã chép' : 'Sao chép'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-dashed border-gray-200 pt-2">
                      <span className="text-gray-500">{isMoMo ? 'Lời nhắn MoMo' : 'Nội dung CK'}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-700">{transferReference}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferReference, 'ref')}
                          className="rounded px-2 py-0.5 text-[10px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                        >
                          {copiedField === 'ref' ? '✓ Đã chép' : 'Sao chép'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!canConfirmTransfer && (
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      {isBankTransfer
                        ? 'Chủ sân chưa cấu hình số tài khoản ngân hàng.'
                        : isMoMo
                          ? 'Chủ sân chưa cấu hình số điện thoại MoMo.'
                          : 'Phương thức này chưa có mã QR. Vui lòng chọn chuyển khoản hoặc phương thức khác.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
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
                  src={fieldData?.images?.[0] || fieldData?.image || "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=120&h=80&fit=crop&auto=format"}
                  alt="Field"
                  className="w-16 h-12 rounded-xl object-cover bg-gray-100"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{fieldData?.name || fieldName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{fieldData?.address || fieldData?.location || 'Đang tải thông tin sân...'}</p>
                  <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full border border-green-100">{fieldData?.sport || 'Thể thao'}</span>
                </div>
              </div>

              {/* Booking details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày chơi</span>
                  <span className="font-medium text-gray-900">{dateString}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Khung giờ</span>
                  <div className="text-right">
                    {slots.map(s => <div key={s} className="font-medium text-gray-900">{s}</div>)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sân</span>
                  <span className="font-medium text-gray-900">{fieldData?.name || fieldName}</span>
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
                disabled={!canConfirmTransfer || isSubmitting}
                className="mt-5 w-full py-4 rounded-xl font-bold text-base text-white bg-green-600 hover:bg-green-700 transition-colors shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {isSubmitting ? (
                  'Đang xử lý...'
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Tôi đã chuyển {finalTotal.toLocaleString('vi-VN')}đ
                  </>
                )}
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
