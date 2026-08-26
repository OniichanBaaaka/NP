const mongoose = require('mongoose');
const { Cart } = require('../models');

async function getCart(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { sessionId } = req.query;

    let cartRecord = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      cartRecord = await Cart.findOne({ userId });
    } else if (sessionId) {
      cartRecord = await Cart.findOne({ sessionId });
    }

    if (!cartRecord) {
      return res.json({ success: true, items: [] });
    }

    return res.json({ success: true, items: cartRecord.items || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function syncCart(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { sessionId, items } = req.body;

    const cleanItems = Array.isArray(items) ? items : [];

    let cart = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = cleanItems;
        await cart.save();
      } else {
        cart = await Cart.create({ userId, items: cleanItems });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
      if (cart) {
        cart.items = cleanItems;
        await cart.save();
      } else {
        cart = await Cart.create({ sessionId, items: cleanItems });
      }
    }

    return res.json({
      success: true,
      message: 'Đã đồng bộ giỏ hàng thành công',
      items: (cart && cart.items) || cleanItems,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getCart,
  syncCart,
};
