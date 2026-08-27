const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, OTP } = require('../models');
const { JWT_SECRET } = require('../middlewares/auth');
const { sendOtpEmail } = require('../services/emailService');

/**
 * Gửi mã OTP xác thực đăng ký tài khoản qua Gmail
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
    const emailResult = await sendOtpEmail(cleanEmail, otpCode, 'register');

    return res.json({
      success: true,
      message: `Mã xác thực OTP đã được gửi đến email ${cleanEmail}. Vui lòng kiểm tra hộp thư (kể cả mục Spam)!`,
      mode: emailResult.mode,
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

    let cleanPhone = '';
    if (phone && phone.trim()) {
      cleanPhone = phone.trim().replace(/[\s.-]/g, '');
      const vnPhoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!vnPhoneRegex.test(cleanPhone) || cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (Ví dụ: 0901234567 hoặc 0387878878).',
        });
      }
    }

    // 3. Tạo tài khoản mới
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'customer',
      phone: cleanPhone,
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

/**
 * Gửi mã OTP Quên mật khẩu / Đặt lại mật khẩu
 */
async function forgotPasswordSendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email hợp lệ' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Kiểm tra tài khoản có tồn tại không
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản nào gắn với email này!',
      });
    }

    // 2. Sinh mã OTP ngẫu nhiên 6 chữ số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Lưu OTP
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
    const emailResult = await sendOtpEmail(cleanEmail, otpCode, 'forgot_password');

    return res.json({
      success: true,
      message: `Mã OTP xác thực đặt lại mật khẩu đã được gửi đến email ${cleanEmail}!`,
      mode: emailResult.mode,
      devOtp: emailResult.mode === 'simulator' ? otpCode : undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Đặt lại mật khẩu mới với mã OTP
 */
async function forgotPasswordReset(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có tối thiểu 6 ký tự',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // 1. Đối soát OTP
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
        message: 'Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới!',
      });
    }

    // 2. Tìm người dùng & cập nhật mật khẩu
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    // 3. Xóa OTP
    await OTP.deleteMany({ email: cleanEmail });

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Gửi mã OTP khi người dùng đã đăng nhập muốn đổi mật khẩu
 */
async function changePasswordSendOtp(req, res) {
  try {
    const user = req.user;
    if (!user || !user.email) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
      { email: user.email },
      {
        otp: otpCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const emailResult = await sendOtpEmail(user.email, otpCode, 'change_password');

    return res.json({
      success: true,
      message: `Mã OTP đổi mật khẩu đã được gửi đến email ${user.email}!`,
      mode: emailResult.mode,
      devOtp: emailResult.mode === 'simulator' ? otpCode : undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Đổi mật khẩu cho người dùng đã đăng nhập (kèm OTP)
 */
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword, otp } = req.body;
    const userId = req.user.id;

    if (!newPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ mã OTP và mật khẩu mới',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Nếu có gửi mật khẩu cũ thì kiểm tra
    if (oldPassword) {
      const isMatch = bcrypt.compareSync(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng!' });
      }
    }

    // Đối soát OTP
    const cleanOtp = String(otp).trim();
    const otpRecord = await OTP.findOne({ email: user.email, otp: cleanOtp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Mã xác thực OTP không chính xác!' });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn!' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    await OTP.deleteMany({ email: user.email });

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
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
  forgotPasswordSendOtp,
  forgotPasswordReset,
  changePasswordSendOtp,
  changePassword,
  login,
  getMe,
};
