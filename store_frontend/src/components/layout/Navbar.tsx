import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  RotateCw,
  ShoppingCart,
  ShoppingBag,
  Wifi,
  WifiOff,
  Sparkles,
  Search,
  Store,
  TrendingUp,
  LogOut,
  User,
  ShieldCheck,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    login,
    logout,
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
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const isCustomer = currentUser?.role?.toUpperCase() === 'CUSTOMER';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitchRole = async (targetRole: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'CUSTOMER') => {
    setIsRoleMenuOpen(false);
    switch (targetRole) {
      case 'ADMIN':
        await login('+998901234567', 'admin123');
        break;
      case 'MANAGER':
        await login('+998974445566', 'manager123');
        break;
      case 'CASHIER':
        await login('+998912223344', 'kassir123');
        break;
      case 'CUSTOMER':
        await login('+998901234568', 'mijoz123');
        break;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            ADMIN
          </span>
        );
      case 'MANAGER':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Briefcase className="w-3 h-3 text-amber-600" />
            MENEJER
          </span>
        );
      case 'CUSTOMER':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <ShoppingBag className="w-3 h-3 text-sky-600" />
            MIJOZ
          </span>
        );
      case 'CASHIER':
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShoppingCart className="w-3 h-3 text-emerald-600" />
            KASSIR
          </span>
        );
    }
  };

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
        <div
          className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 transition-colors px-3 py-1.5 rounded-xl text-xs text-slate-500 cursor-pointer border border-slate-200/60"
          onClick={() => navigate('/products')}
        >
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
              <span className="hidden sm:inline">API Oflayn</span>
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

        {/* POS / Cart shortcut */}
        <Link
          to="/pos"
          title={isCustomer ? "Mening savatim" : "Kassa savdosi"}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] ${
            isCustomer
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-500/25'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
          }`}
        >
          {isCustomer ? <ShoppingBag className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          <span className="hidden sm:inline">{isCustomer ? "Mening Savatim" : "Kassa (POS)"}</span>
          {cart.length > 0 && (
            <span className="bg-white text-blue-600 px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Link>

        {/* User Profile & Role Info & Quick Role Switcher */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 relative">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.first_name} {currentUser.last_name}
              </span>
              <div className="mt-0.5 relative">
                <button
                  type="button"
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  title="Sinov uchun rolni almashtirish (1-Click)"
                  className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {getRoleBadge(currentUser.role)}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown to switch roles quickly */}
                {isRoleMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Rolni almashtirish</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">1-Click</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickSwitchRole('ADMIN')}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-purple-50 transition-colors ${
                        currentUser.role?.toUpperCase() === 'ADMIN' ? 'font-bold text-purple-700 bg-purple-50/60' : 'text-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-semibold">👑 Admin</div>
                        <div className="text-[10px] text-slate-400">To'liq boshqaruv</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSwitchRole('MANAGER')}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-amber-50 transition-colors ${
                        currentUser.role?.toUpperCase() === 'MANAGER' ? 'font-bold text-amber-700 bg-amber-50/60' : 'text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-semibold">💼 Menejer</div>
                        <div className="text-[10px] text-slate-400">Ombor & tovarlar</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSwitchRole('CASHIER')}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-emerald-50 transition-colors ${
                        currentUser.role?.toUpperCase() === 'CASHIER' ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold">🛒 Kassir</div>
                        <div className="text-[10px] text-slate-400">Kassa & o'z mijozlari</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSwitchRole('CUSTOMER')}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-sky-50 transition-colors border-t border-slate-100 ${
                        currentUser.role?.toUpperCase() === 'CUSTOMER' ? 'font-bold text-sky-700 bg-sky-50/60' : 'text-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-sky-600" />
                      <div>
                        <div className="font-semibold">🛍️ Mijoz (Customer)</div>
                        <div className="text-[10px] text-slate-400">Do'kon vitrinasi & xarid</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.first_name ? currentUser.first_name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <button
              onClick={handleLogout}
              title="Tizimdan chiqish"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Kirish</span>
          </Link>
        )}
      </div>
    </header>
  );
};


