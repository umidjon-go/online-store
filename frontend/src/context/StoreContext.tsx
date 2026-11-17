import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Category,
  Product,
  Customer,
  Employee,
  Sale,
  Payment,
  CartItem,
  DashboardStats
} from '../types';
import {
  CategoryApi,
  ProductApi,
  CustomerApi,
  EmployeeApi,
  SaleApi,
  PaymentApi,
  checkBackendHealth,
  isDemoModeActive,
  setDemoModeActive,
  getApiBaseUrl,
} from '../services/api';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface StoreContextType {
  // Data
  categories: Category[];
  products: Product[];
  customers: Customer[];
  employees: Employee[];
  sales: Sale[];
  payments: Payment[];
  stats: DashboardStats;
  loading: boolean;

  // Connectivity
  isBackendOnline: boolean;
  isDemoMode: boolean;
  apiBaseUrl: string;
  setDemoMode: (active: boolean) => void;
  checkConnection: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Cart / POS
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalDiscount: number;
  cartFinalTotal: number;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Helpers
  formatPrice: (val?: number | null) => string;
  formatDate: (val?: string | null) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(isDemoModeActive());
  const [apiBaseUrl, setApiUrlState] = useState<string>(getApiBaseUrl());

  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast alert
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Format price in Uzbek So'm
  const formatPrice = useCallback((val?: number | null): string => {
    if (val === undefined || val === null || isNaN(val)) return "0 so'm";
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  }, []);

  // Format date
  const formatDate = useCallback((val?: string | null): string => {
    if (!val) return "-";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return val;
    }
  }, []);

  // Check backend connection
  const checkConnection = useCallback(async () => {
    const online = await checkBackendHealth();
    setIsBackendOnline(online);
    setApiUrlState(getApiBaseUrl());
  }, []);

  // Refresh all entities
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const online = await checkBackendHealth();
      setIsBackendOnline(online);

      const [cats, prods, custs, emps, sls, pymts] = await Promise.all([
        CategoryApi.getAll(),
        ProductApi.getAll(),
        CustomerApi.getAll(),
        EmployeeApi.getAll(),
        SaleApi.getAll(),
        PaymentApi.getAll(),
      ]);

      setCategories(cats || []);
      setProducts(prods || []);
      setCustomers(custs || []);
      setEmployees(emps || []);
      setSales(sls || []);
      setPayments(pymts || []);
    } catch (err) {
      console.error('Data fetch error:', err);
      addToast("Ma'lumotlarni yuklashda xatolik yuz berdi", 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const setDemoMode = useCallback((active: boolean) => {
    setDemoModeActive(active);
    setIsDemoMode(active);
    refreshAll();
  }, [refreshAll]);

  // Initial load
  useEffect(() => {
    refreshAll();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, [refreshAll, checkConnection]);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (product.quantity <= 0) {
      addToast(`"${product.name}" mahsulotidan omborda qolmagan!`, 'warning');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.quantity) {
          addToast(`Omborda faqat ${product.quantity} dona mavjud!`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          unitPrice: product.price,
          subtotal: product.price * quantity,
        },
      ];
    });
    addToast(`"${product.name}" savatga qo'shildi`, 'success');
  }, [addToast]);

  const updateCartQuantity = useCallback((productId: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.quantity) {
            addToast(`Omborda faqat ${item.product.quantity} dona mavjud!`, 'warning');
            return item;
          }
          return {
            ...item,
            quantity,
            subtotal: quantity * item.unitPrice,
          };
        }
        return item;
      });
    });
  }, [addToast]);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Calculate cart sums
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTotalDiscount = 0; // will be handled at checkout if applied
  const cartFinalTotal = cartSubtotal - cartTotalDiscount;

  // Stats calculation
  const stats: DashboardStats = {
    totalRevenue: sales
      .filter((s) => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + (s.total_amount - (s.discount || 0)), 0),
    totalSalesCount: sales.length,
    totalProductsCount: products.length,
    lowStockCount: products.filter((p) => p.quantity < 10).length,
    totalCustomersCount: customers.length,
    totalEmployeesCount: employees.length,
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        customers,
        employees,
        sales,
        payments,
        stats,
        loading,
        isBackendOnline,
        isDemoMode,
        apiBaseUrl,
        setDemoMode,
        checkConnection,
        refreshAll,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTotalDiscount,
        cartFinalTotal,
        toasts,
        addToast,
        removeToast,
        formatPrice,
        formatDate,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

