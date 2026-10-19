/**
 * [STRATEGY PATTERN] - MoMo Concrete Strategy
 * Chiến lược thanh toán qua Ví điện tử MoMo
 */

import { IPaymentStrategy, PaymentParams, PaymentResult } from './PaymentStrategy';
import { generateMoMoLink, generateMoMoQRUrl } from '../../../utils/momo';

export class MoMoStrategy implements IPaymentStrategy {
  readonly id = 'momo';
  readonly name = 'Ví MoMo (Tự động)';
  readonly emoji = '💜';
  readonly color = '#ae2070';

  generatePaymentData(params: PaymentParams): PaymentResult {
    const { amount, bookingCode, ownerSettings } = params;
    const momoPhone = ownerSettings.momoPhone || ownerSettings.accountNumber || '';
    const momoName = ownerSettings.momoName || ownerSettings.accountName || '';

    const dynamicQr = generateMoMoQRUrl({
      phone: momoPhone,
      amount,
      note: bookingCode,
      name: momoName,
    });

    const deepLink = generateMoMoLink({
      phone: momoPhone,
      amount,
      note: bookingCode,
      name: momoName,
    });

    return {
      methodId: this.id,
      methodName: this.name,
      qrUrl: dynamicQr || ownerSettings.qrCodes?.['momo'],
      deepLink,
      accountNumber: momoPhone,
      accountName: momoName,
      bankName: 'Ví MoMo',
      note: bookingCode,
      instructions: [
        'Mở ứng dụng Ví MoMo trên điện thoại.',
        'Chọn "Quét mã" để quét mã QR thanh toán.',
        'Hoặc nhấn nút "Mở Ví MoMo" nếu thanh toán trên điện thoại.',
        'Kiểm tra số tiền và hoàn tất giao dịch.',
      ],
    };
  }
}
