import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Payment } from '../types';
import { PaymentApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  HelpCircle,
  Banknote,
  Smartphone,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { payments, sales, formatPrice, formatDate, refreshAll, addToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    sale_id: sales.length > 0 ? sales[0].id : 1,
    amount: 100000,
    payment_type: 'CASH',
    status: 'COMPLETED',
  });

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchType = selectedType === 'ALL' || p.payment_type === selectedType;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchQuery =
        p.id.toString() === searchQuery.trim() ||
        p.sale_id.toString() === searchQuery.trim();
      return matchType && matchStatus && matchQuery;
    });
  }, [payments, selectedType, selectedStatus, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({
      sale_id: sales.length > 0 ? sales[0].id : 1,
      amount: 100000,
      payment_type: 'CASH',
      status: 'COMPLETED',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Payment) => {
    setEditingPayment(p);
    setFormData({
      sale_id: p.sale_id,
      amount: p.amount,
      payment_type: p.payment_type,
      status: p.status,
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PaymentApi.create({
        sale_id: Number(formData.sale_id),
        amount: Number(formData.amount),
        payment_type: formData.payment_type,
        status: formData.status,
      });
      addToast("To'lov muvaffaqiyatli saqlandi", 'success');
      setIsAddOpen(false);
      await refreshAll();
    } catch {
      addToast("To'lovni saqlashda xatolik", 'error');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    try {
      await PaymentApi.update(editingPayment.id, {
        sale_id: Number(formData.sale_id),
        amount: Number(formData.amount),
        payment_type: formData.payment_type,
        status: formData.status,
      });
      addToast("To'lov ma'lumotlari yangilandi", 'success');
      setEditingPayment(null);
      await refreshAll();
    } catch {
      addToast("To'lovni yangilashda xatolik", 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingPaymentId) return;
    try {
      await PaymentApi.delete(deletingPaymentId);
      addToast("To'lov o'chirildi", 'info');
      setDeletingPaymentId(null);
      await refreshAll();
    } catch {
      addToast("To'lovni o'chirishda xatolik", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-teal-600" />
            To'lovlar Jurnali
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Barcha kiruvchi to'lovlar, kassa va elektron to'lov tranzaksiyalari
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi To'lov</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="To'lov ID yoki Chek ID bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Barcha To'lov Turlari</option>
            <option value="CASH">Naqd Pul (CASH)</option>
            <option value="CARD">Bank Kartasi (CARD)</option>
            <option value="CLICK">Click</option>
            <option value="PAYME">Payme</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Barcha Holatlar</option>
            <option value="COMPLETED">Muvaffaqiyatli (COMPLETED)</option>
            <option value="PENDING">Kutilmoqda (PENDING)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">To'lov №</th>
                <th className="py-3.5 px-4">Chek ID</th>
                <th className="py-3.5 px-4">To'lov Turi</th>
                <th className="py-3.5 px-4 text-right">Summa</th>
                <th className="py-3.5 px-4 text-center">Holat</th>
                <th className="py-3.5 px-4">To'langan Vaqt</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    To'lovlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                      #{p.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      #{p.sale_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {p.payment_type === 'CASH' ? (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Banknote className="w-3.5 h-3.5" /> Naqd Pul
                          </span>
                        ) : p.payment_type === 'CARD' ? (
                          <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            <CreditCard className="w-3.5 h-3.5" /> Karta
                          </span>
                        ) : p.payment_type === 'CLICK' ? (
                          <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            <Smartphone className="w-3.5 h-3.5" /> Click
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            <Smartphone className="w-3.5 h-3.5" /> Payme
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          To'langan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <HelpCircle className="w-3 h-3" />
                          Kutilmoqda
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {formatDate(p.paid_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Tahrirlash"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPaymentId(p.id)}
                          title="O'chirish"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Payment */}
      <Modal
        isOpen={isAddOpen || !!editingPayment}
        onClose={() => {
          setIsAddOpen(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? 'To\'lovni Tahrirlash' : 'Yangi To\'lov Qo\'shish'}
        maxWidth="sm"
      >
        <form onSubmit={editingPayment ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chek (Sotuv) ID:
            </label>
            <input
              type="number"
              required
              value={formData.sale_id}
              onChange={(e) => setFormData({ ...formData, sale_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Summa (so'm):
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To'lov Turi:
              </label>
              <select
                value={formData.payment_type}
                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="CASH">CASH (Naqd)</option>
                <option value="CARD">CARD (Karta)</option>
                <option value="CLICK">CLICK</option>
                <option value="PAYME">PAYME</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Holati:
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="COMPLETED">COMPLETED (To'langan)</option>
                <option value="PENDING">PENDING (Kutilmoqda)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingPayment(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20"
            >
              {editingPayment ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal
        isOpen={!!deletingPaymentId}
        onClose={() => setDeletingPaymentId(null)}
        title="To'lovni O'chirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Ushbu to'lov yozuvini o'chirishga ishonchingiz komilmi?
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingPaymentId(null)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleDelete}
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

