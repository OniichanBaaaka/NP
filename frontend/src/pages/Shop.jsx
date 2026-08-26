import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, Sparkles, SlidersHorizontal, X, Flame } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
  const sortBy = searchParams.get('sortBy') || 'newest';

  useEffect(() => {
    async function fetchFilterData() {
      try {
        const catRes = await categoryAPI.getAll();
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchFilterData();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (lowStockOnly) params.lowStockOnly = true;
        if (sortBy) params.sortBy = sortBy;

        const res = await productAPI.getAll(params);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, searchQuery, lowStockOnly, sortBy]);

  const handleCategorySelect = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug) {
      nextParams.set('category', slug);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams);
  };

  const handleLowStockToggle = () => {
    const nextParams = new URLSearchParams(searchParams);
    if (lowStockOnly) {
      nextParams.delete('lowStockOnly');
    } else {
      nextParams.set('lowStockOnly', 'true');
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (newSort) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newSort && newSort !== 'newest') {
      nextParams.set('sortBy', newSort);
    } else {
      nextParams.delete('sortBy');
    }
    setSearchParams(nextParams);
  };

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-pink-200 dark:border-gray-800 pb-5">
        <div>
          <span className="text-pink-600 dark:text-cyan-400 text-xs font-mono tracking-widest uppercase font-bold">
            XIV STUDIO Collection ({products.length} Mẫu)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-heading mt-0.5">
            BỘ SƯU TẬP STREETWEAR
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleLowStockToggle}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              lowStockOnly
                ? 'bg-rose-100 dark:bg-red-950 text-rose-800 dark:text-red-300 border-rose-300 dark:border-red-700 shadow-sm'
                : 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-pink-200 dark:border-gray-800 hover:bg-pink-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Hàng sắp hết (&le; 10)
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl border border-pink-200 dark:border-gray-800 text-xs shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-600 dark:text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-gray-200 outline-none cursor-pointer text-xs font-bold"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">🔥 Bán chạy nhất</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {searchQuery && (
        <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-gray-900 border-2 border-pink-200 dark:border-gray-800 flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
            <Search className="w-4 h-4 text-pink-600" />
            <span>Kết quả tìm kiếm cho: <span className="text-pink-700 dark:text-cyan-400 font-mono">"{searchQuery}"</span> ({products.length} sản phẩm)</span>
          </div>
          <button
            onClick={handleClearSearch}
            className="px-3 py-1 rounded-xl bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 border border-rose-200 dark:border-rose-900 font-bold flex items-center gap-1 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm ${
            !selectedCategory
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-pink-500/25'
              : 'bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-300 hover:bg-pink-50 border border-pink-200 dark:border-gray-800'
          }`}
        >
          Tất cả sản phẩm
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.slug
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-pink-500/25'
                : 'bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-300 hover:bg-pink-50 border border-pink-200 dark:border-gray-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Compact Product Grid: 2 cols on mobile, up to 5 cols on large desktop */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div key={n} className="rounded-2xl bg-white dark:bg-gray-900/60 border border-pink-100 dark:border-gray-800 p-3 space-y-2.5 animate-pulse aspect-[4/5]">
              <div className="w-full h-3/4 bg-slate-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white dark:bg-gray-950 rounded-3xl border-2 border-pink-200 dark:border-gray-800 p-8 shadow-md">
          <p className="text-slate-700 dark:text-gray-300 font-bold text-sm">
            Không tìm thấy sản phẩm nào phù hợp với từ khóa hoặc bộ lọc của bạn.
          </p>
          <button
            onClick={() => {
              setSearchParams({});
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-xs shadow-md"
          >
            Xem toàn bộ sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
