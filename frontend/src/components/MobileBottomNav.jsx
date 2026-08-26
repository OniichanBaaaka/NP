import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Package, ShoppingBag, Crown, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();
  const { currentTier, activePackage, user } = useAuth();

  const navItems = [
    {
      label: 'Trang chủ',
      to: '/',
      icon: Home,
    },
    {
      label: 'Bộ sưu tập',
      to: '/shop',
      icon: Compass,
    },
    {
      label: 'Hội Viên',
      to: '/membership',
      icon: Crown,
      badge: currentTier !== 'MEMBER' || (activePackage && activePackage !== 'NONE'),
    },
    {
      label: user ? 'Hồ sơ' : 'Tài khoản',
      to: user ? '/profile' : '/login',
      icon: User,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-gray-800/80 px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 relative transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-2" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-[9px] shadow-md">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Giỏ hàng</span>
        </button>
      </div>
    </div>
  );
}
