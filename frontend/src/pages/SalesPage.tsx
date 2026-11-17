import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Sale, SaleItem, Payment } from '../types';
import { SaleApi, SaleItemApi, PaymentApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import {
  Receipt,
  Search,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Eye,
  Trash2,
  Printer,
  Calendar,
  Filter,
  User,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  const {
    sales,
    customers,
    employees,
    products,
    formatPrice,
    formatDate,
    refreshAll,
    addToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Detail Modal state
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [salePayment, setSalePayment] = useState<Payment | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Delete modal state
  const [deletingSaleId, setDeletingSaleId] = useState<number | null>(null);

  const getCustomerName = (id: number) => {
    const c = customers.find((cust) => cust.id === id);
    return c ? c.full_name : `Mijoz #${id || 'Umumiy'}`;
  };

  const getEmployeeName = (id: number) => {
    const e = employees.find((emp) => emp.id === id);
    return e ? `${e.first_name} ${e.last_name}` : `Kassir #${id || 'Nomaʼlum'}`;
  };

  const getProductName = (id: number) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.name : `Mahsulot #${id}`;
  };

  const filteredSales = useMemo(() => {
    return sales
      .filter((s) => {
        const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
        const custName = getCustomerName(s.customer_id).toLowerCase();
        const matchQuery =
          custName.includes(searchQuery.toLowerCase()) ||
          s.id.toString() === searchQuery.trim();
        return matchStatus && matchQuery;
      })
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [sales, selectedStatus, searchQuery, customers]);

  const handleOpenDetails = async (sale: Sale) => {
    setViewingSale(sale);
    setIsLoadingDetails(true);
    try {
      const [items, payments] = await Promise.all([
        SaleItemApi.getBySaleId(sale.id),
        PaymentApi.getAll(),
      ]);
      setSaleItems(items || []);
      const matchedPayment = payments.find((p) => p.sale_id === sale.id) || null;
      setSalePayment(matchedPayment);
    } catch (err) {
      console.error('Failed to load sale details', err);
      addToast('Sotuv tafsilotlarini yuklashda xatolik', 'error');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'COMPLETED' | 'CANCELLED' | 'PENDING') => {
    if (!viewingSale) return;
    try {
      await SaleApi.update(viewingSale.id, { status: newStatus });
      addToast(`Sotuv holati "${newStatus}"ga o'zgartirildi`, 'success');
      setViewingSale({ ...viewingSale, status: newStatus });
      await refreshAll();
    } catch {
      addToast('Holatni yangilashda xatolik', 'error');
    }
  };

  const handleDeleteSale = async () => {
    if (!deletingSaleId) return;
    try {
      await SaleApi.delete(deletingSaleId);
      addToast("Sotuv o'chirildi", 'info');
      setDeletingSaleId(null);
      if (viewingSale?.id === deletingSaleId) {
        setViewingSale(null);
      }
      await refreshAll();
    } catch {
      addToast("Sotuvni o'chirishda xatolik", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-blue-600" />
            Sotuvlar Tarixi va Jurnali
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Barcha amalga oshirilgan tranzaksiyalar, cheklar va savdo pozitsiyalari
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Chek № yoki mijoz bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Barcha Holatlar</option>
            <option value="COMPLETED">To'langan (COMPLETED)</option>
            <option value="PENDING">Kutilmoqda (PENDING)</option>
            <option value="CANCELLED">Bekor qilingan (CANCELLED)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Chek №</th>
                <th className="py-3.5 px-4">Xaridor</th>
                <th className="py-3.5 px-4">Kassir</th>
                <th className="py-3.5 px-4 text-right">Summa</th>
                <th className="py-3.5 px-4 text-right">Chegirma</th>
                <th className="py-3.5 px-4 text-right">Jami To'lov</th>
                <th className="py-3.5 px-4 text-center">Holat</th>
                <th className="py-3.5 px-4">Sana</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Sotuvlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const netTotal = s.total_amount - (s.discount || 0);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        #{s.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {getCustomerName(s.customer_id)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {getEmployeeName(s.employee_id)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {formatPrice(s.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-medium">
                        {s.discount > 0 ? `-${formatPrice(s.discount)}` : '0'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatPrice(netTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            To'langan
                          </span>
                        ) : s.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <HelpCircle className="w-3 h-3" />
                            Kutilmoqda
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Bekor
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetails(s)}
                            title="Tafsilotlarni ko'rish"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSaleId(s.id)}
                            title="O'chirish"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Sale Details */}
      <Modal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        title={viewingSale ? `Chek № #${viewingSale.id} Tafsilotlari` : 'Sotuv Tafsilotlari'}
        maxWidth="lg"
      >
        {viewingSale && (
          <div className="space-y-5">
            {/* Meta header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">Xaridor:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {getCustomerName(viewingSale.customer_id)}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Kassir:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {getEmployeeName(viewingSale.employee_id)}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Sana:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {formatDate(viewingSale.created_at)}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Holat:</span>
                <p className="font-bold uppercase mt-0.5 text-blue-600">
                  {viewingSale.status}
                </p>
              </div>
            </div>

            {/* Sale Items Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sotilgan Mahsulotlar (Pozitsiyalar):
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Mahsulot</th>
                      <th className="py-2.5 px-3 text-center">Soni</th>
                      <th className="py-2.5 px-3 text-right">Dona narxi</th>
                      <th className="py-2.5 px-3 text-right">Jami</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingDetails ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          Yuklanmoqda...
                        </td>
                      </tr>
                    ) : saleItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          Ushbu sotuv bo'yicha tovarlar topilmadi
                        </td>
                      </tr>
                    ) : (
                      saleItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {getProductName(item.product_id)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {item.quantity} dona
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">
                            {formatPrice(item.unit_price)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatPrice(item.subtotal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500">To'lov usuli: </span>
                <span className="font-bold text-slate-800">
                  {salePayment ? salePayment.payment_type : 'Aniqlanmagan'}
                </span>
                {salePayment && (
                  <span className="ml-2 text-slate-400">
                    ({formatDate(salePayment.paid_at)})
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-500">Jami to'langan summa: </span>
                <span className="text-base font-black text-blue-600">
                  {formatPrice(viewingSale.total_amount - (viewingSale.discount || 0))}
                </span>
              </div>
            </div>

            {/* Status change actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">Holatni o'zgartirish:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition-colors"
                >
                  To'langan
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('PENDING')}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 transition-colors"
                >
                  Kutilmoqda
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 transition-colors"
                >
                  Bekor qilish
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop etish</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal
        isOpen={!!deletingSaleId}
        onClose={() => setDeletingSaleId(null)}
        title="Sotuvni O'chirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Ushbu sotuv chekini va unga biriktirilgan barcha tovar pozitsiyalarini o'chirishga ishonchingiz komilmi?
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingSaleId(null)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleDeleteSale}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Ha, o'chirilsin
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

