import React from 'react';
import { IPaymentStrategy } from '../../patterns/strategy/payment';

interface PaymentMethodSelectorProps {
  strategies: IPaymentStrategy[];
  selectedId: string;
  onSelect: (strategyId: string) => void;
  enabledMethods?: string[];
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  strategies,
  selectedId,
  onSelect,
  enabledMethods,
}) => {
  const visibleStrategies = enabledMethods && enabledMethods.length > 0
    ? strategies.filter((s) => enabledMethods.includes(s.id))
    : strategies;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-900">
        Phương thức thanh toán <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleStrategies.map((strategy) => {
          const isSelected = selectedId === strategy.id;
          return (
            <button
              key={strategy.id}
              type="button"
              onClick={() => onSelect(strategy.id)}
              className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-green-600 bg-green-50/40 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs"
                style={{ backgroundColor: `${strategy.color}15`, color: strategy.color }}
              >
                {strategy.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{strategy.name}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">Tự động điền tiền & mã</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-green-600 bg-green-600' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
