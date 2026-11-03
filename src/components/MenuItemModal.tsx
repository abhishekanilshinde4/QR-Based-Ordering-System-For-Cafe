import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingBag, MessageSquare } from 'lucide-react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface MenuItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({ item, onClose }) => {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const displayName = language === 'mr' ? item.name_mr || item.name : language === 'hi' ? item.name_hi || item.name : item.name;
  const displayDesc = language === 'mr' ? item.description_mr || item.description : language === 'hi' ? item.description_hi || item.description : item.description;

  const handleAdd = () => {
    addToCart(item, quantity, notes);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 text-white backdrop-blur-md hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Food Image */}
          <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
            <img
              src={item.image_url}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/10" />
            <div className="absolute bottom-4 left-5 right-5 text-white flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white">
                    {item.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.is_veg !== false ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    {item.is_veg !== false ? 'VEG' : 'NON-VEG'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold leading-tight">{displayName}</h3>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Description & Price */}
            <div className="flex justify-between items-start gap-4">
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {displayDesc || 'Freshly prepared with authentic ingredients and aromatic spices.'}
              </p>
              <div className="text-xl font-bold text-blue-600 font-mono whitespace-nowrap">
                ₹{item.price.toFixed(2)}
              </div>
            </div>

            {/* Custom Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.specialInstructions}</span>
              </label>
              <input
                type="text"
                placeholder={t.specialInstructionsPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Quantity Controls & Add Button */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-slate-900 font-mono text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.addToOrder} · ₹{(item.price * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
