import axios from 'axios';
import {
  Category,
  Product,
  Customer,
  Employee,
  Sale,
  SaleItem,
  Payment
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialCustomers,
  initialEmployees,
  initialSales,
  initialSaleItems,
  initialPayments
} from './mockData';

export const getApiBaseUrl = (): string => {
  return localStorage.getItem('tezbozor_api_url') || 'http://localhost:8080';
};

export const setApiBaseUrl = (url: string): void => {
  localStorage.setItem('tezbozor_api_url', url);
};

export const isDemoModeActive = (): boolean => {
  return localStorage.getItem('tezbozor_demo_mode') === 'true';
};

export const setDemoModeActive = (active: boolean): void => {
  localStorage.setItem('tezbozor_demo_mode', active ? 'true' : 'false');
};

const createAxiosClient = () => {
  return axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 3500,
  });
};

// Check backend health
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const client = createAxiosClient();
    // Try pinging categories or products
    await client.get('/categories/');
    return true;
  } catch {
    return false;
  }
};

// In-memory demo store fallback when backend is unreachable or demo mode enabled
class LocalDemoStore {
  categories: Category[] = [...initialCategories];
  products: Product[] = [...initialProducts];
  customers: Customer[] = [...initialCustomers];
  employees: Employee[] = [...initialEmployees];
  sales: Sale[] = [...initialSales];
  saleItems: SaleItem[] = [...initialSaleItems];
  payments: Payment[] = [...initialPayments];

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    const saved = localStorage.getItem('tezbozor_local_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.categories = parsed.categories || this.categories;
        this.products = parsed.products || this.products;
        this.customers = parsed.customers || this.customers;
        this.employees = parsed.employees || this.employees;
        this.sales = parsed.sales || this.sales;
        this.saleItems = parsed.saleItems || this.saleItems;
        this.payments = parsed.payments || this.payments;
      } catch (e) {
        console.error('Failed to parse local db', e);
      }
    }
  }

  saveToStorage() {
    localStorage.setItem(
      'tezbozor_local_db',
      JSON.stringify({
        categories: this.categories,
        products: this.products,
        customers: this.customers,
        employees: this.employees,
        sales: this.sales,
        saleItems: this.saleItems,
        payments: this.payments,
      })
    );
  }

  reset() {
    this.categories = [...initialCategories];
    this.products = [...initialProducts];
    this.customers = [...initialCustomers];
    this.employees = [...initialEmployees];
    this.sales = [...initialSales];
    this.saleItems = [...initialSaleItems];
    this.payments = [...initialPayments];
    this.saveToStorage();
  }
}

export const localStore = new LocalDemoStore();

// ===================== CATEGORIES API =====================
export const CategoryApi = {
  getAll: async (): Promise<Category[]> => {
    if (isDemoModeActive()) return localStore.categories;
    try {
      const res = await createAxiosClient().get('/categories/');
      return res.data || [];
    } catch {
      return localStore.categories;
    }
  },

  getById: async (id: number): Promise<Category> => {
    if (isDemoModeActive()) {
      const found = localStore.categories.find((c) => c.id === id);
      if (!found) throw new Error('Kategoriya topilmadi');
      return found;
    }
    try {
      const res = await createAxiosClient().get(`/categories/${id}`);
      return res.data;
    } catch {
      const found = localStore.categories.find((c) => c.id === id);
      if (!found) throw new Error('Kategoriya topilmadi');
      return found;
    }
  },

  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    if (isDemoModeActive()) {
      const newCat: Category = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.categories.unshift(newCat);
      localStore.saveToStorage();
      return newCat;
    }
    try {
      const res = await createAxiosClient().post('/categories/', data);
      return res.data;
    } catch {
      const newCat: Category = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.categories.unshift(newCat);
      localStore.saveToStorage();
      return newCat;
    }
  },

  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    if (isDemoModeActive()) {
      const idx = localStore.categories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        localStore.categories[idx] = { ...localStore.categories[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.categories[idx];
      }
      throw new Error('Kategoriya topilmadi');
    }
    try {
      const res = await createAxiosClient().put(`/categories/${id}`, { ...data, id });
      return res.data;
    } catch {
      const idx = localStore.categories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        localStore.categories[idx] = { ...localStore.categories[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.categories[idx];
      }
      throw new Error('Kategoriya topilmadi');
    }
  },

  delete: async (id: number): Promise<void> => {
    if (isDemoModeActive()) {
      localStore.categories = localStore.categories.filter((c) => c.id !== id);
      localStore.saveToStorage();
      return;
    }
    try {
      await createAxiosClient().delete(`/categories/${id}`);
    } catch {
      localStore.categories = localStore.categories.filter((c) => c.id !== id);
      localStore.saveToStorage();
    }
  },
};

