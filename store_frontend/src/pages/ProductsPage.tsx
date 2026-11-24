import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ProductApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import { ProductDetailModal } from '../components/common/ProductDetailModal';
import { getProductImageUrl } from '../utils/productImages';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers,
  CheckCircle2,
  XCircle,
  Filter,
  ShoppingBag,
  ShoppingCart,
  LayoutGrid,
  List,
  Eye,
  Info,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const {
    products,
    categories,
    formatPrice,
    formatDate,
    refreshAll,
    addToast,
    addToCart,
    cart,
    currentUser,
  } = useStore();

  const isCustomer = currentUser?.role?.toUpperCase() === 'CUSTOMER';
  const isManager = currentUser?.role?.toUpperCase() === 'MANAGER';
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';
  const canManageProducts = isAdmin || isManager;

  // View Mode: 'grid' (Vitrina kartalar) or 'table' (Jadval)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Selected product for Detail & Quantity Modal
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category_id: categories.length > 0 ? categories[0].id : 1,
    price: 0,
    quantity: 0,
    status: 'ACTIVE',
    image_url: '',
    description: '',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString() === searchQuery.trim();
      return matchCat && matchStatus && matchQuery;
    });
  }, [products, selectedCategory, selectedStatus, searchQuery]);

  const getCategoryName = (id: number) => {
    const c = categories.find((cat) => cat.id === id);
    return c ? c.name : 'Boshqa';
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : 1,
      price: 0,
      quantity: 10,
      status: 'ACTIVE',
      image_url: '',
      description: '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      price: p.price,
      quantity: p.quantity,
      status: p.status,
      image_url: p.image_url || '',
      description: p.description || '',
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Mahsulot nomini kiriting', 'warning');
      return;
    }
    try {
      await ProductApi.create({
        name: formData.name.trim(),
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        status: formData.status,
        image_url: formData.image_url.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      addToast("Mahsulot muvaffaqiyatli qo'shildi", 'success');
      setIsAddOpen(false);
      await refreshAll();
    } catch {
      addToast("Mahsulot qo'shishda xatolik", 'error');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await ProductApi.update(editingProduct.id, {
        name: formData.name.trim(),
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        status: formData.status,
        image_url: formData.image_url.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      addToast("Mahsulot muvaffaqiyatli tahrirlandi", 'success');
      setEditingProduct(null);
      await refreshAll();
    } catch {
      addToast("Mahsulotni tahrirlashda xatolik", 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;
    try {
      await ProductApi.delete(deletingProductId);
      addToast("Mahsulot o'chirildi", 'info');
      setDeletingProductId(null);
      await refreshAll();
    } catch {
      addToast("Mahsulotni o'chirishda xatolik", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            {isCustomer ? (
              <>
                <ShoppingBag className="w-8 h-8 text-sky-600" />
                <span>Do'kon Vitrinasi (Onlayn Katalog)</span>
              </>
            ) : (
              <>
                <Package className="w-8 h-8 text-blue-600" />
                <span>Mahsulotlar Katalogi & Vitrina</span>
              </>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isCustomer
              ? "Mahsulotlarni ko'ring, ustiga bosib batafsil ma'lumot va kerakli miqdorni tanlang"
              : "Mahsulotlar suratlari, narxlari va ombor qoldig'i nazorati. Kartani bosib tafsilotlarni oching"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canManageProducts && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Mahsulot</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Cart Quick Banner */}
      {cart.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                Savatingizda {cart.reduce((s, i) => s + i.quantity, 0)} ta mahsulot mavjud
              </div>
              <div className="text-xs text-blue-100 font-medium">
                Jami to'lov: {formatPrice(cart.reduce((s, i) => s + i.subtotal, 0))}
              </div>
            </div>
          </div>
          <Link
            to="/pos"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-white text-blue-600 font-extrabold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <span>{isCustomer ? "Savatga o'tish & To'lash" : "Kassada rasmiylashtirish"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Filters & View Mode Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nomi yoki ID bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category & Status dropdowns + View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Barcha Kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Barcha Holatlar</option>
            <option value="ACTIVE">Faol (ACTIVE)</option>
            <option value="INACTIVE">Nofaol (INACTIVE)</option>
          </select>

          {/* View mode toggle: Grid vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vitrina ko'rinishi (Kartalar)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vitrina</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Jadval ko'rinishi"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Jadval</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA: GRID or TABLE */}
      {viewMode === 'grid' ? (
        /* ================= VITRINA GRID VIEW ================= */
        filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Package className="w-12 h-12 stroke-1 text-slate-300" />
            <p className="font-semibold text-slate-600">Mos keladigan mahsulot topilmadi</p>
            <p className="text-xs text-slate-400">Qidiruv so'zini yoki tanlangan kategoriyani o'zgartirib ko'ring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.product.id === p.id);
              const isOutOfStock = p.quantity <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedDetailProduct(p)}
                  className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60 bg-slate-50/50'
                      : 'border-slate-200 hover:border-blue-500'
                  }`}
                >
                  {/* Top Image Container */}
                  <div className="relative w-full h-48 bg-slate-50 p-4 flex items-center justify-center overflow-hidden group-hover:bg-blue-50/30 transition-colors">
                    <img
                      src={getProductImageUrl(p)}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg shadow-xs border border-slate-200/60">
                      {getCategoryName(p.category_id)}
                    </span>

                    {/* In-cart indicator */}
                    {inCart && (
                      <span className="absolute top-3 right-3 bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        <span>x{inCart.quantity}</span>
                      </span>
                    )}

                    {/* Stock badge */}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs ${
                          isOutOfStock
                            ? 'bg-rose-500 text-white'
                            : p.quantity < 10
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isOutOfStock ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Tugagan
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            {p.quantity} dona mavjud
                          </>
                        )}
                      </span>
                    </div>

                    {/* Quick view button on hover */}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Batafsil ko'rish
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Action Section */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Narxi:</div>
                        <div className="text-sm font-extrabold text-blue-600">
                          {formatPrice(p.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Manage buttons for Admin/Manager */}
                        {canManageProducts && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(p);
                            }}
                            title="Tahrirlash"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingProductId(p.id);
                            }}
                            title="O'chirish"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Open Detail & Quantity Selector */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailProduct(p);
                          }}
                          disabled={isOutOfStock}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isCustomer ? "Xarid" : "Tanlash"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ================= JADVAL (TABLE) VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Rasm</th>
                  <th className="py-3.5 px-4">Mahsulot Nomi</th>
                  <th className="py-3.5 px-4">Kategoriya</th>
                  <th className="py-3.5 px-4 text-right">Narxi</th>
                  <th className="py-3.5 px-4 text-center">Ombordagi Qoldiq</th>
                  <th className="py-3.5 px-4 text-center">Holat</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Mos keladigan mahsulot topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedDetailProduct(p)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200/80 p-1 flex items-center justify-center overflow-hidden mx-auto group-hover:border-blue-400 transition-colors">
                          <img
                            src={getProductImageUrl(p)}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      </td>

                      {/* Product Name & Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: #{p.id}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <span className="bg-slate-100 px-2 py-1 rounded-md font-medium">
                          {getCategoryName(p.category_id)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatPrice(p.price)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            p.quantity <= 0
                              ? 'bg-rose-100 text-rose-800'
                              : p.quantity < 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.quantity <= 0 && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          {p.quantity < 10 && p.quantity > 0 && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {p.quantity} dona
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {p.status === 'ACTIVE' ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Faol
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Nofaol
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedDetailProduct(p)}
                            disabled={p.quantity <= 0}
                            title="Tafsilotlar va xarid miqdorini tanlash"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                              p.quantity > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{p.quantity > 0 ? (isCustomer ? "Xarid qilish" : "Tanlash") : "Tugagan"}</span>
                          </button>

                          {canManageProducts && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              title="Tahrirlash"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeletingProductId(p.id)}
                              title="O'chirish"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Product Detail & Quantity Selection */}
      <ProductDetailModal
        product={selectedDetailProduct}
        isOpen={!!selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={(product, qty) => addToCart(product, qty)}
        categories={categories}
        formatPrice={formatPrice}
      />

      {/* MODAL: Add / Edit Product */}
      <Modal
        isOpen={isAddOpen || !!editingProduct}
        onClose={() => {
          setIsAddOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\'shish'}
        maxWidth="lg"
      >
        <form onSubmit={editingProduct ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mahsulot Nomi:
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Samsung Galaxy A54 5G 128GB"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategoriya:
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Holati:
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">ACTIVE (Faol)</option>
                <option value="INACTIVE">INACTIVE (Nofaol)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Narxi (so'm):
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ombordagi soni:
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Image URL input & Live preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rasm URL havolasi (ixtiyoriy):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.image_url && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bo'sh qoldirilsa, mahsulot nomi va kategoriyasi bo'yicha avtomatik sifatli rasm tanlanadi.
            </p>
          </div>

          {/* Description textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mahsulot tavsifi & xususiyatlari (ixtiyoriy):
            </label>
            <textarea
              rows={3}
              placeholder="Mahsulotning texnik xususiyatlari, modeli va kafolati haqida qisqacha ma'lumot..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              {editingProduct ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        title="Mahsulotni O'chirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Ushbu mahsulotni ro'yxatdan o'chirishga ishonchingiz komilmi? Bu amalni ortga qaytarib bo'lmaydi.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingProductId(null)}
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
