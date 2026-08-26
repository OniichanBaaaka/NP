const { Review, Product } = require('../models');

/**
 * Lấy danh sách đánh giá của chính người dùng đang đăng nhập
 */
async function getMyReviews(req, res) {
  try {
    const userId = req.user.id;
    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Lấy tất cả đánh giá của 1 sản phẩm cụ thể
 */
async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Tạo mới đánh giá cho sản phẩm đã mua
 */
async function createReview(req, res) {
  try {
    const userId = req.user.id;
    const { productId, rating, comment, fitEvaluation, images, orderCode } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã sản phẩm, số sao đánh giá và nội dung nhận xét',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const newReview = await Review.create({
      userId,
      userName: req.user.name || 'Khách hàng XIV',
      userAvatar: req.user.avatar || '',
      productId: product._id,
      productName: product.name,
      productImage: product.images && product.images.length > 0 ? product.images[0] : '',
      orderCode: orderCode || '',
      rating: Number(rating),
      comment: comment.trim(),
      fitEvaluation: fitEvaluation || 'Vừa vặn',
      images: Array.isArray(images) ? images : [],
    });

    // Cập nhật điểm đánh giá trung bình của sản phẩm
    const allProductReviews = await Review.find({ productId: product._id });
    const totalRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / allProductReviews.length).toFixed(1));

    product.rating = avgRating;
    product.reviewsCount = allProductReviews.length;
    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá sản phẩm!',
      review: newReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Xóa đánh giá
 */
async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại' });
    }

    if (review.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đánh giá này' });
    }

    await Review.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Đã xóa đánh giá thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getMyReviews,
  getProductReviews,
  createReview,
  deleteReview,
};
