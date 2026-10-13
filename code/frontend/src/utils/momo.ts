export interface MoMoQRParams {
  phone: string;
  amount?: number;
  note?: string;
  name?: string;
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Generates MoMo direct transfer link:
 * Format: https://me.momo.vn/<PHONE>/<AMOUNT>
 */
export function generateMoMoLink(params: MoMoQRParams): string {
  const cleanPhone = cleanPhoneNumber(params.phone);
  if (!cleanPhone) return '';

  const roundedAmount = params.amount && params.amount > 0 ? Math.round(params.amount) : 0;

  if (roundedAmount > 0) {
    return `https://me.momo.vn/${cleanPhone}/${roundedAmount}`;
  }
  return `https://me.momo.vn/${cleanPhone}`;
}

/**
 * Generates dynamic QR Code Image URL for MoMo
 */
export function generateMoMoQRUrl(params: MoMoQRParams): string {
  const link = generateMoMoLink(params);
  if (!link) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(link)}`;
}
