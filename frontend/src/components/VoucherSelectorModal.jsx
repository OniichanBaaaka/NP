import React, { useState } from 'react';
import { Tag, Check, X, Sparkles, Percent, Gift, AlertCircle, Lock, Crown, Gem, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ALL_VOUCHERS = [
  // General Vouchers
  {
    code: 'XIV10',
    name: 'GIẢM 10% TOÀN BỘ ĐƠN HÀNG',
    description: 'Giảm 10% tối đa 150.000đ cho đơn từ 500.000đ',
    minOrder: 500000,
    type: 'percent',
    value: 0.10,
    maxDiscount: 150000,
    tag: 'HOT',
    requiredTier: null,
  },
  {
    code: 'CYBER200K',
    name: 'GIẢM NGAY 200.000đ',
    description: 'Giảm trực tiếp 200.000đ cho đơn hàng từ 1.500.000đ',
    minOrder: 1500000,
    type: 'fixed',
    value: 200000,
    tag: 'ĐẶC QUYỀN',
    requiredTier: null,
  },
  {
    code: 'FREESHIP',
    name: 'MIỄN PHÍ VẬN CHUYỂN',
    description: 'Giảm 30.000đ phí giao hàng toàn quốc',
    minOrder: 0,
    type: 'shipping',
    value: 30000,
    tag: 'TIẾT KIỆM',
    requiredTier: null,
  },
  {
    code: 'FLASH30',
    name: 'VOUCHER FLASH SALE 30K',
    description: 'Giảm 30.000đ cho mọi đơn hàng từ 300.000đ',
    minOrder: 300000,
    type: 'fixed',
    value: 30000,
    tag: 'LIMITED',
    requiredTier: null,
  },

  // Spending Loyalty Tiers Vouchers (Silver, Gold, Diamond)
  {
    code: 'SILVER50K',
    name: 'VOUCHER HỘI VIÊN BẠC 50K',
    description: 'Đặc quyền chi tiêu từ 2.500.000đ. Đơn từ 400.000đ',
    minOrder: 400000,
    type: 'fixed',
    value: 50000,
    tag: 'SILVER',
    requiredTier: 'SILVER',
  },
  {
    code: 'GOLD150K',
    name: 'VOUCHER HỘI VIÊN VÀNG 150K',
    description: 'Đặc quyền chi tiêu từ 5.000.000đ. Đơn từ 800.000đ',
    minOrder: 800000,
    type: 'fixed',
    value: 150000,
    tag: 'GOLD',
    requiredTier: 'GOLD',
  },
  {
    code: 'DIAMOND300K',
    name: 'SIÊU VOUCHER KIM CƯƠNG 300K',
    description: 'Đặc quyền chi tiêu từ 10.000.000đ. Đơn từ 1.200.000đ',
    minOrder: 1200000,
    type: 'fixed',
    value: 300000,
    tag: 'DIAMOND',
    requiredTier: 'DIAMOND',
  },

  // Paid Subscription Packages Vouchers (Plus 59k, VIP 199k, Premium 499k)
  {
    code: 'PLUS30K',
    name: 'ƯU ĐÃI GÓI PLUS 30K',
    description: 'Đặc quyền dành riêng cho khách hàng mua Gói Plus 59.000đ',
    minOrder: 250000,
    type: 'fixed',
    value: 30000,
    tag: 'GÓI PLUS',
    requiredPackage: 'PLUS',
  },
  {
    code: 'VIP100K',
    name: 'ƯU ĐÃI GÓI VIP 100K',
    description: 'Đặc quyền dành riêng cho khách hàng mua Gói VIP 199.000đ',
    minOrder: 500000,
    type: 'fixed',
    value: 100000,
    tag: 'GÓI VIP',
    requiredPackage: 'VIP',
  },
  {
    code: 'PREMIUM250K',
    name: 'SIÊU VOUCHER GÓI PREMIUM 250K',
    description: 'Đặc quyền tối thượng dành cho khách hàng Gói Premium 499.000đ',
    minOrder: 1000000,
    type: 'fixed',
    value: 250000,
    tag: 'GÓI PREMIUM',
    requiredPackage: 'PREMIUM',
  },
];

export default function VoucherSelectorModal({ isOpen, onClose }) {
  const { cartTotal, appliedVoucher, applyVoucher, removeVoucher } = useCart();
  const { currentTier, activePackage } = useAuth();
  const [customCode, setCustomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isTierEligible = (requiredTier) => {
    if (!requiredTier) return true;
    if (requiredTier === 'SILVER') return currentTier === 'SILVER' || currentTier === 'GOLD' || currentTier === 'DIAMOND';
    if (requiredTier === 'GOLD') return currentTier === 'GOLD' || currentTier === 'DIAMOND';
    if (requiredTier === 'DIAMOND') return currentTier === 'DIAMOND';
    return false;
  };

  const isPackageEligible = (requiredPackage) => {
    if (!requiredPackage) return true;
    if (requiredPackage === 'PLUS') return activePackage === 'PLUS' || activePackage === 'VIP' || activePackage === 'PREMIUM';
    if (requiredPackage === 'VIP') return activePackage === 'VIP' || activePackage === 'PREMIUM';
    if (requiredPackage === 'PREMIUM') return activePackage === 'PREMIUM';
    return false;
  };

  const handleApply = (voucher) => {
    setErrorMsg('');
    if (!isTierEligible(voucher.requiredTier)) {
      setErrorMsg(`Mã "${voucher.code}" chỉ dành cho thành viên hạng ${voucher.requiredTier} trở lên.`);
      return;
    }
    if (!isPackageEligible(voucher.requiredPackage)) {
      setErrorMsg(`Mã "${voucher.code}" yêu cầu bạn đã đăng ký ${voucher.requiredPackage}.`);
      return;
    }
    if (cartTotal < voucher.minOrder) {
      setErrorMsg(
        `Đơn hàng cần đạt tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ để sử dụng mã "${voucher.code}"`
      );
      return;
    }
    applyVoucher(voucher);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const code = customCode.trim().toUpperCase();
    if (!code) return;

    const found = ALL_VOUCHERS.find((v) => v.code === code);
    if (!found) {
      setErrorMsg(`Mã voucher "${code}" không hợp lệ hoặc đã hết hạn.`);
      return;
    }

    handleApply(found);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-950 border border-slate-200 dark:border-cyan-500/40 p-5 sm:p-6 shadow-2xl space-y-5 max-h-[88vh] flex flex-col text-slate-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading">
                KHO VOUCHER & ƯU ĐÃI XIV STUDIO
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Chọn hoặc nhập mã ưu đãi để giảm giá</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Nhập mã voucher (VD: XIV10, SILVER50K)..."
            className="flex-1 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs uppercase font-mono outline-none text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold text-xs shadow transition-all"
          >
            Áp dụng
          </button>
        </form>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-red-950/60 border border-rose-200 dark:border-red-800 text-rose-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Voucher list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {ALL_VOUCHERS.map((v) => {
            const isSelected = appliedVoucher?.code === v.code;
            const tierOk = isTierEligible(v.requiredTier);
            const pkgOk = isPackageEligible(v.requiredPackage);
            const isEligible = tierOk && pkgOk && cartTotal >= v.minOrder;

            return (
              <div
                key={v.code}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 shadow-sm'
                    : isEligible
                    ? 'bg-slate-50 dark:bg-gray-900/60 border-slate-200 dark:border-gray-800 hover:border-slate-300'
                    : 'bg-slate-100/60 dark:bg-gray-950 border-slate-200 dark:border-gray-900 opacity-60'
                }`}
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-extrabold text-xs text-cyan-600 dark:text-cyan-400 bg-white dark:bg-black/50 px-2 py-0.5 rounded border border-slate-200 dark:border-cyan-500/30">
                      {v.code}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400 font-mono">
                      {v.tag}
                    </span>
                    {(!tierOk || !pkgOk) && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Chưa mở
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{v.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">{v.description}</p>
                </div>

                <div>
                  {isSelected ? (
                    <button
                      onClick={removeVoucher}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-red-950 dark:text-red-400 text-xs font-bold"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(v)}
                      disabled={!isEligible}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isEligible
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Dùng mã
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
