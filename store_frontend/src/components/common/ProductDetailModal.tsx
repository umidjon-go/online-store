import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';
import { getProductImageUrl } from '../../utils/productImages';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Tag,
  Info,
  ArrowRight,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  categories: Category[];
  formatPrice: (val?: number | null) => string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  categories,
  formatPrice,
}) => {
  const navigate = useNavigate();
  const [selectedQty, setSelectedQty] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedQty(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const categoryName =
    categories.find((c) => c.id === product.category_id)?.name || 'Kategoriya';

  const isOutOfStock = product.quantity <= 0;
  const maxAvailable = Math.max(0, product.quantity);
  const totalPrice = product.price * selectedQty;

  const handleDecrease = () => {
    setSelectedQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setSelectedQty((prev) => Math.min(maxAvailable, prev + 1));
  };

  const handleQtyChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setSelectedQty(1);
    } else if (num > maxAvailable) {
      setSelectedQty(maxAvailable);
    } else {
      setSelectedQty(num);
    }
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedQty);
    onClose();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedQty);
    onClose();
    navigate('/pos');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 shadow-md flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="relative bg-slate-100 flex items-center justify-center min-h-[280px] md:min-h-full overflow-hidden p-6">
            <img
              src={getProductImageUrl(product)}
              alt={product.name}
              className="w-full h-full max-h-[320px] object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
            />
            {/* Stock badge overlay */}
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                  isOutOfStock
                    ? 'bg-rose-500 text-white'
                    : product.quantity < 10
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Omborda qolmagan
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {product.quantity} dona mavjud
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Right: Info & Quantity Selector */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              {/* Category tag */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span>{categoryName}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 1 dona</span>
              </div>

              {/* Description */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mahsulot tavsifi:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description ||
                    'Ushbu mahsulot do\'konimiz tomonidan sifat kafolati bilan taqdim etiladi. Yuqori sifat va rasmiy kafolat mavjud.'}
                </p>
              </div>
            </div>

            {/* Quantity Selector Section */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Xarid qilish miqdorini tanlang:
                </label>
                <div className="flex items-center gap-3">
                  {/* Minus button */}
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={selectedQty <= 1 || isOutOfStock}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  {/* Number Input */}
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable}
                    value={selectedQty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    disabled={isOutOfStock}
                    className="w-20 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                  />

                  {/* Plus button */}
                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={selectedQty >= maxAvailable || isOutOfStock}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Quick pills */}
                  {!isOutOfStock && maxAvailable >= 5 && (
                    <div className="flex items-center gap-1.5 ml-auto text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedQty(Math.min(5, maxAvailable))}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[11px]"
                      >
                        5 ta
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedQty(maxAvailable)}
                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px]"
                      >
                        Hammasi ({maxAvailable})
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100/80">
                <span className="text-xs font-semibold text-slate-700">Jami hisoblangan:</span>
                <span className="text-base font-extrabold text-blue-700">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Action Buttons: Add to Cart and Buy Now */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all active:scale-[0.99] ${
                    isOutOfStock ? 'opacity-40 cursor-not-allowed border-slate-300 text-slate-400' : ''
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Savatga qo'shish</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow-xl'
                  }`}
                >
                  <span>Hoziroq xarid qilish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

