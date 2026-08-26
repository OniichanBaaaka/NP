import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Tag,
  Percent,
  Crown,
  Sparkles,
  Gift,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import VietQRModal from '../components/VietQRModal';
import MembershipBadge from '../components/MembershipBadge';
import VoucherSelectorModal from '../components/VoucherSelectorModal';

export default function Checkout() {
  const {
    cartItems,
    cartTotal,
    clearCart,
    appliedVoucher,
    voucherDiscount,
    removeVoucher,
  } = useCart();

  const { user, currentTier, tierDiscountRate } = useAuth();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Form Validation Errors State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Input refs for smooth scroll & autofocus on error
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);

  if (cartItems.length === 0 && !createdOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-heading">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-xs text-gray-400">
          Hãy chọn các mẫu thời trang yêu thích từ BST trước khi thanh toán nhé!
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 rounded-xl bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20"
        >
          Khám phá cửa hàng
        </Link>
      </div>
    );
  }

  // Member Tier Discount calculation
  const memberDiscount = Math.round(cartTotal * tierDiscountRate);

  // Shipping Fee
  const rawShipping = cartTotal >= 1000000 || currentTier === 'GOLD' || currentTier === 'DIAMOND' ? 0 : 30000;
  const shippingFee = appliedVoucher?.type === 'shipping' ? 0 : rawShipping;

  // Grand Total calculation
  const totalDiscount = memberDiscount + (appliedVoucher?.type !== 'shipping' ? voucherDiscount : 0);
  const grandTotal = Math.max(0, cartTotal - totalDiscount + shippingFee);

  // Real-time Field Validator
  const validateField = (field, value) => {
    let err = '';
    if (field === 'name') {
      if (!value.trim()) {
        err = 'Vui lòng nhập họ và tên người nhận hàng';
      } else if (value.trim().length < 2) {
        err = 'Họ và tên cần ít nhất 2 ký tự';
      }
    } else if (field === 'phone') {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!value.trim()) {
        err = 'Vui lòng nhập số điện thoại liên hệ';
      } else if (!phoneRegex.test(value.trim().replace(/\s+/g, ''))) {
        err = 'Số điện thoại không hợp lệ (Ví dụ: 0975745248)';
      }
    } else if (field === 'address') {
      if (!value.trim()) {
        err = 'Vui lòng nhập địa chỉ giao hàng cụ thể';
      } else if (value.trim().length < 5) {
        err = 'Địa chỉ quá ngắn (vui lòng nhập số nhà, tên đường, quận/huyện)';
      }
    }
    return err;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, customerInfo[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate all required fields
    const nameErr = validateField('name', customerInfo.name);
    const phoneErr = validateField('phone', customerInfo.phone);
    const addressErr = validateField('address', customerInfo.address);

    const validationErrors = {
      name: nameErr,
      phone: phoneErr,
      address: addressErr,
    };

    setErrors(validationErrors);
    setTouched({ name: true, phone: true, address: true });

    if (nameErr) {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (phoneErr) {
      phoneRef.current?.focus();
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (addressErr) {
      addressRef.current?.focus();
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const res = await orderAPI.checkout({
        customerInfo,
        items: cartItems,
        paymentMethod,
        voucherCode: appliedVoucher?.code || null,
        tierDiscount: memberDiscount,
      });

      if (res.data.success) {
        const order = res.data.order;
        setCreatedOrder(order);
        clearCart();

        if (paymentMethod === 'vietqr') {
          setShowQRModal(true);
        } else {
          navigate(`/order-tracking?code=${order.orderCode}`);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const serverMsg = err.response?.data?.message || err.message;
      setApiError(serverMsg || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some((e) => !!e);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <span className="text-cyan-400 text-xs font-mono tracking-widest uppercase">
          Thanh toán thông minh & Bảo mật
        </span>
        <h1 className="text-3xl font-extrabold text-white font-heading">
          HOÀN TẤT ĐẶT HÀNG
        </h1>
      </div>

      {/* Floating Glowing Error Alert */}
      {(apiError || (hasErrors && Object.keys(touched).length > 0)) && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-red-950 via-gray-950 to-red-950 border border-red-500/70 text-red-300 text-xs shadow-xl shadow-red-950/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-white block">
                {apiError || 'Vui lòng hoàn thiện các trường bắt buộc có viền đỏ bên dưới:'}
              </span>
              <span className="text-[11px] text-red-300/80">
                {apiError ? 'Vui lòng kiểm tra lại kết nối hoặc thông tin' : 'Họ tên, Số điện thoại và Địa chỉ nhận hàng'}
              </span>
            </div>
          </div>
          {apiError && (
            <button onClick={() => setApiError('')} className="p-1 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Customer Details & Payment Options */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/80 border border-gray-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-mono font-bold">
                  1
                </span>
                Thông tin nhận hàng
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">(* Bắt buộc)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold flex items-center justify-between">
                  <span>Họ và tên người nhận *</span>
                  {errors.name && touched.name && (
                    <span className="text-red-400 text-[11px] font-normal animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    ref={nameRef}
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Ví dụ: Vũ Đức Đạt"
                    className={`w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none transition-all ${
                      errors.name && touched.name
                        ? 'border-2 border-red-500/80 bg-red-950/20 ring-4 ring-red-500/10 focus:border-red-400'
                        : 'border border-gray-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                    }`}
                  />
                </div>
              </div>

              {/* Phone field */}
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold flex items-center justify-between">
                  <span>Số điện thoại di động *</span>
                  {errors.phone && touched.phone && (
                    <span className="text-red-400 text-[11px] font-normal animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    ref={phoneRef}
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="Ví dụ: 0975745248"
                    className={`w-full bg-gray-900 rounded-xl px-4 py-3 text-white font-mono outline-none transition-all ${
                      errors.phone && touched.phone
                        ? 'border-2 border-red-500/80 bg-red-950/20 ring-4 ring-red-500/10 focus:border-red-400'
                        : 'border border-gray-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                    }`}
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-gray-300 font-bold">Email (Nhận hóa đơn điện tử & mã VietQR)</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              {/* Address field */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-gray-300 font-bold flex items-center justify-between">
                  <span>Địa chỉ giao hàng chi tiết *</span>
                  {errors.address && touched.address && (
                    <span className="text-red-400 text-[11px] font-normal animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.address}
                    </span>
                  )}
                </label>
                <input
                  ref={addressRef}
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className={`w-full bg-gray-900 rounded-xl px-4 py-3 text-white outline-none transition-all ${
                    errors.address && touched.address
                      ? 'border-2 border-red-500/80 bg-red-950/20 ring-4 ring-red-500/10 focus:border-red-400'
                      : 'border border-gray-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                  }`}
                />
              </div>

              {/* Note field */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-gray-400 font-medium">Ghi chú giao hàng (nếu có)</label>
                <textarea
                  rows={2}
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                  placeholder="Ví dụ: Giao sau 17h hoặc gọi trước khi tới"
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/80 border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              Phương thức thanh toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option: VietQR Napas 247 */}
              <label
                onClick={() => setPaymentMethod('vietqr')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'vietqr'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-white">VietQR Napas 247</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
                    MB 5100101042006
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Quét mã QR tự động thụ hưởng <strong>VU DUC DAT</strong> (MB Bank). Khớp lệnh tức thì 0% phí.
                </p>
              </label>

              {/* Option: COD */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'cod'
                    ? 'bg-blue-950/40 border-blue-400 shadow-lg shadow-blue-500/10'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 text-white flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-white">COD (Khi nhận hàng)</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Kiểm tra hàng trước khi thanh toán tiền mặt cho nhân viên giao hàng trên toàn quốc.
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary, Membership & Voucher */}
        <div className="lg:col-span-5 space-y-6">
          {/* Membership Tier Perk Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-gray-950 to-cyan-950/30 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white font-heading uppercase">
                  Đặc quyền thành viên
                </span>
              </div>
              <MembershipBadge tier={currentTier} />
            </div>

            {tierDiscountRate > 0 ? (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự động giảm {tierDiscountRate * 100}% ({memberDiscount.toLocaleString('vi-VN')}đ) theo hạng {currentTier}!</span>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">
                Tích lũy thêm để mở khóa hạng VIP (giảm 5%), GOLD (giảm 10%), DIAMOND (giảm 15%).
              </p>
            )}
          </div>

          {/* Voucher Selection Box */}
          <div className="p-5 rounded-3xl bg-gray-950/80 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Mã giảm giá (Voucher)
              </span>
              <button
                type="button"
                onClick={() => setShowVoucherModal(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                Chọn mã có sẵn <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {appliedVoucher ? (
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
                <div>
                  <span className="font-mono font-extrabold text-xs text-cyan-300">
                    Mã: {appliedVoucher.code}
                  </span>
                  <span className="text-[11px] text-emerald-400 block font-mono">
                    Giảm {voucherDiscount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeVoucher}
                  className="text-xs text-red-400 hover:text-red-300 font-bold p-1"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVoucherModal(true)}
                className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-dashed border-gray-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Percent className="w-3.5 h-3.5 text-cyan-400" /> Nhập hoặc chọn mã ưu đãi (XIV10, CYBER200K...)
              </button>
            )}
          </div>

          {/* Order Summary Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/80 border border-gray-800 space-y-6 sticky top-28">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Tóm tắt đơn hàng ({cartItems.length} sản phẩm)
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex items-center gap-3 p-2 rounded-xl bg-gray-900/60"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-lg bg-black flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-bold text-gray-200 line-clamp-1">{item.name}</h4>
                    <p className="text-gray-400 text-[11px]">
                      Size: <strong className="text-white">{item.size}</strong> • SL: {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-cyan-400 text-xs">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 border-t border-gray-800 pt-4 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Tạm tính:</span>
                <span className="font-mono text-white font-bold">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              {memberDiscount > 0 && (
                <div className="flex justify-between text-purple-400 font-mono">
                  <span>Chiết khấu {currentTier} ({tierDiscountRate * 100}%):</span>
                  <span className="font-bold">-{memberDiscount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              {appliedVoucher && voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-mono">
                  <span>Voucher ({appliedVoucher.code}):</span>
                  <span className="font-bold">-{voucherDiscount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between text-gray-400">
                <span>Phí vận chuyển:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {shippingFee === 0 ? 'MIỄN PHÍ' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                </span>
              </div>

              <div className="flex justify-between items-baseline border-t border-gray-800 pt-3 text-sm">
                <span className="font-bold text-white">Tổng thanh toán:</span>
                <span className="font-mono font-extrabold text-cyan-400 text-2xl">
                  {grandTotal.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                'Đang xử lý đơn hàng...'
              ) : paymentMethod === 'vietqr' ? (
                <>
                  <QrCode className="w-4 h-4" /> Thanh toán qua VietQR Napas 247
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Xác nhận đặt hàng COD
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Bảo mật Napas liên ngân hàng • Đổi trả 7 ngày
            </div>
          </div>
        </div>
      </form>

      {/* Voucher Selector Modal */}
      <VoucherSelectorModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
      />

      {/* VietQR Dynamic Modal */}
      {showQRModal && createdOrder && (
        <VietQRModal
          order={createdOrder}
          onClose={() => {
            setShowQRModal(false);
            navigate(`/order-tracking?code=${createdOrder.orderCode}`);
          }}
        />
      )}
    </div>
  );
}
