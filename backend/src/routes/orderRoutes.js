const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, optionalAuth, authorizeRoles } = require('../middlewares/auth');

// Public tracking
router.get('/track/:code', orderController.getOrderByCode);

// Customer checkout (Bắt buộc đăng nhập để đặt hàng & thanh toán)
router.post('/checkout', authenticate, orderController.createOrder);
router.post('/', authenticate, orderController.createOrder);

// Người nhận xác nhận đã nhận hàng
router.post('/:id/confirm-delivery', optionalAuth, orderController.confirmDelivery);
router.patch('/:id/confirm-delivery', optionalAuth, orderController.confirmDelivery);

// Customer my orders
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Employee & Admin routes
router.get('/', authenticate, authorizeRoles('employee', 'admin'), orderController.getAllOrders);
router.get('/kpi/dashboard', authenticate, authorizeRoles('employee', 'admin'), orderController.getDashboardKPIs);
router.patch('/:id/status', authenticate, authorizeRoles('employee', 'admin'), orderController.updateStatus);
router.put('/:id/status', authenticate, authorizeRoles('employee', 'admin'), orderController.updateStatus);

module.exports = router;
