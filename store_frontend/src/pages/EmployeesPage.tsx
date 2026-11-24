import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Employee } from '../types';
import { EmployeeApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import { EmployeeDetailModal } from '../components/common/EmployeeDetailModal';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Banknote,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  ShoppingCart,
  LayoutGrid,
  List,
  Eye,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { employees, formatPrice, formatDate, refreshAll, addToast, currentUser } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState<Employee | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: 'CASHIER',
    status: 'ACTIVE',
    salary: 5000000,
  });

  const isCashier = currentUser?.role?.toUpperCase() === 'CASHIER';
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchQuery.toLowerCase();
      const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
      const matchQuery =
        fullName.includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.id.toString() === searchQuery.trim();
      const matchRole = selectedRole === 'ALL' || e.role?.toUpperCase() === selectedRole;
      return matchQuery && matchRole;
    });
  }, [employees, searchQuery, selectedRole]);

  const handleOpenAdd = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone: '+998 ',
      password: '',
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
      password: emp.plain_password || emp.password || '',
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
        password: formData.password.trim() || 'kassir123',
        role: formData.role,
        status: formData.status,
        salary: Number(formData.salary),
      } as any);
      addToast("Yangi xodim muvaffaqiyatli qo'shildi", 'success');
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
        password: formData.password.trim() || undefined,
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

  const getRoleStyle = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          avatarBg: 'bg-gradient-to-br from-rose-500 to-red-600',
          badgeText: 'ADMINISTRATOR',
          borderHover: 'hover:border-rose-400',
        };
      case 'MANAGER':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          avatarBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          badgeText: 'MENEJER',
          borderHover: 'hover:border-blue-400',
        };
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          badgeText: 'KASSIR',
          borderHover: 'hover:border-emerald-400',
        };
    }
  };

  if (isCashier) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-xs">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Ruxsat Cheklangan (403 Forbidden)</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Kassir lavozimidagi xodimlarga boshqa xodimlarni ko'rish yoki ularning ma'lumotlarini boshqarish huquqi berilmagan.
        </p>
        <Link
          to="/pos"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs shadow-blue-500/20"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Kassa bo'limiga o'tish</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-8 h-8 text-purple-600" />
            <span>Xodimlar Ro'yxati & Shtat Boshqaruvi</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? (
              <span className="flex items-center gap-1.5 text-purple-700 font-medium">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Administrator rejimida siz xodimlarning barcha ma'lumotlari va parollarini ko'rishingiz mumkin.
              </span>
            ) : (
              "Xodimlar, ularning lavozimlari va xizmat ma'lumotlari nazorati."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Xodim</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ism, familiya yoki telefon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Barcha Lavozimlar ({employees.length})</option>
            <option value="ADMIN">Administratorlar</option>
            <option value="MANAGER">Menejerlar</option>
            <option value="CASHIER">Kassirlar</option>
          </select>

          {/* View mode toggle: Grid vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Kartalar ko'rinishi"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartalar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Jadval ko'rinishi"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Jadval</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT: GRID CARDS OR TABLE */}
      {viewMode === 'grid' ? (
        /* ================= CARDS GRID VIEW ================= */
        filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <UserCheck className="w-10 h-10 stroke-1 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Mos keluvchi xodim topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((e) => {
              const roleStyle = getRoleStyle(e.role);
              const initials = `${e.first_name?.[0] || ''}${e.last_name?.[0] || ''}`.toUpperCase();

              return (
                <div
                  key={e.id}
                  onClick={() => setSelectedDetailEmployee(e)}
                  className={`group bg-white rounded-2xl border border-slate-200/90 p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${roleStyle.borderHover}`}
                >
                  <div>
                    {/* Top row: Avatar & Role badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${roleStyle.avatarBg} text-white font-extrabold text-base flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                      >
                        {initials}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full border ${roleStyle.bg}`}
                        >
                          {roleStyle.badgeText}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{e.id}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-purple-600 transition-colors">
                      {e.first_name} {e.last_name}
                    </h3>

                    {/* Phone */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{e.phone || '-'}</span>
                    </div>

                    {/* Password indicator badge if Admin */}
                    {isAdmin && (
                      <div className="mt-3 py-1.5 px-2.5 rounded-xl bg-purple-50/70 border border-purple-100/80 flex items-center justify-between text-[11px]">
                        <span className="text-purple-700 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-purple-500" />
                          Parol:
                        </span>
                        <span className="font-mono font-bold text-purple-900">
                          {e.plain_password || e.password || 'kassir123'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Salary & Status */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Oylik maosh:</span>
                      <span className="text-xs font-extrabold text-emerald-600">
                        {formatPrice(e.salary)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(eClick) => {
                          eClick.stopPropagation();
                          setSelectedDetailEmployee(e);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Batafsil</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Xodim (F.I.SH)</th>
                  <th className="py-3.5 px-4">Lavozim (Rol)</th>
                  <th className="py-3.5 px-4">Telefon</th>
                  {isAdmin && <th className="py-3.5 px-4">Tizim Paroli</th>}
                  <th className="py-3.5 px-4 text-right">Oylik Maosh</th>
                  <th className="py-3.5 px-4 text-center">Holat</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                      Xodimlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((e) => {
                    const roleStyle = getRoleStyle(e.role);
                    const initials = `${e.first_name?.[0] || ''}${e.last_name?.[0] || ''}`.toUpperCase();

                    return (
                      <tr
                        key={e.id}
                        onClick={() => setSelectedDetailEmployee(e)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                          #{e.id}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl ${roleStyle.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}
                            >
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                              {e.first_name} {e.last_name}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleStyle.bg}`}
                          >
                            <Shield className="w-3 h-3" />
                            {roleStyle.badgeText}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                          {e.phone || '-'}
                        </td>

                        {/* Parol ustuni (Faqat ADMIN uchun) */}
                        {isAdmin && (
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-purple-700">
                            <span className="bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                              {e.plain_password || e.password || 'kassir123'}
                            </span>
                          </td>
                        )}

                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
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
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedDetailEmployee(e)}
                              title="To'liq ma'lumotlar va parolni ko'rish"
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Batafsil</span>
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(e)}
                                  title="Tahrirlash"
                                  className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingEmpId(e.id)}
                                  title="O'chirish"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
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
      )}

      {/* MODAL: Employee Full Detail Dossier & Password View (Only Admin can see password) */}
      <EmployeeDetailModal
        employee={selectedDetailEmployee}
        isOpen={!!selectedDetailEmployee}
        onClose={() => setSelectedDetailEmployee(null)}
        onEdit={(emp) => handleOpenEdit(emp)}
        onDelete={(id) => setDeletingEmpId(id)}
        isAdmin={isAdmin}
        formatPrice={formatPrice}
        formatDate={formatDate}
        onEmployeeUpdated={refreshAll}
      />

      {/* MODAL: Add / Edit Employee */}
      <Modal
        isOpen={isAddOpen || !!editingEmployee}
        onClose={() => {
          setIsAddOpen(false);
          setEditingEmployee(null);
        }}
        title={editingEmployee ? "Xodim Ma'lumotlarini Tahrirlash" : "Yangi Xodim Qo'shish"}
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
                Telefon raqami:
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
                <option value="CASHIER">CASHIER (Kassir-Operator)</option>
                <option value="MANAGER">MANAGER (Menejer)</option>
                <option value="ADMIN">ADMIN (Bosh Administrator)</option>
              </select>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {editingEmployee ? "Yangi parol (o'zgartirish ixtiyoriy):" : "Tizimga kirish paroli:"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={editingEmployee ? "O'zgartirmaslik uchun bo'sh qoldiring" : "Masalan: kassir123"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {editingEmployee
                ? "Parol yozilsa, xodimning joriy kirish paroli yangilanadi."
                : "Bo'sh qoldirilsa, avtomatik 'kassir123' paroli o'rnatiladi."}
            </p>
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
            Ushbu xodimni tizimdan o'chirishga ishonchingiz komilmi? Bu amalni ortga qaytarib bo'lmaydi.
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
