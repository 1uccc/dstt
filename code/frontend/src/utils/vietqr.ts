export interface BankInfo {
  code: string;
  bin: string;
  name: string;
  shortName: string;
}

export const VIETNAM_BANKS: BankInfo[] = [
  { code: 'VCB', bin: '970436', name: 'Vietcombank', shortName: 'Vietcombank' },
  { code: 'TCB', bin: '970407', name: 'Techcombank', shortName: 'Techcombank' },
  { code: 'MB', bin: '970422', name: 'MB Bank', shortName: 'MB Bank' },
  { code: 'ACB', bin: '970416', name: 'ACB', shortName: 'ACB' },
  { code: 'VPB', bin: '970432', name: 'VPBank', shortName: 'VPBank' },
  { code: 'BIDV', bin: '970418', name: 'BIDV', shortName: 'BIDV' },
  { code: 'ICB', bin: '970415', name: 'VietinBank', shortName: 'VietinBank' },
  { code: 'TPB', bin: '970423', name: 'TPBank', shortName: 'TPBank' },
  { code: 'VBA', bin: '970405', name: 'Agribank', shortName: 'Agribank' },
  { code: 'STB', bin: '970403', name: 'Sacombank', shortName: 'Sacombank' },
  { code: 'HDB', bin: '970437', name: 'HDBank', shortName: 'HDBank' },
  { code: 'SHB', bin: '970443', name: 'SHB', shortName: 'SHB' },
  { code: 'VIB', bin: '970441', name: 'VIB', shortName: 'VIB' },
  { code: 'MSB', bin: '970426', name: 'MSB', shortName: 'MSB' },
  { code: 'SEAB', bin: '970440', name: 'SeABank', shortName: 'SeABank' },
  { code: 'OCB', bin: '970448', name: 'OCB', shortName: 'OCB' },
  { code: 'LPB', bin: '970449', name: 'LPBank', shortName: 'LPBank' },
  { code: 'EIB', bin: '970431', name: 'Eximbank', shortName: 'Eximbank' },
  { code: 'NAB', bin: '970428', name: 'Nam A Bank', shortName: 'Nam A Bank' },
  { code: 'BVB', bin: '970454', name: 'BVBank (Bản Việt)', shortName: 'BVBank' },
];

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function findBank(bankIdentifier: string): BankInfo | undefined {
  if (!bankIdentifier) return undefined;
  const clean = normalizeString(bankIdentifier);

  return VIETNAM_BANKS.find((b) => {
    return (
      normalizeString(b.code) === clean ||
      b.bin === clean ||
      normalizeString(b.shortName) === clean ||
      normalizeString(b.name) === clean ||
      clean.includes(normalizeString(b.shortName)) ||
      normalizeString(b.name).includes(clean)
    );
  });
}

export function getBankIdentifierForVietQR(bankIdentifier: string): string {
  const bank = findBank(bankIdentifier);
  if (bank) {
    return bank.bin; // Using BIN is standard and 100% stable with Napas / VietQR
  }
  // Fallback to sanitized input
  return bankIdentifier.replace(/[^a-zA-Z0-9]/g, '');
}

export interface VietQRParams {
  bank: string;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
  template?: 'compact2' | 'compact' | 'qr_only' | 'print';
}

/**
 * Generates dynamic VietQR URL according to VietQR QuickLink standard:
 * https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
 */
export function generateVietQRUrl(params: VietQRParams): string {
  const { bank, accountNumber, accountName, amount, description, template = 'compact2' } = params;

  if (!bank || !accountNumber) return '';

  const bankId = getBankIdentifierForVietQR(bank);
  const cleanAccount = accountNumber.replace(/\s+/g, '');

  let url = `https://img.vietqr.io/image/${bankId}-${cleanAccount}-${template}.png`;

  const searchParams = new URLSearchParams();
  if (amount && amount > 0) {
    searchParams.set('amount', Math.round(amount).toString());
  }
  if (description) {
    searchParams.set('addInfo', description);
  }
  if (accountName) {
    searchParams.set('accountName', accountName.trim());
  }

  const query = searchParams.toString();
  return query ? `${url}?${query}` : url;
}
