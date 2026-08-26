const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middlewares/auth');

async function register(req, res) {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký! Vui lòng sử dụng email khác hoặc đăng nhập.',
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      totalSpent: 0,
      activePackage: 'NONE',
      membershipTier: 'MEMBER',
    });

    const token = jwt.sign({ id: newUser._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
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
  register,
  login,
  getMe,
};
