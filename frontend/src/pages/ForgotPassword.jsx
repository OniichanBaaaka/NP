import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email Form, 2: OTP & New Password Form
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');

  const otpInputRef = useRef(null);
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus OTP when entering step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Step 1: Send OTP for Password Reset
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authAPI.forgotPasswordSendOtp({ email: email.trim() });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        setStep(2);
        setCountdown(60);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi mã xác thực.';
      setError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || sendingOtp) return;
    setError('');
    setSendingOtp(true);
    try {
      const res = await authAPI.forgotPasswordSendOtp({ email: email.trim() });
      if (res.data.success) {
        setSuccessMsg('Đã gửi lại mã OTP mới vào hộp thư Gmail của bạn!');
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        setCountdown(60);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi gửi lại mã OTP.';
      setError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.forgotPasswordReset({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      if (res.data.success) {
        setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Khôi phục tài khoản qua Gmail
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-wide">
            {step === 1 ? 'QUÊN MẬT KHẨU' : 'ĐẶT LẠI MẬT KHẨU'}
          </h2>
          <p className="text-xs text-gray-400">
            {step === 1
              ? 'Nhập email đã đăng ký để nhận mã xác thực OTP'
              : `Nhập mã OTP gửi về ${email} và mật khẩu mới`}
          </p>
        </div>

        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/90 border border-gray-800 shadow-2xl space-y-5 backdrop-blur-xl">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dev Hint */}
          {devOtpHint && step === 2 && (
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-700/60 text-cyan-300 text-xs flex items-center justify-between">
              <span>💡 Mã OTP thử nghiệm: <strong className="font-mono text-white text-sm tracking-widest">{devOtpHint}</strong></span>
              <button
                type="button"
                onClick={() => setOtp(devOtpHint)}
                className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-[10px] font-bold border border-cyan-500/30"
              >
                Điền nhanh
              </button>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Email đăng ký tài khoản *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-3 text-white outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {sendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Đang gửi mã OTP đến Gmail...
                  </>
                ) : (
                  <>
                    Gửi mã xác thực qua Gmail <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold block text-center">
                  Nhập mã xác thực gồm 6 chữ số *
                </label>
                <div className="relative max-w-[260px] mx-auto">
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full bg-gray-900 border-2 border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-2xl px-4 py-3 text-center font-mono text-2xl font-black text-white tracking-[12px] outline-none transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Countdown & Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <span className="text-gray-400 text-xs">
                    Gửi lại mã sau: <strong className="text-cyan-400 font-mono">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sendingOtp}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sendingOtp ? 'animate-spin' : ''}`} />
                    Gửi lại mã OTP mới
                  </button>
                )}
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-gray-300 font-bold">Mật khẩu mới *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2.5 text-white outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Xác nhận mật khẩu mới *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2.5 text-white outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" /> Đang cập nhật mật khẩu...
                    </>
                  ) : (
                    <>
                      Xác nhận & Đổi mật khẩu <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Thay đổi Email
                </button>
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs text-gray-400 border-t border-gray-900 flex items-center justify-between">
            <Link to="/login" className="text-cyan-400 hover:underline font-bold inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Đăng nhập
            </Link>
            <Link to="/register" className="text-pink-400 hover:underline font-bold">
              Đăng ký mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
