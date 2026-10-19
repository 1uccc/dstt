/**
 * [STRATEGY PATTERN] - PaymentStrategy Interface
 * Định nghĩa giao diện chung cho các chiến lược thanh toán khác nhau trong SportBook.
 */

import { OwnerPaymentSettings } from '../../../types';

export interface PaymentParams {
  amount: number;
  bookingCode: string;
  fieldId: string;
  fieldName: string;
  customerName: string;
  phone: string;
  ownerSettings: OwnerPaymentSettings;
}

export interface PaymentResult {
  methodId: string;
  methodName: string;
  qrUrl?: string;
  deepLink?: string;
  instructions: string[];
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  note?: string;
}

export interface IPaymentStrategy {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly color: string;

  /**
   * Phương thức tạo dữ liệu thanh toán (QR, Deep link, Hướng dẫn)
   */
  generatePaymentData(params: PaymentParams): PaymentResult;
}
