const aiService = require('../services/aiService');

/**
 * UC006: SSE Streaming Chatbot cho tư vấn mua sắm
 */
async function streamChat(req, res) {
  try {
    const { messages, userQuery } = req.body;
    await aiService.streamChatbotResponse({ messages, userQuery }, res);
  } catch (error) {
    console.error('Error in streamChat controller:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

/**
 * UC008: AI sinh mô tả sản phẩm chuẩn SEO cho nhân viên
 */
async function generateDescription(req, res) {
  try {
    const { name, category, material, fit, style, highlights } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên sản phẩm' });
    }

    const aiResult = await aiService.generateProductDescription({
      name,
      category,
      material,
      fit,
      style,
      highlights
    });

    return res.json({
      success: true,
      data: aiResult
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * UC010: AI Phân tích Chiến lược kinh doanh cho Admin
 */
async function getStrategicAnalysis(req, res) {
  try {
    const result = await aiService.generateStrategicAnalysis();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  streamChat,
  generateDescription,
  getStrategicAnalysis
};
