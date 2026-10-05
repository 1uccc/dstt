import { ChangeEvent, useState } from 'react';

const PAYMENT_METHODS = [
  { id: 'zalopay', name: 'ZaloPay', detail: 'Ví điện tử', mark: 'Z', tone: 'bg-blue-600 text-white' },
  { id: 'momo', name: 'MoMo', detail: 'Ví điện tử', mark: 'M', tone: 'bg-pink-700 text-white' },
  { id: 'vnpay', name: 'VNPay QR', detail: 'Quét mã QR', mark: 'V', tone: 'bg-red-600 text-white' },
  { id: 'card', name: 'Chuyển khoản', detail: 'Tài khoản ngân hàng', mark: '••', tone: 'bg-indigo-600 text-white' },
];

const STORAGE_KEY = 'sportbook-owner-payment';

type SavedPaymentSettings = {
  bank: string;
  accountNumber: string;
  accountName: string;
  enabledMethods: string[];
  qrCodes: Record<string, string>;
};

function getSavedSettings(): SavedPaymentSettings | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return {
      bank: parsed.bank ?? 'Vietcombank',
      accountNumber: parsed.accountNumber ?? '',
      accountName: parsed.accountName ?? '',
      enabledMethods: Array.isArray(parsed.enabledMethods) ? parsed.enabledMethods : PAYMENT_METHODS.map((method) => method.id),
      qrCodes: parsed.qrCodes ?? {},
    };
  } catch {
    return null;
  }
}

export function OwnerPaymentSettings() {
  const savedSettings = getSavedSettings();
  const [bank, setBank] = useState(savedSettings?.bank ?? 'Vietcombank');
  const [accountNumber, setAccountNumber] = useState(savedSettings?.accountNumber ?? '0123456789');
  const [accountName, setAccountName] = useState(savedSettings?.accountName ?? 'NGUYEN MINH HOANG');
  const [saved, setSaved] = useState(false);
  const [enabledMethods, setEnabledMethods] = useState(savedSettings?.enabledMethods ?? PAYMENT_METHODS.map((method) => method.id));
  const [qrCodes, setQrCodes] = useState<Record<string, string>>(savedSettings?.qrCodes ?? {});

  const handleQrUpload = (methodId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh QR cần nhỏ hơn 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setQrCodes((current) => ({ ...current, [methodId]: String(reader.result) }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!bank || !accountNumber || !accountName) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bank, accountNumber, accountName, enabledMethods, qrCodes }));
    setSaved(true);
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="font-display text-2xl font-bold uppercase text-slate-900">Cài đặt thanh toán</p>
        <p className="mt-1 text-sm text-slate-500">Thiết lập tài khoản nhận tiền và mã QR hiển thị cho khách đặt sân.</p>
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
            <p className="mt-1 text-xs text-slate-500">Mỗi mã QR dẫn tiền trực tiếp tới ví hoặc tài khoản của chủ sân.</p>
          </div>
          <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            {enabledMethods.length}/4 đang bật
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PAYMENT_METHODS.map((method) => {
            const enabled = enabledMethods.includes(method.id);
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
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8h.01M11 12h1v4h1m8-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Khách hàng quét đúng mã QR bạn đã tải lên. SportBookVN không giữ tiền; chủ sân kiểm tra giao dịch và xác nhận lịch đặt.
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9h18M5 9V7l7-4 7 4v2M5 19h14M7 9v8m5-8v8m5-8v8" /></svg>
            </span>
            <div>
              <p className="font-display text-xl font-bold uppercase text-slate-900">Tài khoản ngân hàng</p>
              <p className="text-xs text-slate-500">Thông tin hiển thị cho khách khi chọn chuyển khoản.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="payment-bank" className="mb-1.5 block text-sm font-medium text-slate-700">Ngân hàng</label>
              <select id="payment-bank" value={bank} onChange={(event) => { setBank(event.target.value); setSaved(false); }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10">
                <option>Vietcombank</option>
                <option>Techcombank</option>
                <option>MB Bank</option>
                <option>ACB</option>
                <option>VPBank</option>
                <option>BIDV</option>
              </select>
            </div>
            <div>
              <label htmlFor="payment-account" className="mb-1.5 block text-sm font-medium text-slate-700">Số tài khoản</label>
              <input id="payment-account" inputMode="numeric" value={accountNumber} onChange={(event) => { setAccountNumber(event.target.value); setSaved(false); }} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
            </div>
            <div>
              <label htmlFor="payment-name" className="mb-1.5 block text-sm font-medium text-slate-700">Tên chủ tài khoản</label>
              <input id="payment-name" value={accountName} onChange={(event) => { setAccountName(event.target.value.toUpperCase()); setSaved(false); }} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
              <p className="mt-1.5 text-xs text-slate-400">Nhập đúng tên viết hoa không dấu như trên tài khoản ngân hàng.</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-2xl bg-green-950 p-6 text-white shadow-sm">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 12h16m-4-4 4 4-4 4M8 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></svg>
            </span>
            <p className="mt-5 font-display text-2xl font-bold uppercase">Tiền về thẳng chủ sân</p>
            <p className="mt-2 text-sm leading-relaxed text-green-100/60">Khách quét QR, chuyển tiền trực tiếp và gửi yêu cầu xác nhận. Không qua ví trung gian của SportBookVN.</p>
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-green-100/70">
            Hãy kiểm tra số tiền và nội dung chuyển khoản trước khi xác nhận lịch.
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={save} className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700">
          Lưu cài đặt thanh toán
        </button>
      </div>
    </div>
  );
}
