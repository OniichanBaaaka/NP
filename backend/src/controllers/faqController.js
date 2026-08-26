const mongoose = require('mongoose');
const { FAQ } = require('../models');

async function getAllFaqs(req, res) {
  try {
    const { category } = req.query;
    const filter = { isPublished: true };

    if (category) {
      filter.category = category.toUpperCase();
    }

    const faqs = await FAQ.find(filter).sort({ displayOrder: 1, createdAt: 1 });

    return res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function createFaq(req, res) {
  try {
    const { question, answer, category, displayOrder } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi và câu trả lời' });
    }

    const newFaq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category: (category || 'GENERAL').toUpperCase(),
      displayOrder: Number(displayOrder || 0),
      isPublished: true,
    });

    return res.status(201).json({ success: true, faq: newFaq });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateFaq(req, res) {
  try {
    const { id } = req.params;
    const { question, answer, category, displayOrder, isPublished } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ không tồn tại' });
    }

    if (question) faq.question = question.trim();
    if (answer) faq.answer = answer.trim();
    if (category) faq.category = category.toUpperCase();
    if (displayOrder !== undefined) faq.displayOrder = Number(displayOrder);
    if (isPublished !== undefined) faq.isPublished = Boolean(isPublished);

    await faq.save();

    return res.json({ success: true, faq });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteFaq(req, res) {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Đã xóa câu hỏi FAQ thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
};
