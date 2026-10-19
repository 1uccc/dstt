import React from 'react';

export interface AlertModalProps {
  isOpen: boolean;
  type?: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  type = 'warning',
  title,
  message,
  primaryButtonText = 'Đã hiểu',
  secondaryButtonText,
  onPrimary,
  onSecondary,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrimaryClick = () => {
    if (onPrimary) {
      onPrimary();
    } else {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondary) {
      onSecondary();
    } else {
      onClose();
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return (
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce duration-1000">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200/80 text-green-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {renderIcon()}

        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
          {title}
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
          {message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          {secondaryButtonText && (
            <button
              type="button"
              onClick={handleSecondaryClick}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              {secondaryButtonText}
            </button>
          )}

          <button
            type="button"
            onClick={handlePrimaryClick}
            className={`w-full ${secondaryButtonText ? 'sm:flex-1' : ''} py-3 px-5 rounded-xl font-bold text-sm text-white shadow-lg transition transform active:scale-[0.98] ${
              type === 'error'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
            }`}
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
