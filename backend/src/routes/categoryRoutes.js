const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

router.get('/', categoryController.getAllCategories);
router.post('/', authenticate, authorizeRoles('admin'), categoryController.createCategory);
router.put('/:id', authenticate, authorizeRoles('admin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;
