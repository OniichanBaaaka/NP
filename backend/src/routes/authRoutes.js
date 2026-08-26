const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// Đăng ký tài khoản kèm OTP
router.post('/send-otp', authController.sendOtp);
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);

// Quên / Đặt lại mật khẩu qua Gmail OTP
router.post('/forgot-password/send-otp', authController.forgotPasswordSendOtp);
router.post('/forgot-password/reset', authController.forgotPasswordReset);

// Đổi mật khẩu cho người dùng đang đăng nhập
router.post('/change-password/send-otp', authenticate, authController.changePasswordSendOtp);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
