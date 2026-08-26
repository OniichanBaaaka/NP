import React from 'react';
import { Crown, Sparkles, Shield, Gem, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MembershipBadge({ tier, showProgress = false, showPackage = true }) {
  const { currentTier, userSpending, nextTierProgress, nextTierRemaining, activePackage } = useAuth();
  const effectiveTier = tier || currentTier;

  const getTierConfig = (t) => {
    switch (t) {
      case 'DIAMOND':
        return {
          name: 'DIAMOND',
          discountText: '-15%',
          badgeClass: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-400/60 shadow-sm dark:shadow-cyan-500/20',
          icon: <Gem className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />,
        };
      case 'GOLD':
        return {
          name: 'GOLD',
          discountText: '-10%',
          badgeClass: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-400/60 shadow-sm dark:shadow-amber-500/20',
          icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
        };
      case 'SILVER':
      case 'VIP':
        return {
          name: 'SILVER',
          discountText: '-5%',
          badgeClass: 'bg-gradient-to-r from-slate-400/20 via-gray-300/20 to-slate-500/20 text-slate-700 dark:text-slate-200 border-slate-400/50 shadow-sm',
          icon: <Shield className="w-3.5 h-3.5 text-slate-500" />,
        };
      default:
        return {
          name: 'MEMBER',
          discountText: '0%',
          badgeClass: 'bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-800',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const config = getTierConfig(effectiveTier);

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold font-mono tracking-wider transition-all ${config.badgeClass}`}
        >
          {config.icon}
          <span>{config.name}</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-black/10 dark:bg-black/40 font-mono font-bold">
            {config.discountText}
          </span>
        </div>

        {showPackage && activePackage && activePackage !== 'NONE' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-[10px] font-mono shadow-sm animate-pulse">
            <Zap className="w-3 h-3" /> GÓI {activePackage}
          </span>
        )}
      </div>

      {showProgress && effectiveTier !== 'DIAMOND' && (
        <div className="w-full space-y-1 mt-1 text-[10px]">
          <div className="flex justify-between text-slate-500 dark:text-gray-400 font-mono">
            <span>Đã tiêu: {Number(userSpending).toLocaleString('vi-VN')}đ</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">
              Còn {Number(nextTierRemaining).toLocaleString('vi-VN')}đ lên {effectiveTier === 'MEMBER' ? 'SILVER' : effectiveTier === 'SILVER' ? 'GOLD' : 'DIAMOND'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-gray-900 rounded-full overflow-hidden border border-slate-300 dark:border-gray-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, nextTierProgress))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
