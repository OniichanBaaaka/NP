const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, cartController.getCart);
router.post('/sync', optionalAuth, cartController.syncCart);

module.exports = router;
