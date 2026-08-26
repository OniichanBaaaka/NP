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
  LogIn,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { orderAPI, reviewAPI, faqAPI, userAPI, authAPI } from '../services/api';
import MembershipBadge from '../components/MembershipBadge';

export default function Profile() {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'orders');

  const {
    user,
    loading: authLoading,
    refreshUserData,
    currentTier = 'MEMBER',
    userSpending = 0,
    tierDiscountRate = 0,
    nextTierRemaining = 0,
    nextTierProgress = 0,
  } = useAuth();
  const navigate = useNavigate();

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [confirmSuccessMsg, setConfirmSuccessMsg] = useState('');

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
    name: '',
    phone: '',
    address: '',
    avatar: '',
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

  // Sync tab from URL if changed
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Handle Tab Switch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
      loadOrders();
      loadReviews();
    }
    loadFaqs();
  }, [user]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      if (res.data && res.data.success) {
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
      if (res.data && res.data.success) {
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
      if (res.data && res.data.success) {
        setFaqs(res.data.faqs || []);
      }
    } catch (e) {
      console.error('Failed to load FAQs:', e);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm('Bạn xác nhận đã nhận được kiện hàng này đầy đủ và nguyên vẹn?')) {
      return;
    }
    setConfirmingOrderId(orderId);
    setConfirmSuccessMsg('');
    try {
      const res = await orderAPI.confirmDelivery(orderId);
      if (res.data && res.data.success) {
        setConfirmSuccessMsg('🎉 ' + res.data.message);
        await loadOrders();
        if (refreshUserData) await refreshUserData();
        setTimeout(() => setConfirmSuccessMsg(''), 5000);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleOpenReviewModal = (product, orderCode) => {
    const pId = String(product.productId?._id || product.productId || product._id || product.id || '');
    setReviewForm({
      productId: pId,
      productName: product.name || 'Sản phẩm XIV',
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
      if (res.data && res.data.success) {
        setIsReviewModalOpen(false);
        await loadReviews();
        handleTabChange('reviews');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await userAPI.updateMyProfile(profileForm);
      if (res.data && res.data.success) {
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

  const handleSendChangePassOtp = async () => {
    setChangePassLoading(true);
    setChangePassError('');
    setChangePassMsg('');
    try {
      const res = await authAPI.changePasswordSendOtp();
      if (res.data && res.data.success) {
        setChangePassMsg(res.data.message);
        setChangePassStep(2);
      }
    } catch (err) {
      setChangePassError(err.response?.data?.message || 'Lỗi gửi mã OTP');
    } finally {
      setChangePassLoading(false);
    }
  };

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
      if (res.data && res.data.success) {
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

  // Helper check status DELIVERED
  const isDelivered = (st) => {
    const s = String(st || '').toUpperCase();
    return s === 'DELIVERED' || s === 'COMPLETED' || s === 'SUCCESS';
  };

  // Tập hợp tất cả sản phẩm từ đơn ĐÃ GIAO mà chưa được đánh giá
  const reviewedProductIds = new Set(
    myReviews.map((r) => String(r.productId?._id || r.productId || ''))
  );

  const pendingReviewItems = orders
    .filter((o) => isDelivered(o.status) || isDelivered(o.orderStatus))
    .flatMap((o) =>
      (o.items || []).map((item) => {
        const pId = String(item.productId?._id || item.productId || item._id || item.id || '');
        return {
          ...item,
          productId: pId,
          orderCode: o.orderCode,
          orderId: o._id || o.id,
        };
      })
    )
    .filter((item) => {
      if (item.type === 'subscription' || item.name?.includes('GÓI HỘI VIÊN')) return false;
      return item.productId && !reviewedProductIds.has(item.productId);
    });

  // If loading authentication state
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-700 dark:text-gray-400 font-mono font-bold">
            Đang tải hồ sơ người dùng...
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show Guest / Login Prompt
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500 mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              BẠN CHƯA ĐĂNG NHẬP
            </h2>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Vui lòng đăng nhập để xem lịch sử mua hàng, kho voucher, đánh giá sản phẩm và quản lý thông tin tài khoản cá nhân.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              to="/login"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:from-pink-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập ngay
            </Link>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl bg-pink-50 dark:bg-gray-900 hover:bg-pink-100 dark:hover:bg-gray-800 border border-pink-200 dark:border-gray-800 text-slate-800 dark:text-gray-300 font-bold text-xs flex items-center justify-center transition-colors"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    const st = String(o.status || o.orderStatus || '').toUpperCase();
    return st === orderFilter;
  });

  const filteredFaqs = faqs.filter(
    (f) =>
      (f.question && f.question.toLowerCase().includes(faqSearch.toLowerCase())) ||
      (f.answer && f.answer.toLowerCase().includes(faqSearch.toLowerCase()))
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
    const upper = String(status || '').toUpperCase();
    switch (upper) {
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã giao thành công
          </span>
        );
      case 'SHIPPING':
      case 'DELIVERING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30">
            <Truck className="w-3.5 h-3.5 text-cyan-600" /> Đang giao hàng
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30">
            <Package className="w-3.5 h-3.5 text-blue-600" /> Đang đóng gói
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ xác nhận
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Đã hủy đơn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-700">
            {upper}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner: User Profile Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border border-pink-200 dark:border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-pink-400 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                  {user?.name || 'Khách hàng XIV'}
                </h1>
                <MembershipBadge tier={currentTier} />
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-mono font-bold">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1 text-xs">
                <span className="px-3 py-1 rounded-full bg-pink-50 dark:bg-gray-800 border border-pink-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-bold">
                  📞 {user?.phone || 'Chưa cập nhật SĐT'}
                </span>
                <span className="px-3 py-1 rounded-full bg-pink-50 dark:bg-gray-800 border border-pink-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-bold">
                  📍 {user?.address || 'Chưa cập nhật địa chỉ'}
                </span>
              </div>
            </div>
          </div>

          {/* Spending & Tier Progress Mini-Card */}
          <div className="w-full md:w-72 p-4 rounded-2xl bg-pink-50/80 dark:bg-gray-950/80 border border-pink-200 dark:border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-gray-400 font-bold">Chi tiêu tích lũy:</span>
              <span className="text-pink-600 dark:text-pink-400 font-mono font-black text-sm">
                {(Number(userSpending) || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, nextTierProgress || 0))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-400 font-bold">
              <span>Hội viên: <strong className="text-slate-900 dark:text-white font-extrabold">{currentTier || 'MEMBER'}</strong></span>
              <span>Chiết khấu: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{(((tierDiscountRate || 0)) * 100).toFixed(0)}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (5 Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pink-200 dark:border-gray-800 no-scrollbar">
        {[
          { id: 'orders', label: 'Lịch sử mua hàng', icon: Package, count: orders.length },
          { id: 'vouchers', label: 'Kho Voucher & Ưu đãi', icon: Ticket, count: voucherList.length },
          { id: 'reviews', label: 'Đánh giá sản phẩm', icon: Star, count: pendingReviewItems.length + myReviews.length },
          { id: 'support', label: 'CSKH & Trợ giúp 24/7', icon: Headphones },
          { id: 'account', label: 'Hồ sơ & Bảo mật', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-white/90 dark:bg-gray-900/60 hover:bg-pink-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 border border-pink-200 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-pink-100 dark:bg-gray-800 text-pink-700 dark:text-gray-300'
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  orderFilter === f.key
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                    : 'bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-pink-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {confirmSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2 shadow-md animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{confirmSuccessMsg}</span>
            </div>
          )}

          {ordersLoading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-700 dark:text-gray-400 font-bold">Đang tải lịch sử đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white/90 dark:bg-gray-950/60 border border-pink-200 dark:border-gray-800 space-y-4 shadow-lg">
              <ShoppingBag className="w-12 h-12 text-pink-400 dark:text-gray-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Chưa có đơn hàng nào</h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 max-w-sm mx-auto font-medium">
                  Khám phá các sản phẩm Streetwear cao cấp và đặt hàng ngay hôm nay!
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all"
              >
                Khám phá bộ sưu tập <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isOrdDelivered = isDelivered(order.status) || isDelivered(order.orderStatus);
                const isOrdCancelled = String(order.status || order.orderStatus || '').toUpperCase() === 'CANCELLED';
                const isOrderSubscription = order.items?.some(
                  (it) => it.type === 'subscription' || !it.productId || it.name?.includes('GÓI HỘI VIÊN')
                );

                return (
                  <div
                    key={order._id || order.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 shadow-xl space-y-4 hover:border-pink-300 dark:hover:border-gray-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-100 dark:border-gray-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-sm text-pink-600 dark:text-cyan-400">
                            #{order.orderCode}
                          </span>
                          {isOrderSubscription ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-sm">
                              <Crown className="w-3.5 h-3.5 text-amber-500" /> GÓI HỘI VIÊN (ĐÃ KÍCH HOẠT TỰ ĐỘNG)
                            </span>
                          ) : (
                            getStatusBadge(order.status || order.orderStatus)
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-gray-500 font-bold block">
                          Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {isOrderSubscription ? (
                          <Link
                            to="/membership"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                          >
                            <Crown className="w-4 h-4 fill-slate-950" /> Xem đặc quyền gói
                          </Link>
                        ) : (
                          <>
                            {!isOrdDelivered && !isOrdCancelled && (
                              <button
                                onClick={() => handleConfirmDelivery(order._id || order.id || order.orderCode)}
                                disabled={confirmingOrderId === (order._id || order.id || order.orderCode)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {confirmingOrderId === (order._id || order.id || order.orderCode)
                                  ? 'Đang xác nhận...'
                                  : 'Đã nhận được hàng'}
                              </button>
                            )}

                            <Link
                              to={`/order-tracking?code=${order.orderCode}`}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-gray-900 hover:bg-pink-100 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Tra cứu vận đơn
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items?.map((item, idx) => {
                        const isSubItem = item.type === 'subscription' || !item.productId || item.name?.includes('GÓI HỘI VIÊN');

                        return (
                          <div key={idx} className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80'}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover border border-pink-200 dark:border-gray-800 flex-shrink-0 shadow-sm"
                              />
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                                  {item.name}
                                </h4>
                                <div className="text-[11px] text-slate-600 dark:text-gray-400 space-x-2 font-medium">
                                  {item.size && <span>Gói/Size: <strong className="text-slate-900 dark:text-gray-200">{item.size}</strong></span>}
                                  {item.color && <span>Màu: <strong className="text-slate-900 dark:text-gray-200">{item.color}</strong></span>}
                                  <span>SL: <strong className="text-slate-900 dark:text-gray-200">x{item.quantity}</strong></span>
                                </div>
                                <span className="text-xs font-black text-pink-600 dark:text-pink-400 font-mono">
                                  {(Number(item.price) || 0).toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            </div>

                            {isOrdDelivered && !isSubItem && (
                              <button
                                onClick={() => handleOpenReviewModal(item, order.orderCode)}
                                className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-pink-500/10 hover:bg-amber-100 dark:hover:bg-pink-500/20 border border-amber-300 dark:border-pink-500/30 text-amber-900 dark:text-pink-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 shadow-sm"
                              >
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Đánh giá
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-pink-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-slate-600 dark:text-gray-400 font-medium">
                        Phương thức: <strong className="text-slate-900 dark:text-gray-200">{order.paymentMethod === 'VIETQR' ? 'VietQR Napas 247' : 'COD (Tiền mặt)'}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 dark:text-gray-400 font-bold">Tổng thanh toán:</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {(Number(order.finalAmount || order.totalAmount) || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KHO VOUCHER & ƯU ĐÃI HỘI VIÊN */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-100 via-purple-100 to-cyan-100 dark:from-pink-950/40 dark:via-purple-950/40 dark:to-cyan-950/40 border border-pink-300 dark:border-pink-500/30 space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Đặc quyền hội viên {currentTier}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Bạn đang được giảm tự động {(((tierDiscountRate || 0)) * 100).toFixed(0)}% trên mọi đơn hàng!
            </h3>
            <p className="text-xs text-slate-700 dark:text-gray-300 max-w-xl font-medium">
              Càng mua sắm nhiều, cấp bậc hội viên càng tăng cao. Sử dụng thêm các mã voucher giảm giá bên dưới để nhận ưu đãi kép không giới hạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voucherList.map((v, i) => (
              <div
                key={i}
                className="p-5 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-gray-700 shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${v.color}`}>
                      {v.tag}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{v.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{v.desc}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-pink-100 dark:border-gray-800 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold block">Hạn sử dụng: {v.expiry}</span>
                    <span className="font-mono font-black text-sm text-pink-600 dark:text-cyan-400">{v.code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyVoucher(v.code)}
                      className="px-3.5 py-2 rounded-xl bg-pink-50 dark:bg-gray-900 hover:bg-pink-100 dark:hover:bg-gray-800 border border-pink-200 dark:border-gray-700 text-slate-800 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedCode === v.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Sao chép
                        </>
                      )}
                    </button>
                    <Link
                      to="/shop"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-extrabold text-xs shadow transition-all"
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
        <div className="space-y-8">
          {/* SECTION 1: Hàng đã nhận — chờ đánh giá */}
          {reviewsLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-7 h-7 text-pink-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-700 dark:text-gray-400 font-bold">Đang tải danh sách chờ đánh giá...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  HÀNG ĐÃ NHẬN — CHỜ ĐÁNH GIÁ
                  {pendingReviewItems.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-[11px] font-mono font-black animate-pulse">
                      {pendingReviewItems.length} sản phẩm
                    </span>
                  )}
                </h3>
              </div>

              {pendingReviewItems.length === 0 ? (
                <div className="p-6 rounded-3xl bg-white/90 dark:bg-gray-900/60 border-2 border-dashed border-pink-200 dark:border-gray-800 text-center space-y-2 shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-black text-slate-800 dark:text-gray-200">
                    Chưa có sản phẩm nào cần đánh giá
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 max-w-md mx-auto font-medium">
                    Khi bạn bấm <strong>"Đã nhận được hàng"</strong> ở mục Lịch sử đơn hàng, sản phẩm sẽ tự động xuất hiện tại đây để bạn gửi cảm nhận và chấm điểm sao!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pendingReviewItems.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="flex items-center gap-3.5 p-4 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-amber-500/30 hover:border-pink-400 dark:hover:border-amber-500/50 shadow-lg transition-all"
                    >
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-pink-200 dark:border-gray-800 flex-shrink-0 shadow-sm"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-slate-600 dark:text-gray-400 space-x-2 font-medium">
                          {item.size && <span>Size: <strong className="text-slate-900 dark:text-gray-200">{item.size}</strong></span>}
                          {item.color && <span>Màu: <strong className="text-slate-900 dark:text-gray-200">{item.color}</strong></span>}
                        </div>
                        <span className="text-[11px] text-pink-600 dark:text-amber-400 font-mono font-black block">
                          #{item.orderCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenReviewModal(item, item.orderCode)}
                        className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/30 transition-all cursor-pointer"
                      >
                        <Star className="w-4 h-4 fill-slate-950" /> Đánh giá
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Đánh giá đã gửi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pt-4 border-t border-pink-200 dark:border-gray-800 flex-wrap gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                ĐÁNH GIÁ ĐÃ GỬI ({myReviews.length})
              </h3>
              <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                Giúp cộng đồng có cái nhìn chân thực
              </span>
            </div>

            {myReviews.length === 0 ? (
              <div className="text-center py-10 rounded-3xl bg-white/90 dark:bg-gray-950/60 border border-pink-200 dark:border-gray-800 space-y-2 shadow-sm">
                <Star className="w-10 h-10 text-slate-300 dark:text-gray-700 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                  Bạn chưa có đánh giá nào được gửi
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myReviews.map((rev) => (
                  <div
                    key={rev._id || rev.id}
                    className="p-5 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 space-y-3 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.productImage || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80'}
                        alt={rev.productName}
                        className="w-14 h-14 rounded-2xl object-cover border border-pink-200 dark:border-gray-800 flex-shrink-0 shadow-sm"
                      />
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                          {rev.productName}
                        </h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-gray-700'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-slate-700 dark:text-gray-400 font-bold ml-1">
                            ({rev.rating}/5)
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20 flex-shrink-0">
                        {rev.fitEvaluation}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-gray-200 bg-pink-50/60 dark:bg-gray-900/60 p-3.5 rounded-2xl border border-pink-100 dark:border-gray-800 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-500 font-bold pt-1">
                      <span>Đơn hàng: #{rev.orderCode || 'XIV-VERIFIED'}</span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHĂM SÓC KHÁCH HÀNG & TRỢ GIÚP 24/7 */}
      {activeTab === 'support' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 space-y-3 shadow-lg">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-600">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Hotline CSKH Miễn Phí</h4>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">Hỗ trợ đặt hàng, đổi size và tư vấn chất liệu</p>
              <a
                href="tel:19006868"
                className="inline-block font-mono font-black text-lg text-pink-600 dark:text-pink-400 hover:underline"
              >
                1900 6868
              </a>
              <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold block">8:00 - 22:00 (Cả T7 & CN)</span>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 space-y-3 shadow-lg">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Zalo / CSKH Trực Tuyến</h4>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">Chat nhanh với nhân viên hỗ trợ trực tiếp</p>
              <span className="font-mono font-black text-lg text-cyan-600 dark:text-cyan-400 block">
                0901 234 567
              </span>
              <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold block">Phản hồi trong 5 phút</span>
            </div>

            <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 space-y-3 shadow-lg">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Email Hỗ Trợ Khách Hàng</h4>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">Gửi khiếu nại, hóa đơn hoặc hợp tác</p>
              <a
                href="mailto:support@xivstudio.com"
                className="inline-block font-mono font-bold text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                support@xivstudio.com
              </a>
              <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold block">Xử lý trong vòng 24 giờ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border border-pink-200 dark:border-cyan-500/30 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4" /> Trợ lý ảo AI Thông minh 24/7
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Cần tư vấn chọn size hoặc phối đồ Streetwear?
              </h3>
              <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                Trợ lý AI của XIV STUDIO được tích hợp mô hình Gemini AI kết hợp dữ liệu tồn kho thực tế, sẵn sàng gợi ý outfit và tra cứu tình trạng đơn hàng ngay lập tức!
              </p>
              <p className="text-xs text-pink-600 dark:text-cyan-300 font-black">
                👉 Nhấp vào biểu tượng Chat AI phát sáng ở góc dưới bên phải màn hình để trò chuyện ngay!
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-black text-xs uppercase tracking-wider">
                <RotateCcw className="w-4 h-4" /> Chính sách đổi trả & bảo hành
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-gray-300 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900 dark:text-white">Đổi size miễn phí trong 7 ngày</strong> nếu không vừa vặn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900 dark:text-white">Bảo hành khóa kéo YKK & đường may 6 tháng</strong> cho mọi sản phẩm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Hoàn tiền 100% nếu phát hiện lỗi từ nhà sản xuất.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                CÂU HỎI THƯỜNG GẶP (FAQ)
              </h3>
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi (VietQR, đổi trả, bảo hành...)"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full sm:w-80 bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => (
                <div
                  key={faq._id || idx}
                  className="rounded-2xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-pink-50/50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-gray-200">
                      ❓ {faq.question}
                    </span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-pink-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-4 pt-0 text-xs text-slate-700 dark:text-gray-400 border-t border-pink-100 dark:border-gray-900 bg-pink-50/30 dark:bg-gray-900/20 leading-relaxed font-medium">
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 space-y-5 shadow-xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <User className="w-4 h-4 text-pink-600" /> THÔNG TIN CÁ NHÂN
            </h3>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-red-950/50 border border-rose-300 dark:border-red-800 text-rose-800 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-800 dark:text-gray-300 font-black">Họ và tên</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-gray-300 font-black">Email (Không thể thay đổi)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-100 dark:bg-gray-900/40 border border-slate-300 dark:border-gray-800 text-slate-500 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-gray-300 font-black">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="0987654321"
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-gray-300 font-black">Địa chỉ giao hàng mặc định</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Số nhà, tên đường, Quận/Huyện, TP"
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-gray-300 font-black">Đường dẫn ảnh đại diện (Avatar URL)</label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none text-[11px] font-mono font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-black text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {profileSaving ? 'Đang lưu thông tin...' : 'Lưu thay đổi hồ sơ'}
              </button>
            </form>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-gray-950/90 border border-pink-200 dark:border-gray-800 space-y-5 shadow-xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> ĐỔI MẬT KHẨU (GMAIL OTP)
            </h3>

            {changePassMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {changePassMsg}
              </div>
            )}

            {changePassError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-red-950/50 border border-rose-300 dark:border-red-800 text-rose-800 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                {changePassError}
              </div>
            )}

            {changePassStep === 1 ? (
              <div className="space-y-4 text-xs">
                <p className="text-slate-700 dark:text-gray-400 leading-relaxed font-medium">
                  Để đảm bảo an toàn, hệ thống sẽ gửi một mã OTP gồm 6 chữ số đến hộp thư Gmail <strong>{user?.email}</strong> trước khi đổi mật khẩu mới.
                </p>

                <button
                  type="button"
                  onClick={handleSendChangePassOtp}
                  disabled={changePassLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 text-white font-black text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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
                  <label className="text-slate-800 dark:text-gray-300 font-black">Mã OTP 6 số (từ Gmail) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={changePassForm.otp}
                    onChange={(e) => setChangePassForm({ ...changePassForm, otp: e.target.value.replace(/\D/g, '') })}
                    placeholder="123456"
                    className="w-full bg-white dark:bg-gray-900 border border-cyan-400 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-center font-mono text-xl font-black text-cyan-600 dark:text-cyan-300 tracking-widest outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-gray-300 font-black">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={changePassForm.oldPassword}
                    onChange={(e) => setChangePassForm({ ...changePassForm, oldPassword: e.target.value })}
                    placeholder="Nhập mật khẩu cũ"
                    className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-gray-300 font-black">Mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={changePassForm.newPassword}
                    onChange={(e) => setChangePassForm({ ...changePassForm, newPassword: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 dark:text-gray-300 font-black">Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={changePassForm.confirmPassword}
                    onChange={(e) => setChangePassForm({ ...changePassForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setChangePassStep(1)}
                    className="w-1/3 py-3 rounded-xl bg-slate-100 dark:bg-gray-900 hover:bg-slate-200 text-slate-700 dark:text-gray-400 text-xs font-black transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={changePassLoading || changePassForm.otp.length !== 6}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-950 border border-pink-200 dark:border-gray-800 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-gray-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> ĐÁNH GIÁ SẢN PHẨM
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-pink-50/70 dark:bg-gray-900/70 border border-pink-200 dark:border-gray-800">
              <img
                src={reviewForm.productImage || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80'}
                alt={reviewForm.productName}
                className="w-14 h-14 rounded-xl object-cover border border-pink-200 dark:border-gray-700 flex-shrink-0 shadow-sm"
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{reviewForm.productName}</h4>
                <span className="text-[11px] text-pink-600 dark:text-cyan-400 font-mono font-black">Đơn hàng: #{reviewForm.orderCode}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="space-y-1.5 text-center">
                <label className="text-slate-800 dark:text-gray-300 font-black block">Chất lượng sản phẩm</label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-300 dark:text-gray-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-gray-300 font-black">Độ vừa vặn của form dáng:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Hơi chật', 'Vừa vặn', 'Hơi rộng'].map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, fitEvaluation: fit })}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                        reviewForm.fitEvaluation === fit
                          ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                          : 'bg-white dark:bg-gray-900 border-pink-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:bg-pink-50'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-800 dark:text-gray-300 font-black">Nhận xét chi tiết *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Hãy chia sẻ cảm nhận của bạn về chất vải, đường may, form dáng..."
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 focus:border-pink-500 rounded-xl p-3 text-slate-900 dark:text-white outline-none resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-gray-900 hover:bg-slate-200 text-slate-700 dark:text-gray-400 text-xs font-black"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-black text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'} <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
