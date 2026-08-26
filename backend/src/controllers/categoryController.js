const mongoose = require('mongoose');
const { Category, Product } = require('../models');

async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, createdAt: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const productCount = await Product.countDocuments({ categoryId: c._id });
        const doc = c.toJSON();
        return {
          ...doc,
          productCount,
        };
      })
    );

    return res.json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function createCategory(req, res) {
  try {
    const { name, slug, description, image, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên danh mục' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Category.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: `Slug danh mục "${generatedSlug}" đã tồn tại` });
    }

    const newCat = await Category.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      displayOrder: Number(displayOrder || 0),
    });

    return res.status(201).json({ success: true, category: newCat });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, description, image, displayOrder } = req.body;

    let category = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    }
    if (!category) {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    if (name) category.name = name.trim();
    if (slug) category.slug = slug.toLowerCase().trim();
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);

    await category.save();

    return res.json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    let category = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    }
    if (!category) {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    const prodCount = await Product.countDocuments({ categoryId: category._id });
    if (prodCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục đang có ${prodCount} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`,
      });
    }

    await Category.findByIdAndDelete(category._id);
    return res.json({ success: true, message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
