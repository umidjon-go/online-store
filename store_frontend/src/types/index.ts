export interface Category {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  quantity: number;
  image_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'ADMIN' | 'CASHIER' | 'MANAGER' | string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  salary: number;
  password?: string;
  plain_password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'ADMIN' | 'CASHIER' | 'MANAGER' | string;
  status?: string;
  salary?: number;
}

export interface LoginResponse {
  token: string;
  employee: AuthUser;
}

export interface CheckoutPayload {
  customer_id: number;
  employee_id?: number;
  total_amount: number;
  discount: number;
  status: string;
  payment_type: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
  }[];
}

export interface Sale {
  id: number;
  customer_id: number;
  employee_id: number;
  total_amount: number;
  discount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED' | string;
  created_at?: string;
  updated_at?: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
  crated_at?: string; // support backend typo in tag
}

export interface Payment {
  id: number;
  sale_id: number;
  amount: number;
  payment_type: 'CASH' | 'CARD' | 'CLICK' | 'PAYME' | string;
  status: 'COMPLETED' | 'PENDING' | string;
  paid_at?: string;
}

// Cart item for POS
export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Dashboard Summary Stats
export interface DashboardStats {
  totalRevenue: number;
  totalSalesCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  totalCustomersCount: number;
  totalEmployeesCount: number;
}

