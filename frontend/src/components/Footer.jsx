import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, QrCode, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/95 dark:bg-gray-950 border-t-2 border-pink-200 dark:border-gray-900 pt-12 pb-8 text-slate-800 dark:text-gray-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-pink-200 dark:border-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-950 dark:text-white font-black text-xs">VietQR Napas 247</h4>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 font-medium">Thanh toán tự động 0% phí</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/80 border border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-400 flex items-center justify-center flex-shrink-0 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-950 dark:text-white font-black text-xs">AI Stylist 24/7</h4>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 font-medium">Tư vấn size & phối đồ tức thì</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-950 dark:text-white font-black text-xs">Đổi trả 7 ngày</h4>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 font-medium">Miễn phí đổi mẫu & size</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-950 dark:text-white font-black text-xs">Giao hàng toàn quốc</h4>
              <p className="text-[11px] text-slate-600 dark:text-gray-400 font-medium">Freeship đơn từ 1.000.000đ</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-3">
            <h4 className="text-slate-950 dark:text-white font-black text-sm tracking-wider font-heading">
              XIV STUDIO
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-gray-400 font-medium">
              Thương hiệu Streetwear tiên phong kết hợp thời trang cao cấp Dystopian và công nghệ trí tuệ nhân tạo GenAI.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Mua sắm
            </h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/shop" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/shop?category=outerwear" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Áo khoác Outerwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hoodies" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Hoodies & Sweaters
                </Link>
              </li>
              <li>
                <Link to="/membership" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Đặc quyền Hội viên
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Khách hàng
            </h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/order-tracking" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <a href="#faqs" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Câu hỏi thường gặp FAQ
                </a>
              </li>
              <li>
                <Link to="/membership" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Hội viên thân thiết VIP
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Thanh toán & Bảo mật
            </h5>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-gray-400">
              Tích hợp Cổng VietQR Napas 247 khớp đơn tự động. MB Bank Chủ tài khoản VU DUC DAT.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-pink-200/60 dark:border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-gray-500">
          <p>© 2026 XIV STUDIO. All rights reserved.</p>
          <p className="font-mono">GenAI Powered • Built for Streetwear Culture</p>
        </div>
      </div>
    </footer>
  );
}
