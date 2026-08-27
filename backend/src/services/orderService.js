const mongoose = require('mongoose');
const { Order, Product, User, Cart } = require('../models');

/**
 * Tạo mã đơn hàng độc nhất dạng XIV-YYYYMMDD-XXXX
 */
function generateOrderCode() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `XIV-${dateStr}-${randomSuffix}`;
}

/**
 * Chuẩn hóa trạng thái đơn hàng (Hỗ trợ cả dạng hoa và thường)
 */
function normalizeStatus(status) {
  if (!status) return 'PENDING';
  const upper = status.toUpperCase();
  if (['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'].includes(upper)) {
    return upper;
  }
  // Mapping từ các từ khóa cũ
  if (upper === 'CONFIRMED' || upper === 'PREPARING') return 'PROCESSING';
  if (upper === 'DELIVERING') return 'SHIPPING';
  if (upper === 'COMPLETED' || upper === 'SUCCESS') return 'DELIVERED';
  return 'PENDING';
}

/**
 * Tạo đơn hàng mới (Lưu thực tế vào MongoDB xiv_orders)
 */
async function createOrder({ userId, customerInfo, items, paymentMethod, voucherCode, discountAmount, note }) {
  if (!customerInfo || !customerInfo.name || !customerInfo.name.trim()) {
    throw new Error('Vui lòng nhập họ và tên người nhận hàng.');
  }

  const phoneClean = (customerInfo.phone || '').trim().replace(/[\s.-]/g, '');
  if (!phoneClean) {
    throw new Error('Vui lòng nhập số điện thoại người nhận hàng để nhân viên liên hệ giao hàng.');
  }

  const vnPhoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!vnPhoneRegex.test(phoneClean) || phoneClean.length !== 10) {
    throw new Error('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (Ví dụ: 0901234567 hoặc 0387878878).');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Đơn hàng phải có ít nhất một sản phẩm');
  }

  const pMethod = (paymentMethod || 'COD').toUpperCase();
  if (!['VIETQR', 'COD'].includes(pMethod)) {
    throw new Error('Phương thức thanh toán không hợp lệ (hỗ trợ VIETQR, COD)');
  }

  let totalAmount = 0;
  const processedItems = [];

  // Duyệt và kiểm tra tồn kho cho từng sản phẩm
  for (const it of items) {
    // 1. Gói hội viên kỹ thuật số
    if (it.type === 'subscription' || (it.productId && String(it.productId).startsWith('999')) || it.name?.includes('GÓI HỘI VIÊN')) {
      const subPrice = Number(it.price) || 0;
      totalAmount += subPrice * (it.quantity || 1);
      processedItems.push({
        productId: null,
        name: it.name || 'Gói Hội Viên XIV',
        price: subPrice,
        quantity: it.quantity || 1,
        size: it.size || 'PLUS',
        color: 'Gold',
        image: it.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        sku: it.sku || `XIV-SUB-${it.size || 'PLUS'}`,
      });
      continue;
    }

    // 2. Sản phẩm vật lý
    let product = null;
    if (it.productId && mongoose.Types.ObjectId.isValid(it.productId)) {
      product = await Product.findById(it.productId);
    }
    if (!product && it.sku) {
      product = await Product.findOne({ sku: it.sku });
    }
    if (!product && it.productId) {
      product = await Product.findOne({
        $or: [{ sku: String(it.productId) }, { name: it.name }],
      });
    }

    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm "${it.name || it.productId}"`);
    }

    const reqQuantity = Number(it.quantity) || 1;
    if (product.stock < reqQuantity) {
      throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho (yêu cầu: ${reqQuantity})`);
    }

    const price = product.salePrice || product.price;
    totalAmount += price * reqQuantity;

    processedItems.push({
      productId: product._id,
      name: product.name,
      price: price,
      quantity: reqQuantity,
      size: it.size || 'L',
      color: it.color || 'Black',
      image: (product.images && product.images[0]) || it.image || '',
      sku: product.sku,
    });
  }

  const discount = Number(discountAmount) || 0;
  const finalAmount = Math.max(0, totalAmount - discount);
  const orderCode = generateOrderCode();

  // Tạo dữ liệu VietQR Napas 247
  let vietqrData = null;
  if (pMethod === 'VIETQR') {
    const bankBin = process.env.VIETQR_BANK_ID || 'MB';
    const bankAccount = process.env.VIETQR_ACCOUNT_NO || '5100101042006';
    const accountName = process.env.VIETQR_ACCOUNT_NAME || 'VU DUC DAT';
    const memo = `XIV ${orderCode}`;
    const qrUrl = `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;

    vietqrData = {
      bankCode: bankBin,
      bankName: 'MB Bank (Ngân hàng Quân Đội)',
      accountNumber: bankAccount,
      accountName: accountName,
      amount: finalAmount,
      content: memo,
      qrUrl: qrUrl,
      quickLink: `https://api.vietqr.io/${bankBin}/${bankAccount}/${finalAmount}/${encodeURIComponent(memo)}`,
    };
  }

  const isSubscriptionOrder = processedItems.every(
    (it) => it.type === 'subscription' || !it.productId || it.name?.includes('GÓI HỘI VIÊN')
  );

  const initStatus = 'PENDING';
  const initPaymentStatus = 'PENDING';

  const initialTimeline = [
    {
      status: initStatus,
      time: new Date(),
      description: isSubscriptionOrder
        ? `Đơn đăng ký Gói Hội Viên được khởi tạo qua VietQR Napas 247. Đang chờ khách hàng chuyển khoản và Admin xác nhận.`
        : `Đơn hàng được khởi tạo qua phương thức thanh toán ${pMethod}`,
    },
  ];

  let validUserId = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    validUserId = userId;
  }

  const orderType = isSubscriptionOrder ? 'MEMBERSHIP' : 'SHOPPING';

  const newOrder = await Order.create({
    orderCode,
    userId: validUserId,
    orderType,
    customerName: customerInfo.name.trim(),
    customerEmail: (customerInfo.email || 'customer@gmail.com').trim().toLowerCase(),
    customerPhone: customerInfo.phone.trim(),
    shippingAddress: (customerInfo.address || 'Tại cửa hàng').trim(),
    items: processedItems,
    totalAmount,
    discountAmount: discount,
    finalAmount,
    voucherCode: voucherCode || null,
    paymentMethod: pMethod,
    paymentStatus: initPaymentStatus,
    orderStatus: initStatus,
    note: note || customerInfo.note || '',
    timeline: initialTimeline,
  });

  // Xóa giỏ hàng sau khi đặt thành công
  if (validUserId) {
    await Cart.findOneAndDelete({ userId: validUserId });
  }

  const doc = newOrder.toJSON();
  return {
    ...doc,
    id: String(doc._id),
    status: initStatus,
    orderStatus: initStatus,
    vietqrData,
    customerInfo: {
      name: doc.customerName,
      email: doc.customerEmail,
      phone: doc.customerPhone,
      address: doc.shippingAddress,
      note: doc.note,
    },
  };
}

