import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, ArrowRight, AlertTriangle } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function ChatProductCard({ productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      try {
        const res = await productAPI.getById(productId);
        if (isMounted && res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error('Failed to fetch product for chat card:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="my-2 p-3 rounded-xl bg-gray-900/60 border border-gray-800 animate-pulse flex items-center gap-3">
        <div className="w-16 h-16 bg-gray-800 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, 1, 'L');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isLowStock = product.stock <= 10 && product.stock > 0;
  const isOutOfStock = product.stock <= 0;
  const mainImage = Array.isArray(product.images) ? product.images[0] : product.images;

  return (
    <div className="my-3 p-3 rounded-xl bg-gradient-to-r from-gray-900/90 to-gray-950/90 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-lg flex gap-3 items-center group">
      <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isLowStock && (
          <span className="absolute top-1 left-1 bg-red-600/90 text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
            <AlertTriangle className="w-2.5 h-2.5" /> {product.stock}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${product.id}`}
          className="text-xs font-semibold text-gray-200 hover:text-cyan-400 line-clamp-1 block transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-cyan-400 font-bold text-xs">
            {(product.salePrice || product.price).toLocaleString('vi-VN')}đ
          </span>
          {product.salePrice && (
            <span className="text-[10px] text-gray-500 line-through">
              {product.price.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {!isOutOfStock ? (
            <button
              onClick={handleAdd}
              disabled={added}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3 h-3" /> Đã thêm
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" /> Thêm giỏ
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] text-red-400 font-medium">Hết hàng</span>
          )}
          <Link
            to={`/product/${product.id}`}
            className="text-[11px] text-gray-400 hover:text-white flex items-center gap-0.5"
          >
            Chi tiết <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
