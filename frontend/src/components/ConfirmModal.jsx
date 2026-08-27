import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Crown, X, PackageCheck } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  subtext = '',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'danger', // 'danger' | 'warning' | 'success' | 'membership' | 'delivery'
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'membership':
        return (
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border-2 border-amber-400 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Crown className="w-7 h-7" />
          </div>
        );
      case 'success':
        return (
          <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border-2 border-amber-500 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-7 h-7" />
          </div>
        );
      case 'delivery':
        return (
          <div className="w-14 h-14 rounded-3xl bg-cyan-500/10 border-2 border-cyan-500 text-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <PackageCheck className="w-7 h-7" />
          </div>
        );
      case 'danger':
      default:
        return (
          <div className="w-14 h-14 rounded-3xl bg-rose-500/10 border-2 border-rose-500 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <Trash2 className="w-7 h-7" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (type) {
      case 'membership':
        return 'bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 hover:opacity-90 text-white shadow-lg shadow-amber-500/25';
      case 'success':
      case 'delivery':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white shadow-lg shadow-emerald-500/25';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-white shadow-lg shadow-amber-500/25';
      case 'danger':
      default:
        return 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white shadow-lg shadow-rose-500/25';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950 border-2 border-pink-200 dark:border-gray-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-900 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center">{getIcon()}</div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-950 dark:text-white font-heading tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
            {message}
          </p>
          {subtext && (
            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono bg-slate-50 dark:bg-gray-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-gray-800">
              {subtext}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-gray-900 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold text-xs border border-slate-200 dark:border-gray-800 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${getConfirmButtonClasses()}`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
