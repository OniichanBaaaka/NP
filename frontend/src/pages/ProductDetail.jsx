import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  AlertTriangle,
  Check,
  ShieldCheck,
  RotateCcw,
  Truck,
  QrCode,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImg, setSelectedImg] = useState('');
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await productAPI.getById(id);
        if (res.data.success) {
          const p = res.data.product;
          setProduct(p);
          const imgs = Array.isArray(p.images) ? p.images : [p.images];
          setSelectedImg(imgs[0] || '');

          // Load related products
          const relRes = await productAPI.getAll({ category: p.categorySlug, limit: 5 });
          if (relRes.data.success) {
            setRelated(relRes.data.products.filter((item) => item.id !== p.id));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-slate-200 dark:bg-gray-900 rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-gray-900 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-gray-900 rounded w-1/3"></div>
            <div className="h-24 bg-slate-200 dark:bg-gray-900 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Không tìm thấy sản phẩm</h2>
        <Link to="/shop" className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold">
          Quay lại danh mục sản phẩm
        </Link>
      </div>
    );
  }

  const isFav = isWishlisted(product.id);
  const isLowStock = product.stock <= 10 && product.stock > 0;
  const isOutOfStock = product.stock <= 0;
  const images = Array.isArray(product.images) ? product.images : [product.images];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize);
    setIsCartOpen(false);
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại BST
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Images Gallery Column */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-md">
            <img
              src={selectedImg || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {isLowStock && (
              <span className="badge-low-stock absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                <AlertTriangle className="w-4 h-4" /> CÒN {product.stock} SẢN PHẨM
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`relative w-16 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImg === img ? 'border-cyan-500 scale-105 shadow-sm' : 'border-slate-200 dark:border-gray-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info Column */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1.5 font-mono">
              <span className="uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
                {product.categoryName}
              </span>
              <span>MÃ: {product.sku}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 shadow-sm">
            <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {(product.salePrice || product.price).toLocaleString('vi-VN')} VNĐ
            </span>
            {product.salePrice && (
              <span className="text-sm text-slate-400 dark:text-gray-500 line-through font-mono">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Size Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 dark:text-gray-200">Chọn kích thước (Form Oversized):</span>
              <span className="text-cyan-600 dark:text-cyan-400 text-[11px] font-semibold">Chuẩn Châu Á</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold font-mono transition-all ${
                    selectedSize === size
                      ? 'bg-cyan-500 text-white shadow-md border-cyan-400'
                      : 'bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-800'
                  }`}
                >
                  Size {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-cyan-600 font-bold"
                >
                  -
                </button>
                <span className="w-9 text-center font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-cyan-600 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isOutOfStock
                    ? 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-900 dark:text-white border border-slate-300 dark:border-gray-700'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                {added ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFav
                    ? 'bg-rose-50 dark:bg-pink-950/80 border-rose-300 dark:border-pink-700 text-rose-600 dark:text-pink-400'
                    : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <QrCode className="w-4 h-4" /> Mua ngay • Thanh toán VietQR Napas 247
            </button>
          </div>

          {/* Store Promises */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 dark:border-gray-800 text-center text-[10px] text-slate-500 dark:text-gray-400">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800">
              <ShieldCheck className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
              100% Chính hãng
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800">
              <RotateCcw className="w-4 h-4 text-pink-500 mx-auto mb-1" />
              Đổi trả 7 ngày
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800">
              <Truck className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              Freeship từ 1 triệu
            </div>
          </div>
        </div>
      </div>

      {/* Description Content */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white uppercase tracking-wider">
          Mô tả chi tiết sản phẩm
        </h3>
        <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {product.description || product.shortDescription}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-extrabold font-heading text-slate-900 dark:text-white">
            SẢN PHẨM CÙNG BST LIÊN QUAN
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
