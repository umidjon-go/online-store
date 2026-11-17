import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { CategoryApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import { Layers, Plus, Edit2, Trash2, Package } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, products, refreshAll, addToast } = useStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormData({ name: c.name, description: c.description || '' });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Kategoriya nomini kiriting', 'warning');
      return;
    }
    try {
      await CategoryApi.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      addToast("Kategoriya muvaffaqiyatli qo'shildi", 'success');
      setIsAddOpen(false);
      await refreshAll();
    } catch {
      addToast("Kategoriya qo'shishda xatolik", 'error');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await CategoryApi.update(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      addToast("Kategoriya muvaffaqiyatli yangilandi", 'success');
      setEditingCategory(null);
      await refreshAll();
    } catch {
      addToast("Kategoriyani tahrirlashda xatolik", 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCatId) return;
    try {
      await CategoryApi.delete(deletingCatId);
      addToast("Kategoriya o'chirildi", 'info');
      setDeletingCatId(null);
      await refreshAll();
    } catch {
      addToast("Kategoriyani o'chirishda xatolik", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            Mahsulot Kategoriyalari
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Barcha bo'limlar va tovar turlarini tartibga solish
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Kategoriya</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => {
          const productCount = products.filter((p) => p.category_id === c.id).length;
          return (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      #{c.id}
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">{c.name}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                    <Package className="w-3 h-3 text-slate-400" />
                    {productCount} tovar
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {c.description || 'Tavsif berilmagan'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  onClick={() => setDeletingCatId(c.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>O'chirish</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Add / Edit Category */}
      <Modal
        isOpen={isAddOpen || !!editingCategory}
        onClose={() => {
          setIsAddOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Qo\'shish'}
        maxWidth="sm"
      >
        <form onSubmit={editingCategory ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategoriya Nomi:
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Maishiy Texnika"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tavsif (ixtiyoriy):
            </label>
            <textarea
              rows={3}
              placeholder="Kategoriya haqida qisqacha ma'lumot..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingCategory(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
            >
              {editingCategory ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal
        isOpen={!!deletingCatId}
        onClose={() => setDeletingCatId(null)}
        title="Kategoriyani O'chirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Ushbu kategoriyani o'chirishga ishonchingiz komilmi? Undagi mahsulotlar kategoriyasiz qolishi mumkin.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingCatId(null)}
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

