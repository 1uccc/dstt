import React, { useState } from 'react';
import { PaymentResult } from '../../patterns/strategy/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  paymentResult: PaymentResult | null;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  paymentResult,
  amount,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !paymentResult) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
              ✓
            </span>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Thanh toán qua {paymentResult.methodName}</h3>
              <p className="text-xs text-gray-500">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* QR Code */}
          {paymentResult.qrUrl ? (
            <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
              <img
                src={paymentResult.qrUrl}
                alt="QR Thanh toán"
                className="w-56 h-56 object-contain rounded-xl shadow-xs bg-white p-2"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Mở ứng dụng tương ứng và quét mã QR
              </p>
              {paymentResult.deepLink && (
                <a
                  href={paymentResult.deepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Mở ứng dụng Ví MoMo ↗
                </a>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center text-xs text-amber-800">
              Chủ sân chưa tải mã QR tĩnh. Vui lòng chuyển khoản theo thông tin số tài khoản bên dưới.
            </div>
          )}

          {/* Account Details */}
          <div className="space-y-2.5 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
            {paymentResult.bankName && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Ngân hàng / Cổng:</span>
                <span className="font-bold text-gray-900">{paymentResult.bankName}</span>
              </div>
            )}
            {paymentResult.accountNumber && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    {paymentResult.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentResult.accountNumber!, 'acc')}
                    className="text-[11px] font-semibold text-green-700 hover:text-green-800 bg-white border border-gray-200 px-2 py-0.5 rounded-md"
                  >
                    {copiedKey === 'acc' ? '✓ Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            )}
            {paymentResult.accountName && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Chủ tài khoản:</span>
                <span className="font-bold text-gray-900 uppercase">
                  {paymentResult.accountName}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-gray-600 border-t border-gray-200/60 pt-2">
              <span>Số tiền thanh toán:</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-green-600 text-sm">
                  {amount.toLocaleString('vi-VN')}đ
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(String(amount), 'amount')}
                  className="text-[11px] font-semibold text-green-700 hover:text-green-800 bg-white border border-gray-200 px-2 py-0.5 rounded-md"
                >
                  {copiedKey === 'amount' ? '✓ Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>
            {paymentResult.note && (
              <div className="flex justify-between items-center text-gray-600 border-t border-gray-200/60 pt-2">
                <span>Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {paymentResult.note}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentResult.note!, 'note')}
                    className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 bg-white border border-gray-200 px-2 py-0.5 rounded-md"
                  >
                    {copiedKey === 'note' ? '✓ Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {paymentResult.instructions && paymentResult.instructions.length > 0 && (
            <div className="space-y-1.5 text-xs text-gray-500">
              <p className="font-semibold text-gray-700">Hướng dẫn:</p>
              <ul className="list-disc pl-4 space-y-1">
                {paymentResult.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-100 transition"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Đang xử lý...' : '✓ Tôi đã thanh toán'}
          </button>
        </div>
      </div>
    </div>
  );
};
