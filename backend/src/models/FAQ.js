const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Vui lòng nhập câu hỏi'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Vui lòng nhập câu trả lời'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['SHIPPING', 'PAYMENT', 'RETURN', 'PRODUCT', 'MEMBERSHIP', 'GENERAL'],
      default: 'GENERAL',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'xiv_faqs',
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

faqSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('FAQ', faqSchema);
