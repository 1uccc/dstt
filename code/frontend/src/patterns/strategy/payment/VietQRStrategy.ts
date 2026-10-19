/**
 * [STRATEGY PATTERN] - VietQR Concrete Strategy
 * Chiến lược thanh toán chuyển khoản liên ngân hàng chuẩn VietQR Napas
 */

import { IPaymentStrategy, PaymentParams, PaymentResult } from './PaymentStrategy';
import { generateVietQRUrl } from '../../../utils/vietqr';

export class VietQRStrategy implements IPaymentStrategy {
  readonly id = 'card';
  readonly name = 'Chuyển khoản (VietQR)';
  readonly emoji = '⚡';
  readonly color = '#1a56db';

  generatePaymentData(params: PaymentParams): PaymentResult {
    const { amount, bookingCode, ownerSettings } = params;
    const bank = ownerSettings.bank || 'Vietcombank';
    const accountNumber = ownerSettings.accountNumber || '';
    const accountName = ownerSettings.accountName || '';

    // Ưu tiên QR động sinh theo chuẩn Napas VietQR QuickLink
    const qrUrl = generateVietQRUrl({
      bank,
      accountNumber,
      accountName,
      amount,
      description: bookingCode,
      template: 'compact2',
    }) || ownerSettings.qrCodes?.['card'];

    return {
      methodId: this.id,
      methodName: this.name,
      qrUrl,
      bankName: bank,
      accountNumber,
      accountName,
      note: bookingCode,
      instructions: [
        'Mở ứng dụng Ngân hàng (App Banking) bất kỳ.',
        'Chọn tính năng "Quét mã QR".',
        'Kiểm tra đúng số tiền và nội dung chuyển khoản tự động.',
        'Xác nhận chuyển khoản và nhấn "Tôi đã thanh toán".',
      ],
    };
  }
}
