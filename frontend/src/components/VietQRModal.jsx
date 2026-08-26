import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Clock, ShieldCheck, X, ArrowRight, Sparkles, Image, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export default function VietQRModal({ order, onClose }) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [qrMode, setQrMode] = useState('user_card'); // 'user_card' | 'dynamic'
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!order) return null;

  const vietqr = order.vietqrData || {};
  const amount = order.totalAmount || vietqr.amount || 0;
  const addInfo = vietqr.addInfo || `XIV ${order.orderCode}`;
  const accountNo = '5100101042006';
  const accountName = 'VU DUC DAT';
  const bankId = 'MB';

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const handleConfirmedPayment = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClose();
    navigate(`/order-tracking?code=${order.orderCode}`);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-950 border border-slate-200 dark:border-cyan-500/40 p-5 sm:p-6 shadow-2xl overflow-hidden my-auto text-slate-900 dark:text-gray-100">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white rounded-full bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold font-mono">
            <QrCode className="w-3.5 h-3.5" /> VIETQR MB BANK • VU DUC DAT
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold font-heading">
            Quét mã QR Chuyển khoản
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Thụ hưởng: <strong>VU DUC DAT</strong> (MB Bank: <strong>5100101042006</strong>)
          </p>
        </div>

        {/* QR Mode Switcher Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-gray-900 rounded-xl max-w-sm mx-auto mb-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setQrMode('user_card')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              qrMode === 'user_card'
                ? 'bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" /> Ảnh QR sắc nét
          </button>
          <button
            type="button"
            onClick={() => setQrMode('dynamic')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              qrMode === 'dynamic'
                ? 'bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Tự động khớp tiền
          </button>
        </div>

        {/* High Definition QR Code Display */}
        <div className="flex flex-col items-center mb-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-xl border-2 border-cyan-400 relative group max-w-[280px] sm:max-w-[310px] overflow-hidden flex items-center justify-center">
            {qrMode === 'user_card' ? (
              <img
                src="/images/my_vietqr.png"
                alt="Mã QR MB Bank chính chủ của VU DUC DAT"
                className="w-full h-auto object-contain rounded-xl select-none"
              />
            ) : (
              <img
                src={`https://img.vietqr.io/image/MB-5100101042006-compact2.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`}
                alt="Mã VietQR Dynamic Napas 247"
                className="w-52 h-auto object-contain rounded-lg"
              />
            )}
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-2.5 font-mono bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/40 font-bold">
            <Clock className="w-3.5 h-3.5" />
            Hết hạn sau: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Banking Transfer Details */}
        <div className="space-y-2 bg-slate-50 dark:bg-gray-900/80 rounded-2xl p-3.5 border border-slate-200 dark:border-gray-800 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-gray-800">
            <span className="text-slate-500 dark:text-gray-400">Ngân hàng:</span>
            <span className="font-bold uppercase text-slate-800 dark:text-white">MB Bank (Ngân hàng Quân đội)</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-gray-800">
            <span className="text-slate-500 dark:text-gray-400">Chủ tài khoản:</span>
            <span className="font-bold text-slate-900 dark:text-white uppercase">{accountName}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-gray-800">
            <span className="text-slate-500 dark:text-gray-400">Số tài khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-cyan-600 dark:text-cyan-300 text-sm tracking-wider">
                {accountNo}
              </span>
              <button
                onClick={() => copyToClipboard(accountNo, 'account')}
                className="p-1 text-slate-500 dark:text-gray-400 hover:text-cyan-600 bg-slate-200 dark:bg-gray-800 rounded transition-colors"
                title="Sao chép số tài khoản"
              >
                {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-gray-800">
            <span className="text-slate-500 dark:text-gray-400">Số tiền thanh toán:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                {Number(amount).toLocaleString('vi-VN')} VNĐ
              </span>
              <button
                onClick={() => copyToClipboard(String(amount), 'amount')}
                className="p-1 text-slate-500 dark:text-gray-400 hover:text-emerald-600 bg-slate-200 dark:bg-gray-800 rounded transition-colors"
                title="Sao chép số tiền"
              >
                {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 dark:text-gray-400">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-pink-600 dark:text-pink-400 text-sm">
                {addInfo}
              </span>
              <button
                onClick={() => copyToClipboard(addInfo, 'content')}
                className="p-1 text-slate-500 dark:text-gray-400 hover:text-pink-600 bg-slate-200 dark:bg-gray-800 rounded transition-colors"
                title="Sao chép nội dung"
              >
                {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Notice */}
        {order?.items?.some((i) => i.type === 'subscription' || !i.productId || i.name?.includes('GÓI HỘI VIÊN')) && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Đăng ký Gói Hội Viên:
            </p>
            <p className="text-slate-700 dark:text-gray-300">
              Sau khi bạn hoàn tất chuyển khoản, Admin sẽ kiểm tra biến động số dư và duyệt kích hoạt gói cho bạn trong <strong>1-5 phút</strong>!
            </p>
          </div>
        )}

        {/* Security & Action Buttons */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            Hệ thống ngân hàng tự động đối soát sau khi bạn chuyển khoản thành công
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-gray-900 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 text-xs font-bold transition-all border border-slate-200 dark:border-gray-800"
            >
              Thanh toán sau
            </button>
            <button
              onClick={handleConfirmedPayment}
              className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
            >
              Tôi đã chuyển khoản <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
