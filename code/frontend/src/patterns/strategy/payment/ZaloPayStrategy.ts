/**
 * [STRATEGY PATTERN] - ZaloPay Concrete Strategy
 * Chiến lược thanh toán qua Ví điện tử ZaloPay
 */

import { IPaymentStrategy, PaymentParams, PaymentResult } from './PaymentStrategy';

export class ZaloPayStrategy implements IPaymentStrategy {
  readonly id = 'zalopay';
  readonly name = 'Ví ZaloPay';
  readonly emoji = '💳';
  readonly color = '#0068ff';

  generatePaymentData(params: PaymentParams): PaymentResult {
    const { bookingCode, ownerSettings } = params;
    const qrUrl = ownerSettings.qrCodes?.['zalopay'];

    return {
      methodId: this.id,
      methodName: this.name,
      qrUrl,
      bankName: 'Ví ZaloPay',
      accountNumber: ownerSettings.momoPhone || ownerSettings.accountNumber,
      accountName: ownerSettings.accountName,
      note: bookingCode,
      instructions: [
        'Mở ứng dụng ZaloPay hoặc tính năng Ví trong Zalo.',
        'Chọn "Quét mã" để quét mã QR chuyển khoản.',
        'Xác nhận thông tin chuyển tiền đúng với mã đơn hàng.',
        'Hoàn tất thanh toán.',
      ],
    };
  }
}
