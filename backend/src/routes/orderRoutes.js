const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, optionalAuth, authorizeRoles } = require('../middlewares/auth');

// Public tracking
router.get('/track/:code', orderController.getOrderByCode);

// Customer checkout (hỗ trợ cả khách đăng nhập và khách vãng lai)
router.post('/checkout', optionalAuth, orderController.createOrder);

// Customer my orders
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Employee & Admin routes
router.get('/', authenticate, authorizeRoles('employee', 'admin'), orderController.getAllOrders);
router.get('/kpi/dashboard', authenticate, authorizeRoles('employee', 'admin'), orderController.getDashboardKPIs);
router.patch('/:id/status', authenticate, authorizeRoles('employee', 'admin'), orderController.updateStatus);

module.exports = router;
