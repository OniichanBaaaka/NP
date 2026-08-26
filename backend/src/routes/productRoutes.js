const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Employee & Admin routes (Thêm/Sửa sản phẩm)
router.post('/', authenticate, authorizeRoles('employee', 'admin'), productController.createProduct);
router.put('/:id', authenticate, authorizeRoles('employee', 'admin'), productController.updateProduct);

// Admin only (Xóa sản phẩm)
router.delete('/:id', authenticate, authorizeRoles('admin'), productController.deleteProduct);

module.exports = router;
