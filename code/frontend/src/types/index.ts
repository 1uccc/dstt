/**
 * Các định nghĩa Interface & Type chuẩn của toàn bộ hệ thống SportBook
 */

export interface UserSession {
  role: 'customer' | 'owner' | 'admin';
  email: string;
  name: string;
  phone?: string;
  uid?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'pending' | 'blocked';
  businessInfo?: {
    businessName?: string;
    businessAddress?: string;
    taxCode?: string;
  };
  createdAt?: string;
}

export interface FieldSchedule {
  slotMinutes: number;
  regularPrice: number;
  peakPrice: number;
  peakStart: string;
  days: Array<{ enabled: boolean; open: string; close: string }>;
  blockedDates: string[];
}

export interface Field {
  id: string;
  name: string;
  location?: string;
  address?: string;
  sport: string;
  price: number;
  description?: string;
  image?: string;
  images?: string[];
  bookings?: number;
  mapUrl?: string;
  amenities: string[];
  schedule?: FieldSchedule;
  ownerName?: string;
  owner?: string;
  active?: boolean;
  rating?: number;
  reviews?: number;
  createdAt?: string;
}

export interface Booking {
  id: string;
  bookingCode?: string;
  customerName?: string;
  phone?: string;
  fieldId: string;
  fieldName: string;
  date: string;
  time: string;
  amount: number;
  paymentMethod?: string;
  reference?: string;
  note?: string;
  userId?: string | null;
  status: 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  fieldId: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  ownerReply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

export interface OwnerPaymentSettings {
  bank: string;
  accountNumber: string;
  accountName: string;
  momoPhone?: string;
  momoName?: string;
  enabledMethods: string[];
  qrCodes: Record<string, string>;
}
