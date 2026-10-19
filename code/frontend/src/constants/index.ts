/**
 * Hằng số hệ thống dùng chung (Application Constants)
 */

export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PAID: 'paid',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const);

export type BookingStatusType = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const STATUS_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string; borderClass: string; dotClass: string }
> = Object.freeze({
  [BOOKING_STATUS.PENDING]: {
    label: 'Chờ xác nhận',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-500',
  },
  [BOOKING_STATUS.CONFIRMED]: {
    label: 'Đã xác nhận',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
    dotClass: 'bg-green-500',
  },
  [BOOKING_STATUS.PAID]: {
    label: 'Đã thanh toán',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    dotClass: 'bg-blue-500',
  },
  [BOOKING_STATUS.COMPLETED]: {
    label: 'Đã hoàn tất',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    dotClass: 'bg-purple-500',
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    dotClass: 'bg-red-500',
  },
});

export const USER_ROLES = Object.freeze({
  CUSTOMER: 'customer',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const);

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

export const STORAGE_KEYS = Object.freeze({
  TOKEN: 'token',
  SESSION: 'sportbook-session',
  PENDING_CHECKOUT: 'sportbook-pending-checkout',
  ADMIN_READ_NOTIFS: 'sportbook-admin-read-notifs',
  ADMIN_CLEARED_TIMESTAMP: 'sportbook-admin-cleared-timestamp',
  OWNER_READ_NOTIFS: 'sportbook-owner-read-notifs',
  OWNER_CLEARED_TIMESTAMP: 'sportbook-owner-cleared-timestamp',
  CUSTOMER_READ_NOTIFS: 'sportbook-customer-read-notifs',
  CUSTOMER_CLEARED_TIMESTAMP: 'sportbook-customer-cleared-timestamp',
} as const);

export const PAYMENT_METHODS = Object.freeze([
  { id: 'card', name: 'Chuyển khoản (VietQR)', color: '#1a56db', emoji: '⚡', desc: 'Tự điền số tiền sân & mã đơn' },
  { id: 'momo', name: 'Ví MoMo (Tự động)', color: '#ae2070', emoji: '💜', desc: 'Tự điền số tiền sân & mở MoMo' },
  { id: 'vnpay', name: 'VNPay', color: '#e31837', emoji: '🏦', desc: 'Thanh toán qua cổng VNPay QR' },
  { id: 'zalopay', name: 'ZaloPay', color: '#0068ff', emoji: '💳', desc: 'Thanh toán qua ví ZaloPay' },
] as const);

export const DEFAULT_SPORTS = Object.freeze([
  'Bóng đá',
  'Tennis',
  'Cầu lông',
  'Bóng rổ',
  'Pickleball',
] as const);

export const DEFAULT_AMENITIES = Object.freeze([
  'Bãi đỗ xe',
  'Phòng thay đồ & tắm',
  'Đèn chiếu sáng',
  'Wi-Fi',
  'Cho thuê dụng cụ',
  'Căn tin',
  'Camera an ninh',
  'Trọng tài',
] as const);
