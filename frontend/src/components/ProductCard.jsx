import React, { useState } from 'react';
import { Heart, ShoppingBag, Check, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('L');
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const isFav = isWishlisted(product.id);
  const isLowStock = product.stock <= 10 && product.stock > 0;
  const isOutOfStock = product.stock <= 0;

  const images = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []);
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
  const hoverImage = images[1] || mainImage;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800/80 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm dark:shadow-md hover:shadow-lg hover:shadow-cyan-500/10">
      {/* Thumbnail Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-gray-900 block">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out group-hover:opacity-0"
        />
        <img
          src={hoverImage}
          alt={product.name}
          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[9px] font-mono shadow">
              -{discountPercent}%
            </span>
          )}
          {isLowStock && (
            <span className="badge-low-stock px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 shadow">
              <AlertTriangle className="w-2.5 h-2.5" /> Còn {product.stock}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-bold">
              HẾT HÀNG
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-10 ${
            isFav
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
              : 'bg-white/80 dark:bg-black/50 text-slate-600 dark:text-gray-300 hover:text-rose-500 border border-slate-200 dark:border-white/10 shadow-sm'
          }`}
          title="Thêm vào yêu thích"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick Size Selector on Hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 inset-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-md py-1 px-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`text-[9px] font-bold w-5 h-5 rounded transition-all ${
                  selectedSize === size
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-800'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </Link>

      {/* Info Container (Compact & Refined) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-gray-500 mb-0.5 font-mono">
            <span className="uppercase tracking-wider font-bold truncate max-w-[90px]">
              {product.categoryName || 'Streetwear'}
            </span>
            <span>{product.sku}</span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="font-bold text-xs text-slate-900 dark:text-gray-100 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors line-clamp-1 block mb-1.5"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-xs sm:text-sm font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {(product.salePrice || product.price).toLocaleString('vi-VN')}đ
            </span>
            {product.salePrice && (
              <span className="text-[10px] text-slate-400 dark:text-gray-500 line-through font-mono">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-1.5 sm:py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-cyan-600 dark:bg-gray-900 dark:hover:bg-cyan-500 dark:hover:text-black text-white border border-slate-200 dark:border-gray-800'
            }`}
          >
            {isOutOfStock ? (
              'Tạm hết'
            ) : added ? (
              <>
                <Check className="w-3 h-3" /> Đã thêm ({selectedSize})
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" /> Mua ({selectedSize})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
