const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER || '';
const emailPass = process.env.EMAIL_PASS || '';

let transporter = null;
if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

/**
 * Gửi mã OTP xác thực qua Email
 */
async function sendOtpEmail(toEmail, otpCode) {
  const formattedOtp = otpCode.toString().split('').join(' ');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0d14; color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 520px; margin: 0 auto; background: #111420; border: 1px solid #2a2f45; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #ec4899 100%); padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; }
    .header p { margin: 5px 0 0; font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.85); font-weight: bold; }
    .body { padding: 30px 25px; text-align: center; }
    .body h2 { font-size: 18px; color: #ffffff; margin-top: 0; }
    .body p { font-size: 13px; color: #94a3b8; line-height: 1.6; }
    .otp-box { margin: 25px auto; padding: 18px 25px; background: #07090e; border: 2px dashed #06b6d4; border-radius: 16px; display: inline-block; }
    .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: 'Courier New', monospace; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(236,72,153,0.15); border: 1px solid rgba(236,72,153,0.4); border-radius: 20px; color: #f472b6; font-size: 11px; font-weight: bold; margin-bottom: 15px; }
    .footer { padding: 20px; background: #090b10; text-align: center; border-top: 1px solid #1e2438; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>XIV STUDIO</h1>
      <p>HIGH-END STREETWEAR & AI</p>
    </div>
    <div class="body">
      <div class="badge">XÁC THỰC DANH TÍNH TÀI KHOẢN</div>
      <h2>MÃ XÁC THỰC ĐĂNG KÝ (OTP)</h2>
      <p>Cảm ơn bạn đã gia nhập cộng đồng thời trang <strong>XIV STUDIO</strong>. Hãy sử dụng mã OTP gồm 6 chữ số dưới đây để hoàn tất việc đăng ký tài khoản của bạn:</p>
      
      <div class="otp-box">
        <div class="otp-code">${formattedOtp}</div>
      </div>

      <p style="font-size: 12px; color: #f59e0b;">
        ⏱️ Mã xác thực này có hiệu lực trong vòng <strong>5 phút</strong>.<br/>
        Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ an toàn tài khoản.
      </p>
    </div>
    <div class="footer">
      © 2026 XIV STUDIO VIETNAM. Mọi quyền được bảo lưu.<br/>
      Hệ thống bảo mật thương mại điện tử tự động.
    </div>
  </div>
</body>
</html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"XIV STUDIO Security" <${emailUser}>`,
        to: toEmail,
        subject: `[XIV STUDIO] Mã xác thực đăng ký tài khoản: ${otpCode}`,
        html: htmlContent,
      });
      console.log(`✉️ Đã gửi OTP thành công tới ${toEmail}: ${info.messageId}`);
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.warn(`⚠️ Gửi email qua SMTP thất bại (${err.message}). Sử dụng chế độ Console Fallback:`);
    }
  }

  // Fallback: in mã OTP ra Terminal phục vụ kiểm thử
  console.log(`\n======================================================`);
  console.log(`🔑 [XIV OTP SIMULATOR] MÃ XÁC THỰC GMAIL CHO: ${toEmail}`);
  console.log(`👉 MÃ OTP (6 số): ${otpCode}`);
  console.log(`⏱️ Thời hạn: 5 phút`);
  console.log(`======================================================\n`);

  return { success: true, mode: 'simulator', otp: otpCode };
}

module.exports = {
  sendOtpEmail,
};