/**
 * Cập nhật trạng thái đơn hàng (Quản lý kho & Kích hoạt tích điểm/hội viên)
 */
async function updateOrderStatus(orderId, newStatus, updaterInfo = 'Employee/Admin', note = '') {
  const normStatus = normalizeStatus(newStatus);

  let order = null;
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findById(orderId);
  }
  if (!order) {
    order = await Order.findOne({ orderCode: orderId.toUpperCase() });
  }

  if (!order) {
    throw new Error(`Không tìm thấy đơn hàng với ID hoặc mã: ${orderId}`);
  }

  const oldStatus = order.orderStatus;
  if (oldStatus === normStatus) {
    return formatOrderRecord(order);
  }

  // Cập nhật timeline
  order.timeline.push({
    status: normStatus,
    time: new Date(),
    description: note || `Trạng thái cập nhật từ ${oldStatus} sang ${normStatus} bởi ${updaterInfo}`,
  });

  // 1. Khi đơn chuyển sang DELIVERED -> Trừ kho thực tế, tăng soldCount và cộng tích điểm cho khách
  if (normStatus === 'DELIVERED' && oldStatus !== 'DELIVERED') {
    for (const it of order.items) {
      if (it.productId) {
        const prod = await Product.findById(it.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - it.quantity);
          prod.soldCount += it.quantity;
          await prod.save();
        }
      }
    }

    // Tích điểm và thăng hạng thành viên
    let targetUser = null;
    if (order.userId) {
      targetUser = await User.findById(order.userId);
    } else if (order.customerEmail) {
      targetUser = await User.findOne({ email: order.customerEmail.toLowerCase() });
    }

    if (targetUser) {
      targetUser.totalSpent += order.finalAmount || order.totalAmount;

      // Kích hoạt gói hội viên nếu là đơn mua gói
      const subItem = order.items?.find(
        (it) => it.type === 'subscription' || !it.productId || it.name?.includes('GÓI HỘI VIÊN')
      );
      if (subItem) {
        const pkg = (subItem.size || 'PLUS').toUpperCase();
        targetUser.activePackage = pkg;
        if (pkg === 'VIP' || pkg === 'PREMIUM') {
          if (targetUser.membershipTier === 'MEMBER' || targetUser.membershipTier === 'SILVER') {
            targetUser.membershipTier = 'GOLD';
          }
        }
      }

      if (targetUser.totalSpent >= 30000000) targetUser.membershipTier = 'DIAMOND';
      else if (targetUser.totalSpent >= 15000000 && targetUser.membershipTier !== 'DIAMOND') targetUser.membershipTier = 'GOLD';
      else if (targetUser.totalSpent >= 5000000 && targetUser.membershipTier === 'MEMBER') targetUser.membershipTier = 'SILVER';

      await targetUser.save();
    }

    order.paymentStatus = 'PAID';
  }

  // 2. Nếu đơn đã DELIVERED mà bị CANCELLED -> Hoàn lại tồn kho
  if (oldStatus === 'DELIVERED' && normStatus === 'CANCELLED') {
    for (const it of order.items) {
      if (it.productId) {
        const prod = await Product.findById(it.productId);
        if (prod) {
          prod.stock += it.quantity;
          prod.soldCount = Math.max(0, prod.soldCount - it.quantity);
          await prod.save();
        }
      }
    }
  }

  order.orderStatus = normStatus;
  await order.save();

  return formatOrderRecord(order);
}

