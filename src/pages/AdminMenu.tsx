import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit3, Trash2, ArrowLeft, Image as ImageIcon, Tag, DollarSign, Check, X, Sparkles, Coffee } from 'lucide-react';
import { MenuItem } from '../types';
import { apiClient, DEFAULT_MENU_ITEMS } from '../services/apiClient';
import { useBrand } from '../context/BrandContext';

export const AdminMenu: React.FC = () => {
  const navigate = useNavigate();
  const { brandName } = useBrand();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [name, setName] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Meals & Mains');
  const [price, setPrice] = useState('60.00');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [isVeg, setIsVeg] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Token authentication check
  useEffect(() => {
    const token = localStorage.getItem('scandine_token') || localStorage.getItem('aura_cafe_token');
    if (!token) {
      navigate('/login', { replace: true, state: { unauthorized: true } });
    }
  }, [navigate]);

  const fetchMenuItems = async () => {
    try {
      const data = await apiClient.getMenu();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else {
        setItems(DEFAULT_MENU_ITEMS);
      }
    } catch (e) {
      setItems(DEFAULT_MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setNameMr('');
    setNameHi('');
    setDescription('');
    setCategory('Meals & Mains');
    setPrice('60.00');
    setImageUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800');
    setAvailable(true);
    setIsVeg(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setNameMr(item.name_mr || '');
    setNameHi(item.name_hi || '');
    setDescription(item.description || '');
    setCategory(item.category);
    setPrice(item.price.toString());
    setImageUrl(item.image_url);
    setAvailable(item.available);
    setIsVeg(item.is_veg !== false);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid positive price.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<MenuItem> = {
        name: name.trim(),
        name_mr: nameMr.trim() || undefined,
        name_hi: nameHi.trim() || undefined,
        description: description.trim(),
        category,
        price: parsedPrice,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
        available,
        is_veg: isVeg
      };

      if (editingItem) {
        payload.id = editingItem.id;
      }

      const saved = await apiClient.saveMenuItem(payload);
      if (editingItem) {
        setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      } else {
        setItems((prev) => [saved, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save menu item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await apiClient.deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const updated = { ...item, available: !item.available };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await apiClient.saveMenuItem(updated);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pt-4 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl border border-blue-200 hover:bg-blue-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">{brandName} Menu</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Digital Menu Manager
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Menu Items Table / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                item.available ? 'border-slate-200' : 'border-slate-300 opacity-60 bg-slate-50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.is_veg !== false ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{item.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{item.name}</h3>
                    <p className="font-mono font-bold text-blue-600 text-xs">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(item)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    item.available
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-200 text-slate-600 border border-slate-300'
                  }`}
                >
                  {item.available ? 'Available ✓' : 'Sold Out ✕'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveItem} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Item Name (English)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kolhapuri Special Misal Pav"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Marathi Name (मराठी)</label>
                    <input
                      type="text"
                      value={nameMr}
                      onChange={(e) => setNameMr(e.target.value)}
                      placeholder="उदा. मिसळ पाव"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Hindi Name (हिन्दी)</label>
                    <input
                      type="text"
                      value={nameHi}
                      onChange={(e) => setNameHi(e.target.value)}
                      placeholder="जैसे: मिसल पाव"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="Chai & Hot Teas">Chai & Hot Teas</option>
                      <option value="Buns & Snacks">Buns & Snacks</option>
                      <option value="Meals & Mains">Meals & Mains</option>
                      <option value="Desserts & Sweets">Desserts & Sweets</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="80.00"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of ingredients and taste..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isVeg}
                      onChange={(e) => setIsVeg(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Vegetarian Dish</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>In Stock (Available)</span>
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {saving ? 'Saving Item...' : 'Save Menu Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
