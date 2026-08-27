import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Info Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    otp: '',
  });

  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');

  const otpInputRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus OTP input when transitioning to Step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Step 1: Send OTP to Gmail
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.trim().replace(/[\s.-]/g, '');
      const vnPhoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!vnPhoneRegex.test(cleanPhone) || cleanPhone.length !== 10) {
        setError('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (Ví dụ: 0901234567 hoặc 0387878878).');
        return;
      }
    }

    setSendingOtp(true);
    try {
      const res = await authAPI.sendOtp({ email: formData.email.trim() });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        setStep(2);
        setCountdown(60); // 60s cooldown
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
      const res = await authAPI.sendOtp({ email: formData.email.trim() });
      if (res.data.success) {
        setSuccessMsg('Đã gửi lại mã xác thực mới vào Gmail của bạn!');
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

  // Step 2: Final Submit with OTP
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.otp || formData.otp.trim().length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        otp: formData.otp.trim(),
      });

      // Tự động chuyển về trang redirect hoặc trang chủ sau khi đăng ký thành công
      navigate(redirectParam || '/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại mã OTP.';
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Xác thực Gmail Bảo Mật
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-wide">
            {step === 1 ? 'TẠO TÀI KHOẢN MỚI' : 'XÁC THỰC MÃ OTP'}
          </h2>
          <p className="text-xs text-gray-400">
            {step === 1
              ? 'Gia nhập cộng đồng Streetwear XIV STUDIO'
              : `Mã xác thực 6 số đã được gửi đến hộp thư ${formData.email}`}
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-12 bg-pink-500' : 'w-4 bg-emerald-500'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-12 bg-cyan-400' : 'w-4 bg-gray-800'}`} />
        </div>

        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/90 border border-gray-800 shadow-2xl space-y-5 backdrop-blur-xl">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && step === 2 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dev Hint if Simulator mode */}
          {devOtpHint && step === 2 && (
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-700/60 text-cyan-300 text-xs flex items-center justify-between">
              <span>💡 Mã OTP thử nghiệm: <strong className="font-mono text-white text-sm tracking-widest">{devOtpHint}</strong></span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, otp: devOtpHint })}
                className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-[10px] font-bold border border-cyan-500/30"
              >
                Điền nhanh
              </button>
            </div>
          )}

          {/* STEP 1: Account Information Form */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Họ và tên *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-3 text-white outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Email (Nhận mã OTP) *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-3 text-white outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Mật khẩu *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-3 text-white outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Số điện thoại</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0987654321"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-3 text-white outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">Địa chỉ nhận hàng</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số nhà, tên đường, Quận/Huyện, TP"
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-3 text-white outline-none transition-all"
                  />
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all duration-300 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {sendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Đang gửi mã OTP đến Gmail...
                  </>
                ) : (
                  <>
                    Tiếp tục & Nhận mã OTP qua Gmail <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5 text-xs">
              <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 text-center space-y-2">
                <span className="text-gray-400 text-[11px] block">Mã xác thực 6 số gửi đến:</span>
                <span className="text-pink-400 font-bold text-sm block font-mono">
                  {formData.email}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  (Vui lòng kiểm tra hộp thư đến hoặc mục Thư rác / Spam)
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 font-bold block text-center">
                  Nhập mã xác thực gồm 6 chữ số *
                </label>
                <div className="relative max-w-[260px] mx-auto">
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    placeholder="• • • • • •"
                    className="w-full bg-gray-900 border-2 border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-2xl px-4 py-3.5 text-center font-mono text-2xl font-black text-white tracking-[12px] outline-none transition-all shadow-inner"
                  />
                  <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Countdown & Resend Button */}
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

              {/* Submit & Back buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" /> Đang xác thực tài khoản...
                    </>
                  ) : (
                    <>
                      Xác thực OTP & Tạo tài khoản <ShieldCheck className="w-4 h-4" />
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
                  <ArrowLeft className="w-3.5 h-3.5" /> Thay đổi thông tin / Email
                </button>
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs text-gray-400 border-t border-gray-900">
            Đã có tài khoản?{' '}
            <Link to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'} className="text-cyan-400 hover:underline font-bold">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
