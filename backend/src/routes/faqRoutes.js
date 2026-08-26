const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

router.get('/', faqController.getAllFaqs);
router.post('/', authenticate, authorizeRoles('admin'), faqController.createFaq);
router.put('/:id', authenticate, authorizeRoles('admin'), faqController.updateFaq);
router.delete('/:id', authenticate, authorizeRoles('admin'), faqController.deleteFaq);

module.exports = router;
