import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Employee } from '../types';
import { EmployeeApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Banknote,
  Shield,
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { employees, formatPrice, formatDate, refreshAll, addToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'CASHIER',
    status: 'ACTIVE',
    salary: 5000000,
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchQuery.toLowerCase();
      const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.id.toString() === searchQuery.trim()
      );
    });
  }, [employees, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone: '+998 ',
      role: 'CASHIER',
      status: 'ACTIVE',
      salary: 5000000,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      phone: emp.phone,
      role: emp.role,
      status: emp.status,
      salary: emp.salary,
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      addToast("Xodim ism va familiyasini to'liq kiriting", 'warning');
      return;
    }
    try {
      await EmployeeApi.create({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
        salary: Number(formData.salary),
      });
      addToast("Xodim muvaffaqiyatli qo'shildi", 'success');
      setIsAddOpen(false);
      await refreshAll();
    } catch {
      addToast("Xodim qo'shishda xatolik", 'error');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      await EmployeeApi.update(editingEmployee.id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
        salary: Number(formData.salary),
      });
      addToast("Xodim ma'lumotlari yangilandi", 'success');
      setEditingEmployee(null);
      await refreshAll();
    } catch {
      addToast("Xodim ma'lumotlarini tahrirlashda xatolik", 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingEmpId) return;
    try {
      await EmployeeApi.delete(deletingEmpId);
      addToast("Xodim o'chirildi", 'info');
      setDeletingEmpId(null);
      await refreshAll();
    } catch {
      addToast("Xodimni o'chirishda xatolik", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-purple-600" />
            Do'kon Xodimlari
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kassirlar, administratorlar va do'kon xodimlari shtati
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Xodim</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ism, familiya yoki lavozim bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">F.I.SH</th>
                <th className="py-3.5 px-4">Lavozim (Rol)</th>
                <th className="py-3.5 px-4">Telefon</th>
                <th className="py-3.5 px-4 text-right">Oylik Maosh</th>
                <th className="py-3.5 px-4 text-center">Holat</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Xodimlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                      #{e.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {e.first_name} {e.last_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        e.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800'
                          : e.role === 'MANAGER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {e.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {e.phone || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatPrice(e.salary)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {e.status === 'ACTIVE' ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Faol
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Nofaol
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(e)}
                          title="Tahrirlash"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingEmpId(e.id)}
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

      {/* MODAL: Add / Edit Employee */}
      <Modal
        isOpen={isAddOpen || !!editingEmployee}
        onClose={() => {
          setIsAddOpen(false);
          setEditingEmployee(null);
        }}
        title={editingEmployee ? 'Xodimni Tahrirlash' : 'Yangi Xodim Qo\'shish'}
        maxWidth="md"
      >
        <form onSubmit={editingEmployee ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ismi:
              </label>
              <input
                type="text"
                required
                placeholder="Jasur"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Familiyasi:
              </label>
              <input
                type="text"
                required
                placeholder="Karimov"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefon:
              </label>
              <input
                type="text"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lavozimi (Rol):
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="CASHIER">CASHIER (Kassir)</option>
                <option value="MANAGER">MANAGER (Menejer)</option>
                <option value="ADMIN">ADMIN (Administrator)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oylik Maosh (so'm):
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                value={formData.salary || ''}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Holati:
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ACTIVE">ACTIVE (Faol)</option>
                <option value="INACTIVE">INACTIVE (Nofaol)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingEmployee(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20"
            >
              {editingEmployee ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal
        isOpen={!!deletingEmpId}
        onClose={() => setDeletingEmpId(null)}
        title="Xodimni O'chirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Ushbu xodimni ro'yxatdan o'chirishga ishonchingiz komilmi?
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingEmpId(null)}
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

