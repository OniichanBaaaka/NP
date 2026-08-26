const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// UC006: SSE Streaming Chatbot cho tư vấn mua sắm 24/7 (Public)
router.post('/chat/stream', aiController.streamChat);

// UC008: AI sinh mô tả sản phẩm chuẩn SEO (Employee & Admin)
router.post('/generate-description', authenticate, authorizeRoles('employee', 'admin'), aiController.generateDescription);

// UC010: AI Phân tích Chiến lược kinh doanh (Admin only)
router.get('/strategic-analysis', authenticate, authorizeRoles('admin'), aiController.getStrategicAnalysis);

module.exports = router;
