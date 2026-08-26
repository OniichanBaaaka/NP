import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Package,
  Ticket,
  Star,
  Headphones,
  Shield,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  Sparkles,
  MapPin,
  Lock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Bot,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderAPI, reviewAPI, faqAPI, userAPI, authAPI } from '../services/api';
import MembershipBadge from '../components/MembershipBadge';

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  const {
    user,
    refreshUserData,
    currentTier,
    userSpending,
    tierDiscountRate,
    nextTierRemaining,
    nextTierProgress,
  } = useAuth();
  const navigate = useNavigate();

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('ALL');

  // Reviews State
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    productId: '',
    productName: '',
    productImage: '',
    orderCode: '',
    rating: 5,
    fitEvaluation: 'Vừa vặn',
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Vouchers State
  const [copiedCode, setCopiedCode] = useState('');

  // Support & FAQ State
  const [faqs, setFaqs] = useState([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Account Settings State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Change Password State
  const [changePassForm, setChangePassForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });
  const [changePassStep, setChangePassStep] = useState(1); // 1: request otp, 2: verify & update
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassMsg, setChangePassMsg] = useState('');
  const [changePassError, setChangePassError] = useState('');

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Load Data
  useEffect(() => {
    loadOrders();
    loadReviews();
    loadFaqs();
  }, []);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await reviewAPI.getMyReviews();
      if (res.data.success) {
        setMyReviews(res.data.reviews || []);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadFaqs = async () => {
    try {
      const res = await faqAPI.getAll();
      if (res.data.success) {
        setFaqs(res.data.faqs || []);
      }
    } catch (e) {
      console.error('Failed to load FAQs:', e);
    }
  };

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Open Review Modal for a specific purchased product
  const handleOpenReviewModal = (product, orderCode) => {
    setReviewForm({
      productId: product.productId || product._id || product.id,
      productName: product.name,
      productImage: product.image || (product.images && product.images[0]) || '',
      orderCode: orderCode || '',
      rating: 5,
      fitEvaluation: 'Vừa vặn',
      comment: '',
    });
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create(reviewForm);
      if (res.data.success) {
        setIsReviewModalOpen(false);
        await loadReviews();
        setActiveTab('reviews');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Update Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await userAPI.updateMyProfile(profileForm);
      if (res.data.success) {
        setProfileSuccess('Cập nhật hồ sơ cá nhân thành công!');
        await refreshUserData();
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password - Send OTP
  const handleSendChangePassOtp = async () => {
    setChangePassLoading(true);
    setChangePassError('');
    setChangePassMsg('');
    try {
      const res = await authAPI.changePasswordSendOtp();
      if (res.data.success) {
        setChangePassMsg(res.data.message);
        setChangePassStep(2);
      }
    } catch (err) {
      setChangePassError(err.response?.data?.message || 'Lỗi gửi mã OTP');
    } finally {
      setChangePassLoading(false);
    }
  };

  // Change Password - Submit
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (changePassForm.newPassword !== changePassForm.confirmPassword) {
      setChangePassError('Xác nhận mật khẩu mới không khớp!');
      return;
    }
    setChangePassLoading(true);
    setChangePassError('');
    setChangePassMsg('');
    try {
      const res = await authAPI.changePassword({
        oldPassword: changePassForm.oldPassword,
        newPassword: changePassForm.newPassword,
        otp: changePassForm.otp,
      });
      if (res.data.success) {
        setChangePassMsg('Đổi mật khẩu thành công!');
        setChangePassForm({ oldPassword: '', newPassword: '', confirmPassword: '', otp: '' });
        setChangePassStep(1);
      }
    } catch (err) {
      setChangePassError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangePassLoading(false);
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  // Filter FAQs
  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const voucherList = [
    {
      code: 'XIVWELCOME',
      title: 'Giảm 50.000đ Đơn Đầu Tiên',
      desc: 'Áp dụng cho đơn hàng bất kỳ từ 400.000đ',
      expiry: '31/12/2026',
      tag: 'TÂN THỦ',
      color: 'from-pink-500 to-rose-600',
    },
    {
      code: 'CYBERVIP10',
      title: 'Giảm 10% Tối Đa 150.000đ',
      desc: 'Áp dụng cho đơn hàng từ 800.000đ',
      expiry: '30/11/2026',
      tag: 'HOT SALE',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      code: 'FREESHIP',
      title: 'Miễn Phí Vận Chuyển Toàn Quốc',
      desc: 'Áp dụng cho tất cả đơn hàng từ 500.000đ',
      expiry: '31/12/2026',
      tag: 'FREESHIP',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      code: 'STREETWEAR100',
      title: 'Giảm Ngay 100.000đ',
      desc: 'Áp dụng cho đơn từ 1.200.000đ khi mua Hoodie & Jacket',
      expiry: '15/10/2026',
      tag: 'STREETWEAR',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      code: 'DIAMOND20',
      title: 'Đặc Quyền Hội Viên Diamond 20%',
      desc: 'Giảm ngay 20% cho đơn hàng không giới hạn',
      expiry: 'Vĩnh viễn',
      tag: 'VIP EXCLUSIVE',
      color: 'from-amber-500 to-rose-500',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Đã giao thành công</span>;
      case 'SHIPPING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"><Truck className="w-3 h-3" /> Đang giao hàng</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30"><Package className="w-3 h-3" /> Đang đóng gói</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"><Clock className="w-3 h-3" /> Chờ xác nhận</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30"><XCircle className="w-3 h-3" /> Đã hủy đơn</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/30">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: User Profile Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-pink-500/40 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
                  {user?.name || 'Khách hàng XIV'}
                </h1>
                <MembershipBadge tier={currentTier} />
              </div>
              <p className="text-xs text-gray-400 font-mono">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-medium">
                  📞 {user?.phone || 'Chưa cập nhật SĐT'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-medium">
                  📍 {user?.address || 'Chưa cập nhật địa chỉ'}
                </span>
              </div>
            </div>
          </div>

          {/* Spending & Tier Progress Mini-Card */}
          <div className="w-full md:w-72 p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-bold">Chi tiêu tích lũy:</span>
              <span className="text-pink-400 font-mono font-black">
                {(userSpending || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${nextTierProgress || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Hội viên: <strong className="text-white">{currentTier || 'MEMBER'}</strong></span>
              <span>Chiết khấu: <strong className="text-emerald-400 font-bold">{(((tierDiscountRate || 0)) * 100).toFixed(0)}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (5 Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800 no-scrollbar">
        {[
          { id: 'orders', label: 'Lịch sử mua hàng', icon: Package, count: orders.length },
          { id: 'vouchers', label: 'Kho Voucher & Ưu đãi', icon: Ticket, count: voucherList.length },
          { id: 'reviews', label: 'Đánh giá sản phẩm', icon: Star, count: myReviews.length },
          { id: 'support', label: 'CSKH & Trợ giúp 24/7', icon: Headphones },
          { id: 'account', label: 'Hồ sơ & Bảo mật', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: LỊCH SỬ HÀNG ĐÃ MUA */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { key: 'ALL', label: 'Tất cả đơn' },
              { key: 'PENDING', label: 'Chờ xác nhận' },
              { key: 'PROCESSING', label: 'Đang xử lý' },
              { key: 'SHIPPING', label: 'Đang giao hàng' },
              { key: 'DELIVERED', label: 'Đã nhận hàng' },
              { key: 'CANCELLED', label: 'Đã hủy' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setOrderFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  orderFilter === f.key
                    ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {ordersLoading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400">Đang tải lịch sử đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-gray-950/60 border border-gray-800 space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Chưa có đơn hàng nào</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Khám phá các sản phẩm Streetwear cao cấp và đặt hàng ngay hôm nay!
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all"
              >
                Khám phá bộ sưu tập <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="p-5 sm:p-6 rounded-3xl bg-gray-950/90 border border-gray-800 shadow-xl space-y-4 hover:border-gray-700 transition-all"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-cyan-400">
                          #{order.orderCode}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <span className="text-[11px] text-gray-500 block">
                        Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/order-tracking?code=${order.orderCode}`}
                        className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-cyan-400" /> Tra cứu vận đơn
                      </Link>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80'}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover border border-gray-800 flex-shrink-0"
                          />
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {item.name}
                            </h4>
                            <div className="text-[11px] text-gray-400 space-x-2">
                              {item.size && <span>Size: <strong className="text-gray-300">{item.size}</strong></span>}
                              {item.color && <span>Màu: <strong className="text-gray-300">{item.color}</strong></span>}
                              <span>SL: <strong className="text-gray-300">x{item.quantity}</strong></span>
                            </div>
                            <span className="text-xs font-bold text-pink-400 font-mono">
                              {(item.price || 0).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>

                        {/* Review Button for Delivered items */}
                        {order.status === 'DELIVERED' && (
                          <button
                            onClick={() => handleOpenReviewModal(item, order.orderCode)}
                            className="px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer flex-shrink-0"
                          >
                            <Star className="w-3 h-3 text-pink-400 fill-pink-400" /> Đánh giá
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Total */}
                  <div className="pt-3 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-gray-400">
                      Phương thức: <strong className="text-gray-200">{order.paymentMethod === 'VIETQR' ? 'VietQR Napas 247' : 'COD (Tiền mặt)'}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Tổng thanh toán:</span>
                      <span className="text-base font-black text-white font-mono">
                        {(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KHO VOUCHER & ƯU ĐÃI HỘI VIÊN */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-cyan-950/40 border border-pink-500/30 space-y-3">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Đặc quyền hội viên {currentTier}
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Bạn đang được giảm tự động {(tierDiscountRate * 100).toFixed(0)}% trên mọi đơn hàng!
            </h3>
            <p className="text-xs text-gray-300 max-w-xl">
              Càng mua sắm nhiều, cấp bậc hội viên càng tăng cao. Sử dụng thêm các mã voucher giảm giá bên dưới để nhận ưu đãi kép không giới hạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voucherList.map((v, i) => (
              <div
                key={i}
                className="p-5 rounded-3xl bg-gray-950/90 border border-gray-800 hover:border-gray-700 shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${v.color}`}>
                      {v.tag}
                    </span>
                    <h4 className="text-sm font-black text-white">{v.title}</h4>
                    <p className="text-xs text-gray-400">{v.desc}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 block">Hạn sử dụng: {v.expiry}</span>
                    <span className="font-mono font-black text-sm text-cyan-400">{v.code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyVoucher(v.code)}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedCode === v.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Sao chép
                        </>
                      )}
                    </button>
                    <Link
                      to="/shop"
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs shadow transition-all"
                    >
                      Dùng ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ĐÁNH GIÁ MẶT HÀNG ĐÃ MUA */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-heading">
              ĐÁNH GIÁ CỦA BẠN ({myReviews.length})
            </h3>
            <span className="text-xs text-gray-400">
              Giúp cộng đồng có cái nhìn chân thực nhất về sản phẩm
            </span>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400">Đang tải danh sách đánh giá...</p>
            </div>
          ) : myReviews.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-gray-950/60 border border-gray-800 space-y-3">
              <Star className="w-12 h-12 text-gray-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Bạn chưa có đánh giá nào</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Khi các đơn hàng được giao thành công, bạn có thể gửi nhận xét và chấm điểm sao tại đây!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myReviews.map((rev) => (
                <div
                  key={rev._id || rev.id}
                  className="p-5 rounded-3xl bg-gray-950/90 border border-gray-800 space-y-3 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.productImage || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80'}
                      alt={rev.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-800 flex-shrink-0"
                    />
                    <div className="space-y-0.5 flex-1">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{rev.productName}</h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] text-gray-400 ml-1">({rev.rating}/5)</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {rev.fitEvaluation}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-2xl border border-gray-800/80 leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Đơn hàng: #{rev.orderCode || 'XIV-VERIFIED'}</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CHĂM SÓC KHÁCH HÀNG & TRỢ GIÚP 24/7 */}
      {activeTab === 'support' && (
        <div className="space-y-8">
          {/* Support Hotline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-gray-950/90 border border-gray-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white">Hotline CSKH Miễn Phí</h4>
              <p className="text-xs text-gray-400">Hỗ trợ đặt hàng, đổi size và tư vấn chất liệu</p>
              <a
                href="tel:19006868"
                className="inline-block font-mono font-black text-lg text-pink-400 hover:underline"
              >
                1900 6868
              </a>
              <span className="text-[10px] text-gray-500 block">8:00 - 22:00 (Cả T7 & CN)</span>
            </div>

            <div className="p-6 rounded-3xl bg-gray-950/90 border border-gray-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white">Zalo / CSKH Trực Tuyến</h4>
              <p className="text-xs text-gray-400">Chat nhanh với nhân viên hỗ trợ trực tiếp</p>
              <span className="font-mono font-black text-lg text-cyan-400 block">
                0901 234 567
              </span>
              <span className="text-[10px] text-gray-500 block">Phản hồi trong 5 phút</span>
            </div>

            <div className="p-6 rounded-3xl bg-gray-950/90 border border-gray-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white">Email Hỗ Trợ Khách Hàng</h4>
              <p className="text-xs text-gray-400">Gửi khiếu nại, hóa đơn hoặc hợp tác</p>
              <a
                href="mailto:support@xivstudio.com"
                className="inline-block font-mono font-bold text-sm text-purple-400 hover:underline"
              >
                support@xivstudio.com
              </a>
              <span className="text-[10px] text-gray-500 block">Xử lý trong vòng 24 giờ</span>
            </div>
          </div>

          {/* AI Assistant Quick Connect & Warranty Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Shopping Assistant */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-cyan-500/30 space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4" /> Trợ lý ảo AI Thông minh 24/7
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Cần tư vấn chọn size hoặc phối đồ Streetwear?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Trợ lý AI của XIV STUDIO được tích hợp mô hình Gemini AI kết hợp dữ liệu tồn kho thực tế, sẵn sàng gợi ý outfit và tra cứu tình trạng đơn hàng ngay lập tức!
              </p>
              <p className="text-xs text-cyan-300 font-bold">
                👉 Nhấp vào biểu tượng Chat AI phát sáng ở góc dưới bên phải màn hình để trò chuyện ngay!
              </p>
            </div>

            {/* Warranty & Return Policy */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/90 border border-gray-800 space-y-4">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
                <RotateCcw className="w-4 h-4" /> Chính sách đổi trả & bảo hành
              </div>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Đổi size miễn phí trong 7 ngày</strong> nếu không vừa vặn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Bảo hành khóa kéo YKK & đường may 6 tháng</strong> cho mọi sản phẩm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Hoàn tiền 100% nếu phát hiện lỗi từ nhà sản xuất.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive FAQ Search */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white font-heading">
                CÂU HỎI THƯỜNG GẶP (FAQ)
              </h3>
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi (VietQR, đổi trả, bảo hành...)"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full sm:w-80 bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => (
                <div
                  key={faq._id || idx}
                  className="rounded-2xl bg-gray-950/90 border border-gray-800 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-gray-900/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-gray-200">
                      ❓ {faq.question}
                    </span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-4 pt-0 text-xs text-gray-400 border-t border-gray-900 bg-gray-900/20 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HỒ SƠ & BẢO MẬT */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Info Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/90 border border-gray-800 space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <User className="w-4 h-4 text-pink-400" /> THÔNG TIN CÁ NHÂN
            </h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Họ và tên</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Email (Không thể thay đổi)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-gray-900/40 border border-gray-800 text-gray-500 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="0987654321"
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Địa chỉ giao hàng mặc định</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Số nhà, tên đường, Quận/Huyện, TP"
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Đường dẫn ảnh đại diện (Avatar URL)</label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white outline-none text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {profileSaving ? 'Đang lưu thông tin...' : 'Lưu thay đổi hồ sơ'}
              </button>
            </form>
          </div>

          {/* Change Password Form (with Gmail OTP) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/90 border border-gray-800 space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> ĐỔI MẬT KHẨU (GMAIL OTP)
            </h3>

            {changePassMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {changePassMsg}
              </div>
            )}

            {changePassError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                {changePassError}
              </div>
            )}

            {changePassStep === 1 ? (
              <div className="space-y-4 text-xs">
                <p className="text-gray-400 leading-relaxed">
                  Để đảm bảo an toàn, hệ thống sẽ gửi một mã OTP gồm 6 chữ số đến hộp thư Gmail <strong>{user?.email}</strong> trước khi đổi mật khẩu mới.
                </p>

                <button
                  type="button"
                  onClick={handleSendChangePassOtp}
                  disabled={changePassLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {changePassLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Đang gửi mã OTP...
                    </>
                  ) : (
                    <>
                      Gửi mã xác thực qua Gmail <Mail className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Mã OTP 6 số (từ Gmail) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={changePassForm.otp}
                    onChange={(e) => setChangePassForm({ ...changePassForm, otp: e.target.value.replace(/\D/g, '') })}
                    placeholder="123456"
                    className="w-full bg-gray-900 border border-cyan-400/50 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-center font-mono text-lg font-bold text-cyan-300 tracking-widest outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={changePassForm.oldPassword}
                    onChange={(e) => setChangePassForm({ ...changePassForm, oldPassword: e.target.value })}
                    placeholder="Nhập mật khẩu cũ"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={changePassForm.newPassword}
                    onChange={(e) => setChangePassForm({ ...changePassForm, newPassword: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={changePassForm.confirmPassword}
                    onChange={(e) => setChangePassForm({ ...changePassForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setChangePassStep(1)}
                    className="w-1/3 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-bold transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={changePassLoading || changePassForm.otp.length !== 6}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-black font-extrabold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {changePassLoading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REVIEW SUBMISSION MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-gray-950 border border-gray-800 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-base font-extrabold text-white font-heading flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> ĐÁNH GIÁ SẢN PHẨM
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900/70 border border-gray-800">
              <img
                src={reviewForm.productImage || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80'}
                alt={reviewForm.productName}
                className="w-12 h-12 rounded-xl object-cover border border-gray-700 flex-shrink-0"
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white line-clamp-1">{reviewForm.productName}</h4>
                <span className="text-[10px] text-gray-400">Đơn hàng: #{reviewForm.orderCode}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Selector */}
              <div className="space-y-1.5 text-center">
                <label className="text-gray-300 font-bold block">Chất lượng sản phẩm</label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewForm.rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-gray-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Evaluation */}
              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Độ vừa vặn của form dáng:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Hơi chật', 'Vừa vặn', 'Hơi rộng'].map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, fitEvaluation: fit })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        reviewForm.fitEvaluation === fit
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Nhận xét chi tiết *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Hãy chia sẻ cảm nhận của bạn về chất vải, đường may, form dáng..."
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl p-3 text-white outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'} <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
