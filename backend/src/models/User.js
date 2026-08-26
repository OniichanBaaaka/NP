const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp họ tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng cung cấp email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Vui lòng cung cấp mật khẩu'],
    },
    role: {
      type: String,
      enum: ['customer', 'employee', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    activePackage: {
      type: String,
      enum: ['NONE', 'PLUS', 'VIP', 'PREMIUM', 'FASHIONISTA_PRO', 'CYBER_VIP', 'XIV_GOD'],
      default: 'NONE',
    },
    membershipTier: {
      type: String,
      enum: ['MEMBER', 'SILVER', 'GOLD', 'DIAMOND'],
      default: 'MEMBER',
    },
  },
  {
    timestamps: true,
    collection: 'xiv_users',
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.password;
        return ret;
      },
    },
  }
);

// Virtual field id mapping
userSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('User', userSchema);
