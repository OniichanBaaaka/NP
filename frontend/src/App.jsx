import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Membership from './pages/Membership';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeInventory from './pages/EmployeeInventory';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import AIChatWidget from './components/AIChatWidget';
import Footer from './components/Footer';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function MainLayout() {
  const { isDark } = useTheme();

  return (
    <div
      id="xiv-main-container"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0f111a 0%, #08090d 50%, #050608 100%)'
          : 'linear-gradient(180deg, #fbcfe8 0%, #fce7f3 20%, #fdf2f8 45%, #fff0f5 70%, #ffffff 100%)',
        color: isDark ? '#f8fafc' : '#1e1b4b',
        minHeight: '100vh',
      }}
      className="min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white transition-colors duration-300 pb-16 md:pb-0"
    >
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Employee & Admin Dashboard */}
          <Route
            path="/employee/inventory"
            element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <EmployeeInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Persistent Components */}
      <CartDrawer />
      <AIChatWidget />
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <MainLayout />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
