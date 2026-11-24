import { Category, Product, Customer, Employee, Sale, SaleItem, Payment } from '../types';

export const initialCategories: Category[] = [
  { id: 1, name: 'Elektronika & Smartfonlar', description: 'Zamonaviy smartfonlar, noutbuklar va gadjetlar' },
  { id: 2, name: 'Maishiy Texnika', description: 'Muzlatgich, televizor va oshxona anjomlari' },
  { id: 3, name: 'Kiyim-kechak & Poyabzal', description: 'Erkaklar, ayollar va bolalar kiyimlari' },
  { id: 4, name: 'Oziq-ovqat & Ichimliklar', description: 'Kundalik sifatli mahsulotlar' },
  { id: 5, name: 'Kantselyariya & Kitoblar', description: 'O‘quv va ofis qurollari' },
];

export const initialProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    category_id: 1,
    price: 14500000,
    quantity: 18,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    description: 'Titan korpus, A17 Pro kuchli protsessori, 48MP asosiy kamera va 5x optik zoom. 120Hz ProMotion OLED ekran.',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    category_id: 1,
    price: 13200000,
    quantity: 12,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    description: 'Galaxy AI sun\'iy intellekt texnologiyasi, 200MP kamera, o\'rnatilgan S-Pen qalam va Dynamic AMOLED 2X ekran.',
  },
  {
    id: 3,
    name: 'MacBook Air M2 13.6"',
    category_id: 1,
    price: 12800000,
    quantity: 7,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    description: 'Yengil va ingichka dizayn, Apple M2 chip, 18 soatgacha batareya quvvati, Liquid Retina yorqin displey.',
  },
  {
    id: 4,
    name: 'AirPods Pro 2 (USB-C)',
    category_id: 1,
    price: 2900000,
    quantity: 25,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    description: 'Faol shovqinni bekor qilish (ANC), Shaffoflik rejimi, Adaptiv audio va USB-C MagSafe g‘ilof.',
  },
  {
    id: 5,
    name: 'LG Smart TV 55" 4K UHD',
    category_id: 2,
    price: 5800000,
    quantity: 5,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
    description: '55 dyuymli 4K Ultra HD ekran, webOS aqlli tizimi, HDR10 Pro va immersiv ovoz texnologiyasi.',
  },
  {
    id: 6,
    name: 'Artel Muzlatgich Grand 330',
    category_id: 2,
    price: 4200000,
    quantity: 8,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    description: '330 litr hajm, No Frost tizimi, A+ energiya tejamkorligi va antibakterial himoya qoplamasi.',
  },
  {
    id: 7,
    name: 'Erkaklar klassik kostyumi',
    category_id: 3,
    price: 850000,
    quantity: 30,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    description: 'Premium sifatli tabiiy jundan tayyorlangan ikki qismli klassik kostyum (shim va pidjak).',
  },
  {
    id: 8,
    name: 'Nike Air Monarch IV',
    category_id: 3,
    price: 650000,
    quantity: 15,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    description: 'Har kuni kiyish uchun qulay krossovka. Bardoshli charm qoplama va yumshoq Air-Sole yostiqcha.',
  },
  {
    id: 9,
    name: 'Nestle Sut 3.2% 1L',
    category_id: 4,
    price: 14000,
    quantity: 120,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    description: 'Toza tabiiy pasterizatsiyalangan sigir suti. 3.2% yog‘lilik darajasi, vitaminlarga boy.',
  },
  {
    id: 10,
    name: 'Lavazza Qahva Donalari 1kg',
    category_id: 4,
    price: 280000,
    quantity: 4,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    description: 'Italiya espresso uchun 100% Arabica donalari. O‘rtacha qovurilgan, xushbo‘y va boy ta\'m.',
  },
  {
    id: 11,
    name: 'Deli Qalamlar to‘plami 24 tali',
    category_id: 5,
    price: 45000,
    quantity: 50,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    description: '24 xil rangdagi yorqin rangli qalamlar. Mustahkam uchi va yumshoq chizish xususiyati.',
  },
];

export const initialCustomers: Customer[] = [
  { id: 1, full_name: 'Alisher Qodirov', phone: '+998 90 123 45 67', email: 'alisher.qodirov@gmail.com', status: 'ACTIVE', created_by: 2 },
  { id: 2, full_name: 'Dilnoza Karimova', phone: '+998 93 987 65 43', email: 'dilnoza.k@mail.ru', status: 'ACTIVE', created_by: 2 },
  { id: 3, full_name: 'Jasur Bekmirzayev', phone: '+998 97 555 44 33', email: 'jasur.bek@gmail.com', status: 'ACTIVE', created_by: 1 },
  { id: 4, full_name: 'Madina Umarova', phone: '+998 99 888 77 66', email: 'madina.u@yahoo.com', status: 'ACTIVE', created_by: 1 },
  { id: 5, full_name: 'Shavkat Rashidov', phone: '+998 94 321 00 11', email: 'shavkat.r@tezbozor.uz', status: 'ACTIVE', created_by: 3 },
];

export const initialEmployees: Employee[] = [
  { id: 1, first_name: 'Bobur', last_name: 'Rustamov', phone: '+998 90 111 22 33', role: 'ADMIN', status: 'ACTIVE', salary: 12000000, password: 'admin123', plain_password: 'admin123' },
  { id: 2, first_name: 'Nodira', last_name: 'Sobirova', phone: '+998 91 222 33 44', role: 'CASHIER', status: 'ACTIVE', salary: 5500000, password: 'kassir123', plain_password: 'kassir123' },
  { id: 3, first_name: 'Sanjar', last_name: 'Toirov', phone: '+998 93 333 44 55', role: 'CASHIER', status: 'ACTIVE', salary: 5200000, password: 'kassir123', plain_password: 'kassir123' },
  { id: 4, first_name: 'Shahlo', last_name: 'Azizova', phone: '+998 97 444 55 66', role: 'MANAGER', status: 'ACTIVE', salary: 8000000, password: 'manager123', plain_password: 'manager123' },
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

