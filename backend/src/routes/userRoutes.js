const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// Cập nhật thông tin cá nhân
router.put('/profile/me', authenticate, userController.updateMyProfile);

// Admin only routes
router.get('/', authenticate, authorizeRoles('admin'), userController.getAllUsers);
router.put('/:id/role', authenticate, authorizeRoles('admin'), userController.updateUserRole);
router.put('/:id/membership', authenticate, authorizeRoles('admin'), userController.updateUserMembership);
router.delete('/:id', authenticate, authorizeRoles('admin'), userController.deleteUser);

module.exports = router;
