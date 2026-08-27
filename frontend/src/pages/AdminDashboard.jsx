import React, { useState, useEffect } from 'react';
import {
  Shield,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Users,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Trash2,
  Edit2,
  FolderPlus,
  HelpCircle,
  Plus,
  AlertCircle,
  CheckCircle,
  Crown,
  Clock,
  Package,
} from 'lucide-react';
import { orderAPI, userAPI, categoryAPI, faqAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'subscriptions' | 'users' | 'categories' | 'faqs'
  const [loading, setLoading] = useState(true);

  // AI Strategic Analysis State (UC010)
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // User Error / Notice message
  const [actionNotice, setActionNotice] = useState({ type: '', message: '' });

  const loadAdminData = async () => {
    setLoading(true);
    setActionNotice({ type: '', message: '' });
    try {
      const [kpiRes, userRes, catRes, faqRes, orderRes] = await Promise.all([
        orderAPI.getKPIs(),
        userAPI.getAll(),
        categoryAPI.getAll(),
        faqAPI.getAll(),
        orderAPI.getAll(),
      ]);

      if (kpiRes.data.success) setKpis(kpiRes.data.kpis);
      if (userRes.data.success) setUsersList(userRes.data.users);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (faqRes.data.success) setFaqs(faqRes.data.faqs);
      if (orderRes.data.success) setOrdersList(orderRes.data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle UC010: AI Strategic Analysis Trigger
  const handleTriggerAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await aiAPI.getStrategicAnalysis();
      if (res.data.success) {
        setAiReport(res.data.analysis);
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kích hoạt AI Phân tích Chiến lược: ' + (e.response?.data?.message || e.message));
    } finally {
      setAiLoading(false);
    }
  };

  // Handle User Role Change
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const res = await userAPI.updateRole(userId, newRole);
      if (res.data.success) {
        setActionNotice({ type: 'success', message: res.data.message });
        loadAdminData();
      }
    } catch (e) {
      setActionNotice({
        type: 'error',
        message: e.response?.data?.message || 'Không thể cập nhật vai trò người dùng',
      });
    }
  };

  // Handle User Membership / Package Change
  const handleChangeUserMembership = async (userId, data) => {
    try {
      const res = await userAPI.updateMembership(userId, data);
      if (res.data.success) {
        setActionNotice({ type: 'success', message: res.data.message });
        loadAdminData();
      }
    } catch (e) {
      setActionNotice({
        type: 'error',
        message: e.response?.data?.message || 'Không thể cập nhật gói hội viên',
      });
    }
  };

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    subtext: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    type: 'danger',
    onConfirm: null,
    isLoading: false,
  });

  const openConfirmModal = ({ title, message, subtext, confirmText, cancelText, type, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      subtext,
      confirmText: confirmText || 'Xác nhận',
      cancelText: cancelText || 'Hủy bỏ',
      type: type || 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await onConfirm();
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  // Handle User Delete (with protection rule test)
  const handleDeleteUser = (userId, userName) => {
    openConfirmModal({
      title: 'Xóa tài khoản người dùng',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${userName}" khỏi hệ thống không?`,
      subtext: 'Toàn bộ thông tin tài khoản sẽ bị xóa và không thể khôi phục lại.',
      type: 'danger',
      confirmText: 'Đồng ý xóa vĩnh viễn',
      onConfirm: async () => {
        try {
          const res = await userAPI.delete(userId);
          if (res.data.success) {
            setActionNotice({ type: 'success', message: res.data.message });
            await loadAdminData();
          }
        } catch (e) {
          setActionNotice({
            type: 'error',
            message: e.response?.data?.message || 'Không thể xóa người dùng',
          });
        }
      },
    });
  };

  // Handle Admin Approve Subscription Order
  const handleApproveSubscription = async (order) => {
    const oId = order._id || order.id || order.orderCode;
    try {
      const res = await orderAPI.updateStatus(oId, {
        status: 'DELIVERED',
        note: 'Admin đã duyệt thanh toán VietQR và kích hoạt gói hội viên',
      });
      if (res.data.success) {
        setActionNotice({ type: 'success', message: `🎉 Đã duyệt và kích hoạt gói hội viên cho đơn #${order.orderCode}!` });
        await loadAdminData();
      }
    } catch (e) {
      setActionNotice({
        type: 'error',
        message: e.response?.data?.message || 'Không thể duyệt đơn đăng ký gói',
      });
    }
  };

  // Handle Admin Cancel Subscription Order
  const handleCancelSubscription = (order) => {
    const oId = order._id || order.id || order.orderCode;
    openConfirmModal({
      title: 'Hủy đơn đăng ký Gói Hội Viên',
      message: `Bạn có chắc chắn muốn hủy đơn đăng ký #${order.orderCode} của khách hàng ${order.customerName || order.customerInfo?.name}?`,
      subtext: 'Trạng thái đơn hàng sẽ chuyển sang CANCELLED do khách hàng chưa thanh toán hoặc yêu cầu hủy.',
      type: 'danger',
      confirmText: 'Xác nhận hủy đơn',
      onConfirm: async () => {
        try {
          const res = await orderAPI.updateStatus(oId, {
            status: 'CANCELLED',
            note: 'Admin hủy đơn do chưa nhận được thanh toán',
          });
          if (res.data.success) {
            setActionNotice({ type: 'success', message: `Đã hủy đơn đăng ký #${order.orderCode}` });
            await loadAdminData();
          }
        } catch (e) {
          setActionNotice({
            type: 'error',
            message: e.response?.data?.message || 'Không thể hủy đơn đăng ký gói',
          });
        }
      },
    });
  };

  // Handle Admin Revoke User Package
  const handleRevokeUserPackage = (userId, userName) => {
    openConfirmModal({
      title: 'Thu hồi Gói Hội Viên',
      message: `Bạn có chắc chắn muốn hủy gói hội viên và thu hồi đặc quyền của "${userName}" không?`,
      subtext: 'Khách hàng sẽ trở về hạng tài khoản thông thường và mất toàn bộ chiết khấu giảm giá của gói.',
      type: 'warning',
      confirmText: 'Đồng ý thu hồi gói',
      onConfirm: async () => {
        try {
          const res = await userAPI.updateMembership(userId, { activePackage: 'NONE' });
          if (res.data.success) {
            setActionNotice({ type: 'success', message: `Đã thu hồi gói hội viên của ${userName} thành công!` });
            await loadAdminData();
          }
        } catch (e) {
          setActionNotice({
            type: 'error',
            message: e.response?.data?.message || 'Không thể thu hồi gói hội viên',
          });
        }
      },
    });
  };

  // Handle Admin Update Shopping Order Status
  const handleUpdateShoppingOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await orderAPI.updateStatus(orderId, {
        status: newStatus,
        note: `Admin cập nhật trạng thái sang ${newStatus}`,
      });
      if (res.data.success) {
        setActionNotice({ type: 'success', message: `Đã cập nhật đơn hàng #${orderId} sang "${newStatus}"!` });
        await loadAdminData();
      }
    } catch (e) {
      setActionNotice({
        type: 'error',
        message: e.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng',
      });
    }
  };

  const subscriptionOrders = (ordersList || []).filter((o) => {
    if (o.orderType === 'MEMBERSHIP') return true;
    if (o.items && Array.isArray(o.items)) {
      return o.items.some(
        (it) =>
          it.type === 'subscription' ||
          it.itemType === 'subscription' ||
          !it.productId ||
          (it.name && it.name.toUpperCase().includes('HỘI VIÊN')) ||
          (it.name && it.name.toUpperCase().includes('GÓI')) ||
          (it.sku && it.sku.includes('SUB'))
      );
    }
    return false;
  });

  const shoppingOrders = (ordersList || []).filter((o) => {
    return !subscriptionOrders.some(
      (sub) =>
        (sub.id && sub.id === o.id) ||
        (sub._id && sub._id === o._id) ||
        (sub.orderCode && sub.orderCode === o.orderCode)
    );
  });

  const totalSubscriptionRevenue = subscriptionOrders
    .filter((o) => (o.orderStatus || o.status) === 'DELIVERED')
    .reduce((acc, cur) => acc + (cur.finalAmount || cur.totalAmount || 0), 0);

  const totalShoppingRevenue = shoppingOrders
    .filter((o) => (o.orderStatus || o.status) === 'DELIVERED')
    .reduce((acc, cur) => acc + (cur.finalAmount || cur.totalAmount || 0), 0);

  const activeSubscriptionUsersCount = (usersList || []).filter(
    (u) => u.activePackage && u.activePackage !== 'NONE'
  ).length;

  const pendingSubCount = (subscriptionOrders || []).filter(
    (o) => (o.orderStatus || o.status) === 'PENDING'
  ).length;

  const pendingShopCount = (shoppingOrders || []).filter(
    (o) => (o.orderStatus || o.status) === 'PENDING'
  ).length;

  if (loading && !kpis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
        <p className="text-slate-500 dark:text-gray-400 text-sm">Đang tải trung tâm chỉ huy Admin XIV STUDIO...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-mono font-black uppercase">
              👑 Toàn quyền Quản trị: Admin C-Level
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-400 font-mono font-bold">
              Xin chào, {user?.name || 'Administrator'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
            BẢNG ĐIỀU KHIỂN CHIẾN LƯỢC & QUẢN TRỊ ADMIN
          </h1>
          <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
            Quản lý độc quyền Gói Hội Viên (Lượt mua, Doanh thu, Duyệt/Hủy) & Toàn bộ Đơn hàng Mua sắm.
          </p>
        </div>

        <button
          onClick={handleTriggerAIAnalysis}
          disabled={aiLoading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all hover:scale-105 disabled:opacity-50"
        >
          {aiLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Gemini AI đang phân tích toàn hệ thống...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Kích hoạt AI Phân tích Chiến lược (UC010)
            </>
          )}
        </button>
      </div>

      {/* Action Notice Alert */}
      {actionNotice.message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            actionNotice.type === 'error'
              ? 'bg-rose-50 dark:bg-red-950/80 border-rose-200 dark:border-red-800 text-rose-700 dark:text-red-300'
              : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            <span className="font-semibold">{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice({ type: '', message: '' })}
            className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white"
          >
            Đóng
          </button>
        </div>
      )}

      {/* KPI Cards Grid: Separating Subscriptions vs Shopping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Subscription Orders Count */}
        <div
          onClick={() => setActiveTab('subscriptions')}
          className={`p-4 rounded-2xl border-2 shadow-sm space-y-1 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${
            activeTab === 'subscriptions'
              ? 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-500 ring-2 ring-amber-400/40'
              : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-mono font-bold">
              👑 Lượt mua Gói
            </span>
            <Crown className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-lg font-black text-amber-950 dark:text-white font-mono">
            {subscriptionOrders.length} lượt
          </h3>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">
            {pendingSubCount > 0 ? `⏳ ${pendingSubCount} đơn chờ duyệt` : '✓ Đã duyệt hết'}
          </span>
        </div>

        {/* KPI 2: Subscription Revenue */}
        <div
          onClick={() => setActiveTab('subscriptions')}
          className={`p-4 rounded-2xl border-2 shadow-sm space-y-1 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${
            activeTab === 'subscriptions'
              ? 'bg-purple-100/90 dark:bg-purple-950/80 border-purple-500 ring-2 ring-purple-400/40'
              : 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-800 dark:text-purple-300 uppercase font-mono font-bold">
              💰 Doanh thu Gói
            </span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-black text-purple-950 dark:text-white font-mono">
            {totalSubscriptionRevenue.toLocaleString('vi-VN')}đ
          </h3>
          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold block">
            {activeSubscriptionUsersCount} thành viên VIP
          </span>
        </div>

        {/* KPI 3: Shopping Orders Count */}
        <div
          onClick={() => setActiveTab('shopping')}
          className={`p-4 rounded-2xl border-2 shadow-sm space-y-1 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${
            activeTab === 'shopping'
              ? 'bg-blue-100/90 dark:bg-blue-950/80 border-blue-500 ring-2 ring-blue-400/40'
              : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-800 dark:text-blue-300 uppercase font-mono font-bold">
              🛍️ Đơn Mua Sắm
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-black text-blue-950 dark:text-white font-mono">
            {shoppingOrders.length} đơn
          </h3>
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold block">
            {shoppingOrders.filter(o => (o.orderStatus || o.status) === 'DELIVERED').length} đơn đã giao
          </span>
        </div>

        {/* KPI 4: Shopping Revenue */}
        <div
          onClick={() => setActiveTab('shopping')}
          className={`p-4 rounded-2xl border-2 shadow-sm space-y-1 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${
            activeTab === 'shopping'
              ? 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/40'
              : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-mono font-bold">
              💵 Doanh thu Bán lẻ
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-lg font-black text-emerald-950 dark:text-white font-mono">
            {totalShoppingRevenue.toLocaleString('vi-VN')}đ
          </h3>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
            Sản phẩm thời trang
          </span>
        </div>

        {/* KPI 5: Low Stock Warning */}
        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-red-950/40 border-2 border-rose-300 dark:border-red-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-800 dark:text-rose-300 uppercase font-mono font-bold">
              ⚠️ Tồn kho thấp
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="text-lg font-black text-rose-950 dark:text-white font-mono">
            {kpis?.lowStockCount || 0} SP
          </h3>
          <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">
            Cần nhập thêm kho
          </span>
        </div>

        {/* KPI 6: Users Count */}
        <div
          onClick={() => setActiveTab('users')}
          className={`p-4 rounded-2xl border-2 shadow-sm space-y-1 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${
            activeTab === 'users'
              ? 'bg-slate-200 dark:bg-gray-800 border-purple-500 ring-2 ring-purple-400/40'
              : 'bg-slate-100 dark:bg-gray-900 border-slate-300 dark:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-700 dark:text-gray-300 uppercase font-mono font-bold">
              👥 Tài khoản
            </span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-lg font-black text-slate-950 dark:text-white font-mono">
            {usersList.length} user
          </h3>
          <span className="text-[10px] text-slate-600 dark:text-gray-400 font-bold block">
            Khách hàng & NV
          </span>
        </div>
      </div>

      {/* UC010: AI Strategic Report Card Display */}
      {aiReport && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-50 via-purple-50 to-slate-50 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-gray-950 border border-pink-300 dark:border-pink-500/40 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-pink-200 dark:border-pink-900/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  BÁO CÁO PHÂN TÍCH CHIẾN LƯỢC KINH DOANH (GEMINI 3.6 FLASH)
                </h3>
                <span className="text-[11px] text-pink-700 dark:text-pink-300 font-mono">
                  Phân tích từ dữ liệu thời gian thực của XIV STUDIO
                </span>
              </div>
            </div>
            <button
              onClick={() => setAiReport(null)}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              Đóng báo cáo
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">TỔNG QUAN TÌNH HÌNH:</h4>
              <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{aiReport.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {aiReport.recommendations?.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-900/80 border border-pink-200 dark:border-pink-900/40 space-y-2 shadow-sm"
                >
                  <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-[10px] font-bold font-mono">
                    Khuyến nghị #{i + 1}
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">{rec.title}</h5>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-pink-200 dark:border-gray-800 pb-3">
        {[
          { id: 'overview', label: 'Tổng quan & Top Bán Chạy' },
          {
            id: 'shopping',
            label: `🛍️ Đơn Mua Sắm (${shoppingOrders.length})`,
          },
          {
            id: 'subscriptions',
            label: `👑 Duyệt Đơn Gói Hội Viên ${
              pendingSubCount > 0 ? `(${pendingSubCount} Chờ Duyệt)` : `(${subscriptionOrders.length})`
            }`,
          },
          { id: 'users', label: `Quản lý Người dùng (${usersList.length})` },
          { id: 'categories', label: `Danh mục BST (${categories.length})` },
          { id: 'faqs', label: `Câu hỏi FAQ & RAG (${faqs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white shadow-md shadow-pink-500/25'
                : 'bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-gray-800 border-2 border-pink-200 dark:border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Shopping Orders Management (Admin toàn quyền quản lý đơn mua sắm) */}
      {activeTab === 'shopping' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/80 border-2 border-pink-200 dark:border-gray-800 space-y-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-600" /> Quản Lý Đơn Hàng Mua Sắm Sản Phẩm Thời Trang
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                Admin có toàn quyền xem, duyệt, chuyển trạng thái hoặc hủy mọi đơn hàng mua sắm trong hệ thống.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-4 py-2 rounded-xl bg-pink-50 dark:bg-gray-900 border border-pink-200 dark:border-gray-800 text-xs font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5 hover:bg-pink-100 transition-all self-start"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {shoppingOrders.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-500 dark:text-gray-400 text-xs">
              <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold">Chưa có đơn hàng mua sắm nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-pink-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 font-mono uppercase text-[10px] font-black">
                  <tr>
                    <th className="py-3 px-2">Mã đơn</th>
                    <th className="py-3 px-2">Khách hàng & Địa chỉ</th>
                    <th className="py-3 px-2">Sản phẩm</th>
                    <th className="py-3 px-2">Tổng tiền</th>
                    <th className="py-3 px-2">Trạng thái hiện tại</th>
                    <th className="py-3 px-2 text-right">Cập nhật trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 dark:divide-gray-800">
                  {shoppingOrders.map((ord) => {
                    const st = (ord.orderStatus || ord.status || 'PENDING').toUpperCase();
                    return (
                      <tr key={ord.id || ord._id} className="hover:bg-pink-50/60 dark:hover:bg-gray-900/50">
                        <td className="py-3 px-2 font-mono font-black text-pink-600 dark:text-cyan-400">
                          #{ord.orderCode}
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-black text-slate-900 dark:text-white block">{ord.customerName || ord.customerInfo?.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono block">{ord.customerPhone || ord.customerInfo?.phone}</span>
                          <span className="text-[10px] text-slate-400 block max-w-xs truncate">{ord.shippingAddress || ord.customerInfo?.address}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="space-y-1 max-w-xs">
                            {ord.items?.map((it, idx) => (
                              <div key={idx} className="text-[11px] text-slate-700 dark:text-gray-300 truncate">
                                • {it.name} <span className="font-mono font-bold text-pink-600">x{it.quantity}</span> ({it.size || 'L'})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-mono font-black text-slate-900 dark:text-white">
                          {(ord.finalAmount || ord.totalAmount || 0).toLocaleString('vi-VN')}đ
                          <span className="block text-[10px] font-normal text-slate-400">{ord.paymentMethod} • {ord.paymentStatus}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              st === 'DELIVERED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                : st === 'SHIPPING'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300'
                                : st === 'PROCESSING'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300'
                                : st === 'CANCELLED'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                            }`}
                          >
                            {st}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <select
                            value={st}
                            onChange={(e) => handleUpdateShoppingOrderStatus(ord.id || ord._id || ord.orderCode, e.target.value)}
                            className="px-2.5 py-1 rounded-lg font-bold text-[11px] font-mono outline-none cursor-pointer border border-pink-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-200"
                          >
                            <option value="PENDING">1. PENDING (Chờ duyệt)</option>
                            <option value="PROCESSING">2. PROCESSING (Đóng gói)</option>
                            <option value="SHIPPING">3. SHIPPING (Đang giao)</option>
                            <option value="DELIVERED">4. DELIVERED (Đã giao xong)</option>
                            <option value="CANCELLED">5. CANCELLED (Hủy đơn)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Subscriptions Approval (Admin Duyệt hoặc Hủy đơn gói hội viên) */}
      {activeTab === 'subscriptions' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/80 border-2 border-pink-200 dark:border-gray-800 space-y-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" /> Quản Lý & Duyệt Đơn Đăng Ký Gói Hội Viên
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                Admin kiểm tra tiền về tài khoản ngân hàng MB Bank (5100101042006 • VU DUC DAT) rồi bấm Duyệt để kích hoạt gói hội viên cho khách hàng.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-4 py-2 rounded-xl bg-pink-50 dark:bg-gray-900 border border-pink-200 dark:border-gray-800 text-xs font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5 hover:bg-pink-100 transition-all self-start"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {subscriptionOrders.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-500 dark:text-gray-400 text-xs">
              <Crown className="w-10 h-10 text-amber-500/40 mx-auto" />
              <p className="font-bold">Chưa có đơn đăng ký gói hội viên nào trong hệ thống.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-pink-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 font-mono uppercase text-[10px] font-black">
                  <tr>
                    <th className="py-3 px-2">Mã đơn</th>
                    <th className="py-3 px-2">Khách hàng</th>
                    <th className="py-3 px-2">Gói đăng ký</th>
                    <th className="py-3 px-2">Số tiền</th>
                    <th className="py-3 px-2">Thời gian</th>
                    <th className="py-3 px-2">Trạng thái</th>
                    <th className="py-3 px-2 text-right">Hành động của Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 dark:divide-gray-800">
                  {subscriptionOrders.map((ord) => {
                    const subItem = ord.items?.find((it) => it.type === 'subscription' || !it.productId || it.name?.includes('GÓI HỘI VIÊN'));
                    const isPending = (ord.orderStatus || ord.status) === 'PENDING';
                    const isDelivered = (ord.orderStatus || ord.status) === 'DELIVERED';
                    const isCancelled = (ord.orderStatus || ord.status) === 'CANCELLED';

                    return (
                      <tr key={ord.id || ord._id} className="hover:bg-pink-50/60 dark:hover:bg-gray-900/50">
                        <td className="py-3 px-2 font-mono font-black text-pink-600 dark:text-cyan-400">
                          #{ord.orderCode}
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-black text-slate-900 dark:text-white block">{ord.customerName || ord.customerInfo?.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono block">{ord.customerPhone || ord.customerInfo?.phone} • {ord.customerEmail || ord.customerInfo?.email}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            {subItem?.name || subItem?.size || 'GÓI HỘI VIÊN'}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono font-black text-slate-900 dark:text-white">
                          {Number(ord.finalAmount || ord.totalAmount || subItem?.price || 0).toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-3 px-2 text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                        </td>
                        <td className="py-3 px-2">
                          {isDelivered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Đã kích hoạt
                            </span>
                          ) : isCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                              Đã hủy
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ Admin duyệt
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApproveSubscription(ord)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Duyệt & Cấp gói
                                </button>
                                <button
                                  onClick={() => handleCancelSubscription(ord)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-red-950 hover:bg-rose-200 text-rose-700 dark:text-red-300 font-bold text-xs transition-colors cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            {isDelivered && ord.userId && (
                              <button
                                onClick={() => handleRevokeUserPackage(ord.userId, ord.customerName || ord.customerInfo?.name)}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-red-950/60 hover:bg-rose-100 text-rose-600 dark:text-red-400 font-bold text-[11px] border border-rose-200 dark:border-red-900 transition-colors"
                              >
                                Thu hồi gói
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Overview (Top Products & Revenue Distribution) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Pending Subscriptions Action Box */}
          {pendingSubCount > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border-2 border-amber-400 dark:border-amber-600 space-y-4 shadow-lg animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shadow-md">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-950 dark:text-white uppercase tracking-wider font-heading">
                      CẦN DUYỆT: {pendingSubCount} ĐƠN ĐĂNG KÝ GÓI HỘI VIÊN
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                      Khách hàng đã chuyển khoản VietQR Napas 247. Vui lòng đối soát và bấm Duyệt để kích hoạt đặc quyền!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-md self-start cursor-pointer"
                >
                  Xem toàn bộ ({subscriptionOrders.length} đơn gói) &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-amber-200 dark:border-gray-800 text-slate-700 dark:text-gray-400 font-mono uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-2">Mã đơn</th>
                      <th className="py-2.5 px-2">Khách hàng</th>
                      <th className="py-2.5 px-2">Gói hội viên</th>
                      <th className="py-2.5 px-2">Số tiền</th>
                      <th className="py-2.5 px-2 text-right">Phê duyệt nhanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-gray-800">
                    {subscriptionOrders
                      .filter((o) => (o.orderStatus || o.status) === 'PENDING')
                      .map((ord) => {
                        const subItem = ord.items?.find((it) => it.type === 'subscription' || !it.productId || it.name?.includes('GÓI HỘI VIÊN'));
                        return (
                          <tr key={ord.id || ord._id} className="hover:bg-amber-100/40 dark:hover:bg-gray-900/50">
                            <td className="py-3 px-2 font-mono font-black text-pink-600 dark:text-cyan-400">
                              #{ord.orderCode}
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-black text-slate-950 dark:text-white block">{ord.customerName || ord.customerInfo?.name}</span>
                              <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono block">{ord.customerPhone || ord.customerInfo?.phone}</span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
                                {subItem?.name || subItem?.size || 'GÓI HỘI VIÊN'}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-mono font-black text-slate-900 dark:text-white">
                              {(ord.finalAmount || ord.totalAmount || subItem?.price || 0).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveSubscription(ord)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-black text-xs shadow-md flex items-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Duyệt & Cấp gói
                                </button>
                                <button
                                  onClick={() => handleCancelSubscription(ord)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-100 dark:bg-red-950 hover:bg-rose-200 text-rose-700 dark:text-red-300 font-bold text-xs cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/80 border-2 border-pink-200 dark:border-gray-800 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider font-heading">
                Top Sản Phẩm Bán Chạy Nhất (Hero Drops)
              </h3>
              <span className="text-xs text-slate-600 dark:text-gray-400 font-mono font-bold">
                Số lượng bán thực tế
              </span>
            </div>

            <div className="divide-y divide-pink-100 dark:divide-gray-800">
              {kpis?.topSellingProducts?.map((prod, i) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-pink-50/60 dark:hover:bg-gray-900/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-pink-100 dark:bg-gray-800 text-pink-800 dark:text-gray-300 font-black flex items-center justify-center text-xs">
                      #{i + 1}
                    </span>
                    <div>
                      <h4 className="font-black text-slate-950 dark:text-white text-sm">{prod.name}</h4>
                      <span className="text-[11px] text-slate-600 dark:text-gray-400 font-mono font-semibold">
                        SKU: {prod.sku} | Tồn: {prod.stock} cái
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-pink-700 dark:text-cyan-400 text-sm sm:text-base">
                      {prod.soldCount} đã bán
                    </span>
                    <span className="block text-[11px] text-slate-600 dark:text-gray-400 font-bold">
                      Doanh thu: {((prod.salePrice || prod.price) * prod.soldCount).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management (Sole Admin Protection Rule & Membership Tier Management) */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/80 border-2 border-pink-200 dark:border-gray-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-600" /> Danh sách Tài khoản, Phân quyền & Quản lý Gói Hội Viên
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                Admin có thể trực tiếp cấp/đổi Gói Hội Viên (PLUS, VIP, PREMIUM) hoặc Cấp bậc Tích lũy (Silver, Gold, Diamond) cho từng tài khoản.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-pink-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 font-mono uppercase text-[10px] font-black">
                <tr>
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Họ tên & Email</th>
                  <th className="py-3 px-2">Chi tiêu & Cấp bậc</th>
                  <th className="py-3 px-2">Gói Trả Phí</th>
                  <th className="py-3 px-2">Vai trò (Role)</th>
                  <th className="py-3 px-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100 dark:divide-gray-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-pink-50/60 dark:hover:bg-gray-900/50">
                    <td className="py-3 px-2 font-mono text-slate-600 font-bold">#{u.id}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover border border-pink-300 dark:border-gray-700"
                        />
                        <div>
                          <span className="font-black text-slate-950 dark:text-white block">{u.name}</span>
                          <span className="text-[11px] text-slate-600 dark:text-gray-400 font-mono font-bold">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono">
                      <span className="text-slate-950 dark:text-white font-black block">
                        {(u.totalSpent || 0).toLocaleString('vi-VN')}đ
                      </span>
                      <select
                        value={u.membershipTier || 'MEMBER'}
                        onChange={(e) => handleChangeUserMembership(u.id, { membershipTier: e.target.value })}
                        className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold border border-pink-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-200"
                      >
                        <option value="MEMBER">Member (0đ)</option>
                        <option value="SILVER">Silver (2.5M - 5%)</option>
                        <option value="GOLD">Gold (5M - 10%)</option>
                        <option value="DIAMOND">Diamond (10M - 15%)</option>
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={u.activePackage || 'NONE'}
                        onChange={(e) => handleChangeUserMembership(u.id, { activePackage: e.target.value })}
                        className={`px-2.5 py-1 rounded-lg font-black text-[11px] font-mono outline-none cursor-pointer border ${
                          u.activePackage === 'PREMIUM'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                            : u.activePackage === 'VIP'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : u.activePackage === 'PLUS'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-400 border-slate-200 dark:border-gray-700'
                        }`}
                      >
                        <option value="NONE">Chưa có gói</option>
                        <option value="PLUS">Gói PLUS (+3%)</option>
                        <option value="VIP">Gói VIP (+7%)</option>
                        <option value="PREMIUM">Gói PREMIUM (+12%)</option>
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg font-black text-[11px] font-mono outline-none cursor-pointer border ${
                          u.role === 'admin'
                            ? 'bg-pink-100 dark:bg-cyan-950 text-pink-800 dark:text-cyan-400 border-pink-300 dark:border-cyan-800'
                            : u.role === 'employee'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-300 border-slate-200 dark:border-gray-700'
                        }`}
                      >
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.activePackage && u.activePackage !== 'NONE' ? (
                          <button
                            onClick={() => handleRevokeUserPackage(u.id, u.name)}
                            className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-[10px] font-bold transition-colors"
                            title="Hủy/Thu hồi gói hội viên"
                          >
                            Hủy gói
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeUserMembership(u.id, { activePackage: 'VIP' })}
                            className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-[10px] font-bold transition-colors"
                            title="Cấp nhanh gói VIP"
                          >
                            + Cấp VIP
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-red-950 transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Categories & FAQs */}
      {activeTab === 'categories' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/80 border-2 border-pink-200 dark:border-gray-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider font-heading">
              Danh Mục BST ({categories.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-pink-50/80 dark:bg-gray-900 border border-pink-200 dark:border-gray-800 flex items-center gap-3 shadow-sm"
              >
                <img src={c.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-pink-200 dark:border-gray-800" />
                <div>
                  <h4 className="font-black text-slate-950 dark:text-white text-xs">{c.name}</h4>
                  <span className="text-[11px] text-slate-600 dark:text-gray-400 font-mono font-bold">Slug: {c.slug}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/80 border-2 border-pink-200 dark:border-gray-800 space-y-4 shadow-md">
          <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider font-heading">
            Dữ liệu RAG Context FAQs ({faqs.length})
          </h3>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div
                key={f.id}
                className="p-4 sm:p-5 rounded-2xl bg-pink-50/80 dark:bg-gray-900 border border-pink-200 dark:border-gray-800 space-y-1.5 text-xs shadow-sm"
              >
                <h4 className="font-black text-slate-950 dark:text-white flex items-center gap-2 text-sm">
                  <HelpCircle className="w-4 h-4 text-pink-600 dark:text-cyan-500 flex-shrink-0" /> {f.question}
                </h4>
                <p className="text-slate-700 dark:text-gray-300 font-medium leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Luxury Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        subtext={confirmModal.subtext}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
