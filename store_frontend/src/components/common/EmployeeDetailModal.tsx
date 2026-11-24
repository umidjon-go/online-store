import React, { useState } from 'react';
import { Employee } from '../../types';
import { EmployeeApi } from '../../services/api';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Phone,
  Banknote,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: number) => void;
  isAdmin: boolean;
  formatPrice: (val?: number | null) => string;
  formatDate: (val?: string | null) => string;
  onEmployeeUpdated?: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isAdmin,
  formatPrice,
  formatDate,
  onEmployeeUpdated,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const [passUpdateMsg, setPassUpdateMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen || !employee) return null;

  const currentPassword = employee.plain_password || employee.password || 'kassir123';

  const handleCopyPassword = () => {
    if (!currentPassword) return;
    navigator.clipboard.writeText(currentPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setIsSubmittingPass(true);
    setPassUpdateMsg(null);
    try {
      await EmployeeApi.update(employee.id, {
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        salary: employee.salary,
        password: newPassword.trim(),
      });
      employee.password = newPassword.trim();
      employee.plain_password = newPassword.trim();
      setPassUpdateMsg({ text: 'Parol muvaffaqiyatli yangilandi!', success: true });
      setNewPassword('');
      setIsChangingPass(false);
      if (onEmployeeUpdated) onEmployeeUpdated();
      setTimeout(() => setPassUpdateMsg(null), 3000);
    } catch {
      setPassUpdateMsg({ text: 'Parolni yangilashda xatolik yuz berdi', success: false });
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return {
          title: 'Bosh Administrator (ADMIN)',
          desc: 'Tizimning barcha bo‘limlari, xodimlar maoshi, rollar va hisobotlar ustidan to‘liq nazorat huquqiga ega.',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          avatarBg: 'bg-gradient-to-br from-rose-500 to-red-600',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
        };
      case 'MANAGER':
        return {
          title: 'Menejer (MANAGER)',
          desc: 'Ombor mahsulotlari, tovar qoldiqlari, narxlar va savdo kassa aylanmasini boshqarish huquqiga ega.',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          avatarBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
        };
      default:
        return {
          title: 'Kassir-Operator (CASHIER)',
          desc: 'POS kassa orqali savdolarni rasmiylashtirish va faqat o‘ziga biriktirilgan mijozlar bilan ishlash huquqiga ega.',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
        };
    }
  };

  const roleInfo = getRoleBadge(employee.role);
  const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-slate-900 p-6 sm:p-7 text-white overflow-hidden">
          {/* Background decorative blob */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={`w-16 h-16 rounded-2xl ${roleInfo.avatarBg} text-white font-extrabold text-xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0`}
            >
              {initials || <UserCheck className="w-8 h-8" />}
            </div>

            {/* Name & ID */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-300 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                  ID #{employee.id}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    employee.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {employee.status === 'ACTIVE' ? '● Faol' : '● Nofaol'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 text-white truncate">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">{roleInfo.title}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                  Telefon Raqami
                </span>
                <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
                  {employee.phone || '-'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
            </div>

            {/* Salary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                  Oylik Maoshi
                </span>
                <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">
                  {formatPrice(employee.salary)}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Banknote className="w-4 h-4" />
              </div>
            </div>

            {/* Role & Privileges */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  Ruxsatlar va Vazifasi
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleInfo.badgeBg}`}>
                  {employee.role}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{roleInfo.desc}</p>
            </div>

            {/* Dates */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Ro'yxatdan o'tgan:
              </span>
              <span className="font-medium text-slate-700">{formatDate(employee.created_at)}</span>
            </div>
          </div>

          {/* ================= MAXFIY PAROL BO'LIMI ================= */}
          <div className="rounded-2xl border p-4 transition-all duration-200 bg-gradient-to-br from-slate-50 to-purple-50/30 border-purple-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Tizimga Kirish Paroli
                  </h4>
                  <p className="text-[10px] text-slate-400">Login va avtorizatsiya kaliti</p>
                </div>
              </div>

              {/* Permission pill */}
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                {isAdmin ? 'Faqat Admin Ko‘radi' : 'Ruxsat Cheklangan'}
              </span>
            </div>

            {isAdmin ? (
              /* ADMIN KO'RISHI MUMKIN */
              <div className="space-y-3 mt-3">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-purple-100 shadow-xs">
                  <Lock className="w-4 h-4 text-purple-600 shrink-0 ml-1" />
                  <div className="flex-1 font-mono text-sm font-black text-slate-900 tracking-wider">
                    {showPassword ? (
                      <span className="text-purple-700 selection:bg-purple-100">{currentPassword}</span>
                    ) : (
                      <span className="text-slate-400 text-base">••••••••••••</span>
                    )}
                  </div>

                  {/* Toggle Show/Hide button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {/* Copy button */}
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    title="Paroldan nusxa olish"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nusxa</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Change Password toggle & Form */}
                {!isChangingPass ? (
                  <button
                    type="button"
                    onClick={() => setIsChangingPass(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ushbu xodimning parolini o'zgartirish (reset)</span>
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-2 pt-2 border-t border-purple-100">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Yangi parol kiriting:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Yangi parol..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingPass || !newPassword.trim()}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                      >
                        {isSubmittingPass ? 'Saqlanmoqda...' : 'Saqlash'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPass(false);
                          setNewPassword('');
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        Bekor
                      </button>
                    </div>
                  </form>
                )}

                {passUpdateMsg && (
                  <div
                    className={`text-xs font-semibold p-2 rounded-lg ${
                      passUpdateMsg.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {passUpdateMsg.text}
                  </div>
                )}
              </div>
            ) : (
              /* NOT ADMIN - PAROL BERKITILGAN */
              <div className="p-3 bg-white/80 rounded-xl border border-rose-200 mt-2 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-rose-700 font-semibold block mb-0.5">Xavfsizlik chegarasi:</strong>
                  Xodimning kirish parolini ko'rish faqat <strong>Bosh Administrator (ADMIN)</strong> ruxsatiga ega.
                  Boshqa rollar uchun parollar shifrlangan va yopiq holda saqlanadi.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isAdmin && onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(employee);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Tahrirlash</span>
                </button>
              )}
              {isAdmin && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(employee.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>O'chirish</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

