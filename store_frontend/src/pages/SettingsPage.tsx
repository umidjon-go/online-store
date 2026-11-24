import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  setApiBaseUrl,
  localStore,
} from '../services/api';
import {
  Settings,
  Server,
  Wifi,
  WifiOff,
  CheckCircle2,
  RotateCcw,
  Terminal,
  Database,
  Globe,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    isBackendOnline,
    isDemoMode,
    setDemoMode,
    apiBaseUrl,
    checkConnection,
    refreshAll,
    addToast,
  } = useStore();

  const [inputUrl, setInputUrl] = useState(apiBaseUrl);
  const [testing, setTesting] = useState(false);

  const handleSaveUrl = () => {
    let clean = inputUrl.trim();
    if (clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    setApiBaseUrl(clean);
    setInputUrl(clean);
    addToast("API manzili saqlandi", 'success');
    checkConnection();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await checkConnection();
    setTesting(false);
    if (isBackendOnline) {
      addToast("Backend bilan aloqa muvaffaqiyatli!", 'success');
    } else {
      addToast("Backend bilan aloqa o'rnatilmadi (http://localhost:8080)", 'warning');
    }
  };

  const handleResetDemoData = () => {
    localStore.reset();
    refreshAll();
    addToast("Demo ma'lumotlar boshlang'ich holatga qaytarildi", 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-slate-700" />
          Tizim Sozlamalari & Backend Integratsiyasi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          "TezBozor" frontend qismini Go backend API bilan bog'lash va sozlash
        </p>
      </div>

      {/* Backend Connection Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isBackendOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isBackendOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Backend API Holati</h3>
              <p className="text-xs text-slate-500">
                {isBackendOnline
                  ? "Go Backend serveri faol ishlamoqda (http://localhost:8080)"
                  : "Go Backend serveri bilan aloqa yo'q yoki server o'chirilgan"}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isBackendOnline
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isBackendOnline ? 'Online (Ulangan)' : 'Offline (Ulanmagan)'}
          </span>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Backend API Server URL manzili:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
            >
              Saqlash
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              {testing ? 'Tekshirilmoqda...' : 'Sinash'}
            </button>
          </div>
        </div>

        {/* Demo Mode Toggle */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Avtonom Demo Rejim</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Backend yoki ma'lumotlar bazasisiz ham butun tizimni sinovdan o'tkazish imkonini beradi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoMode(!isDemoMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isDemoMode
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDemoMode ? 'Demo Rejim: YOQILGAN' : 'Demo Rejim: O‘CHIRILGAN'}
            </button>
            <button
              onClick={handleResetDemoData}
              title="Demo ma'lumotlarni qayta tiklash"
              className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Backend Run Instructions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Go Backend va PostgreSQL-ni Ishga Tushirish
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Ushbu TezBozor frontend ilovasi <code className="text-blue-600 font-mono">c:\Users\user\Desktop\online-store</code> papkasidagi Go Gin REST backend bilan 100% integratsiya qilingan. Backendni ishga tushirish uchun:
        </p>

        <div className="space-y-3 text-xs font-mono">
          <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1">
            <div className="text-slate-400"># 1. PostgreSQL bazasini tekshiring (.env fayli asosida):</div>
            <div className="text-emerald-400">POSTGRES_HOST=localhost, PORT=5432, USER=postgres, DB=postgres</div>
          </div>

          <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1">
            <div className="text-slate-400"># 2. Backend papkasiga o'ting va serverni yoqing:</div>
            <div className="text-blue-400">cd c:\Users\user\Desktop\online-store</div>
            <div className="text-emerald-400">go run main.go</div>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Backend yoqilgach nima bo'ladi?
          </div>
          <p className="leading-relaxed">
            Goose migratsiyalari avtomatik ishga tushadi va Gin serveri <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">:8080</code> portida eshitishni boshlaydi. Frontend buni avtomatik aniqlaydi va yuqori menyuda <span className="text-emerald-600 font-bold">API Ulangan</span> belgisi paydo bo'ladi.
          </p>
        </div>
      </div>

      {/* Backend API Endpoints Reference */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Mavjud Backend API Endpointlari
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
            <div className="font-bold text-slate-800 font-sans">Kategoriyalar:</div>
            <div className="text-slate-600">GET, POST /categories/</div>
            <div className="text-slate-600">GET, PUT, DELETE /categories/:id</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
            <div className="font-bold text-slate-800 font-sans">Mahsulotlar:</div>
            <div className="text-slate-600">GET, POST /products/</div>
            <div className="text-slate-600">GET, PUT, DELETE /products/:id</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
            <div className="font-bold text-slate-800 font-sans">Mijozlar:</div>
            <div className="text-slate-600">GET, POST /customers/</div>
            <div className="text-slate-600">GET, PUT, DELETE /customers/:id</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
            <div className="font-bold text-slate-800 font-sans">Xodimlar:</div>
            <div className="text-slate-600">GET, POST /employees/</div>
            <div className="text-slate-600">GET, PUT, DELETE /employees/:id</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
            <div className="font-bold text-slate-800 font-sans">Sotuvlar:</div>
            <div className="text-slate-600">GET, POST /sales/</div>
            <div className="text-slate-600">GET, PUT, DELETE /sales/:id</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
            <div className="font-bold text-slate-800 font-sans">Savdo Pozitsiyalari:</div>
            <div className="text-slate-600">GET, POST /sale-items/</div>
            <div className="text-slate-600">GET, PUT, DELETE /sale-items/:id</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono sm:col-span-2">
            <div className="font-bold text-slate-800 font-sans">To'lovlar:</div>
            <div className="text-slate-600">GET, POST /payments/</div>
            <div className="text-slate-600">GET, PUT, DELETE /payments/:id</div>
          </div>
        </div>
      </div>
    </div>
  );
};

