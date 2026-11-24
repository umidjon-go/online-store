import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Layers,
  Receipt,
  Users,
  UserCheck,
  CreditCard,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { cart, stats, products, currentUser } = useStore();
  const lowStockCount = products.filter((p) => p.quantity < 10).length;

  const userRole = currentUser?.role?.toUpperCase() || 'ADMIN';
  const isCustomer = userRole === 'CUSTOMER';

  const allLinks = [
    {
      to: '/',
      label: 'Boshqaruv Paneli',
      icon: LayoutDashboard,
      badge: null,
      roles: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    {
      to: '/products',
      label: isCustomer ? "Do'kon Vitrinasi" : 'Mahsulotlar',
      icon: isCustomer ? ShoppingBag : Package,
      badge: !isCustomer && lowStockCount > 0 ? `${lowStockCount} kam` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['ADMIN', 'MANAGER', 'CASHIER', 'CUSTOMER'],
    },
    {
      to: '/pos',
      label: isCustomer ? 'Mening Savatim' : 'Kassa (POS)',
      icon: ShoppingCart,
      badge: cart.length > 0 ? `${cart.length}` : null,
      badgeColor: 'bg-blue-500 text-white',
      roles: ['ADMIN', 'MANAGER', 'CASHIER', 'CUSTOMER'],
    },
    {
      to: '/sales',
      label: isCustomer ? 'Mening Xaridlarim' : 'Sotuvlar Tarixi',
      icon: Receipt,
      badge: stats.totalSalesCount > 0 ? `${stats.totalSalesCount}` : null,
      badgeColor: 'bg-slate-100 text-slate-700',
      roles: ['ADMIN', 'MANAGER', 'CASHIER', 'CUSTOMER'],
    },
    {
      to: '/categories',
      label: 'Kategoriyalar',
      icon: Layers,
      badge: null,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      to: '/customers',
      label: userRole === 'CASHIER' ? 'Mening Mijozlarim' : 'Mijozlar',
      icon: Users,
      badge: null,
      roles: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    {
      to: '/employees',
      label: 'Xodimlar',
      icon: UserCheck,
      badge: null,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      to: '/payments',
      label: "To'lovlar",
      icon: CreditCard,
      badge: null,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      to: '/settings',
      label: 'Sozlamalar & API',
      icon: Settings,
      badge: null,
      roles: ['ADMIN', 'MANAGER'],
    },
  ];

  const links = allLinks.filter((l) => l.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation */}
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Asosiy Bo'limlar
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                        link.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Low stock warning banner in sidebar */}
      {lowStockCount > 0 && (
        <div className="p-4 m-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Kam qolgan tovarlar</span>
          </div>
          <p className="text-amber-700 text-[11px] leading-relaxed">
            {lowStockCount} ta mahsulot zaxirasi 10 donadan kam!
          </p>
          <NavLink
            to="/products"
            className="mt-2 inline-block font-semibold text-[11px] text-amber-800 hover:underline"
          >
            Ko'rib chiqish &rarr;
          </NavLink>
        </div>
      )}

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex flex-col gap-1">
        <div className="flex items-center justify-between font-medium">
          <span className="text-slate-500 font-semibold">TezBozor v1.0</span>
          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px]">Active</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Go Backend API + React Frontend
        </p>
      </div>
    </aside>
  );
};

