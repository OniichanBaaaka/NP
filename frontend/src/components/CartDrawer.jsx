import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="font-heading font-bold text-lg text-white">
                GIỎ HÀNG CỦA BẠN ({cartItems.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-gray-400 text-sm">Giỏ hàng của bạn đang trống</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all"
                >
                  Khám phá BST ngay
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="p-3 rounded-2xl bg-gray-900/60 border border-gray-800/80 flex gap-3 items-center group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-xl bg-black flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                      <span>Size: <strong className="text-gray-200">{item.size}</strong></span>
                      <span>•</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {item.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-gray-950 rounded-lg border border-gray-800 px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-gray-900 border-t border-gray-800 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Tạm tính:</span>
                <span className="font-extrabold text-cyan-400 text-lg">
                  {cartTotal.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                ⚡ Hỗ trợ thanh toán tức thì qua VietQR Napas 247 hoặc COD
              </p>
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                Tiến hành Đặt hàng <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
