const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên sản phẩm'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Vui lòng cung cấp mã SKU'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    category: {
      type: String,
      default: 'Streetwear',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: [0, 'Giá sản phẩm không thể âm'],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Giá sale không thể âm'],
    },
    stock: {
      type: Number,
      required: [true, 'Vui lòng cung cấp số lượng tồn kho'],
      default: 0,
      min: [0, 'Tồn kho không thể âm'],
    },
    soldCount: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng bán không thể âm'],
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: {
      type: [String],
      default: ['Black'],
    },
    material: {
      type: String,
      default: '100% Heavyweight Cotton',
    },
    fit: {
      type: String,
      default: 'Boxy / Oversized',
    },
    style: {
      type: String,
      default: 'Cyberpunk Streetwear',
    },
    tags: {
      type: [String],
      default: [],
    },
    isNewProduct: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'xiv_products',
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

productSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('Product', productSchema);
