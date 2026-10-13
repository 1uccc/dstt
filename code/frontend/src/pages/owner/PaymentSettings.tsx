import { ChangeEvent, useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { QRCropModal } from '../../components/QRCropModal';
import { VIETNAM_BANKS, generateVietQRUrl } from '../../utils/vietqr';
import { generateMoMoQRUrl } from '../../utils/momo';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Chuyển khoản (VietQR)', detail: 'Tự sinh mã theo tiền sân', mark: '••', tone: 'bg-indigo-600 text-white' },
  { id: 'momo', name: 'Ví MoMo (Tự động)', detail: 'Tự sinh mã theo tiền sân', mark: 'M', tone: 'bg-pink-700 text-white' },
  { id: 'vnpay', name: 'VNPay QR', detail: 'Quét mã QR', mark: 'V', tone: 'bg-red-600 text-white' },
  { id: 'zalopay', name: 'ZaloPay', detail: 'Ví điện tử', mark: 'Z', tone: 'bg-blue-600 text-white' },
];

type SavedPaymentSettings = {
  bank: string;
  accountNumber: string;
  accountName: string;
  momoPhone?: string;
  momoName?: string;
  enabledMethods: string[];
  qrCodes: Record<string, string>;
};

async function fetchPaymentSettings(uid: string): Promise<SavedPaymentSettings | null> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/payment/${uid}`);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export function OwnerPaymentSettings() {
  const [uid, setUid] = useState<string>('');
  const [bank, setBank] = useState('Vietcombank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState('NGUYEN MINH HOANG');
  const [momoPhone, setMomoPhone] = useState('');
  const [momoName, setMomoName] = useState('');
  const [previewTab, setPreviewTab] = useState<'card' | 'momo'>('card');
  const [saved, setSaved] = useState(false);
  const [enabledMethods, setEnabledMethods] = useState(PAYMENT_METHODS.map((method) => method.id));
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  const [cropTarget, setCropTarget] = useState<{ methodId: string; imageSrc: string } | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUid(user.uid);
        const settings = await fetchPaymentSettings(user.uid);
        if (settings) {
          setBank(settings.bank || 'Vietcombank');
          setAccountNumber(settings.accountNumber || '');
          setAccountName(settings.accountName || '');
          setMomoPhone(settings.momoPhone || '');
          setMomoName(settings.momoName || '');
          setEnabledMethods(settings.enabledMethods || PAYMENT_METHODS.map(m => m.id));
          setQrCodes(settings.qrCodes || {});
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleQrUpload = (methodId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh QR cần nhỏ hơn 2MB.');
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropTarget({ methodId, imageSrc: reader.result as string });
    });
    reader.readAsDataURL(file);
    // Reset file input value so selecting the same file again triggers onChange
    event.target.value = '';
  };

  const uploadCroppedFile = async (croppedFile: File, methodId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('upload_preset', 'datsanthethao');
      
      const res = await fetch('https://api.cloudinary.com/v1_1/vafqskfg/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.secure_url) {
        setQrCodes((current) => ({ ...current, [methodId]: data.secure_url }));
        setSaved(false);
        setCropTarget(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Lỗi upload mã QR:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  };

  const save = async () => {
    if (!bank || !accountNumber || !accountName || !uid) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập lại.');
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bank,
          accountNumber,
          accountName,
          momoPhone,
          momoName,
          enabledMethods,
          qrCodes
        })
      });
      if (res.ok) {
        setSaved(true);
      } else {
        alert('Có lỗi xảy ra khi lưu cài đặt.');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối.');
    }
  };

  const toggleMethod = (id: string) => {
    if (enabledMethods.length === 1 && enabledMethods.includes(id)) {
      alert('Cần bật ít nhất một phương thức thanh toán.');
      return;
    }
    setEnabledMethods((current) =>
      current.includes(id) ? current.filter((method) => method !== id) : [...current, id],
    );
    setSaved(false);
  };

  const previewVietQrUrl = accountNumber.trim()
    ? generateVietQRUrl({
        bank,
        accountNumber,
        accountName,
        amount: 350000,
        description: 'SPB123456',
        template: 'compact2',
      })
    : '';

  const previewMoMoUrl = momoPhone.trim()
    ? generateMoMoQRUrl({
        phone: momoPhone,
        amount: 350000,
        note: 'SPB123456',
        name: momoName || accountName,
      })
    : '';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="font-display text-2xl font-bold uppercase text-slate-900">Cài đặt thanh toán</p>
        <p className="mt-1 text-sm text-slate-500">Thiết lập tài khoản ngân hàng VietQR & Ví MoMo tự sinh mã nhận tiền từ khách.</p>
      </div>

      {saved && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" /></svg>
          <div><strong>Đã lưu thông tin thanh toán.</strong> Khách hàng sẽ thấy thông tin mới trong bước thanh toán.</div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-bold uppercase text-slate-900">Phương thức khách hàng có thể chọn</p>
            <p className="mt-1 text-xs text-slate-500">VietQR và MoMo tự động tạo mã theo tiền sân; Các ví khác dùng mã QR do bạn tải lên.</p>
          </div>
          <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            {enabledMethods.length}/4 đang bật
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PAYMENT_METHODS.map((method) => {
            const enabled = enabledMethods.includes(method.id);
            const isBankTransfer = method.id === 'card';
            const isMoMo = method.id === 'momo';
            return (
              <div key={method.id} className={`rounded-xl border p-3 transition ${enabled ? 'border-green-200 bg-green-50/50' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${method.tone}`}>{method.mark}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{method.name}</p>
                    <p className="truncate text-xs text-slate-500">{method.detail}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${enabled ? 'Tắt' : 'Bật'} ${method.name}`}
                    onClick={() => toggleMethod(method.id)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? 'bg-green-600' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                {isBankTransfer ? (
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2 py-2 text-xs font-semibold text-indigo-700">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    VietQR tự sinh theo tiền sân
                  </div>
                ) : isMoMo ? (
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50/80 px-2 py-2 text-xs font-semibold text-pink-700">
                    <span className="h-2 w-2 rounded-full bg-pink-600 animate-pulse" />
                    MoMo tự sinh theo tiền sân
                  </div>
                ) : (
                  <>
                    <label htmlFor={`qr-${method.id}`} className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-green-400 hover:text-green-700">
                      {qrCodes[method.id] ? (
                        <>
                          <img src={qrCodes[method.id]} alt="" className="h-7 w-7 rounded object-cover" />
                          Đổi ảnh QR
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 0h2v2h-2v-2Zm3 0h2v5h-2v-5Z" /></svg>
                          Tải QR nhận tiền
                        </>
                      )}
                    </label>
                    <input id={`qr-${method.id}`} type="file" accept="image/png,image/jpeg" onChange={(event) => handleQrUpload(method.id, event)} className="sr-only" />
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8h.01M11 12h1v4h1m8-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Hệ thống hỗ trợ tự động điền số tiền cho cả <strong>Chuyển khoản VietQR 24/7</strong> và <strong>Ví điện tử MoMo</strong>: Khách chỉ cần quét mã là app tự mở và điền đúng số tiền.
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Left Inputs */}
        <div className="space-y-6">
          {/* Section: Ngân hàng */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9h18M5 9V7l7-4 7 4v2M5 19h14M7 9v8m5-8v8m5-8v8" /></svg>
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase text-slate-900">Tài khoản ngân hàng (VietQR)</p>
                <p className="text-xs text-slate-500">Tự động sinh mã VietQR theo chuẩn Napas 24/7.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="payment-bank" className="mb-1.5 block text-sm font-medium text-slate-700">Ngân hàng</label>
                <select
                  id="payment-bank"
                  value={bank}
                  onChange={(event) => { setBank(event.target.value); setSaved(false); }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                >
                  {VIETNAM_BANKS.map((b) => (
                    <option key={b.code} value={b.shortName}>
                      {b.shortName} ({b.code}) - {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="payment-account" className="mb-1.5 block text-sm font-medium text-slate-700">Số tài khoản</label>
                <input
                  id="payment-account"
                  inputMode="numeric"
                  placeholder="Nhập số tài khoản nhận tiền"
                  value={accountNumber}
                  onChange={(event) => { setAccountNumber(event.target.value); setSaved(false); }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                />
              </div>
              <div>
                <label htmlFor="payment-name" className="mb-1.5 block text-sm font-medium text-slate-700">Tên chủ tài khoản</label>
                <input
                  id="payment-name"
                  placeholder="VÍ DỤ: NGUYEN VAN A"
                  value={accountName}
                  onChange={(event) => { setAccountName(event.target.value.toUpperCase()); setSaved(false); }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                />
                <p className="mt-1 text-xs text-slate-400">Nhập đúng tên viết hoa không dấu như trên thẻ/tài khoản.</p>
              </div>
            </div>
          </section>

          {/* Section: Ví MoMo */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-700 font-bold">
                M
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase text-slate-900">Ví MoMo (Tự động)</p>
                <p className="text-xs text-slate-500">Tự động sinh mã MoMo chuyển tiền kèm số tiền và mã đơn.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="payment-momo-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại MoMo</label>
                <input
                  id="payment-momo-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={momoPhone}
                  onChange={(event) => { setMomoPhone(event.target.value); setSaved(false); }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
                />
              </div>
              <div>
                <label htmlFor="payment-momo-name" className="mb-1.5 block text-sm font-medium text-slate-700">Tên chủ ví MoMo</label>
                <input
                  id="payment-momo-name"
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={momoName}
                  onChange={(event) => { setMomoName(event.target.value.toUpperCase()); setSaved(false); }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Preview Card */}
        <section className={`flex flex-col justify-between rounded-2xl p-6 text-white shadow-sm transition-colors ${
          previewTab === 'card' ? 'bg-gradient-to-b from-indigo-950 to-slate-900' : 'bg-gradient-to-b from-pink-950 to-slate-900'
        }`}>
          <div>
            {/* Tabs */}
            <div className="flex gap-2 rounded-xl bg-white/10 p-1 mb-4">
              <button
                type="button"
                onClick={() => setPreviewTab('card')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                  previewTab === 'card' ? 'bg-white text-indigo-950 shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                Xem trước VietQR
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('momo')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                  previewTab === 'momo' ? 'bg-pink-600 text-white shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                Xem trước MoMo
              </button>
            </div>

            <p className="font-display text-xl font-bold uppercase">
              {previewTab === 'card' ? 'Mã VietQR mẫu' : 'Mã MoMo mẫu'}
            </p>
            <p className="mt-1 text-xs text-white/70">
              {previewTab === 'card'
                ? 'Khi khách đặt sân, mã QR sẽ tự động điền sẵn số tiền theo đơn giá sân và mã đơn.'
                : 'Khách quét bằng ứng dụng MoMo sẽ tự động mở màn hình chuyển tiền kèm giá sân.'}
            </p>

            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              {previewTab === 'card' ? (
                previewVietQrUrl ? (
                  <div className="relative">
                    <img
                      src={previewVietQrUrl}
                      alt="VietQR Mẫu"
                      className="max-h-52 rounded-xl bg-white p-2 shadow-lg object-contain"
                    />
                    <div className="mt-2 text-[11px] font-medium text-indigo-200">
                      *Mẫu mức giá 350.000đ & mã demo
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-xs text-slate-300">
                    Vui lòng nhập số tài khoản ngân hàng để xem trước
                  </div>
                )
              ) : (
                previewMoMoUrl ? (
                  <div className="relative">
                    <img
                      src={previewMoMoUrl}
                      alt="MoMo QR Mẫu"
                      className="max-h-52 rounded-xl bg-white p-2 shadow-lg object-contain"
                    />
                    <div className="mt-2 text-[11px] font-medium text-pink-200">
                      *Mẫu mức giá 350.000đ & số {momoPhone}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-xs text-slate-300">
                    Vui lòng nhập số điện thoại MoMo để xem trước mã QR
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white/70">
            💡 Quét thử mã trên bằng ứng dụng để kiểm tra thông tin người nhận trước khi lưu.
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={save} className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700">
          Lưu cài đặt thanh toán
        </button>
      </div>

      {cropTarget && (
        <QRCropModal
          imageSrc={cropTarget.imageSrc}
          onClose={() => setCropTarget(null)}
          onCropComplete={(file) => uploadCroppedFile(file, cropTarget.methodId)}
        />
      )}
    </div>
  );
}
