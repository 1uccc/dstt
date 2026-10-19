/**
 * [STRATEGY PATTERN] - VNPay Concrete Strategy
 * Chiến lược thanh toán qua Cổng VNPay QR
 */

import { IPaymentStrategy, PaymentParams, PaymentResult } from './PaymentStrategy';
import { generateVietQRUrl } from '../../../utils/vietqr';

export class VNPayStrategy implements IPaymentStrategy {
  readonly id = 'vnpay';
  readonly name = 'Cổng VNPay';
  readonly emoji = '🏦';
  readonly color = '#e31837';

  generatePaymentData(params: PaymentParams): PaymentResult {
    const { amount, bookingCode, ownerSettings } = params;
    
    // Nếu chủ sân có upload mã QR VNPay riêng thì dùng, nếu không thì dùng chuẩn Napas fallback
    const customQr = ownerSettings.qrCodes?.['vnpay'];
    const qrUrl = customQr || generateVietQRUrl({
      bank: ownerSettings.bank || 'Vietcombank',
      accountNumber: ownerSettings.accountNumber || '',
      accountName: ownerSettings.accountName || '',
      amount,
      description: bookingCode,
      template: 'compact2',
    });

    return {
      methodId: this.id,
      methodName: this.name,
      qrUrl,
      bankName: 'Cổng VNPay QR',
      accountNumber: ownerSettings.accountNumber,
      accountName: ownerSettings.accountName,
      note: bookingCode,
      instructions: [
        'Mở bất kỳ ứng dụng Ngân hàng nào hỗ trợ VNPay-QR.',
        'Quét mã QR hiển thị trên màn hình.',
        'Kiểm tra thông tin đơn hàng và mã hóa đơn.',
        'Xác thực giao dịch (OTP/FaceID/Vân tay).',
      ],
    };
  }
}
