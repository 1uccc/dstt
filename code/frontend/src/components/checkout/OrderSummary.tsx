import React from 'react';
import { Field } from '../../types';

interface OrderSummaryProps {
  field: Field | null;
  slots: string[];
  dateStr: string;
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  field,
  slots,
  dateStr,
  total,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
        Tóm tắt đơn đặt sân
      </h2>

      {field && (
        <div className="mt-4 flex gap-3.5 items-center">
          <img
            src={field.image || 'https://images.unsplash.com/photo-1529900245534-5e6922028af9?w=300'}
            alt={field.name}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm truncate">{field.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{field.location || field.address}</p>
            <span className="inline-block mt-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
              {field.sport || 'Thể thao'}
            </span>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3 text-xs border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center text-gray-600">
          <span>Ngày thi đấu:</span>
          <span className="font-semibold text-gray-900">{dateStr}</span>
        </div>
        <div className="flex justify-between items-start text-gray-600">
          <span>Khung giờ ({slots.length}):</span>
          <div className="text-right">
            {slots.map((s) => (
              <span key={s} className="block font-semibold text-gray-900">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-dashed border-gray-200 pt-4 flex justify-between items-baseline">
        <span className="text-sm font-semibold text-gray-700">Tổng thanh toán</span>
        <span className="text-xl font-extrabold text-green-600">
          {total.toLocaleString('vi-VN')}đ
        </span>
      </div>
    </div>
  );
};
