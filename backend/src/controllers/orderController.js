const mongoose = require('mongoose');
const { Order, Product, Category } = require('../models');
const orderService = require('../services/orderService');

async function createOrder(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { customerInfo, items, paymentMethod, voucherCode, discountAmount, note } = req.body;

    const order = await orderService.createOrder({
      userId,
      customerInfo,
      items,
      paymentMethod: paymentMethod || 'COD',
      voucherCode,
      discountAmount,
      note,
    });

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      order,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    const formatted = orders.map(orderService.formatOrderRecord);

    return res.json({ success: true, count: formatted.length, orders: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getAllOrders(req, res) {
  try {
    const { status, search, limit, orderType } = req.query;

    const filter = {};
    if (status) {
      filter.orderStatus = status.toUpperCase();
    }

    // Phân quyền: Employee chỉ được xem đơn hàng mua sắm (SHOPPING)
    if (req.user && req.user.role === 'employee') {
      filter.orderType = { $ne: 'MEMBERSHIP' };
    } else if (orderType) {
      filter.orderType = orderType.toUpperCase();
    }

    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { orderCode: regex },
        { customerName: regex },
        { customerPhone: regex },
        { customerEmail: regex },
      ];
    }

    let query = Order.find(filter).sort({ createdAt: -1 });

    if (limit && !isNaN(parseInt(limit, 10))) {
      query = query.limit(parseInt(limit, 10));
    }

    const orders = await query.exec();
    let formatted = orders.map(orderService.formatOrderRecord);

    // Bộ lọc phụ bảo vệ: nếu employee, loại bỏ mọi đơn có subscription item
    if (req.user && req.user.role === 'employee') {
      formatted = formatted.filter((o) => o.orderType !== 'MEMBERSHIP');
    }

    return res.json({ success: true, count: formatted.length, orders: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getOrderByCode(req, res) {
  try {
    const { code } = req.params;
    let order = await Order.findOne({ orderCode: code.toUpperCase().trim() });

    if (!order && mongoose.Types.ObjectId.isValid(code)) {
      order = await Order.findById(code);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: `Không tìm thấy đơn hàng với mã ${code}` });
    }

    return res.json({
      success: true,
      order: orderService.formatOrderRecord(order),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const status = (req.body && (req.body.status || req.body.newStatus || req.body.orderStatus)) || (typeof req.body === 'string' ? req.body : null);
    const note = req.body?.note || req.body?.description || '';

    if (!status) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp trạng thái mới' });
    }

    let targetOrder = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      targetOrder = await Order.findById(id);
    }
    if (!targetOrder) {
      targetOrder = await Order.findOne({ orderCode: id.toUpperCase().trim() });
    }

    if (!targetOrder) {
      return res.status(404).json({ success: false, message: `Không tìm thấy đơn hàng ${id}` });
    }

    // Phân quyền: Employee chỉ được xem và tác động vào đơn SHOPPING!
    const isSubOrder =
      targetOrder.orderType === 'MEMBERSHIP' ||
      targetOrder.items?.some(
        (it) => it.type === 'subscription' || !it.productId || it.name?.includes('GÓI HỘI VIÊN')
      );

    if (req.user && req.user.role === 'employee' && isSubOrder) {
      return res.status(403).json({
        success: false,
        message: 'Nhân viên không có quyền can thiệp vào đơn đăng ký Gói Hội Viên. Chỉ Admin mới có quyền duyệt gói!',
      });
    }

    const updater = req.user ? `${req.user.name} (${req.user.role})` : 'System';
    const updatedOrder = await orderService.updateOrderStatus(targetOrder._id, status, updater, note);

    return res.json({
      success: true,
      message: `Cập nhật đơn hàng sang trạng thái "${status}" thành công`,
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Người mua / Người nhận xác nhận đã nhận được hàng (Chuyển sang DELIVERED)
 */
async function confirmDelivery(req, res) {
  try {
    const { id } = req.params;
    let order = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderCode: id.toUpperCase().trim() });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const currentStatus = String(order.orderStatus || order.status || '').toUpperCase();

    if (currentStatus === 'DELIVERED') {
      return res.json({
        success: true,
        message: 'Đơn hàng này đã được xác nhận đã nhận trước đó.',
        order: orderService.formatOrderRecord(order),
      });
    }

    if (currentStatus === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đang chờ Admin/Nhân viên xác nhận. Sau khi đơn hàng chuyển sang giai đoạn vận chuyển (SHIPPING), bạn mới có thể xác nhận đã nhận hàng.',
      });
    }

    if (currentStatus === 'PROCESSING') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đang trong quá trình đóng gói & chuẩn bị hàng tại kho, chưa bàn giao cho bên vận chuyển.',
      });
    }

    if (currentStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này đã bị hủy, không thể xác nhận nhận hàng.',
      });
    }

    if (currentStatus !== 'SHIPPING' && currentStatus !== 'DELIVERING') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng phải ở giai đoạn đang vận chuyển (SHIPPING) thì bạn mới có thể xác nhận đã nhận được hàng.',
      });
    }

    const updaterName = req.user ? `${req.user.name} (Người nhận)` : `${order.customerName} (Người nhận)`;
    const updatedOrder = await orderService.updateOrderStatus(
      order._id,
      'DELIVERED',
      updaterName,
      'Người nhận xác nhận đã nhận kiện hàng đầy đủ và nguyên vẹn.'
    );

    return res.json({
      success: true,
      message: 'Xác nhận đã nhận hàng thành công! Hãy gửi đánh giá để nhận quà ưu đãi nhé.',
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getDashboardKPIs(req, res) {
  try {
    // Tổng doanh thu từ các đơn không bị CANCELLED
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'PENDING' });

    const lowStockCount = await Product.countDocuments({ stock: { $lte: 10 } });
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .select('name sku stock price category')
      .sort({ stock: 1 });

    const topSellingProducts = await Product.find()
      .select('name sku price stock soldCount images')
      .sort({ soldCount: -1 })
      .limit(5);

    const recentOrdersRaw = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentOrders = recentOrdersRaw.map(orderService.formatOrderRecord);

    return res.json({
      success: true,
      kpis: {
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        lowStockCount,
        lowStockProducts,
        topSellingProducts,
        recentOrders,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderByCode,
  updateStatus,
  confirmDelivery,
  getDashboardKPIs,
};
