import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  AlertTriangle,
  ChevronDown,
  QrCode,
  Flame,
} from 'lucide-react';
import { productAPI, categoryAPI, faqAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import FlashSaleSection from '../components/FlashSaleSection';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, lowRes, catRes, faqRes] = await Promise.all([
          productAPI.getAll({ featured: true, limit: 10 }),
          productAPI.getAll({ lowStockOnly: true, limit: 5 }),
          categoryAPI.getAll(),
          faqAPI.getAll(),
        ]);

        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products);
        if (lowRes.data.success) setLowStockProducts(lowRes.data.products);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (faqRes.data.success) setFaqs(faqRes.data.faqs);
      } catch (e) {
        console.error('Failed to load homepage data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Banner Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/20 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-400/20 dark:bg-pink-500/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 dark:bg-gray-900/80 border border-pink-300 dark:border-cyan-500/30 text-pink-800 dark:text-cyan-400 text-xs font-black backdrop-blur-md shadow-md shadow-pink-200/50">
            <Sparkles className="w-4 h-4 text-pink-600 dark:text-cyan-400 animate-spin" />
            BST FW26 CYBERPUNK STREETWEAR • GENAI POWERED
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1] font-heading">
            ĐỊNH NGHĨA LẠI PHONG CÁCH <br />
            <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 dark:from-cyan-400 dark:via-pink-500 dark:to-purple-500 bg-clip-text text-transparent">
              STREETWEAR TƯƠNG LAI
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-800 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-bold">
            XIV STUDIO kết hợp tính thẩm mỹ Dystopian cao cấp cùng công nghệ Trợ lý ảo AI và thanh toán tự động VietQR Napas 247 trong 3 giây.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/shop"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 hover:opacity-95 text-white font-black text-sm flex items-center gap-2 transition-all shadow-xl shadow-pink-500/30 hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" /> Khám phá Bộ sưu tập
            </Link>
            <a
              href="#faqs"
              className="px-8 py-4 rounded-2xl bg-white dark:bg-gray-900/90 hover:bg-pink-50 dark:hover:bg-gray-800 text-slate-950 dark:text-gray-200 border border-pink-300 dark:border-gray-700 font-black text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              Chính sách & VietQR <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Feature Highlights Pill */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-pink-300 dark:border-gray-800 backdrop-blur-md flex items-center gap-3 shadow-md shadow-pink-200/40">
              <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-cyan-950 text-pink-700 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-950 dark:text-white font-black text-xs">VietQR Napas 247</h4>
                <p className="text-[11px] text-slate-700 dark:text-gray-400 font-medium">Khớp đơn tức thì 0% phí</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-pink-300 dark:border-gray-800 backdrop-blur-md flex items-center gap-3 shadow-md shadow-pink-200/40">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-pink-950 text-rose-700 dark:text-pink-400 flex items-center justify-center flex-shrink-0 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-950 dark:text-white font-black text-xs">AI Chatbot RAG</h4>
                <p className="text-[11px] text-slate-700 dark:text-gray-400 font-medium">Tư vấn size theo số đo 24/7</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-pink-300 dark:border-gray-800 backdrop-blur-md flex items-center gap-3 shadow-md shadow-pink-200/40">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-950 dark:text-white font-black text-xs">100% Authentic Drop</h4>
                <p className="text-[11px] text-slate-700 dark:text-gray-400 font-medium">Đổi trả 7 ngày nguyên seal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Countdown Section */}
      <FlashSaleSection />

      {/* Low-Stock Alert Section (Trending Limited Drops) */}
      {lowStockProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-red-950/40 dark:via-gray-900/60 dark:to-gray-950/80 border border-red-200 dark:border-red-900/50 shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-500/30 text-xs font-black mb-2">
                  <Flame className="w-4 h-4 animate-bounce" /> CẢNH BÁO SẮP CHÁY HÀNG (TỒN KHO &le; 10)
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-heading">
                  SẢN PHẨM GIỚI HẠN SẮP HẾT
                </h2>
              </div>
              <Link
                to="/shop?lowStockOnly=true"
                className="text-xs text-red-700 dark:text-red-400 hover:underline font-black flex items-center gap-1"
              >
                Xem tất cả mẫu sắp hết <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {lowStockProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-pink-700 dark:text-cyan-400 text-xs font-mono tracking-widest uppercase font-black">
              Danh mục sản phẩm
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-heading mt-1">
              KHÁM PHÁ THEO BST
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs text-slate-800 dark:text-gray-400 hover:text-pink-700 dark:hover:text-cyan-400 font-extrabold flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border border-pink-200 dark:border-gray-800 hover:border-pink-500 transition-all shadow-md hover:shadow-xl"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
                <h3 className="text-sm font-black text-white group-hover:text-pink-300 transition-colors font-heading">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-pink-200 mt-0.5 font-mono font-bold">
                  {cat.productCount || 0} sản phẩm
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Drops Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-pink-700 dark:text-cyan-400 text-xs font-mono tracking-widest uppercase font-black">
              Chủ đạo FW26
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-heading mt-1">
              BEST SELLERS & NỔI BẬT
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs text-slate-800 dark:text-gray-400 hover:text-pink-700 dark:hover:text-cyan-400 font-extrabold flex items-center gap-1 transition-colors"
          >
            Toàn bộ cửa hàng ({featuredProducts.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-pink-700 dark:text-cyan-400 text-xs font-mono tracking-widest uppercase font-black">
            Hỗ trợ & Chính sách
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-heading">
            CÂU HỎI THƯỜNG GẶP (FAQ)
          </h2>
          <p className="text-xs text-slate-700 dark:text-gray-400 font-bold">
            Dữ liệu được nạp trực tiếp vào RAG Context của AI Chatbot
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-2xl bg-white dark:bg-gray-900/60 border border-pink-300 dark:border-gray-800 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:text-pink-600 dark:hover:text-cyan-400 transition-colors"
              >
                <span className="font-black text-sm text-slate-950 dark:text-gray-100">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-pink-600 dark:text-cyan-400 flex-shrink-0 transition-transform ${
                    openFaq === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === faq.id && (
                <div className="px-5 pb-5 text-xs text-slate-800 dark:text-gray-400 leading-relaxed border-t border-pink-100 dark:border-gray-800/60 pt-3 font-medium">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
