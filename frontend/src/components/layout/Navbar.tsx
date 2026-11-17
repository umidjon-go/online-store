import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  RotateCw,
  ShoppingCart,
  Wifi,
  WifiOff,
  Sparkles,
  Search,
  Bell,
  Store,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isBackendOnline,
    isDemoMode,
    setDemoMode,
    loading,
    refreshAll,
    cart,
    stats,
    formatPrice,
  } = useStore();

  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      {/* Brand & Search */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight tracking-tight font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              TezBozor
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-0.5 tracking-wider uppercase">
              Do'kon Tizimi
            </span>
          </div>
        </Link>

        {/* Search shortcut / hint */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 transition-colors px-3 py-1.5 rounded-xl text-xs text-slate-500 cursor-pointer border border-slate-200/60"
             onClick={() => navigate('/products')}>
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Mahsulotlarni tezkor qidirish...</span>
          <kbd className="ml-2 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px] text-slate-400 font-mono">
            /
          </kbd>
        </div>
      </div>

      {/* Center status ticker */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-slate-50 rounded-full border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Jami tushum:</span>
          <span>{formatPrice(stats.totalRevenue)}</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-slate-500">
          <span>Sotuvlar soni: </span>
          <span className="font-semibold text-slate-700">{stats.totalSalesCount} ta</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend / Demo mode status indicator */}
        <div className="flex items-center">
          {isDemoMode ? (
            <button
              onClick={() => setDemoMode(false)}
              title="Demo rejim yoqilgan. Jonli backendga o'tish uchun bosing"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="hidden sm:inline">Demo Rejim</span>
            </button>
          ) : isBackendOnline ? (
            <div
              title="Backend ulangan (http://localhost:8080)"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">API Ulangan</span>
            </div>
          ) : (
            <button
              onClick={() => setDemoMode(true)}
              title="Backend bilan aloqa yo'q. Demo rejimni yoqish uchun bosing"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">API Ofline (Demo yoqish)</span>
            </button>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refreshAll()}
          disabled={loading}
          title="Ma'lumotlarni yangilash"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* POS shortcut */}
        <Link
          to="/pos"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all hover:shadow-md hover:scale-[1.02]"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Kassa (POS)</span>
          {cart.length > 0 && (
            <span className="bg-white text-blue-600 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Link>

        {/* Live clock */}
        <div className="hidden xl:block font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/70">
          {timeStr}
        </div>
      </div>
    </header>
  );
};

