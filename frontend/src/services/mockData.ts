import { Category, Product, Customer, Employee, Sale, SaleItem, Payment } from '../types';

export const initialCategories: Category[] = [
  { id: 1, name: 'Elektronika & Smartfonlar', description: 'Zamonaviy smartfonlar, noutbuklar va gadjetlar' },
  { id: 2, name: 'Maishiy Texnika', description: 'Muzlatgich, televizor va oshxona anjomlari' },
  { id: 3, name: 'Kiyim-kechak & Poyabzal', description: 'Erkaklar, ayollar va bolalar kiyimlari' },
  { id: 4, name: 'Oziq-ovqat & Ichimliklar', description: 'Kundalik sifatli mahsulotlar' },
  { id: 5, name: 'Kantselyariya & Kitoblar', description: 'O‘quv va ofis qurollari' },
];

export const initialProducts: Product[] = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', category_id: 1, price: 14500000, quantity: 18, status: 'ACTIVE' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', category_id: 1, price: 13200000, quantity: 12, status: 'ACTIVE' },
  { id: 3, name: 'MacBook Air M2 13.6"', category_id: 1, price: 12800000, quantity: 7, status: 'ACTIVE' },
  { id: 4, name: 'AirPods Pro 2 (USB-C)', category_id: 1, price: 2900000, quantity: 25, status: 'ACTIVE' },
  { id: 5, name: 'LG Smart TV 55" 4K UHD', category_id: 2, price: 5800000, quantity: 5, status: 'ACTIVE' },
  { id: 6, name: 'Artel Muzlatgich Grand 330', category_id: 2, price: 4200000, quantity: 8, status: 'ACTIVE' },
  { id: 7, name: 'Erkaklar klassik kostyumi', category_id: 3, price: 850000, quantity: 30, status: 'ACTIVE' },
  { id: 8, name: 'Nike Air Monarch IV', category_id: 3, price: 650000, quantity: 15, status: 'ACTIVE' },
  { id: 9, name: 'Nestle Sut 3.2% 1L', category_id: 4, price: 14000, quantity: 120, status: 'ACTIVE' },
  { id: 10, name: 'Lavazza Qahva Donalari 1kg', category_id: 4, price: 280000, quantity: 4, status: 'ACTIVE' },
  { id: 11, name: 'Deli Qalamlar to‘plami 24 tali', category_id: 5, price: 45000, quantity: 50, status: 'ACTIVE' },
];

export const initialCustomers: Customer[] = [
  { id: 1, full_name: 'Alisher Qodirov', phone: '+998 90 123 45 67', email: 'alisher.qodirov@gmail.com', status: 'ACTIVE' },
  { id: 2, full_name: 'Dilnoza Karimova', phone: '+998 93 987 65 43', email: 'dilnoza.k@mail.ru', status: 'ACTIVE' },
  { id: 3, full_name: 'Jasur Bekmirzayev', phone: '+998 97 555 44 33', email: 'jasur.bek@gmail.com', status: 'ACTIVE' },
  { id: 4, full_name: 'Madina Umarova', phone: '+998 99 888 77 66', email: 'madina.u@yahoo.com', status: 'ACTIVE' },
  { id: 5, full_name: 'Shavkat Rashidov', phone: '+998 94 321 00 11', email: 'shavkat.r@tezbozor.uz', status: 'ACTIVE' },
];

export const initialEmployees: Employee[] = [
  { id: 1, first_name: 'Bobur', last_name: 'Rustamov', phone: '+998 90 111 22 33', role: 'ADMIN', status: 'ACTIVE', salary: 12000000 },
  { id: 2, first_name: 'Nodira', last_name: 'Sobirova', phone: '+998 91 222 33 44', role: 'CASHIER', status: 'ACTIVE', salary: 5500000 },
  { id: 3, first_name: 'Sanjar', last_name: 'Toirov', phone: '+998 93 333 44 55', role: 'CASHIER', status: 'ACTIVE', salary: 5200000 },
  { id: 4, first_name: 'Shahlo', last_name: 'Azizova', phone: '+998 97 444 55 66', role: 'MANAGER', status: 'ACTIVE', salary: 8000000 },
];

export const initialSales: Sale[] = [
  {
    id: 101,
    customer_id: 1,
    employee_id: 2,
    total_amount: 17400000,
    discount: 400000,
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 102,
    customer_id: 2,
    employee_id: 2,
    total_amount: 4200000,
    discount: 100000,
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 103,
    customer_id: 3,
    employee_id: 3,
    total_amount: 1500000,
    discount: 0,
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const initialSaleItems: SaleItem[] = [
  { id: 1, sale_id: 101, product_id: 1, quantity: 1, unit_price: 14500000, subtotal: 14500000 },
  { id: 2, sale_id: 101, product_id: 4, quantity: 1, unit_price: 2900000, subtotal: 2900000 },
  { id: 3, sale_id: 102, product_id: 6, quantity: 1, unit_price: 4200000, subtotal: 4200000 },
  { id: 4, sale_id: 103, product_id: 7, quantity: 1, unit_price: 850000, subtotal: 850000 },
  { id: 5, sale_id: 103, product_id: 8, quantity: 1, unit_price: 650000, subtotal: 650000 },
];

export const initialPayments: Payment[] = [
  { id: 1, sale_id: 101, amount: 17000000, payment_type: 'PAYME', status: 'COMPLETED', paid_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 2, sale_id: 102, amount: 4100000, payment_type: 'CARD', status: 'COMPLETED', paid_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 3, sale_id: 103, amount: 1500000, payment_type: 'CASH', status: 'PENDING', paid_at: new Date(Date.now() - 3600000 * 48).toISOString() },
];

