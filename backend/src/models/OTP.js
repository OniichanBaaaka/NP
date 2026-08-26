const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // Hết hạn sau 5 phút
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // MongoDB TTL Index: tự động xóa bản ghi sau 300 giây (5 phút)
    },
  },
  {
    collection: 'xiv_otps',
    timestamps: true,
  }
);

module.exports = mongoose.model('OTP', otpSchema);
