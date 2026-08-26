const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      default: '',
    },
    orderCode: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    fitEvaluation: {
      type: String,
      enum: ['Vừa vặn', 'Hơi rộng', 'Hơi chật'],
      default: 'Vừa vặn',
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    collection: 'xiv_reviews',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Review', reviewSchema);
