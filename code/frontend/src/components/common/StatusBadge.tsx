import React from 'react';
import { STATUS_CONFIG, BOOKING_STATUS } from '../../constants';

interface StatusBadgeProps {
  status?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'pending',
  size = 'sm',
  className = '',
}) => {
  const normalizedStatus = status.toLowerCase();
  const config = STATUS_CONFIG[normalizedStatus] || {
    label: status,
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200',
    dotClass: 'bg-gray-400',
  };

  const isPending = normalizedStatus === BOOKING_STATUS.PENDING;
  const isConfirmed = normalizedStatus === BOOKING_STATUS.CONFIRMED;
  const isPaid = normalizedStatus === BOOKING_STATUS.PAID;
  const isCompleted = normalizedStatus === BOOKING_STATUS.COMPLETED;
  const isCancelled = normalizedStatus === BOOKING_STATUS.CANCELLED;

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses} ${className}`}
    >
      {isPending && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass} animate-pulse`} />
      )}
      {(isConfirmed || isPaid || isCompleted) && (
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {isCancelled && (
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{config.label}</span>
    </span>
  );
};