function formatOrderRecord(order) {
  if (!order) return null;
  const doc = order.toJSON ? order.toJSON() : order;

  // Dữ liệu VietQR nếu là phương thức VIETQR
  let vietqrData = null;
  if (doc.paymentMethod === 'VIETQR') {
    const bankBin = process.env.VIETQR_BANK_ID || 'MB';
    const bankAccount = process.env.VIETQR_ACCOUNT_NO || '5100101042006';
    const accountName = process.env.VIETQR_ACCOUNT_NAME || 'VU DUC DAT';
    const memo = `XIV ${doc.orderCode}`;
    const amount = doc.finalAmount || doc.totalAmount;
    vietqrData = {
      bankCode: bankBin,
      bankName: 'MB Bank (Ngân hàng Quân Đội)',
      accountNumber: bankAccount,
      accountName: accountName,
      amount: amount,
      content: memo,
      qrUrl: `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`,
    };
  }

  const rawStatus = (doc.orderStatus || doc.status || 'PENDING').toUpperCase();
  const isSubscriptionOrder =
    doc.orderType === 'MEMBERSHIP' ||
    (doc.items || []).some(
      (it) =>
        it.type === 'subscription' ||
        it.itemType === 'subscription' ||
        !it.productId ||
        (it.name && it.name.toUpperCase().includes('HỘI VIÊN')) ||
        (it.name && it.name.toUpperCase().includes('GÓI')) ||
        (it.sku && it.sku.includes('SUB'))
    );
  const normalizedOrderType = isSubscriptionOrder ? 'MEMBERSHIP' : (doc.orderType || 'SHOPPING');

  return {
    ...doc,
    id: doc._id ? String(doc._id) : doc.id,
    orderType: normalizedOrderType,
    status: rawStatus,
    orderStatus: rawStatus,
    customerInfo: {
      name: doc.customerName,
      email: doc.customerEmail,
      phone: doc.customerPhone,
      address: doc.shippingAddress,
      note: doc.note,
    },
    vietqrData,
    statusHistory: doc.timeline,
  };
}

module.exports = {
  createOrder,
  updateOrderStatus,
  formatOrderRecord,
  generateOrderCode,
};
