import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  Store,
  ShieldCheck,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  ShoppingCart,
  ShoppingBag,
  Briefcase,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, currentUser, isBackendOnline, isDemoMode, setDemoMode } = useStore();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('+998901234567');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError('Telefon raqamini kiriting');
      return;
    }
    if (!password) {
      setError('Parolni kiriting');
      return;
    }

    setIsLoading(true);
    const res = await login(phone.trim(), password);
    setIsLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Telefon raqam yoki parol noto‘g‘ri');
    }
  };

  const handleQuickLogin = async (p: string, pass: string) => {
    setPhone(p);
    setPassword(pass);
    setError(null);
    setIsLoading(true);
    const res = await login(p, pass);
    setIsLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Kirishda xatolik yuz berdi');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-4 ring-4 ring-white/10">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
            TezBozor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Do'kon Boshqaruvi va Savdo Tizimi (RBAC & Auth)
          </p>

          {/* Connection status badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
            {isBackendOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Backend API Ulangan (:8080)</span>
              </>
            ) : isDemoMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-300">Demo Rejim Faol</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300">Backend aloqasi yo'q</span>
                <button
                  type="button"
                  onClick={() => setDemoMode(true)}
                  className="underline text-blue-400 hover:text-blue-300 ml-1"
                >
                  Demo yoqish
                </button>
              </>
            )}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Tizimga kirish</h2>
            <p className="text-xs text-slate-400 mt-1">
              Xodim akkauntingiz ma'lumotlarini kiriting
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telefon Raqam
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maxfiy Parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tizimga kirish</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Login Helper for RBAC testing */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Tezkor sinov hisoblari (1-Click Login)
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('+998901234567', 'admin123')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-white">Admin</span>
                <span className="text-[9px] text-purple-300/80">To'liq huquq</span>
              </button>

              {/* Manager Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('+998974445566', 'manager123')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-white">Menejer</span>
                <span className="text-[9px] text-amber-300/80">Ombor & Boshqaruv</span>
              </button>

              {/* Cashier Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('+998912223344', 'kassir123')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-white">Kassir</span>
                <span className="text-[9px] text-emerald-300/80">O'z mijozlari</span>
              </button>

              {/* Customer Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('+998901234568', 'mijoz123')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <span className="text-xs font-bold text-white">Mijoz</span>
                <span className="text-[9px] text-sky-300/80">Katalog & Xarid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          TezBozor v1.0 &copy; {new Date().getFullYear()} &bull; Barcha huquqlar himoyalangan
        </p>
      </div>
    </div>
  );
};
