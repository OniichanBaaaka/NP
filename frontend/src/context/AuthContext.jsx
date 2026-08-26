import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('xiv_token') || null);
  const [loading, setLoading] = useState(true);

  // Spending state (Persisted in localStorage & Synced with DB)
  const [userSpending, setUserSpending] = useState(() => {
    const saved = localStorage.getItem('xiv_user_spending');
    return saved ? parseFloat(saved) : 2800000; // Mặc định 2.8tr
  });

  // Paid Subscription Package state (Persisted in localStorage & Synced with DB)
  const [activePackage, setActivePackage] = useState(() => {
    return localStorage.getItem('xiv_active_package') || 'NONE'; // 'NONE' | 'PLUS' | 'VIP' | 'PREMIUM'
  });

  useEffect(() => {
    localStorage.setItem('xiv_user_spending', userSpending.toString());
  }, [userSpending]);

  useEffect(() => {
    localStorage.setItem('xiv_active_package', activePackage);
  }, [activePackage]);

  const loadUser = async () => {
    if (token) {
      try {
        const res = await authAPI.getMe();
        if (res.data.success && res.data.user) {
          const u = res.data.user;
          setUser(u);
          if (u.totalSpent !== undefined && u.totalSpent > 0) {
            setUserSpending(Number(u.totalSpent));
          }
          if (u.activePackage && u.activePackage !== 'NONE') {
            setActivePackage(u.activePackage);
          }
        }
      } catch (e) {
        console.error('Failed to load user:', e);
        localStorage.removeItem('xiv_token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('xiv_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.totalSpent) {
        setUserSpending(Number(res.data.user.totalSpent));
      }
      if (res.data.user.activePackage) {
        setActivePackage(res.data.user.activePackage);
      }
      return res.data;
    }
    throw new Error(res.data.message || 'Đăng nhập thất bại');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data.success) {
      localStorage.setItem('xiv_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Đăng ký thất bại');
  };

  const logout = () => {
    localStorage.removeItem('xiv_token');
    setToken(null);
    setUser(null);
  };

  const refreshUserData = async () => {
    await loadUser();
  };

  // Tính toán cấp bậc thành viên Tích Lũy Chi Tiêu:
  // Mức 1: Silver (2.500.000đ) -> Giảm 5%
  // Mức 2: Gold (5.000.000đ) -> Giảm 10%
  // Mức 3: Diamond (10.000.000đ) -> Giảm 15%
  let currentTier = 'MEMBER';
  let tierDiscountRate = 0;
  let nextTierThreshold = 2500000;
  let nextTierRemaining = 2500000 - userSpending;
  let nextTierProgress = (userSpending / 2500000) * 100;

  if (userSpending >= 10000000) {
    currentTier = 'DIAMOND';
    tierDiscountRate = 0.15; // Giảm 15%
    nextTierThreshold = 10000000;
    nextTierRemaining = 0;
    nextTierProgress = 100;
  } else if (userSpending >= 5000000) {
    currentTier = 'GOLD';
    tierDiscountRate = 0.10; // Giảm 10%
    nextTierThreshold = 10000000;
    nextTierRemaining = 10000000 - userSpending;
    nextTierProgress = ((userSpending - 5000000) / 5000000) * 100;
  } else if (userSpending >= 2500000) {
    currentTier = 'SILVER';
    tierDiscountRate = 0.05; // Giảm 5%
    nextTierThreshold = 5000000;
    nextTierRemaining = 5000000 - userSpending;
    nextTierProgress = ((userSpending - 2500000) / 2500000) * 100;
  }

  // Chiết khấu từ gói trả phí đã mua
  let packageDiscountRate = 0;
  if (activePackage === 'PLUS') packageDiscountRate = 0.03; // Thêm 3%
  if (activePackage === 'VIP') packageDiscountRate = 0.07; // Thêm 7%
  if (activePackage === 'PREMIUM') packageDiscountRate = 0.12; // Thêm 12%

  // Tổng mức chiết khấu áp dụng tự động
  const totalTierDiscountRate = tierDiscountRate + packageDiscountRate;

  // Hàm chuyển nhanh cấp bậc để demo
  const setTierDemo = (tierName) => {
    switch (tierName) {
      case 'DIAMOND':
        setUserSpending(10500000);
        break;
      case 'GOLD':
        setUserSpending(5500000);
        break;
      case 'SILVER':
        setUserSpending(2800000);
        break;
      default:
        setUserSpending(500000);
        break;
    }
  };

  // Hàm kích hoạt gói dịch vụ trả phí (Demo & Real Activation)
  const setPackageDemo = (pkgCode) => {
    setActivePackage(pkgCode);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUserData,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee' || user?.role === 'admin',
    isCustomer: user?.role === 'customer' || !user,
    currentTier,
    userSpending,
    setUserSpending,
    tierDiscountRate,
    nextTierThreshold,
    nextTierRemaining: Math.max(0, nextTierRemaining),
    nextTierProgress: Math.min(100, Math.max(0, nextTierProgress)),
    setTierDemo,
    activePackage,
    setActivePackage,
    packageDiscountRate,
    totalTierDiscountRate,
    setPackageDemo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
