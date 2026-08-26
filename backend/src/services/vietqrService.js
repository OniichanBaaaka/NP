/**
 * Service tích hợp cổng thanh toán VietQR Napas 247
 * Sinh Dynamic QR Code chuyển khoản tức thì chuẩn liên ngân hàng
 */

const DEFAULT_BANK_ID = process.env.VIETQR_BANK_ID || 'MB';
const DEFAULT_ACCOUNT_NO = process.env.VIETQR_ACCOUNT_NO || '5100101042006';
const DEFAULT_ACCOUNT_NAME = process.env.VIETQR_ACCOUNT_NAME || 'VU DUC DAT';
const DEFAULT_TEMPLATE = process.env.VIETQR_TEMPLATE || 'compact2';

function generateVietQRData({
  amount,
  orderCode,
  bankId = DEFAULT_BANK_ID,
  accountNo = DEFAULT_ACCOUNT_NO,
  accountName = DEFAULT_ACCOUNT_NAME,
  template = DEFAULT_TEMPLATE
}) {
  const addInfo = `XIV ${orderCode}`;
  
  // Format URL theo chuẩn QuickLink của VietQR Napas 247
  // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  const encodedInfo = encodeURIComponent(addInfo);
  const encodedName = encodeURIComponent(accountName);
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${Math.round(amount)}&addInfo=${encodedInfo}&accountName=${encodedName}`;

  return {
    qrUrl,
    bankId,
    accountNo,
    accountName,
    amount: Math.round(amount),
    addInfo
  };
}

module.exports = {
  generateVietQRData
};
