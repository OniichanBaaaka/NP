import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Package,
  Shield,
  Layers,
  LogOut,
  ChevronDown,
  Crown,
  Sun,
  Moon,
  Menu,
  X,
  LogIn,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { productAPI } from '../services/api';
import MembershipBadge from './MembershipBadge';

export default function Navbar() {
  const { user, logout, isAdmin, isEmployee, login, currentTier } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { toggleTheme, isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchReady, setIsSearchReady] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Load Top Hot Products on mount
  useEffect(() => {
    productAPI.getAll({ sortBy: 'popular', limit: 4 })
      .then(res => { if (res.data.success) setHotProducts(res.data.products); })
      .catch(() => {});
  }, []);

  // Handle Search Submit
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchExpanded(false);
      setIsSearchReady(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
        setIsSearchReady(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth delayed activation: wait for gliding animation to finish before enabling input & dropdown
  useEffect(() => {
    let timer;
    if (isSearchExpanded) {
      // Wait for the slide & expansion animation to finish (~520ms) before focusing and showing dropdown
      timer = setTimeout(() => {
        setIsSearchReady(true);
        searchInputRef.current?.focus();
      }, 520);
    } else {
      setIsSearchReady(false);
      setSearchTerm('');
      setSearchResults([]);
      searchInputRef.current?.blur();
    }
    return () => clearTimeout(timer);
  }, [isSearchExpanded]);

  // Live search debounce
  useEffect(() => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productAPI.getAll({ search: searchTerm.trim(), limit: 5 });
        if (res.data.success) setSearchResults(res.data.products);
      } catch (err) { console.error(err); }
      finally { setIsSearching(false); }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Quick switch role
  const handleQuickSwitch = async (email, pass, path) => {
    try {
      await login(email, pass);
      navigate(path);
      setIsProfileMenuOpen(false);
    } catch (e) { console.error(e); }
  };

  const getImage = (prod) => {
    if (!prod) return '';
    if (Array.isArray(prod.images)) return prod.images[0] || '';
    if (typeof prod.images === 'string') {
      try { return JSON.parse(prod.images)[0] || ''; } catch { return ''; }
    }
    return '';
  };

  return (
    <>
      <header
        style={{ backgroundColor: isDark ? 'rgba(10,12,20,0.97)' : '#ffffff' }}
        className="sticky top-0 z-40 w-full backdrop-blur-xl border-b-2 border-pink-200 dark:border-gray-800 shadow-sm transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single-row flex: [Left group] [Search] [Right group] */}
          <div className="flex items-center h-20 gap-3">

            {/* ─── LEFT GROUP: Logo + Nav ─── */}
            <div className="nav-group flex items-center gap-3 sm:gap-5 flex-shrink-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 rounded-xl text-slate-900 dark:text-gray-300 md:hidden hover:bg-pink-100 dark:hover:bg-gray-900 flex-shrink-0"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 dark:from-cyan-500 dark:via-blue-600 dark:to-pink-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-heading font-extrabold text-pink-400 dark:text-cyan-400 text-base sm:text-lg">
                    XIV
                  </div>
                </div>
                {/* Hide text label when search is expanded on smaller screens */}
                <div
                  className="hidden sm:block overflow-hidden transition-all"
                  style={{
                    maxWidth: isSearchExpanded ? '0px' : '160px',
                    opacity: isSearchExpanded ? 0 : 1,
                    transition: 'max-width 0.52s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
                  }}
                >
                  <span className="font-heading font-extrabold text-lg xl:text-xl tracking-wider text-slate-950 dark:text-white group-hover:text-pink-600 dark:group-hover:text-cyan-400 transition-colors whitespace-nowrap block">
                    XIV STUDIO
                  </span>
                  <span className="block text-[9px] font-mono tracking-widest text-pink-700 dark:text-cyan-400 uppercase -mt-1 font-bold whitespace-nowrap">
                    High-End AI Streetwear
                  </span>
                </div>
              </Link>

              {/* Desktop Nav links — smoothly shrink & fade out when search expands */}
              <nav
                className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-black overflow-hidden whitespace-nowrap"
                style={{
                  maxWidth: isSearchExpanded ? '0px' : '480px',
                  opacity: isSearchExpanded ? 0 : 1,
                  transform: isSearchExpanded ? 'translateX(-10px)' : 'translateX(0)',
                  pointerEvents: isSearchExpanded ? 'none' : 'auto',
                  transition: 'max-width 0.58s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Link to="/" className="text-slate-950 dark:text-gray-300 hover:text-pink-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap">
                  Trang chủ
                </Link>
                <Link to="/shop" className="text-slate-950 dark:text-gray-300 hover:text-pink-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap">
                  Bộ sưu tập
                </Link>
                <Link to="/membership" className="text-slate-950 dark:text-gray-300 hover:text-pink-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 whitespace-nowrap">
                  <Crown className="w-3.5 h-3.5 text-amber-500" /> Hội Viên
                </Link>
                <Link to="/order-tracking" className="text-slate-950 dark:text-gray-300 hover:text-pink-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 whitespace-nowrap">
                  <Package className="w-3.5 h-3.5 text-pink-500" /> Tra cứu đơn
                </Link>
                {isEmployee && (
                  <Link to="/employee/inventory" className="px-2 py-1 rounded-lg bg-pink-100 dark:bg-blue-950/80 text-pink-800 dark:text-blue-300 border border-pink-300 dark:border-blue-800/80 hover:bg-pink-200 transition-all text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                    <Layers className="w-3 h-3" /> Kho & Đơn
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin/dashboard" className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-pink-950/80 text-purple-800 dark:text-pink-300 border border-purple-300 dark:border-pink-800/80 hover:bg-purple-200 transition-all text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                    <Shield className="w-3 h-3" /> Admin
                  </Link>
                )}
              </nav>
            </div>

            {/* ─── CENTER: EXPANDABLE SEARCH BAR — Smooth gliding transition ─── */}
            <div
              ref={searchContainerRef}
              className="relative hidden md:flex items-center flex-1 max-w-[560px]"
              style={{
                width: isSearchExpanded ? '100%' : '148px',
                maxWidth: isSearchExpanded ? '560px' : '148px',
                transition: 'max-width 0.6s cubic-bezier(0.16, 1, 0.3, 1), width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <form onSubmit={handleSearch} className="w-full flex items-center gap-0">
                {/* Single morphing input bar */}
                <div className="relative flex-1 overflow-hidden">
                  {/* Icon */}
                  <button
                    type={isSearchReady ? 'submit' : 'button'}
                    onClick={!isSearchExpanded ? () => setIsSearchExpanded(true) : undefined}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-pink-500 dark:text-cyan-400 transition-transform hover:scale-110"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => isSearchReady && setSearchTerm(e.target.value)}
                    onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                    placeholder={
                      isSearchReady
                        ? 'Tìm áo hoodie, cargo, sneaker, phụ kiện...'
                        : (isSearchExpanded ? 'Đang mở tìm kiếm...' : 'Tìm kiếm...')
                    }
                    readOnly={!isSearchReady}
                    className="w-full font-bold text-sm outline-none"
                    style={{
                      padding: '10px 36px 10px 36px',
                      borderRadius: '9999px',
                      background: isDark ? '#111827' : (isSearchExpanded ? '#ffffff' : '#f1f5f9'),
                      border: `2px solid ${isSearchReady ? '#ec4899' : (isSearchExpanded ? '#f472b6' : '#fbcfe8')}`,
                      color: isDark ? (isSearchExpanded ? '#f8fafc' : '#6b7280') : (isSearchExpanded ? '#0f172a' : '#64748b'),
                      boxShadow: isSearchReady ? '0 6px 25px -4px rgba(236,72,153,0.3)' : (isSearchExpanded ? '0 4px 18px -4px rgba(236,72,153,0.18)' : '0 1px 4px rgba(0,0,0,0.06)'),
                      cursor: isSearchReady ? 'text' : 'pointer',
                      transition: [
                        'border-color 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                        'box-shadow 0.45s ease',
                        'background 0.35s ease',
                        'color 0.3s ease',
                      ].join(', '),
                    }}
                  />

                  {/* Clear X button — fade + scale in when there's text */}
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                    style={{
                      opacity: searchTerm ? 1 : 0,
                      transform: `translateY(-50%) scale(${searchTerm ? 1 : 0.5})`,
                      pointerEvents: searchTerm ? 'auto' : 'none',
                      transition: 'opacity 0.2s ease, transform 0.2s ease',
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hủy button — slides in gracefully once animation is ready */}
                <div
                  style={{
                    maxWidth: isSearchReady ? '60px' : '0px',
                    opacity: isSearchReady ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-width 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchReady(false);
                      setIsSearchExpanded(false);
                    }}
                    className="ml-2 px-1 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white whitespace-nowrap transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>

              {/* Dropdown panel — displays smoothly ONLY AFTER gliding expansion is complete */}
              {isSearchExpanded && isSearchReady && (
                <div className="search-dropdown absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-950 rounded-2xl border-2 border-pink-200 dark:border-gray-800 shadow-2xl overflow-hidden z-50">
                  {searchTerm.trim() ? (
                    /* Live search results */
                    <div className="max-h-80 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-pink-100 dark:border-gray-800 text-[11px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Kết quả tìm kiếm {isSearching ? '— đang tìm...' : `(${searchResults.length} sản phẩm)`}
                      </div>
                      {isSearching ? (
                        <div className="p-8 text-center text-xs text-slate-400 font-bold">Đang tìm...</div>
                      ) : searchResults.length > 0 ? (
                        <>
                          {searchResults.map((prod, i) => (
                            <Link
                              key={prod.id}
                              to={`/product/${prod.id}`}
                              onClick={() => {
                                setIsSearchReady(false);
                                setIsSearchExpanded(false);
                              }}
                              style={{ animationDelay: `${i * 40}ms` }}
                              className="search-result-row flex items-center justify-between gap-3 px-4 py-3 hover:bg-pink-50 dark:hover:bg-gray-900 transition-colors border-b border-pink-50 dark:border-gray-800/60 last:border-0"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={getImage(prod)}
                                  alt={prod.name}
                                  className="w-9 h-11 object-cover rounded-lg border border-pink-100 dark:border-gray-800 flex-shrink-0"
                                />
                                <div>
                                  <span className="font-black text-slate-950 dark:text-white text-xs block line-clamp-1">
                                    {prod.name}
                                  </span>
                                  <span className="text-[10px] text-rose-600 dark:text-red-400 font-bold font-mono">
                                    🔥 {prod.soldCount || 0} đã bán
                                  </span>
                                </div>
                              </div>
                              <span className="font-black text-pink-700 dark:text-cyan-400 text-xs font-mono flex-shrink-0">
                                {(prod.salePrice || prod.price).toLocaleString('vi-VN')}đ
                              </span>
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleSearch()}
                            className="w-full py-3 text-xs font-black text-pink-700 dark:text-cyan-400 hover:bg-pink-50 dark:hover:bg-gray-900 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            Xem tất cả kết quả cho "{searchTerm}" <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 font-bold">
                          Không tìm thấy sản phẩm nào với từ khóa "{searchTerm}".
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default: trending tags + hot products */
                    <div className="p-4 space-y-4">
                      {/* Trending tags */}
                      <div>
                        <span className="text-[11px] font-black text-slate-500 dark:text-gray-400 uppercase font-mono tracking-wider block mb-2">
                          ✨ Tìm kiếm phổ biến:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['Hoodie', 'Cyber Jacket', 'Cargo Pants', 'Sneaker', 'Titan Chain', 'Oversized'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSearchTerm(tag);
                                navigate(`/shop?search=${encodeURIComponent(tag)}`);
                                setIsSearchReady(false);
                                setIsSearchExpanded(false);
                              }}
                              className="px-2.5 py-1 rounded-full bg-pink-50 dark:bg-gray-900 border border-pink-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 hover:bg-pink-100 font-bold text-[11px] transition-colors"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hot Drops */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black text-rose-700 dark:text-red-400 uppercase font-mono tracking-wider flex items-center gap-1">
                            <Flame className="flame-pulse w-3.5 h-3.5" /> Đề xuất HOT — Bán chạy nhất:
                          </span>
                          <Link
                            to="/shop?sortBy=popular"
                            onClick={() => {
                              setIsSearchReady(false);
                              setIsSearchExpanded(false);
                            }}
                            className="text-[10px] text-pink-600 dark:text-cyan-400 font-bold hover:underline"
                          >
                            Xem thêm →
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {hotProducts.map((prod) => (
                            <Link
                              key={prod.id}
                              to={`/product/${prod.id}`}
                              onClick={() => {
                                setIsSearchReady(false);
                                setIsSearchExpanded(false);
                              }}
                              className="hot-card p-2.5 rounded-xl bg-pink-50/70 dark:bg-gray-900 border border-pink-200 dark:border-gray-800 flex items-center gap-2"
                            >
                              <img
                                src={getImage(prod)}
                                alt={prod.name}
                                className="w-9 h-11 object-cover rounded-lg border border-pink-200 dark:border-gray-800 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-950 dark:text-white text-[11px] block line-clamp-1">{prod.name}</span>
                                <span className="text-[10px] text-rose-600 font-bold font-mono">🔥 {prod.soldCount} đã bán</span>
                                <span className="block font-black text-pink-700 dark:text-cyan-400 text-[11px] font-mono">
                                  {(prod.salePrice || prod.price).toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── RIGHT GROUP: Actions ─── */}
            <div className="nav-group flex items-center gap-2 flex-shrink-0 ml-auto">
              {/* Mobile search button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 text-pink-600 dark:text-cyan-400 hover:bg-pink-100 shadow-sm"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`hidden sm:flex px-3 py-1.5 rounded-xl border text-xs font-black font-mono items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                  isDark
                    ? 'bg-gray-900 border-cyan-500/50 text-cyan-400 hover:bg-gray-800'
                    : 'bg-white border-pink-300 text-pink-800 hover:bg-pink-100'
                }`}
              >
                {isDark
                  ? <><Moon className="w-3.5 h-3.5" /><span>Cyber Tối</span></>
                  : <><Sun className="w-3.5 h-3.5 animate-spin" /><span>Melody Sáng</span></>
                }
              </button>

              {/* Membership Badge */}
              <div className={`hidden sm:block transition-all duration-300 ${isSearchExpanded ? 'xl:block hidden' : ''}`}>
                <MembershipBadge tier={currentTier} />
              </div>

              {/* Wishlist */}
              <Link
                to="/shop"
                className="relative p-2.5 rounded-xl bg-white dark:bg-gray-900/80 border border-pink-200 dark:border-gray-800 text-pink-600 dark:text-gray-300 hover:bg-pink-100 transition-all shadow-sm flex items-center justify-center"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-white dark:bg-gray-900/80 border border-pink-200 dark:border-gray-800 text-pink-600 dark:text-gray-300 hover:bg-pink-100 dark:hover:text-cyan-400 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="px-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 dark:from-cyan-500 dark:to-blue-600 text-white text-[10px] font-extrabold shadow">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Profile / Login */}
              <div className="relative flex-shrink-0">
                {user ? (
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-800 hover:border-pink-400 transition-all shadow-sm"
                  >
                    <div className={`text-left hidden sm:block transition-all duration-300 ${isSearchExpanded ? 'xl:block hidden' : ''}`}>
                      <span className="text-xs font-bold text-slate-950 dark:text-white block line-clamp-1 max-w-[90px]">{user.name}</span>
                      <span className="text-[10px] text-pink-700 dark:text-cyan-400 uppercase font-mono font-bold">{user.role}</span>
                    </div>
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover border border-pink-400/60 dark:border-cyan-400/40"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-700 dark:text-slate-500" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Đăng nhập
                  </Link>
                )}

                {/* Profile Dropdown */}
                {isProfileMenuOpen && user && (
                  <div className="profile-dropdown absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-950 border-2 border-pink-200 dark:border-gray-800 shadow-2xl p-2 z-50">
                    <div className="p-3 border-b border-pink-100 dark:border-gray-800/80">
                      <span className="text-xs font-bold text-slate-950 dark:text-white block">{user.name}</span>
                      <span className="text-[11px] text-slate-600 dark:text-gray-400 font-mono block">{user.email}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-pink-100 dark:bg-gray-800 text-pink-800 dark:text-cyan-400">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-2 space-y-0.5">
                      <Link to="/order-tracking" onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-950 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-pink-500" /> Đơn hàng của tôi
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-purple-800 dark:text-pink-400 hover:bg-purple-50 dark:hover:bg-gray-900 flex items-center gap-2">
                          <Shield className="w-4 h-4" /> Bảng quản trị Admin
                        </Link>
                      )}
                      {isEmployee && (
                        <Link to="/employee/inventory" onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-800 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-gray-900 flex items-center gap-2">
                          <Layers className="w-4 h-4" /> Kho & Đơn hàng
                        </Link>
                      )}
                    </div>

                    {/* Demo role switcher */}
                    <div className="p-2 bg-pink-50/80 dark:bg-gray-900/60 rounded-xl border border-pink-100 dark:border-gray-800 space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-gray-500 font-bold uppercase block">⚡ Chuyển vai trò Demo:</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => handleQuickSwitch('customer@gmail.com', 'customer123', '/shop')}
                          className="px-2 py-1 rounded bg-white dark:bg-gray-800 text-[10px] font-bold text-slate-900 dark:text-gray-300 border border-pink-200 dark:border-gray-700 hover:bg-pink-100">
                          Khách
                        </button>
                        <button onClick={() => handleQuickSwitch('staff@xivstudio.com', 'staff123', '/employee/inventory')}
                          className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-200">
                          Staff
                        </button>
                        <button onClick={() => handleQuickSwitch('admin@xivstudio.com', 'admin123', '/admin/dashboard')}
                          className="px-2 py-1 rounded bg-purple-100 dark:bg-pink-950 text-[10px] font-bold text-purple-800 dark:text-pink-300 border border-purple-300 dark:border-pink-800 hover:bg-purple-200">
                          Admin
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                      className="mt-2 w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer md:hidden border-t border-pink-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-3">
            {/* Search bar in mobile */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm streetwear..."
                className="w-full bg-slate-50 dark:bg-gray-900 border-2 border-pink-300 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-950 dark:text-white font-bold outline-none focus:border-pink-500"
              />
              <Search className="w-4 h-4 text-pink-600 dark:text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Mobile trending tags */}
            <div className="flex flex-wrap gap-1.5">
              {['Hoodie', 'Cargo', 'Jacket', 'Sneaker'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    navigate(`/shop?search=${encodeURIComponent(tag)}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-slate-800 text-[11px] font-bold hover:bg-pink-100"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1 font-bold text-sm">
              {[
                { to: '/', label: 'Trang chủ' },
                { to: '/shop', label: 'Bộ sưu tập' },
                { to: '/membership', label: '👑 Hội Viên', icon: Crown },
                { to: '/order-tracking', label: '📦 Tra cứu đơn' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-pink-50 dark:hover:bg-gray-900 text-slate-950 dark:text-white">
                  {label}
                </Link>
              ))}
              {isEmployee && (
                <Link to="/employee/inventory" onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-pink-100 text-pink-800 text-xs flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Quản lý kho
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-purple-100 text-purple-800 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Bảng điều khiển Admin
                </Link>
              )}
            </div>

            {/* Theme toggle mobile */}
            <button onClick={toggleTheme}
              className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border ${
                isDark ? 'bg-gray-900 border-cyan-500/50 text-cyan-400' : 'bg-white border-pink-300 text-pink-800'
              }`}>
              {isDark ? <><Moon className="w-4 h-4" /> Cyber Tối</> : <><Sun className="w-4 h-4 animate-spin" /> Melody Sáng</>}
            </button>
          </div>
        )}
      </header>
    </>
  );
}
