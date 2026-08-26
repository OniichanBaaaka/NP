const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, OTP } = require('../models');
const { JWT_SECRET } = require('../middlewares/auth');
const { sendOtpEmail } = require('../services/emailService');

/**
 * Gửi mã OTP xác thực qua Gmail
 */
async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email hợp lệ' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký tài khoản! Vui lòng sử dụng email khác hoặc đăng nhập.',
      });
    }

    // 2. Sinh mã OTP ngẫu nhiên gồm 6 chữ số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Lưu / Cập nhật mã OTP vào MongoDB (hết hạn sau 5 phút)
    await OTP.findOneAndUpdate(
      { email: cleanEmail },
      {
        otp: otpCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 4. Gửi email
    const emailResult = await sendOtpEmail(cleanEmail, otpCode);

    return res.json({
      success: true,
      message: `Mã xác thực OTP đã được gửi đến email ${cleanEmail}. Vui lòng kiểm tra hộp thư (kể cả mục Spam)!`,
      mode: emailResult.mode,
      // Trong chế độ giả lập (chưa cấu hình EMAIL_PASS), trả về preview để không chặn người dùng
      devOtp: emailResult.mode === 'simulator' ? otpCode : undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Đăng ký tài khoản mới kèm đối soát mã OTP
 */
async function register(req, res) {
  try {
    const { name, email, password, phone, address, otp } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
    }

    if (!otp || String(otp).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã xác thực OTP gửi về Gmail' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // 1. Kiểm tra email đã đăng ký chưa
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký! Vui lòng sử dụng email khác hoặc đăng nhập.',
      });
    }

    // 2. Đối soát mã OTP trong CSDL
    const otpRecord = await OTP.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại Gmail!',
      });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực OTP đã hết hạn (quá 5 phút). Vui lòng yêu cầu gửi lại mã mới!',
      });
    }

    // 3. Tạo tài khoản mới
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'customer',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      totalSpent: 0,
      activePackage: 'NONE',
      membershipTier: 'MEMBER',
    });

    // 4. Xóa mã OTP đã sử dụng
    await OTP.deleteMany({ email: cleanEmail });

    // 5. Sinh JWT Token
    const token = jwt.sign({ id: newUser._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công! Chào mừng bạn đến với XIV STUDIO.',
      token,
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản không tồn tại! Vui lòng kiểm tra lại email đăng nhập.',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Nhập sai mật khẩu! Vui lòng kiểm tra lại mật khẩu.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: `Đăng nhập thành công với vai trò ${user.role}`,
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  sendOtp,
  register,
  login,
  getMe,
};
