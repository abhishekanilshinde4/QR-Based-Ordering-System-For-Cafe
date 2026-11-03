import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Clock,
  Utensils,
  Search,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  QrCode
} from 'lucide-react';
import { Order, MenuItem } from '../types';
import { apiClient } from '../services/apiClient';

interface EditOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onOrderSaved: (updatedOrder: Order) => void;
  secondsRemaining: number;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderSaved,
  secondsRemaining
}) => {
  // Working draft of items
  const [items, setItems] = useState<
    Array<{
      menu_id?: string | null;
      name: string;
      price: number;
      quantity: number;
      notes?: string | null;
    }>
  >([]);

  const [notes, setNotes] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize draft items when order or modal opens
  useEffect(() => {
    if (isOpen && order) {
      setItems(
        (order.items || []).map((it) => ({
          menu_id: it.menu_id || null,
          name: it.item_name,
          price: it.item_price,
          quantity: it.quantity,
          notes: it.notes || null
        }))
      );
      // Clean notes from internal tags
      const clean = (order.notes || '')
        .replace(/\[MODIFIED\]/g, '')
        .replace(/\[FINALIZED\]/g, '')
        .replace(/\[FAST_ORDER\]/g, '')
        .trim();
      setNotes(clean);
      setErrorMessage(null);
    }
  }, [isOpen, order]);

  // Load menu for "Add Items" browser
  useEffect(() => {
    if (isOpen) {
      apiClient.getMenu().then((res) => {
        if (Array.isArray(res)) setMenuItems(res);
      });
    }
  }, [isOpen]);

  // If time runs out, auto close
  useEffect(() => {
    if (isOpen && secondsRemaining <= 0) {
      onClose();
    }
  }, [isOpen, secondsRemaining, onClose]);

  // Calculate live total
  const calculatedTotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  }, [items]);

  // Item quantity modifiers
  const handleIncreaseQty = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const handleDecreaseQty = (index: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (target.quantity <= 1) {
        // Remove item if decreases below 1
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((item, i) => (i === index ? { ...item, quantity: item.quantity - 1 } : item));
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Add item from menu
  const handleAddMenuItem = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => (i.menu_id && i.menu_id === menuItem.id) || i.name.toLowerCase() === menuItem.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        return prev.map((item, i) =>
          i === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          menu_id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: null
        }
      ];
    });
  };

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(menuItems.map((m) => m.category))).filter(Boolean);
    return ['All', ...list];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Save changes & finalize
  const handleSave = async () => {
    if (items.length === 0) {
      setErrorMessage('Your order must contain at least 1 item. Please add an item from the menu.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = await apiClient.modifyOrder(order.id, {
        items,
        notes: notes.trim(),
        is_finalized: false
      });
      onOrderSaved(updated);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-100 flex flex-col max-h-[90vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-blue-50 bg-linear-to-r from-blue-50/70 to-white gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="inline-flex items-center justify-center min-w-[3.75rem] w-auto h-auto px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs shadow-2xs whitespace-nowrap shrink-0">
                #{order.order_number}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base text-slate-900 truncate">Change / Edit Order</h2>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 whitespace-nowrap">
                    <QrCode className="w-3 h-3 text-blue-600 shrink-0" />
                    Table #{order.table_number}
                  </span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">• Add, delete or modify items</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Countdown Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Current Ordered Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-blue-600" />
                  Current Items in Order ({items.length})
                </h3>
                <span className="text-xs text-slate-400">Tap trash icon to delete</span>
              </div>

              {items.length === 0 ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                  <p className="font-bold text-xs text-amber-900">All items removed</p>
                  <p className="text-xs text-slate-600">Please add at least 1 dish from the menu below.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {it.name}
                          </h4>
                          <span className="font-mono text-xs text-blue-600 font-semibold shrink-0">
                            ₹{it.price}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Subtotal: ₹{(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Controls: [-] [qty] [+] and [trash] */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleDecreaseQty(idx)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Decrease or remove"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold font-mono text-xs text-slate-900">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncreaseQty(idx)}
                            className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Add one more"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Direct Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete this item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add More Dishes from Menu */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Add More Items from Menu
                </h3>
              </div>

              {/* Search & Category Tabs */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu items..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu items scroll grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-100 hover:border-blue-300 shadow-2xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                        <span className="text-xs font-mono font-semibold text-blue-600">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddMenuItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Special Instructions for Kitchen</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Less spicy, extra butter on pav, no onions..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer with Total and Save button */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-blue-50 bg-slate-50/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Updated Total</span>
              <span className="font-mono font-extrabold text-base sm:text-lg text-blue-700">
                ₹{calculatedTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || items.length === 0}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Confirm Changes'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
