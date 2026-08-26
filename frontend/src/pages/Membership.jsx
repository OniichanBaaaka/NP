import React, { useState } from 'react';
import {
  Crown,
  Shield,
  Gem,
  Sparkles,
  Zap,
  Gift,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  QrCode,
  Check,
  Star,
  Flame,
  Award,
  Layers,
  Clock,
  Truck,
  HeartHandshake,
  RotateCcw,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import MembershipBadge from '../components/MembershipBadge';
import VietQRModal from '../components/VietQRModal';

export default function Membership() {
  const {
    user,
    currentTier,
    userSpending,
    nextTierProgress,
    nextTierRemaining,
    nextTierThreshold,
    activePackage,
    activateSubscriptionPackage,
    setTierDemo,
    refreshUserData,
  } = useAuth();

  const navigate = useNavigate();
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showPackageQR, setShowPackageQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimedVouchers, setClaimedVouchers] = useState({});
  const [toast, setToast] = useState(null);
  const [successPlanModal, setSuccessPlanModal] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const spendingTiers = [
    {
      id: 'MEMBER',
      name: 'MEMBER (KHỞI ĐẦU)',
      threshold: '0 VNĐ',
      minSpend: 0,
      discount: '0%',
      icon: Sparkles,
      color: 'slate',
      badge: 'Cơ bản',
      perks: [
        'Tích điểm hoàn tiền 1% trên mỗi đơn hàng',
        'Nhận thông báo các đợt phát hành mới trước cộng đồng',
        'Tư vấn size chuẩn theo số đo cùng AI Chatbot 24/7',
        'Đổi trả hàng 7 ngày tiêu chuẩn nguyên seal',
      ],
      exclusiveVoucher: null,
    },
    {
      id: 'SILVER',
      name: 'SILVER (HẠNG BẠC)',
      threshold: '2.500.000 VNĐ',
      minSpend: 2500000,
      discount: '5% TRỌN ĐỜI',
      icon: Shield,
      color: 'slate',
      badge: 'Tiêu chuẩn',
      perks: [
        'Tự động giảm 5% trọn đời cho toàn bộ sản phẩm',
        'Tặng Voucher độc quyền SILVER50K (Giảm 50.000đ)',
        'Tặng Voucher sinh nhật 100.000đ khi đến ngày sinh nhật',
        'Mở rộng chính sách đổi trả lên 14 ngày (gấp đôi)',
        'Tích điểm hoàn tiền 2% trên mọi đơn hàng',
        'Ưu tiên đóng gói và xử lý giao hàng trong ngày',
      ],
      exclusiveVoucher: {
        code: 'SILVER50K',
        name: 'VOUCHER HỘI VIÊN BẠC 50K',
        description: 'Giảm 50.000đ cho đơn từ 400.000đ',
        minOrder: 400000,
        value: 50000,
      },
    },
    {
      id: 'GOLD',
      name: 'GOLD (HẠNG VÀNG)',
      threshold: '5.000.000 VNĐ',
      minSpend: 5000000,
      discount: '10% TRỌN ĐỜI',
      icon: Crown,
      color: 'amber',
      badge: 'Cao cấp',
      perks: [
        'Tự động giảm 10% trọn đời cho toàn bộ sản phẩm',
        'MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC KHÔNG GIỚI HẠN',
        'Tặng Voucher độc quyền GOLD150K (Giảm 150.000đ)',
        'Quyền truy cập phòng chờ mua sớm Limited Drop trước 12 tiếng',
        'Tặng Hộp quà Unboxing Signature Box XIV trị giá 200.000đ',
        'Chính sách đổi trả 30 ngày tận nhà miễn phí',
        'Tích điểm hoàn tiền 5% trên mọi đơn hàng',
      ],
      exclusiveVoucher: {
        code: 'GOLD150K',
        name: 'VOUCHER HỘI VIÊN VÀNG 150K',
        description: 'Giảm 150.000đ cho đơn từ 800.000đ',
        minOrder: 800000,
        value: 150000,
      },
    },
    {
      id: 'DIAMOND',
      name: 'DIAMOND (KIM CƯƠNG)',
      threshold: '10.000.000 VNĐ',
      minSpend: 10000000,
      discount: '15% TRỌN ĐỜI',
      icon: Gem,
      color: 'cyan',
      badge: 'Thượng đỉnh',
      perks: [
        'Tự động giảm 15% trọn đời cho toàn bộ sản phẩm',
        'FREESHIP HỎA TỐC 2H NỘI THÀNH & FREESHIP TOÀN QUỐC',
        'Tặng Siêu Voucher DIAMOND300K (Giảm 300.000đ)',
        'TẶNG ÁO THUN OVERSIZED HEAVYWEIGHT LIMITED TRỊ GIÁ 650.000đ HÀNG NĂM',
        'Quyền mua trước đợt phát hành Limited Drop 24 tiếng (Đảm bảo có size)',
        'Stylist AI VIP 1-1 hỗ trợ phối đồ và giữ hàng riêng',
        'Vé mời VIP tham gia Fashion Showcase thường niên của XIV STUDIO',
      ],
      exclusiveVoucher: {
        code: 'DIAMOND300K',
        name: 'VOUCHER KIM CƯƠNG 300K',
        description: 'Giảm 300.000đ cho đơn từ 1.200.000đ',
        minOrder: 1200000,
        value: 300000,
      },
    },
  ];

  const paidPlans = [
    {
      id: 'PLUS',
      name: 'GÓI PLUS',
      price: 59000,
      period: '30 ngày',
      tag: 'TIẾT KIỆM',
      color: 'blue',
      perks: [
        'Mở khóa ngay Voucher PLUS30K (Giảm 30.000đ)',
        'Giảm thêm 3% cho 5 đơn hàng đầu tiên',
        'Tặng 1 mã Miễn phí vận chuyển toàn quốc',
        'Nhân đôi điểm thưởng tích lũy (2x Points)',
        'Huy hiệu thành viên Gói PLUS phát sáng độc quyền',
      ],
      voucherCode: 'PLUS30K',
    },
    {
      id: 'VIP',
      name: 'GÓI VIP',
      price: 199000,
      period: '30 ngày',
      tag: 'PHỔ BIẾN NHẤT',
      color: 'purple',
      perks: [
        'Mở khóa ngay Bộ Voucher VIP100K (Giảm 100.000đ)',
        'TẶNG 3 MÃ MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC',
        'Giảm thêm 7% toàn bộ đơn hàng trong 30 ngày',
        'Quyền mua sớm các đợt phát hành Limited Drop trước 24h',
        'TẶNG NÓN STREETWEAR CYBER BUCKET HAT TRỊ GIÁ 290.000đ',
        'Ưu tiên xử lý bảo hành đổi trả tận nhà miễn phí',
      ],
      voucherCode: 'VIP100K',
    },
    {
      id: 'PREMIUM',
      name: 'GÓI PREMIUM',
      price: 499000,
      period: '90 ngày',
      tag: 'ĐẲNG CẤP',
      color: 'pink',
      perks: [
        'Mở khóa Siêu Voucher PREMIUM250K (Giảm 250.000đ)',
        'MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC KHÔNG GIỚI HẠN TRONG 90 NGÀY',
        'Giảm thêm 12% toàn bộ đơn hàng trong 90 ngày',
        'TẶNG SET QUÀ SIGNATURE BOX (ÁO THUN + NÓN) TRỊ GIÁ 850.000đ',
        'Trợ lý Stylist AI VIP ưu tiên xử lý đơn 1-1 không giới hạn',
        'Vé mời VIP tham dự sự kiện Private Drop Showcase của XIV STUDIO',
      ],
      voucherCode: 'PREMIUM250K',
    },
  ];

  // Khởi tạo đơn hàng thật trong CSDL cho gói đăng ký
  const handleBuyPlan = async (plan) => {
    setIsProcessing(true);
    try {
      const orderPayload = {
        items: [
          {
            productId: null,
            name: `GÓI HỘI VIÊN ${plan.name} (${plan.period})`,
            price: plan.price,
            quantity: 1,
            size: plan.id,
            image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
            type: 'subscription',
          },
        ],
        customerInfo: {
          name: user?.name || 'Khách hàng XIV',
          phone: user?.phone || '0901234567',
          email: user?.email || 'customer@gmail.com',
          address: 'Kích hoạt gói trực tuyến (Digital Membership Activation)',
          note: `Đăng ký gói hội viên ${plan.name}`,
        },
        paymentMethod: 'VIETQR',
      };

      const res = await orderAPI.checkout(orderPayload);
      if (res.data && res.data.success) {
        setCreatedOrder(res.data.order);
        setShowPackageQR(true);
        showToast(`🔔 Đã tạo đơn đăng ký #${res.data.order.orderCode}. Vui lòng chuyển khoản VietQR để Admin xác nhận!`, 'info');
      }
    } catch (err) {
      console.error('Failed to create subscription order:', err);
      showToast(err.response?.data?.message || 'Không thể tạo đơn đăng ký gói. Vui lòng thử lại sau!', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseQRModal = () => {
    setShowPackageQR(false);
    if (createdOrder) {
      navigate(`/order-tracking?code=${createdOrder.orderCode}`);
    }
  };

  const handleClaimVoucher = (code) => {
    setClaimedVouchers((prev) => ({ ...prev, [code]: true }));
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
    showToast(`🎁 Đã lưu mã voucher ${code} vào kho voucher của bạn!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Banner - Sáng sủa, Đẳng cấp, Tương phản cao */}
      <div className="relative rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white p-6 sm:p-10 border-2 border-pink-300 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400/20 dark:bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-cyan-500/20 text-pink-800 dark:text-cyan-300 text-xs font-mono font-black border border-pink-300 dark:border-cyan-500/30">
              <Award className="w-3.5 h-3.5 text-pink-600 dark:text-cyan-400" /> XIV STUDIO MEMBERSHIP CLUB
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 dark:text-white tracking-tight">
              ĐẶC QUYỀN HỘI VIÊN & GÓI ƯU ĐÃI
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed font-bold">
              Tích lũy chi tiêu tự động thăng hạng <strong className="text-slate-950 dark:text-white font-black">Silver (2.5tr) - Gold (5tr) - Diamond (10tr)</strong> hoặc đăng ký ngay các gói <strong className="text-slate-950 dark:text-white font-black">Plus (59k) - VIP (199k) - Premium (499k)</strong> để nhận ngay voucher độc quyền và chiết khấu trọn đời.
            </p>
          </div>

          {/* Current Status Card */}
          <div className="bg-pink-50/90 dark:bg-black/60 p-5 rounded-2xl border-2 border-pink-200 dark:border-white/15 min-w-[290px] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-bold">Hạng của bạn:</span>
              <MembershipBadge tier={currentTier} />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Tổng chi tiêu:</span>
                <span className="font-black text-pink-700 dark:text-cyan-300 text-sm">{Number(userSpending).toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="w-full h-2.5 bg-pink-200 dark:bg-black/40 rounded-full overflow-hidden border border-pink-300 dark:border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 dark:from-cyan-400 dark:to-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(5, nextTierProgress))}%` }}
                ></div>
              </div>
              {currentTier !== 'DIAMOND' && (
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">
                  Còn <strong className="text-slate-950 dark:text-white">{Number(nextTierRemaining).toLocaleString('vi-VN')}đ</strong> để thăng hạng tiếp theo!
                </p>
              )}
            </div>

            {/* Quick Demo Switcher */}
            <div className="pt-2.5 border-t border-pink-200 dark:border-white/10">
              <span className="text-[10px] text-slate-700 dark:text-slate-400 block mb-1.5 font-mono font-bold">⚡ Demo Chuyển nhanh cấp bậc:</span>
              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-black">
                {['MEMBER', 'SILVER', 'GOLD', 'DIAMOND'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTierDemo(t)}
                    className={`py-1.5 rounded-lg border transition-all ${
                      currentTier === t
                        ? 'bg-pink-600 dark:bg-cyan-500 text-white border-pink-600 dark:border-cyan-400 font-black shadow-sm'
                        : 'bg-white dark:bg-black/40 text-slate-800 dark:text-slate-300 border-pink-200 dark:border-white/10 hover:bg-pink-100'
                    }`}
                  >
                    {t === 'SILVER' ? 'SILVER (2.5tr)' : t === 'GOLD' ? 'GOLD (5tr)' : t === 'DIAMOND' ? 'DIA (10tr)' : 'MEMBER'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Loyalty Spending Tiers (Silver 2.5tr, Gold 5tr, Diamond 10tr) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-gray-800 pb-4">
          <div>
            <span className="text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              Phần 1: Cấp bậc Tích lũy
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              CẤP BẬC CHI TIÊU TỰ ĐỘNG (SILVER • GOLD • DIAMOND)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-gray-400">
            Tự động nâng hạng khi đạt đủ mốc chi tiêu tích lũy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {spendingTiers.map((tier) => {
            const Icon = tier.icon;
            const isUnlocked = userSpending >= tier.minSpend;
            const isCurrent = currentTier === tier.id;

            return (
              <div
                key={tier.id}
                className={`rounded-3xl p-5 border transition-all flex flex-col justify-between relative shadow-sm ${
                  isCurrent
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/20'
                    : isUnlocked
                    ? 'bg-white dark:bg-gray-900/90 border-slate-200 dark:border-gray-800'
                    : 'bg-slate-50 dark:bg-gray-950/60 border-slate-200 dark:border-gray-900 opacity-80'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-cyan-500 text-white font-mono font-extrabold text-[9px] uppercase shadow">
                    Cấp hiện tại
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tier.id === 'DIAMOND'
                        ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400'
                        : tier.id === 'GOLD'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        : tier.id === 'SILVER'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-100 dark:bg-gray-800 text-slate-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
                      Mốc: {tier.threshold}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading">
                      {tier.name}
                    </h3>
                    <span className="text-xs font-mono font-extrabold text-cyan-600 dark:text-cyan-400 block mt-0.5">
                      Chiết khấu: {tier.discount}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-gray-300 pt-2 border-t border-slate-100 dark:border-gray-800">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusive Voucher Box */}
                {tier.exclusiveVoucher && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-slate-700 dark:text-gray-200 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-pink-500" /> {tier.exclusiveVoucher.code}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <Unlock className="w-3 h-3" /> Đã mở
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> Khóa
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleClaimVoucher(tier.exclusiveVoucher.code)}
                      disabled={!isUnlocked || claimedVouchers[tier.exclusiveVoucher.code]}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                        claimedVouchers[tier.exclusiveVoucher.code]
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : isUnlocked
                          ? 'bg-slate-900 hover:bg-cyan-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-black shadow-sm'
                          : 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {claimedVouchers[tier.exclusiveVoucher.code] ? (
                        <span className="flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Đã lưu vào ví
                        </span>
                      ) : isUnlocked ? (
                        'Lưu Voucher vào Ví'
                      ) : (
                        `Cần tiêu thêm ${tier.threshold}`
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Paid Subscription Packages (Plus 59k, VIP 199k, Premium 499k) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-gray-800 pb-4">
          <div>
            <span className="text-pink-600 dark:text-pink-400 text-xs font-mono font-bold uppercase tracking-wider">
              Phần 2: Mua Gói Hội Viên Trả Phí
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              GÓI ĐẶC QUYỀN MUA THÊM (PLUS 59K • VIP 199K • PREMIUM 499K)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-gray-400">
            Tạo đơn thật trong CSDL & quét VietQR MB Bank
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paidPlans.map((plan) => {
            const isCurrentActive = activePackage === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between relative shadow-md ${
                  isCurrentActive
                    ? 'bg-gradient-to-b from-pink-50 to-white dark:from-pink-950/40 dark:to-gray-950 border-pink-500 ring-2 ring-pink-500/20'
                    : 'bg-white dark:bg-gray-950/80 border-slate-200 dark:border-gray-800 hover:border-slate-300'
                }`}
              >
                {/* Plan Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-mono font-bold text-[10px] uppercase border border-pink-200 dark:border-pink-800">
                    {plan.tag}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                    Hạn dùng {plan.period}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                        {plan.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-gray-400">VNĐ / {plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-gray-300 pt-3 border-t border-slate-100 dark:border-gray-800">
                    {plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                  {isCurrentActive ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-pink-300 dark:border-pink-800"
                    >
                      <Check className="w-4 h-4" /> Đang sử dụng gói này
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyPlan(plan)}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
                    >
                      <QrCode className="w-4 h-4" /> {isProcessing ? 'Đang tạo đơn...' : `Mua gói ${plan.price.toLocaleString('vi-VN')}đ qua VietQR`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Package VietQR Payment Modal */}
      {showPackageQR && createdOrder && (
        <VietQRModal
          order={createdOrder}
          onClose={handleCloseQRModal}
        />
      )}

      {/* Modern Animated Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-3 fade-in duration-300">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-black backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-950/50'
                : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50 shadow-cyan-950/50'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Membership Activation Celebration Modal */}
      {successPlanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-950 border-2 border-pink-300 dark:border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
              <Crown className="w-10 h-10 fill-white" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-black font-mono border border-amber-300 dark:border-amber-500/40">
                KÍCH HOẠT TỰ ĐỘNG THÀNH CÔNG
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-heading mt-2">
                CHÚC MỪNG BẠN ĐÃ ĐĂNG KÝ {successPlanModal.plan.name}!
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-medium max-w-sm mx-auto">
                Mọi quyền lợi giảm giá và ưu đãi độc quyền của gói đã sẵn sàng áp dụng cho tài khoản của bạn ngay từ đơn hàng tiếp theo!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/80 dark:bg-gray-900/80 border border-pink-200 dark:border-gray-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-gray-400 font-bold">Mã đơn đăng ký:</span>
                <span className="font-mono font-black text-pink-600 dark:text-cyan-400">#{successPlanModal.order?.orderCode}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-gray-400 font-bold">Thời hạn hiệu lực:</span>
                <span className="font-bold text-slate-800 dark:text-gray-200">{successPlanModal.plan.period}</span>
              </div>
              <div className="pt-2 border-t border-pink-200 dark:border-gray-800 space-y-1">
                {successPlanModal.plan.perks.slice(0, 3).map((pk, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-gray-300 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{pk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setSuccessPlanModal(null);
                  navigate('/shop');
                }}
                className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-black text-xs shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Mua sắm áp dụng ngay
              </button>
              <button
                onClick={() => {
                  setSuccessPlanModal(null);
                  navigate('/profile?tab=vouchers');
                }}
                className="py-3.5 px-4 rounded-xl bg-slate-100 dark:bg-gray-900 hover:bg-pink-100 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-300 font-black text-xs transition-colors cursor-pointer"
              >
                Xem kho Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
