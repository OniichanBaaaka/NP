const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    sku: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    size: {
      type: String,
      default: 'L',
    },
    color: {
      type: String,
      default: 'Black',
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: [true, 'Vui lòng cung cấp mã đơn hàng'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      required: [true, 'Vui lòng nhập tên người nhận'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Vui lòng nhập email khách hàng'],
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      trim: true,
    },
    shippingAddress: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ giao hàng'],
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    voucherCode: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'VIETQR'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    orderType: {
      type: String,
      enum: ['SHOPPING', 'MEMBERSHIP'],
      default: 'SHOPPING',
      index: true,
    },
    // 5 trạng thái đơn hàng chuẩn
    orderStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    note: {
      type: String,
      default: '',
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'xiv_orders',
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

orderSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('Order', orderSchema);
