import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  QrCode,
  MapPin,
  Calendar,
  AlertCircle,
  Crown,
  Sparkles,
} from 'lucide-react';
import { orderAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import VietQRModal from '../components/VietQRModal';
import ConfirmModal from '../components/ConfirmModal';

export default function OrderTracking() {
  const { isDark } = useTheme();
  const { setActivePackage, refreshUserData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderCode, setOrderCode] = useState(searchParams.get('code') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const isSubscriptionOrder = order?.items?.some(i => i.type === 'subscription' || i.name?.includes('GÓI HỘI VIÊN'));

  // Tự động kích hoạt badge và quyền lợi gói trên client khi xem đơn completed
  useEffect(() => {
    if (order && order.orderStatus === 'completed' && isSubscriptionOrder) {
      const subItem = order.items?.find(it => it.type === 'subscription' || it.name?.includes('GÓI HỘI VIÊN'));
      if (subItem) {
        const pkgCode = (subItem.size || 'PLUS').toUpperCase();
        if (['PLUS', 'VIP', 'PREMIUM'].includes(pkgCode)) {
          setActivePackage(pkgCode);
          if (refreshUserData) refreshUserData();
        }
      }
    }
  }, [order, isSubscriptionOrder]);

  const fetchOrder = async (codeToFetch) => {
    if (!codeToFetch.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await orderAPI.getTracking(codeToFetch.trim());
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleConfirmReceived = () => {
    if (!order) return;
    setIsConfirmModalOpen(true);
  };

  const handleExecuteConfirm = async () => {
    setConfirming(true);
    setConfirmSuccess('');
    try {
      const res = await orderAPI.confirmDelivery(order.orderCode || order.id);
      if (res.data && res.data.success) {
        setConfirmSuccess('🎉 ' + res.data.message);
        await fetchOrder(order.orderCode);
        if (refreshUserData) refreshUserData();
        setTimeout(() => setConfirmSuccess(''), 5000);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setConfirming(false);
      setIsConfirmModalOpen(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setOrderCode(code);
      fetchOrder(code);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderCode.trim()) {
      setSearchParams({ code: orderCode.trim() });
      fetchOrder(orderCode);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700 text-xs font-black flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Hoàn thành / Đã kích hoạt
          </span>
        );
      case 'delivering':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-700 text-xs font-black flex items-center gap-1.5 shadow-sm">
            <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Đang giao hàng
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-400 dark:border-blue-700 text-xs font-black flex items-center gap-1.5 shadow-sm">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Đã xác nhận
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-red-950 text-rose-800 dark:text-red-300 border border-rose-400 dark:border-red-700 text-xs font-black flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-700 text-xs font-black flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Chờ Admin / Hệ thống xác nhận
          </span>
        );
    }
  };

  const stages = [
    { key: 'pending', label: 'Tiếp nhận đơn' },
    { key: 'confirmed', label: 'Xác nhận thanh toán' },
    { key: 'delivering', label: 'Đang xử lý / Giao' },
    { key: 'completed', label: 'Hoàn tất & Kích hoạt' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'delivering': return 2;
      case 'completed': return 3;
      default: return -1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span
          style={{ color: isDark ? '#38bdf8' : '#db2777' }}
          className="text-xs font-mono tracking-widest uppercase font-black"
        >
          Theo dõi đơn hàng & Gói Hội Viên
        </span>
        <h1
          style={{ color: isDark ? '#ffffff' : '#000000' }}
          className="text-3xl sm:text-4xl font-black font-heading tracking-tight"
        >
          TRA CỨU TIẾN ĐỘ ĐƠN HÀNG
        </h1>
        <p style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs font-bold">
          Nhập mã đơn hàng (Ví dụ:{' '}
          <code style={{ color: isDark ? '#38bdf8' : '#db2777' }} className="font-black">
            XIV-20260826-...
          </code>
          )
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <input
          type="text"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          placeholder="Nhập mã đơn hàng XIV-..."
          style={{
            backgroundColor: isDark ? '#121520' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
            borderColor: isDark ? '#334155' : '#f472b6',
          }}
          className="flex-1 border-2 rounded-2xl px-5 py-3.5 text-sm uppercase font-mono outline-none shadow-md font-black"
        />
        <button
          type="submit"
          disabled={loading || !orderCode.trim()}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-cyan-500 dark:to-blue-600 text-white font-black text-xs flex items-center gap-2 hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-pink-500/30"
        >
          <Search className="w-4 h-4" /> Tra cứu
        </button>
      </form>

      {/* Success display */}
      {confirmSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 shadow-md font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {confirmSuccess}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-red-950/60 border-2 border-rose-300 dark:border-red-800 text-rose-800 dark:text-red-300 text-xs flex items-center justify-center gap-2 shadow-md font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Order Details Card - 100% TRẮNG SÁNG TRONG LIGHT MODE */}
      {order && (
        <div
          style={{
            backgroundColor: isDark ? '#10131e' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#f472b6',
            color: isDark ? '#f8fafc' : '#000000',
          }}
          className="p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-8 animate-in fade-in"
        >
          {/* Order Header */}
          <div
            style={{ borderColor: isDark ? '#1e293b' : '#fbcfe8' }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6"
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  className="text-[11px] font-mono font-black uppercase tracking-wider"
                >
                  MÃ ĐƠN HÀNG
                </span>
                {isSubscriptionOrder && (
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300 text-[10px] font-black font-mono border border-pink-300 dark:border-pink-800">
                    👑 ĐƠN MUA GÓI HỘI VIÊN
                  </span>
                )}
              </div>
              <h2
                style={{ color: isDark ? '#38bdf8' : '#000000' }}
                className="text-2xl sm:text-3xl font-black font-mono mt-1 tracking-tight"
              >
                {order.orderCode}
              </h2>
              <span
                style={{ color: isDark ? '#94a3b8' : '#475569' }}
                className="text-xs flex items-center gap-1.5 mt-1 font-mono font-bold"
              >
                <Calendar className="w-4 h-4 text-pink-500" /> Tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isSubscriptionOrder ? (
                <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-400 dark:border-amber-700 text-xs font-black flex items-center gap-1.5 shadow-sm">
                  <Crown className="w-4 h-4 text-amber-500" /> Gói Hội Viên - Đã kích hoạt tự động
                </span>
              ) : (
                getStatusBadge(order.orderStatus)
              )}

              {!isSubscriptionOrder &&
                order.orderStatus !== 'completed' &&
                order.orderStatus !== 'DELIVERED' &&
                order.orderStatus !== 'cancelled' &&
                order.orderStatus !== 'CANCELLED' && (
                  <button
                    onClick={handleConfirmReceived}
                    disabled={confirming}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {confirming ? 'Đang xác nhận...' : 'Đã nhận được hàng'}
                  </button>
                )}

              {isSubscriptionOrder && (
                <Link
                  to="/membership"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all"
                >
                  <Crown className="w-4 h-4 fill-slate-950" /> Xem quyền lợi gói
                </Link>
              )}

              {order.paymentMethod === 'vietqr' && order.orderStatus === 'pending' && !isSubscriptionOrder && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 dark:from-cyan-500 dark:to-blue-600 text-white font-black text-xs flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-pink-500/25"
                >
                  <QrCode className="w-4 h-4" /> Mở VietQR
                </button>
              )}
            </div>
          </div>

          {/* Subscription Notice (Pending: Chờ duyệt | Completed: Đã kích hoạt thành công) */}
          {isSubscriptionOrder && order.orderStatus === 'pending' && (
            <div
              style={{
                backgroundColor: isDark ? 'rgba(69, 26, 3, 0.4)' : '#fffbeb',
                borderColor: isDark ? '#78350f' : '#fcd34d',
              }}
              className="p-5 rounded-2xl border-2 text-xs space-y-1.5 shadow-sm"
            >
              <p
                style={{ color: isDark ? '#fde68a' : '#78350f' }}
                className="font-black text-sm flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-amber-600" /> Đơn mua gói đang chờ Admin xác nhận đã nhận tiền chuyển khoản.
              </p>
              <p
                style={{ color: isDark ? '#fcd34d' : '#92400e' }}
                className="text-xs leading-relaxed font-bold"
              >
                Sau khi Admin kiểm tra tài khoản MB Bank thụ hưởng{' '}
                <strong style={{ color: isDark ? '#ffffff' : '#000000' }} className="font-black">
                  VU DUC DAT
                </strong>{' '}
                và bấm duyệt, gói hội viên sẽ tự động kích hoạt vào tài khoản của bạn ngay lập tức!
              </p>
            </div>
          )}

          {/* Subscription Completed Banner (Kích Hoạt Thành Công) */}
          {isSubscriptionOrder && (order.orderStatus === 'completed' || order.orderStatus === 'DELIVERED') && (
            <div
              style={{
                backgroundColor: isDark ? 'rgba(6, 78, 59, 0.4)' : '#ecfdf5',
                borderColor: isDark ? '#059669' : '#10b981',
              }}
              className="p-5 rounded-2xl border-2 text-xs space-y-1.5 shadow-lg animate-in zoom-in-95"
            >
              <p
                style={{ color: isDark ? '#6ee7b7' : '#065f46' }}
                className="font-black text-sm sm:text-base flex items-center gap-2"
              >
                <Crown className="w-5 h-5 text-amber-500 animate-bounce" /> 🎉 GÓI HỘI VIÊN ĐÃ ĐƯỢC KÍCH HOẠT THÀNH CÔNG!
              </p>
              <p
                style={{ color: isDark ? '#a7f3d0' : '#047857' }}
                className="text-xs leading-relaxed font-bold"
              >
                Chúc mừng bạn! Gói hội viên <strong>{order.items?.find(it => it.type === 'subscription' || !it.productId || it.name?.includes('GÓI HỘI VIÊN'))?.name || 'VIP'}</strong> đã được kích hoạt trực tiếp vào tài khoản của bạn. Mọi đặc quyền giảm giá độc quyền, mua drop sớm và voucher đã sẵn sàng áp dụng ngay khi bạn thanh toán đơn hàng tiếp theo!
              </p>
            </div>
          )}

          {/* Stepper Progress */}
          {order.orderStatus !== 'cancelled' && (
            <div className="py-4">
              <div className="grid grid-cols-4 gap-2 relative">
                {stages.map((stg, idx) => {
                  const currentIdx = getStepIndex(order.orderStatus);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div key={stg.key} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                          isDone
                            ? 'bg-pink-600 dark:bg-cyan-500 text-white shadow-md ring-4 ring-pink-200 dark:ring-cyan-950'
                            : isDark
                            ? 'bg-gray-800 text-gray-500'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        style={{
                          color: isCurrent
                            ? isDark
                              ? '#38bdf8'
                              : '#db2777'
                            : isDone
                            ? isDark
                              ? '#ffffff'
                              : '#000000'
                            : isDark
                            ? '#64748b'
                            : '#94a3b8',
                        }}
                        className="text-xs leading-tight font-black"
                      >
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer & Shipping Information (Khung Thông Tin Người Nhận) */}
          <div
            style={{
              backgroundColor: isDark ? '#161a28' : '#fff5f8',
              borderColor: isDark ? '#334155' : '#fbcfe8',
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border text-xs shadow-sm"
          >
            <div className="space-y-1">
              <span
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                className="font-black uppercase tracking-wider text-[10px]"
              >
                Người nhận hàng / Đăng ký:
              </span>
              <p
                style={{ color: isDark ? '#ffffff' : '#000000' }}
                className="font-black text-sm"
              >
                {order.customerInfo?.name}
              </p>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155' }} className="font-bold">
                SĐT: {order.customerInfo?.phone}
              </p>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155' }} className="font-bold">
                {order.customerInfo?.email}
              </p>
            </div>
            <div className="space-y-1">
              <span
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                className="font-black uppercase tracking-wider text-[10px]"
              >
                Địa chỉ / Hình thức:
              </span>
              <p
                style={{ color: isDark ? '#ffffff' : '#000000' }}
                className="flex items-start gap-1 font-black text-sm"
              >
                <MapPin className="w-4 h-4 text-pink-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                {order.customerInfo?.address}
              </p>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155' }} className="text-xs font-bold">
                Phương thức:{' '}
                <strong
                  style={{ color: isDark ? '#38bdf8' : '#db2777' }}
                  className="font-black"
                >
                  {order.paymentMethod === 'vietqr' ? 'VietQR Napas 247' : 'COD (Tiền mặt)'}
                </strong>
              </p>
            </div>
          </div>

          {/* Items Table (Khung Danh Sách Sản Phẩm) */}
          <div className="space-y-3">
            <h4
              style={{ color: isDark ? '#ffffff' : '#000000' }}
              className="text-xs font-black uppercase tracking-wider font-heading"
            >
              Sản phẩm / Dịch vụ ({order.items?.length || 0})
            </h4>
            <div
              style={{
                backgroundColor: isDark ? '#161a28' : '#ffffff',
                borderColor: isDark ? '#334155' : '#fbcfe8',
              }}
              className="divide-y divide-pink-100 dark:divide-gray-800 border rounded-2xl overflow-hidden shadow-sm"
            >
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: isDark ? '#161a28' : '#ffffff',
                  }}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      style={{
                        backgroundColor: isDark ? '#000000' : '#fdf2f8',
                        borderColor: isDark ? '#334155' : '#fbcfe8',
                      }}
                      className="w-14 h-16 object-cover rounded-xl flex-shrink-0 border"
                    />
                    <div>
                      <h5
                        style={{ color: isDark ? '#ffffff' : '#000000' }}
                        className="text-xs sm:text-sm font-black"
                      >
                        {item.name}
                      </h5>
                      <span
                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                        className="text-[11px] font-mono font-bold block mt-0.5"
                      >
                        Số lượng: x{item.quantity} | Size/Gói: {item.size || 'M'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span
                      style={{ color: isDark ? '#38bdf8' : '#db2777' }}
                      className="font-black text-base sm:text-lg"
                    >
                      {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Calculation (Khung Tổng Thanh Toán) */}
          <div
            style={{
              backgroundColor: isDark ? '#161a28' : '#fff5f8',
              borderColor: isDark ? '#334155' : '#fbcfe8',
            }}
            className="p-5 rounded-2xl border space-y-2 text-xs font-mono shadow-sm"
          >
            <div
              style={{ color: isDark ? '#94a3b8' : '#475569' }}
              className="flex justify-between font-bold"
            >
              <span>Tạm tính:</span>
              <span style={{ color: isDark ? '#ffffff' : '#000000' }} className="font-black">
                {(order.totalAmount || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div
              style={{ color: isDark ? '#94a3b8' : '#475569' }}
              className="flex justify-between font-bold"
            >
              <span>Phí vận chuyển:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                MIỄN PHÍ (Freeship)
              </span>
            </div>
            <div
              style={{
                borderColor: isDark ? '#334155' : '#fbcfe8',
                color: isDark ? '#ffffff' : '#000000',
              }}
              className="flex justify-between text-base font-black pt-3 border-t"
            >
              <span>Tổng thanh toán:</span>
              <span
                style={{ color: isDark ? '#38bdf8' : '#db2777' }}
                className="text-lg font-black"
              >
                {(order.totalAmount || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VietQR Modal */}
      {order && (
        <VietQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          orderCode={order.orderCode}
          amount={order.totalAmount}
        />
      )}

      {/* Custom Luxury Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Xác nhận đã nhận hàng"
        message="Bạn xác nhận đã nhận được kiện hàng này đầy đủ, nguyên vẹn và đúng mẫu?"
        subtext={`Đơn hàng #${order?.orderCode} sẽ được chuyển sang trạng thái ĐÃ GIAO (DELIVERED).`}
        confirmText="Đã nhận đủ hàng"
        cancelText="Chưa nhận được"
        type="delivery"
        isLoading={confirming}
        onConfirm={handleExecuteConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}
