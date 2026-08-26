import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function FlashSaleSection() {
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  // Countdown timer (tự động reset theo chu kỳ 8 tiếng)
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const hoursRemaining = 7 - (now.getHours() % 8);
    const minutesRemaining = 59 - now.getMinutes();
    const secondsRemaining = 59 - now.getSeconds();
    return hoursRemaining * 3600 + minutesRemaining * 60 + secondsRemaining;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 8 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const flashSaleItems = [
    {
      id: 1,
      sku: 'XIV-HD-001',
      name: 'XIV "NEO-CYBER" Acid Wash Heavyweight Hoodie',
      categoryName: 'Hoodies',
      price: 1250000,
      salePrice: 750000,
      discount: 40,
      stock: 4,
      soldPercent: 88,
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      sku: 'XIV-TS-003',
      name: 'XIV "METAVERSE" Boxy Fit Graphic Tee',
      categoryName: 'T-Shirts',
      price: 550000,
      salePrice: 299000,
      discount: 46,
      stock: 7,
      soldPercent: 92,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 6,
      sku: 'XIV-AC-006',
      name: 'XIV "SHADOW CROSS" Tactical Crossbody Bag',
      categoryName: 'Accessories',
      price: 650000,
      salePrice: 390000,
      discount: 40,
      stock: 5,
      soldPercent: 84,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      sku: 'XIV-JK-004',
      name: 'XIV "DARK MATTER" Reversible Bomber Jacket',
      categoryName: 'Outerwear',
      price: 1850000,
      salePrice: 1190000,
      discount: 36,
      stock: 3,
      soldPercent: 95,
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleAdd = (item) => {
    addToCart(item, 1, 'L');
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-pink-950/50 dark:via-gray-950 dark:to-purple-950/40 border border-pink-200 dark:border-pink-500/40 shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/15 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Section Header with Countdown Timer */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-pink-200 dark:border-pink-900/50 pb-6 mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400 border border-pink-300 dark:border-pink-500/40 text-xs font-extrabold uppercase font-mono tracking-wider">
              <Flame className="w-4 h-4 animate-bounce text-pink-600 dark:text-pink-400" />
              SĂN SALE GIỚI HẠN • FLASH SALE 8H
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
              ƯU ĐÃI ĐỘC QUYỀN LÊN ĐẾN 50%
            </h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-white/80 dark:bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-pink-200 dark:border-pink-500/40 shadow-md">
            <span className="text-xs text-slate-700 dark:text-gray-300 font-bold flex items-center gap-1.5 uppercase font-mono">
              <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" /> KẾT THÚC TRONG:
            </span>
            <div className="flex items-center gap-1.5 font-mono font-extrabold text-sm text-white">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-pink-600 dark:text-pink-400">:</span>
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-pink-600 dark:text-pink-400">:</span>
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Flash Sale Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashSaleItems.map((item) => {
            const isAdded = addedIds[item.id];

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-white dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 hover:border-pink-500 transition-all p-3.5 flex flex-col justify-between shadow-sm hover:shadow-xl"
              >
                {/* Discount Tag */}
                <div className="absolute top-5 left-5 z-10 px-2.5 py-1 rounded-lg bg-pink-600 text-white font-mono font-extrabold text-xs shadow-lg">
                  -{item.discount}%
                </div>

                <div className="space-y-3">
                  {/* Image */}
                  <Link
                    to={`/product/${item.id}`}
                    className="block relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 dark:bg-black"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-mono tracking-wider">
                      {item.categoryName}
                    </span>
                    <Link
                      to={`/product/${item.id}`}
                      className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    >
                      {item.name}
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-1 font-mono">
                      <span className="text-sm sm:text-base font-extrabold text-pink-600 dark:text-pink-400">
                        {item.salePrice.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-xs text-slate-400 dark:text-gray-500 line-through">
                        {item.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Burn Meter Progress */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                        <span className="text-pink-600 dark:text-pink-400 font-bold flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-pink-500" /> Đã bán {item.soldPercent}%
                        </span>
                        <span>Còn {item.stock} cái</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${item.soldPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={() => handleAdd(item)}
                  className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Đã thêm vào giỏ
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Thêm nhanh vào giỏ
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 transition-colors uppercase tracking-wider font-mono"
          >
            Xem tất cả ưu đãi Flash Sale hôm nay <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
