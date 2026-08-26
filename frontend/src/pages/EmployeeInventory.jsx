import React, { useState, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { productAPI, orderAPI, categoryAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeInventory() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // AI Description Generator Modal State (UC008)
  const [showAIDescModal, setShowAIDescModal] = useState(false);
  const [aiForm, setAiForm] = useState({
    name: '',
    category: 'Outerwear & Jackets',
    material: '100% Cotton nỉ bông 450GSM cao cấp',
    fit: 'Oversized Boxy Drop-shoulder',
    style: 'Cyberpunk Techwear',
    highlights: 'Chi tiết thêu logo vi tính phản quang dạ quang ban đêm',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Product Add/Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    categoryId: 1,
    price: '',
    salePrice: '',
    stock: 20,
    shortDescription: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    tags: ['streetwear', 'xiv-studio'],
    isFeatured: 1,
  });

  // Order Status Update State
  const [statusUpdating, setStatusUpdating] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, catRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(),
        categoryAPI.getAll(),
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (e) {
      console.error('Error loading employee data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle UC008: AI Generate Description
  const handleGenerateAIDescription = async (e) => {
    e.preventDefault();
    if (!aiForm.name) return;
    setAiLoading(true);
    try {
      const res = await aiAPI.generateDescription(aiForm);
      if (res.data.success) {
        setAiResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi khi kích hoạt AI sinh mô tả: ' + (e.response?.data?.message || e.message));
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI Result to Product Form
  const applyAIToProductForm = () => {
    if (!aiResult) return;
    setProductForm({
      ...productForm,
      name: aiForm.name,
      shortDescription: aiResult.shortDescription,
      description: aiResult.description,
      tags: aiResult.tags || ['streetwear', 'genai'],
      price: aiResult.suggestedPrice || 890000,
    });
    setShowAIDescModal(false);
    setShowProductModal(true);
  };

  // Handle Product Save (Create / Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id, productForm);
      } else {
        await productAPI.create(productForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadData();
    } catch (e) {
      alert('Lỗi lưu sản phẩm: ' + (e.response?.data?.message || e.message));
    }
  };

  // Handle Order Status Transition (5 Statuses & Auto Inventory Deduction)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    try {
      const res = await orderAPI.updateStatus(orderId, {
        status: newStatus,
        note: `Cập nhật trạng thái sang ${newStatus} bởi ${user?.name || 'Nhân viên'}`,
      });
      if (res.data.success) {
        // Tải lại cả orders và products để thấy ngay sự thay đổi tồn kho và soldCount
        await loadData();
      }
    } catch (e) {
      alert('Lỗi cập nhật trạng thái đơn hàng: ' + (e.response?.data?.message || e.message));
    } finally {
      setStatusUpdating(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesLow = showLowStockOnly ? p.stock <= 10 : true;
    return matchesSearch && matchesLow;
  });

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Title & Employee Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-mono font-bold uppercase">
              Vai trò: Employee & Logistics
            </span>
            <span className="text-xs text-gray-500 font-mono">
              Xin chào, {user?.name || 'Nhân viên'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading mt-1">
            QUẢN LÝ KHO & ĐƠN HÀNG (XIV LOGISTICS)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAiResult(null);
              setShowAIDescModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI Sinh mô tả SEO (UC008)
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: '',
                sku: `XIV-NEW-${Math.floor(100 + Math.random() * 900)}`,
                categoryId: categories[0]?.id || 1,
                price: '',
                salePrice: '',
                stock: 20,
                shortDescription: '',
                description: '',
                images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
                tags: ['streetwear', 'new-drop'],
                isFeatured: 0,
              });
              setShowProductModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/80 to-gray-950 border border-red-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/80 border border-red-700 text-red-300 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-200 font-heading">
                CẢNH BÁO TỒN KHO NGUY HIỂM ({lowStockCount} SẢN PHẨM &le; 10)
              </h3>
              <p className="text-xs text-red-300/80">
                Các mặt hàng sắp hết cần được nhập thêm kho để tránh đứt gãy chuỗi bán hàng.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold border border-red-700 whitespace-nowrap transition-all"
          >
            {showLowStockOnly ? 'Hiện tất cả sản phẩm' : 'Lọc các sản phẩm tồn <= 10'}
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 gap-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-xs font-bold font-heading uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'inventory'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Layers className="w-4 h-4" /> Bảng Kiểm kê Kho ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-bold font-heading uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'orders'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Package className="w-4 h-4" /> Xử lý 5 trạng thái Đơn hàng ({orders.length})
        </button>
      </div>

      {/* TAB 1: INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm theo tên sản phẩm hoặc SKU..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={loadData}
              className="p-2.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="border border-gray-800 rounded-2xl overflow-hidden bg-gray-950/80 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900 text-gray-400 uppercase font-mono tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">SKU / Danh mục</th>
                  <th className="p-4">Giá bán</th>
                  <th className="p-4">Tồn kho</th>
                  <th className="p-4">Đã bán</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= 10;
                  const imgs = Array.isArray(p.images) ? p.images : [p.images];
                  return (
                    <tr key={p.id} className="hover:bg-gray-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgs[0]}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-lg bg-black flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-gray-500 line-clamp-1">
                              {p.shortDescription}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="text-cyan-400 font-bold block">{p.sku}</span>
                        <span className="text-gray-500 text-[11px]">{p.categoryName}</span>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="font-bold text-white">
                          {(p.salePrice || p.price).toLocaleString('vi-VN')}đ
                        </span>
                        {p.salePrice && (
                          <span className="block text-[10px] text-gray-500 line-through">
                            {p.price.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold font-mono px-2.5 py-1 rounded-lg ${
                            isLow
                              ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                              : 'bg-gray-900 text-emerald-400'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.stock} cái
                        </span>
                      </td>

                      <td className="p-4 font-mono text-gray-300 font-bold">
                        {p.soldCount} đã bán
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name,
                              sku: p.sku,
                              categoryId: p.categoryId,
                              price: p.price,
                              salePrice: p.salePrice || '',
                              stock: p.stock,
                              shortDescription: p.shortDescription || '',
                              description: p.description || '',
                              images: imgs,
                              tags: Array.isArray(p.tags) ? p.tags : ['streetwear'],
                              isFeatured: p.isFeatured || 0,
                            });
                            setShowProductModal(true);
                          }}
                          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-cyan-400 border border-gray-800 transition-colors"
                          title="Chỉnh sửa sản phẩm / Điều chỉnh kho"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER STATUS WORKFLOW (5 STATES & INVENTORY DEDUCTION) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-800 dark:text-cyan-300 flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span>
              <strong>Quy tắc nghiệp vụ:</strong> Khi chuyển trạng thái đơn hàng sang{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">"completed"</strong>, hệ thống tự động
              trừ tồn kho sản phẩm, tăng <strong className="text-slate-900 dark:text-white font-mono">soldCount</strong>, và tự động kích hoạt gói thành viên nếu là đơn mua gói!
            </span>
          </div>

          <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-950/80 shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-gray-900 text-slate-500 dark:text-gray-400 uppercase font-mono tracking-wider border-b border-slate-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Mã Đơn / Khách hàng</th>
                  <th className="p-4">Sản phẩm / Dịch vụ</th>
                  <th className="p-4">Tổng tiền & PT</th>
                  <th className="p-4">Trạng thái hiện tại</th>
                  <th className="p-4">Cập nhật 5 bước trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-slate-700 dark:text-gray-300">
                {orders.map((ord) => {
                  const isSub = ord.items?.some(it => it.type === 'subscription' || it.name?.includes('GÓI HỘI VIÊN'));

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-gray-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 block">
                            {ord.orderCode}
                          </span>
                          {isSub && (
                            <span className="px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400 text-[9px] font-bold font-mono border border-pink-200 dark:border-pink-800">
                              👑 GÓI HỘI VIÊN
                            </span>
                          )}
                        </div>
                        <span className="text-slate-900 dark:text-white font-semibold block mt-0.5">
                          {ord.customerInfo?.name}
                        </span>
                        <span className="text-slate-500 dark:text-gray-500 text-[11px] block">
                          {ord.customerInfo?.phone}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 max-w-xs">
                          {ord.items?.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-slate-800 dark:text-gray-300 flex items-center justify-between">
                              <span className="line-clamp-1 font-medium">{it.name} ({it.size})</span>
                              <span className="font-mono text-cyan-600 dark:text-cyan-400 ml-2">x{it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {Number(ord.totalAmount).toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase">
                          {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase font-mono ${
                            ord.orderStatus === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : ord.orderStatus === 'delivering'
                              ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800'
                              : ord.orderStatus === 'confirmed'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                              : ord.orderStatus === 'cancelled'
                              ? 'bg-rose-100 dark:bg-red-950 text-rose-700 dark:text-red-400 border border-rose-300 dark:border-red-800'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isSub && ord.orderStatus === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                              disabled={statusUpdating === ord.id}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow hover:scale-105 transition-all flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Duyệt tiền MB & Kích hoạt gói
                            </button>
                          )}

                          {['pending', 'confirmed', 'delivering', 'completed', 'cancelled'].map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateOrderStatus(ord.id, st)}
                                disabled={statusUpdating === ord.id || ord.orderStatus === st}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all uppercase ${
                                  ord.orderStatus === st
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold shadow-sm'
                                    : 'bg-slate-100 dark:bg-gray-900 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-800'
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
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

      {/* UC008: AI Product Description Generator Modal */}
      {showAIDescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-gray-950 border border-purple-500/40 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAIDescModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  AI SINH MÔ TẢ SẢN PHẨM CHUẨN SEO (UC008)
                </h2>
                <p className="text-xs text-gray-400">
                  Google Gemini 3.6 Flash tự động sinh shortDescription và description tối ưu SEO
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateAIDescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={aiForm.name}
                    onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })}
                    placeholder="Ví dụ: XIV Phantom Acid-Wash Bomber"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-purple-400 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Danh mục</label>
                  <input
                    type="text"
                    value={aiForm.category}
                    onChange={(e) => setAiForm({ ...aiForm, category: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 focus:border-purple-400 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Chất liệu vải</label>
                  <input
                    type="text"
                    value={aiForm.material}
                    onChange={(e) => setAiForm({ ...aiForm, material: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 focus:border-purple-400 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Form dáng (Fit)</label>
                  <input
                    type="text"
                    value={aiForm.fit}
                    onChange={(e) => setAiForm({ ...aiForm, fit: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 focus:border-purple-400 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-gray-300 font-bold">Điểm nhấn thiết kế đặc biệt</label>
                  <input
                    type="text"
                    value={aiForm.highlights}
                    onChange={(e) => setAiForm({ ...aiForm, highlights: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 focus:border-purple-400 rounded-xl p-3 text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={aiLoading || !aiForm.name}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Gemini AI đang sáng tạo nội dung...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Kích hoạt Gemini AI Sinh mô tả
                  </>
                )}
              </button>
            </form>

            {/* AI Generated Preview Output */}
            {aiResult && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/80 space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 font-mono">
                    ✓ KẾT QUẢ AI SINH JSON THÀNH CÔNG:
                  </span>
                  <button
                    onClick={applyAIToProductForm}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Áp dụng vào Form thêm sản phẩm
                  </button>
                </div>

                <div className="space-y-2 bg-gray-950/80 p-3 rounded-xl border border-gray-800">
                  <div>
                    <strong className="text-gray-400 block">Short Description (SEO):</strong>
                    <p className="text-gray-200 mt-0.5">{aiResult.shortDescription}</p>
                  </div>
                  <div>
                    <strong className="text-gray-400 block">Full Description:</strong>
                    <p className="text-gray-300 mt-0.5 leading-relaxed">{aiResult.description}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {aiResult.tags?.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-gray-900 text-cyan-400 font-mono text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-gray-950 border border-gray-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white font-heading">
              {editingProduct ? `CHỈNH SỬA SẢN PHẨM / TỒN KHO: ${editingProduct.sku}` : 'THÊM MỚI SẢN PHẨM'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-gray-300 font-bold">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">SKU Mã hàng *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white uppercase font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Danh mục</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: parseInt(e.target.value, 10) })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Giá niêm yết (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Giá khuyến mãi (nếu có)</label>
                  <input
                    type="number"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">
                    Số lượng tồn kho (Stock) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">Ảnh sản phẩm URL</label>
                  <input
                    type="text"
                    value={productForm.images[0] || ''}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-gray-300 font-bold">Mô tả ngắn (Short Description)</label>
                  <input
                    type="text"
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-gray-300 font-bold">Mô tả chi tiết</label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs shadow-lg transition-all"
              >
                {editingProduct ? 'Cập nhật sản phẩm & Tồn kho' : 'Lưu sản phẩm mới'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
