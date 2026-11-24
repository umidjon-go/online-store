import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  UserCheck,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    stats,
    sales,
    products,
    categories,
    customers,
    employees,
    formatPrice,
    formatDate,
    isDemoMode,
    isBackendOnline,
  } = useStore();

  const recentSales = [...sales].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);
  const lowStockProducts = products.filter((p) => p.quantity < 10).slice(0, 5);

  const getCustomerName = (id: number) => {
    const c = customers.find((cust) => cust.id === id);
    return c ? c.full_name : `Mijoz #${id || 'Umumiy'}`;
  };

  const getEmployeeName = (id: number) => {
    const e = employees.find((emp) => emp.id === id);
    return e ? `${e.first_name} ${e.last_name}` : `Kassir #${id || 'Nomaʼlum'}`;
  };

  const getCategoryName = (id: number) => {
    const c = categories.find((cat) => cat.id === id);
    return c ? c.name : 'Boshqa';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner if Backend offline */}
      {!isBackendOnline && !isDemoMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Backend server (http://localhost:8080) bilan ulanish kutilmoqda</p>
              <p className="text-xs text-amber-700">
                Go backendni ishga tushiring: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">go run main.go</code>. Tizim avtomatik ulanadi.
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-xl hover:bg-amber-700 transition-colors"
          >
            Sozlamalar
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Boshqaruv Paneli
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            "TezBozor" do'koni va savdo ko'rsatkichlarining real vaqtdagi hisoboti
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/pos"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kassaga O'tish</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Jami Daromad</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatPrice(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Muvaffaqiyatli sotuvlar asosida</span>
            </div>
          </div>
        </div>

        {/* Total Sales Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Sotuvlar Soni</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalSalesCount} ta
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Barcha rasmiylashtirilgan cheklar
            </div>
          </div>
        </div>

        {/* Products In Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Mahsulotlar</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalProductsCount} xil
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {categories.length} ta kategoriya bo'yicha
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Kam Qolgan Zaxira</span>
            <div className={`p-2 rounded-xl ${stats.lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-extrabold tracking-tight ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stats.lowStockCount} ta
            </div>
            <div className="text-xs text-slate-400 mt-1">
              10 donadan kam qolgan tovarlar
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/pos"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800">Yangi Savdo</div>
            <div className="text-xs text-slate-400">Kassa orqali sotish</div>
          </div>
        </Link>

        <Link
          to="/products"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800">Tovar Qo'shish</div>
            <div className="text-xs text-slate-400">Katalogga yangi tovar</div>
          </div>
        </Link>

        <Link
          to="/customers"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800">Mijoz Ro'yxati</div>
            <div className="text-xs text-slate-400">{stats.totalCustomersCount} ta mijoz</div>
          </div>
        </Link>

        <Link
          to="/employees"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800">Xodimlar</div>
            <div className="text-xs text-slate-400">{stats.totalEmployeesCount} ta xodim</div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h2 className="font-bold text-slate-900">So'nggi Sotuvlar</h2>
            </div>
            <Link
              to="/sales"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Barchasini ko'rish &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Chek №</th>
                  <th className="py-3 px-4">Xaridor</th>
                  <th className="py-3 px-4">Kassir</th>
                  <th className="py-3 px-4 text-right">Summa</th>
                  <th className="py-3 px-4 text-center">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Hozircha sotuvlar amalga oshirilmagan
                    </td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        #{sale.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {getCustomerName(sale.customer_id)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {getEmployeeName(sale.employee_id)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatPrice(sale.total_amount - (sale.discount || 0))}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {sale.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            To'langan
                          </span>
                        ) : sale.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <HelpCircle className="w-3 h-3" />
                            Kutilmoqda
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Bekor qilingan
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning & Top Categories (1 col) */}
        <div className="space-y-6">
          {/* Low Stock list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-slate-900">Kam Qolgan Tovarlar</h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Ombor &rarr;
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Barcha tovarlar zaxirasi yetarli darajada!
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {getCategoryName(p.category_id)} &bull; {formatPrice(p.price)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                        p.quantity === 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.quantity} dona
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Categories Quick overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h2 className="font-bold text-slate-900">Kategoriyalar</h2>
              </div>
              <Link
                to="/categories"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Barchasi &rarr;
              </Link>
            </div>
            <div className="space-y-2">
              {categories.slice(0, 4).map((c) => {
                const count = products.filter((p) => p.category_id === c.id).length;
                return (
                  <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <span className="font-medium text-slate-700 truncate">{c.name}</span>
                    <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {count} ta tovar
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

