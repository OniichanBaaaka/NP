import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, User, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'employee') {
        navigate('/employee/inventory');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 dark:from-cyan-400 dark:via-blue-600 dark:to-pink-500 p-0.5 mx-auto shadow-xl">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-heading font-extrabold text-pink-400 dark:text-cyan-400 text-xl">
              XIV
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-heading">
            ĐĂNG NHẬP HỆ THỐNG
          </h2>
          <p className="text-xs text-slate-600 dark:text-gray-400 font-bold">
            Truy cập nền tảng thương mại điện tử XIV STUDIO
          </p>
        </div>

        {/* Quick 1-Click Demo Accounts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/70 border-2 border-pink-200 dark:border-gray-800 space-y-2 text-xs shadow-md">
          <span className="text-slate-700 dark:text-gray-400 font-black block text-[11px] uppercase tracking-wider">
            ⚡ 1-Click Đăng nhập Tài khoản Mẫu (Demo):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@xivstudio.com', 'admin123')}
              className="p-2.5 rounded-xl bg-purple-100 dark:bg-pink-950/80 hover:bg-purple-200 text-purple-800 dark:text-pink-300 border border-purple-300 dark:border-pink-800 font-black transition-all text-center shadow-sm"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('staff@xivstudio.com', 'staff123')}
              className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-black transition-all text-center shadow-sm"
            >
              📦 Employee
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('customer@gmail.com', 'customer123')}
              className="p-2.5 rounded-xl bg-pink-100 dark:bg-gray-800 hover:bg-pink-200 text-pink-800 dark:text-gray-200 border border-pink-300 dark:border-gray-700 font-black transition-all text-center shadow-sm"
            >
              🛍️ Customer
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-950/90 border-2 border-pink-300 dark:border-gray-800 shadow-2xl space-y-5">
          {/* Prominent Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/80 border-2 border-red-400 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-3 font-black shadow-md animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-gray-300 font-black">Địa chỉ Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-50 dark:bg-gray-900 border-2 border-pink-200 dark:border-gray-800 focus:border-pink-500 dark:focus:border-cyan-500 rounded-xl px-4 py-3 pl-10 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none transition-all font-bold"
                />
                <Mail className="w-4 h-4 text-pink-600 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-800 dark:text-gray-300 font-black">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 dark:bg-gray-900 border-2 border-pink-200 dark:border-gray-800 focus:border-pink-500 dark:focus:border-cyan-500 rounded-xl px-4 py-3 pl-10 pr-10 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none transition-all font-bold"
                />
                <Lock className="w-4 h-4 text-pink-600 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-cyan-500 dark:to-blue-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-pink-500/25"
            >
              {loading ? (
                'Đang xác thực...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Đăng nhập ngay
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-slate-600 dark:text-gray-400 text-xs font-semibold">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-pink-600 dark:text-cyan-400 hover:underline font-black">
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
