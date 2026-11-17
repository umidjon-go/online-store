import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Customer } from '../types';
import { SaleApi, SaleItemApi, PaymentApi, CustomerApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Printer,
  UserPlus,
  Package,
  Layers,
  ArrowRight,
  User,
  ShieldCheck,
} from 'lucide-react';

export const PosPage: React.FC = () => {
  const {
    products,
    categories,
    customers,
    employees,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    formatPrice,
    addToast,
    refreshAll,
  } = useStore();

  // Search & Category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');

  // Checkout state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    customers.length > 0 ? customers[0].id : 1
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(
    employees.length > 0 ? employees[0].id : 1
  );
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment form inside Checkout Modal
  const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'CLICK' | 'PAYME'>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Last finished sale for receipt
  const [completedSaleData, setCompletedSaleData] = useState<{
    saleId: number;
    items: typeof cart;
    subtotal: number;
    discount: number;
    total: number;
    cashReceived: number;
    change: number;
    paymentType: string;
    customerName: string;
    employeeName: string;
    date: string;
  } | null>(null);

  // New customer form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString() === searchQuery.trim();
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const changeAmount = paymentType === 'CASH' && cashReceived > finalTotal ? cashReceived - finalTotal : 0;

  // Handle Quick Add Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      addToast('Mijoz ismini kiriting', 'warning');
      return;
    }
    try {
      const newCust = await CustomerApi.create({
        full_name: newCustName.trim(),
        phone: newCustPhone.trim() || '+998 90 000 00 00',
        email: newCustEmail.trim() || 'mijoz@tezbozor.uz',
        status: 'ACTIVE',
      });
      addToast("Yangi mijoz muvaffaqiyatli qo'shildi", 'success');
      await refreshAll();
      setSelectedCustomerId(newCust.id);
      setIsNewCustomerOpen(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
    } catch {
      addToast("Mijoz qo'shishda xatolik", 'error');
    }
  };

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      addToast("Savatcha bo'sh! Avval mahsulot tanlang.", 'warning');
      return;
    }
    setCashReceived(finalTotal);
    setIsCheckoutOpen(true);
  };

  // Process Checkout Transaction
  const handleConfirmCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Create Sale
      const newSale = await SaleApi.create({
        customer_id: selectedCustomerId,
        employee_id: selectedEmployeeId,
        total_amount: cartSubtotal,
        discount: discountAmount,
        status: 'COMPLETED',
      });

      const saleId = newSale.id;

      // 2. Create Sale Items
      for (const item of cart) {
        await SaleItemApi.create({
          sale_id: saleId,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
        });
      }

      // 3. Create Payment
      await PaymentApi.create({
        sale_id: saleId,
        amount: finalTotal,
        payment_type: paymentType,
        status: 'COMPLETED',
      });

      // Prepare receipt data
      const cust = customers.find((c) => c.id === selectedCustomerId);
      const emp = employees.find((e) => e.id === selectedEmployeeId);

      setCompletedSaleData({
        saleId,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: discountAmount,
        total: finalTotal,
        cashReceived: paymentType === 'CASH' ? cashReceived : finalTotal,
        change: changeAmount,
        paymentType,
        customerName: cust ? cust.full_name : 'Umumiy Xaridor',
        employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Kassir',
        date: new Date().toLocaleString('uz-UZ'),
      });

      // Refresh data to sync stock
      await refreshAll();

      clearCart();
      setDiscountAmount(0);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
      addToast("Savdo muvaffaqiyatli amalga oshirildi va saqlandi!", 'success');
    } catch (err) {
      console.error('Checkout error:', err);
      addToast("Savdoni rasmiylashtirishda xatolik yuz berdi", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* LEFT: Product Catalog */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mahsulot nomi yoki kodi bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Barcha tovarlar ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.category_id === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                    selectedCategory === c.id
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Package className="w-10 h-10 stroke-1" />
              <p className="text-sm">Bunday mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const inCart = cart.find((item) => item.product.id === p.id);
                const isOutOfStock = p.quantity <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`relative p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 group ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          p.quantity <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : p.quantity < 10
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.quantity <= 0 ? 'Tugagan' : `${p.quantity} dona`}
                        </span>
                        {inCart && (
                          <span className="bg-blue-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                            x{inCart.quantity}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-600">
                        {formatPrice(p.price)}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart & Cash Register Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">Kassa Savati</h3>
            <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} dona
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tozalash
            </button>
          )}
        </div>

        {/* Customer & Cashier selection */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/30 space-y-2 text-xs">
          {/* Customer */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Mijoz:
            </span>
            <div className="flex items-center gap-1 flex-1 justify-end">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium max-w-[170px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.phone})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsNewCustomerOpen(true)}
                title="Yangi mijoz qo'shish"
                className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cashier */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Kassir:
            </span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium max-w-[200px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.first_name} {e.last_name} ({e.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
              <ShoppingCart className="w-8 h-8 stroke-1 text-slate-300" />
              <p className="text-xs">Savatchada mahsulot yo'q</p>
              <p className="text-[11px] text-slate-400">Chap tomondan tovarlarni tanlang</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatPrice(item.unitPrice)}
                  </div>
                </div>

                {/* Counter */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right w-20 shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculation & Checkout Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Tovarlar summasi:</span>
            <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
          </div>

          {/* Discount input */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Chegirma (so'm):</span>
            <input
              type="number"
              min="0"
              max={cartSubtotal}
              step="1000"
              value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-28 text-right px-2 py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Final Total */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Jami to'lov:</span>
            <span className="text-lg font-extrabold text-blue-600">
              {formatPrice(finalTotal)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleOpenCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:scale-[1.01]'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>To'lovni Qabul Qilish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL: Checkout / Payment Selection */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="To'lovni Rasmiylashtirish"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-700 font-medium">To'lanishi lozim summa:</span>
              <div className="text-2xl font-black text-blue-900">
                {formatPrice(finalTotal)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Chegirma: {formatPrice(discountAmount)}</div>
              <div>Tovarlar: {cart.length} xil</div>
            </div>
          </div>

          {/* Payment Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              To'lov Turini Tanlang:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentType('CASH')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  paymentType === 'CASH'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Naqd Pul (CASH)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('CARD')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  paymentType === 'CARD'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Bank Kartasi (Uzcard/Humo)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('CLICK')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  paymentType === 'CLICK'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>Click</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('PAYME')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  paymentType === 'PAYME'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span>Payme</span>
              </button>
            </div>
          </div>

          {/* If Cash: Received & Change calculation */}
          {paymentType === 'CASH' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mijoz bergan naqd summa (so'm):
                </label>
                <input
                  type="number"
                  min={finalTotal}
                  step="1000"
                  value={cashReceived || ''}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-medium text-slate-600">Qaytim (Сдача):</span>
                <span className="font-extrabold text-sm text-emerald-600">
                  {formatPrice(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Submit Checkout */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmCheckout}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Bajarilmoqda...' : 'Tasdiqlash & Chek'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Printable Receipt */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Savdo Cheki (Kvitansiya)"
        maxWidth="md"
      >
        {completedSaleData && (
          <div className="space-y-4">
            {/* Printable Container */}
            <div
              id="printable-receipt"
              className="p-6 bg-white border border-dashed border-slate-300 rounded-xl font-mono text-xs text-slate-800 space-y-3"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h2 className="text-base font-black tracking-widest text-slate-900 uppercase">
                  TEZBOZOR
                </h2>
                <p className="text-[10px] text-slate-500">Savdo va Do'kon Tizimi</p>
                <p className="text-[10px] text-slate-500">Toshkent sh., O'zbekiston</p>
              </div>

              <div className="text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Chek raqami:</span>
                  <span className="font-bold text-slate-900">#{completedSaleData.saleId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sana:</span>
                  <span>{completedSaleData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kassir:</span>
                  <span>{completedSaleData.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mijoz:</span>
                  <span>{completedSaleData.customerName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-2 border-y border-dashed border-slate-300 space-y-1.5">
                <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
                  <span>Mahsulot</span>
                  <span>Jami</span>
                </div>
                {completedSaleData.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div className="flex-1 pr-2 truncate">
                      {it.product.name} <span className="text-slate-400">x{it.quantity}</span>
                    </div>
                    <span className="font-semibold shrink-0">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Jami tovarlar:</span>
                  <span>{formatPrice(completedSaleData.subtotal)}</span>
                </div>
                {completedSaleData.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Chegirma:</span>
                    <span>-{formatPrice(completedSaleData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>TO'LANDI:</span>
                  <span>{formatPrice(completedSaleData.total)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>To'lov turi:</span>
                  <span className="font-bold uppercase">{completedSaleData.paymentType}</span>
                </div>
                {completedSaleData.paymentType === 'CASH' && (
                  <>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Qabul qilindi:</span>
                      <span>{formatPrice(completedSaleData.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold text-[10px]">
                      <span>Qaytim:</span>
                      <span>{formatPrice(completedSaleData.change)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400">
                Xaridingiz uchun rahmat! Yana kutib qolamiz.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Chop etish (Print)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Yangi savdo boshlash
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Quick Add Customer */}
      <Modal
        isOpen={isNewCustomerOpen}
        onClose={() => setIsNewCustomerOpen(false)}
        title="Yangi Mijoz Qo'shish"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              F.I.SH (To'liq ism):
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Sardor Aliyev"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Telefon raqami:
            </label>
            <input
              type="text"
              placeholder="+998 90 123 45 67"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email (ixtiyoriy):
            </label>
            <input
              type="email"
              placeholder="sardor@gmail.com"
              value={newCustEmail}
              onChange={(e) => setNewCustEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewCustomerOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              Qo'shish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