// ===================== PRODUCTS API =====================
export const ProductApi = {
  getAll: async (): Promise<Product[]> => {
    if (isDemoModeActive()) return localStore.products;
    try {
      const res = await createAxiosClient().get('/products/');
      return res.data || [];
    } catch {
      return localStore.products;
    }
  },

  getById: async (id: number): Promise<Product> => {
    if (isDemoModeActive()) {
      const p = localStore.products.find((i) => i.id === id);
      if (!p) throw new Error('Mahsulot topilmadi');
      return p;
    }
    try {
      const res = await createAxiosClient().get(`/products/${id}`);
      return res.data;
    } catch {
      const p = localStore.products.find((i) => i.id === id);
      if (!p) throw new Error('Mahsulot topilmadi');
      return p;
    }
  },

  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    if (isDemoModeActive()) {
      const newP: Product = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.products.unshift(newP);
      localStore.saveToStorage();
      return newP;
    }
    try {
      const res = await createAxiosClient().post('/products/', data);
      return res.data;
    } catch {
      const newP: Product = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.products.unshift(newP);
      localStore.saveToStorage();
      return newP;
    }
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    if (isDemoModeActive()) {
      const idx = localStore.products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localStore.products[idx] = { ...localStore.products[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.products[idx];
      }
      throw new Error('Mahsulot topilmadi');
    }
    try {
      const res = await createAxiosClient().put(`/products/${id}`, { ...data, id });
      return res.data;
    } catch {
      const idx = localStore.products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localStore.products[idx] = { ...localStore.products[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.products[idx];
      }
      throw new Error('Mahsulot topilmadi');
    }
  },

  delete: async (id: number): Promise<void> => {
    if (isDemoModeActive()) {
      localStore.products = localStore.products.filter((p) => p.id !== id);
      localStore.saveToStorage();
      return;
    }
    try {
      await createAxiosClient().delete(`/products/${id}`);
    } catch {
      localStore.products = localStore.products.filter((p) => p.id !== id);
      localStore.saveToStorage();
    }
  },
};

// ===================== CUSTOMERS API =====================
export const CustomerApi = {
  getAll: async (): Promise<Customer[]> => {
    if (isDemoModeActive()) return localStore.customers;
    try {
      const res = await createAxiosClient().get('/customers/');
      return res.data || [];
    } catch {
      return localStore.customers;
    }
  },

  getById: async (id: number): Promise<Customer> => {
    try {
      const res = await createAxiosClient().get(`/customers/${id}`);
      return res.data;
    } catch {
      const c = localStore.customers.find((i) => i.id === id);
      if (!c) throw new Error('Mijoz topilmadi');
      return c;
    }
  },

  create: async (data: Omit<Customer, 'id'>): Promise<Customer> => {
    if (isDemoModeActive()) {
      const newC: Customer = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.customers.unshift(newC);
      localStore.saveToStorage();
      return newC;
    }
    try {
      const res = await createAxiosClient().post('/customers/', data);
      return res.data;
    } catch {
      const newC: Customer = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.customers.unshift(newC);
      localStore.saveToStorage();
      return newC;
    }
  },

  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    if (isDemoModeActive()) {
      const idx = localStore.customers.findIndex((c) => c.id === id);
      if (idx !== -1) {
        localStore.customers[idx] = { ...localStore.customers[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.customers[idx];
      }
      throw new Error('Mijoz topilmadi');
    }
    try {
      const res = await createAxiosClient().put(`/customers/${id}`, { ...data, id });
      return res.data;
    } catch {
      const idx = localStore.customers.findIndex((c) => c.id === id);
      if (idx !== -1) {
        localStore.customers[idx] = { ...localStore.customers[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.customers[idx];
      }
      throw new Error('Mijoz topilmadi');
    }
  },

  delete: async (id: number): Promise<void> => {
    if (isDemoModeActive()) {
      localStore.customers = localStore.customers.filter((c) => c.id !== id);
      localStore.saveToStorage();
      return;
    }
    try {
      await createAxiosClient().delete(`/customers/${id}`);
    } catch {
      localStore.customers = localStore.customers.filter((c) => c.id !== id);
      localStore.saveToStorage();
    }
  },
};

// ===================== EMPLOYEES API =====================
export const EmployeeApi = {
  getAll: async (): Promise<Employee[]> => {
    if (isDemoModeActive()) return localStore.employees;
    try {
      const res = await createAxiosClient().get('/employees/');
      return res.data || [];
    } catch {
      return localStore.employees;
    }
  },

  getById: async (id: number): Promise<Employee> => {
    try {
      const res = await createAxiosClient().get(`/employees/${id}`);
      return res.data;
    } catch {
      const e = localStore.employees.find((i) => i.id === id);
      if (!e) throw new Error('Xodim topilmadi');
      return e;
    }
  },

  create: async (data: Omit<Employee, 'id'>): Promise<Employee> => {
    if (isDemoModeActive()) {
      const newE: Employee = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.employees.unshift(newE);
      localStore.saveToStorage();
      return newE;
    }
    try {
      const res = await createAxiosClient().post('/employees/', data);
      return res.data;
    } catch {
      const newE: Employee = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.employees.unshift(newE);
      localStore.saveToStorage();
      return newE;
    }
  },

  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    if (isDemoModeActive()) {
      const idx = localStore.employees.findIndex((e) => e.id === id);
      if (idx !== -1) {
        localStore.employees[idx] = { ...localStore.employees[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.employees[idx];
      }
      throw new Error('Xodim topilmadi');
    }
    try {
      const res = await createAxiosClient().put(`/employees/${id}`, { ...data, id });
      return res.data;
    } catch {
      const idx = localStore.employees.findIndex((e) => e.id === id);
      if (idx !== -1) {
        localStore.employees[idx] = { ...localStore.employees[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.employees[idx];
      }
      throw new Error('Xodim topilmadi');
    }
  },

  delete: async (id: number): Promise<void> => {
    if (isDemoModeActive()) {
      localStore.employees = localStore.employees.filter((e) => e.id !== id);
      localStore.saveToStorage();
      return;
    }
    try {
      await createAxiosClient().delete(`/employees/${id}`);
    } catch {
      localStore.employees = localStore.employees.filter((e) => e.id !== id);
      localStore.saveToStorage();
    }
  },
};

// ===================== SALES API =====================
export const SaleApi = {
  getAll: async (): Promise<Sale[]> => {
    if (isDemoModeActive()) return localStore.sales;
    try {
      const res = await createAxiosClient().get('/sales/');
      return res.data || [];
    } catch {
      return localStore.sales;
    }
  },

  getById: async (id: number): Promise<Sale> => {
    try {
      const res = await createAxiosClient().get(`/sales/${id}`);
      return res.data;
    } catch {
      const s = localStore.sales.find((i) => i.id === id);
      if (!s) throw new Error('Sotuv topilmadi');
      return s;
    }
  },

  create: async (data: Omit<Sale, 'id'>): Promise<Sale> => {
    if (isDemoModeActive()) {
      const newS: Sale = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.sales.unshift(newS);
      localStore.saveToStorage();
      return newS;
    }
    try {
      const res = await createAxiosClient().post('/sales/', data);
      return res.data;
    } catch {
      const newS: Sale = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.sales.unshift(newS);
      localStore.saveToStorage();
      return newS;
    }
  },

  update: async (id: number, data: Partial<Sale>): Promise<Sale> => {
    if (isDemoModeActive()) {
      const idx = localStore.sales.findIndex((s) => s.id === id);
      if (idx !== -1) {
        localStore.sales[idx] = { ...localStore.sales[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.sales[idx];
      }
      throw new Error('Sotuv topilmadi');
    }
    try {
      const res = await createAxiosClient().put(`/sales/${id}`, { ...data, id });
      return res.data;
    } catch {
      const idx = localStore.sales.findIndex((s) => s.id === id);
      if (idx !== -1) {
        localStore.sales[idx] = { ...localStore.sales[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.sales[idx];
      }
      throw new Error('Sotuv topilmadi');
    }
  },

  delete: async (id: number): Promise<void> => {
    if (isDemoModeActive()) {
      localStore.sales = localStore.sales.filter((s) => s.id !== id);
      localStore.saleItems = localStore.saleItems.filter((i) => i.sale_id !== id);
      localStore.payments = localStore.payments.filter((p) => p.sale_id !== id);
      localStore.saveToStorage();
      return;
    }
    try {
      await createAxiosClient().delete(`/sales/${id}`);
    } catch {
      localStore.sales = localStore.sales.filter((s) => s.id !== id);
      localStore.saleItems = localStore.saleItems.filter((i) => i.sale_id !== id);
      localStore.payments = localStore.payments.filter((p) => p.sale_id !== id);
      localStore.saveToStorage();
    }
  },
};

// ===================== SALE ITEMS API =====================
export const SaleItemApi = {
  getAll: async (): Promise<SaleItem[]> => {
    if (isDemoModeActive()) return localStore.saleItems;
    try {
      const res = await createAxiosClient().get('/sale-items/');
      return res.data || [];
    } catch {
      return localStore.saleItems;
    }
  },

  getBySaleId: async (saleId: number): Promise<SaleItem[]> => {
    if (isDemoModeActive()) {
      return localStore.saleItems.filter((item) => item.sale_id === saleId);
    }
    try {
      const res = await createAxiosClient().get(`/sale-items/?sale_id=${saleId}`);
      return res.data || [];
    } catch {
      return localStore.saleItems.filter((item) => item.sale_id === saleId);
    }
  },

  create: async (data: Omit<SaleItem, 'id'>): Promise<SaleItem> => {
    if (isDemoModeActive()) {
      const newItem: SaleItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.saleItems.push(newItem);
      localStore.saveToStorage();
      return newItem;
    }
    try {
      const res = await createAxiosClient().post('/sale-items/', data);
      return res.data;
    } catch {
      const newItem: SaleItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        ...data,
        created_at: new Date().toISOString(),
      };
      localStore.saleItems.push(newItem);
      localStore.saveToStorage();
      return newItem;
    }
  },

  delete: async (id: number): Promise<void> => {
    if (isDemoModeActive()) {
      localStore.saleItems = localStore.saleItems.filter((i) => i.id !== id);
      localStore.saveToStorage();
      return;
    }
    try {
      await createAxiosClient().delete(`/sale-items/${id}`);
    } catch {
      localStore.saleItems = localStore.saleItems.filter((i) => i.id !== id);
      localStore.saveToStorage();
    }
  },
};

// ===================== PAYMENTS API =====================
export const PaymentApi = {
  getAll: async (): Promise<Payment[]> => {
    if (isDemoModeActive()) return localStore.payments;
    try {
      const res = await createAxiosClient().get('/payments/');
      return res.data || [];
    } catch {
      return localStore.payments;
    }
  },

  getById: async (id: number): Promise<Payment> => {
    try {
      const res = await createAxiosClient().get(`/payments/${id}`);
      return res.data;
    } catch {
      const p = localStore.payments.find((i) => i.id === id);
      if (!p) throw new Error('To‘lov topilmadi');
      return p;
    }
  },

  create: async (data: Omit<Payment, 'id'>): Promise<Payment> => {
    if (isDemoModeActive()) {
      const newP: Payment = {
        id: Date.now(),
        ...data,
        paid_at: new Date().toISOString(),
      };
      localStore.payments.unshift(newP);
      localStore.saveToStorage();
      return newP;
    }
    try {
      const res = await createAxiosClient().post('/payments/', data);
      return res.data;
    } catch {
      const newP: Payment = {
        id: Date.now(),
        ...data,
        paid_at: new Date().toISOString(),
      };
      localStore.payments.unshift(newP);
      localStore.saveToStorage();
      return newP;
    }
  },

  update: async (id: number, data: Partial<Payment>): Promise<Payment> => {
    if (isDemoModeActive()) {
      const idx = localStore.payments.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localStore.payments[idx] = { ...localStore.payments[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.payments[idx];
      }
      throw new Error('To‘lov topilmadi');
    }
    try {
      const res = await createAxiosClient().put(`/payments/${id}`, { ...data, id });
      return res.data;
    } catch {
      const idx = localStore.payments.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localStore.payments[idx] = { ...localStore.payments[idx], ...data, id };
        localStore.saveToStorage();
        return localStore.payments[idx];
      }
      throw new Error('To‘lov topilmadi');
    }
  },

  delete: async (id: number): Promise<void> => {
    if (isDemoModeActive()) {
      localStore.payments = localStore.payments.filter((p) => p.id !== id);
      localStore.saveToStorage();
      return;
    }
    try {
      await createAxiosClient().delete(`/payments/${id}`);
    } catch {
      localStore.payments = localStore.payments.filter((p) => p.id !== id);
      localStore.saveToStorage();
    }
  },
};

