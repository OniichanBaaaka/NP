const mongoose = require('mongoose');
const { Product, Category } = require('../models');

function formatProduct(p) {
  if (!p) return null;
  const doc = p.toJSON ? p.toJSON() : p;
  return {
    ...doc,
    isLowStock: doc.stock <= 10,
  };
}

async function getAllProducts(req, res) {
  try {
    const { category, search, lowStockOnly, featured, sortBy, limit } = req.query;

    const filter = {};

    // Filter by Category (by slug or ObjectId)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.categoryId = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          filter.categoryId = cat._id;
        } else {
          filter.category = new RegExp(category, 'i');
        }
      }
    }

    // Full-text Search
    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { name: regex },
        { sku: regex },
        { shortDescription: regex },
        { description: regex },
        { tags: regex },
        { category: regex },
      ];
    }

    // Low stock filter
    if (lowStockOnly === 'true' || lowStockOnly === '1') {
      filter.stock = { $lte: 10 };
    }

    // Featured / trending filter
    if (featured === 'true' || featured === '1') {
      filter.isTrending = true;
    }

    let query = Product.find(filter).populate('categoryId', 'name slug image');

    // Sorting
    if (sortBy === 'popular') {
      query = query.sort({ soldCount: -1, _id: -1 });
    } else if (sortBy === 'price-asc') {
      query = query.sort({ price: 1 });
    } else if (sortBy === 'price-desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Limit
    if (limit && !isNaN(parseInt(limit, 10))) {
      query = query.limit(parseInt(limit, 10));
    }

    const products = await query.exec();
    const formatted = products.map(formatProduct);

    return res.json({
      success: true,
      count: formatted.length,
      products: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('categoryId', 'name slug image');
    }

    if (!product) {
      product = await Product.findOne({
        $or: [{ sku: id.toUpperCase() }, { name: new RegExp(`^${id}$`, 'i') }],
      }).populate('categoryId', 'name slug image');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    return res.json({
      success: true,
      product: formatProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const {
      name,
      sku,
      categoryId,
      category,
      price,
      salePrice,
      stock,
      images,
      shortDescription,
      description,
      sizes,
      colors,
      material,
      fit,
      style,
      tags,
      isNewProduct,
      isTrending,
      status,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên và giá sản phẩm',
      });
    }

    const finalSku = sku || `XIV-${Date.now().toString().slice(-6)}`;
    const existing = await Product.findOne({ sku: finalSku.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Mã SKU ${finalSku} đã tồn tại trong hệ thống`,
      });
    }

    let finalCategoryName = category || 'Streetwear';
    let validCatId = null;
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      const cat = await Category.findById(categoryId);
      if (cat) {
        validCatId = cat._id;
        finalCategoryName = cat.name;
      }
    }

    const product = await Product.create({
      name: name.trim(),
      sku: finalSku.toUpperCase(),
      categoryId: validCatId,
      category: finalCategoryName,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      stock: Number(stock || 0),
      soldCount: 0,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      shortDescription: shortDescription || '',
      description: description || '',
      sizes: Array.isArray(sizes) && sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(colors) && colors.length ? colors : ['Black'],
      material: material || '100% Cotton cao cấp',
      fit: fit || 'Boxy Oversized',
      style: style || 'Cyberpunk Streetwear',
      tags: Array.isArray(tags) ? tags : ['streetwear', 'xiv-studio'],
      isNewProduct: isNewProduct !== undefined ? Boolean(isNewProduct) : true,
      isTrending: isTrending !== undefined ? Boolean(isTrending) : false,
      status: status || 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm mới thành công',
      product: formatProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ sku: id.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const updates = req.body;
    if (updates.name) product.name = updates.name.trim();
    if (updates.sku) product.sku = updates.sku.toUpperCase().trim();
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.salePrice !== undefined) product.salePrice = updates.salePrice ? Number(updates.salePrice) : null;
    if (updates.stock !== undefined) product.stock = Number(updates.stock);
    if (updates.soldCount !== undefined) product.soldCount = Number(updates.soldCount);
    if (updates.images) product.images = Array.isArray(updates.images) ? updates.images : [updates.images];
    if (updates.shortDescription !== undefined) product.shortDescription = updates.shortDescription;
    if (updates.description !== undefined) product.description = updates.description;
    if (updates.sizes) product.sizes = updates.sizes;
    if (updates.colors) product.colors = updates.colors;
    if (updates.material) product.material = updates.material;
    if (updates.fit) product.fit = updates.fit;
    if (updates.style) product.style = updates.style;
    if (updates.tags) product.tags = updates.tags;
    if (updates.isNewProduct !== undefined) product.isNewProduct = Boolean(updates.isNewProduct);
    if (updates.isTrending !== undefined) product.isTrending = Boolean(updates.isTrending);
    if (updates.status) product.status = updates.status;

    if (updates.categoryId && mongoose.Types.ObjectId.isValid(updates.categoryId)) {
      const cat = await Category.findById(updates.categoryId);
      if (cat) {
        product.categoryId = cat._id;
        product.category = cat.name;
      }
    }

    await product.save();

    return res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      product: formatProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndDelete(id);
    }
    if (!product) {
      product = await Product.findOneAndDelete({ sku: id.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    return res.json({
      success: true,
      message: `Đã xóa sản phẩm "${product.name}" thành công`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
