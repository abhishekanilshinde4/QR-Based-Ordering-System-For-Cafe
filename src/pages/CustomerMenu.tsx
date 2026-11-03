import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Plus, QrCode, CheckCircle, Coffee, Filter, Bell, Sparkles, Utensils, Check, User } from 'lucide-react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { useSocket } from '../context/SocketContext';
import { MenuItemModal } from '../components/MenuItemModal';
import { CallWaiterModal } from '../components/CallWaiterModal';
import { CustomerInfoModal } from '../components/CustomerInfoModal';
import { apiClient, DEFAULT_MENU_ITEMS } from '../services/apiClient';

export const CustomerMenu: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tableNumber, setTableNumber, addToCart, itemCount, totalAmount } = useCart();
  const { customerInfo, openCustomerModal, isInfoComplete } = useCustomer();
  const { language, t } = useLanguage();
  const { brandName, tagline } = useBrand();
  const { socket } = useSocket();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  // 1. Detect Table Number from QR URL query parameter e.g., /menu?table=3
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const parsed = parseInt(tableParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setTableNumber(parsed);
      }
    }
  }, [searchParams, setTableNumber]);

  // 2. Fetch Menu Items
  const fetchMenu = async () => {
    try {
      const data = await apiClient.getMenu();
      if (Array.isArray(data) && data.length > 0) {
        setMenuItems(data);
      } else {
        setMenuItems(DEFAULT_MENU_ITEMS);
      }
    } catch (e) {
      setMenuItems(DEFAULT_MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Listen to BroadcastChannel / Cross-tab events
  useEffect(() => {
    const unsubscribe = apiClient.onEvent((type) => {
      if (type === 'menu:updated' || type === 'menu:deleted') {
        fetchMenu();
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Listen to Real-Time Menu Updates from Socket.IO
  useEffect(() => {
    if (!socket) return;
    const handleMenuUpdate = () => {
      fetchMenu();
    };
    socket.on('menu:updated', handleMenuUpdate);
    return () => {
      socket.off('menu:updated', handleMenuUpdate);
    };
  }, [socket]);

  // Categories list
  const categories = ['All', 'Chai & Hot Teas', 'Buns & Snacks', 'Meals & Mains', 'Desserts & Sweets'];

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (!item.available) return false;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg =
      vegFilter === 'all' ? true : vegFilter === 'veg' ? item.is_veg !== false : item.is_veg === false;

    const itemName = (language === 'mr' ? item.name_mr || item.name : language === 'hi' ? item.name_hi || item.name : item.name).toLowerCase();
    const itemDesc = (language === 'mr' ? item.description_mr || item.description : language === 'hi' ? item.description_hi || item.description : item.description).toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = itemName.includes(query) || itemDesc.includes(query);
    return matchesCategory && matchesVeg && matchesSearch;
  });

  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    addToCart(item, 1, '');
    const name = language === 'mr' ? item.name_mr || item.name : language === 'hi' ? item.name_hi || item.name : item.name;
    setAddedToast(name);
    setTimeout(() => setAddedToast(null), 2000);
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Clean Hero Header in Lite Blue Theme */}
      <section className="pt-4 sm:pt-6 pb-6 sm:pb-8 text-center max-w-2xl mx-auto space-y-3">
        
        {/* Project Tagline & Table Card */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{tagline}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome to <span className="text-blue-600">{brandName}</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Scan the table QR, browse dishes in your preferred language, customize cooking instructions, and order directly to the kitchen.
        </p>

        {/* Mandatory Customer Info Badge Banner & Table/Waiter Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {isInfoComplete && customerInfo ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-blue-200 shadow-2xs text-xs text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500">{t.customerBadgeText}:</span>
              <span className="font-bold text-slate-900">{customerInfo.name}</span>
              <span className="text-slate-400 font-mono text-[11px]">(+91 {customerInfo.phone})</span>
              <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 whitespace-nowrap shadow-2xs">
                <QrCode className="w-3 h-3 text-blue-600 shrink-0" />
                <span>{t.table} #{tableNumber || customerInfo.table_number}</span>
              </span>
              <button
                type="button"
                onClick={openCustomerModal}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline ml-1 cursor-pointer"
              >
                {t.editInfoBtn}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openCustomerModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white shadow-md text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer animate-pulse"
            >
              <User className="w-3.5 h-3.5 text-white" />
              <span>📝 Enter Your Details to Order (Mandatory)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsWaiterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.callWaiter}</span>
          </button>
        </div>
      </section>

      {/* Quick Add Toast */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 text-xs font-medium border border-slate-700"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{addedToast} {t.addedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar & Filters */}
      <div className="space-y-3 mb-8 max-w-4xl mx-auto">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-blue-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs transition-colors"
          />
        </div>

        {/* Categories Bar & Veg Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const label =
                cat === 'All' ? t.categoryAll :
                cat === 'Chai & Hot Teas' ? t.categoryChai :
                cat === 'Buns & Snacks' ? t.categorySnacks :
                cat === 'Meals & Mains' ? t.categoryMain : t.categoryDessert;

              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-blue-100 hover:bg-blue-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Veg / Non-Veg Toggle Pill */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-blue-100 text-xs font-medium shrink-0 self-start sm:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setVegFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                vegFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setVegFilter('veg')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                vegFilter === 'veg' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Veg Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Item Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-white animate-pulse border border-blue-100" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-blue-100 p-8 max-w-md mx-auto shadow-2xs">
          <Coffee className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No dishes found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const displayName = language === 'mr' ? item.name_mr || item.name : language === 'hi' ? item.name_hi || item.name : item.name;
            const displayDesc = language === 'mr' ? item.description_mr || item.description : language === 'hi' ? item.description_hi || item.description : item.description;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedItemForModal(item)}
                className="group cursor-pointer bg-white rounded-2xl border border-blue-100 hover:border-blue-400 transition-all overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  {/* Dish Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-blue-50">
                    <img
                      src={item.image_url}
                      alt={displayName}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    
                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs flex items-center gap-1.5 text-[10px] font-bold">
                      <span className={`w-2 h-2 rounded-full ${item.is_veg !== false ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      <span className={item.is_veg !== false ? 'text-emerald-700' : 'text-red-700'}>
                        {item.is_veg !== false ? 'VEG' : 'NON-VEG'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 bg-slate-900/70 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
                      {item.category}
                    </div>
                  </div>

                  {/* Dish Details */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {displayName}
                      </h3>
                      <span className="font-bold text-blue-600 font-mono text-sm whitespace-nowrap">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                {/* Card Footer with Quick Add Button */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-blue-50">
                  <span className="text-[11px] text-slate-400">Click to customize</span>
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addToOrder}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar (Shows when items are added) */}
      {itemCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40"
        >
          <div className="bg-slate-900 text-white rounded-2xl p-3 px-5 shadow-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Table #{tableNumber || 1} • {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <span className="text-base font-bold text-white font-mono">₹{totalAmount.toFixed(2)}</span>
            </div>
            <Link
              to="/cart"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Review Order Tray</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Mandatory Customer Information Modal */}
      <CustomerInfoModal />

      {/* Item Details Customization Modal */}
      <MenuItemModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />

      {/* Call Waiter Dialog */}
      <CallWaiterModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableNumber={tableNumber || 1}
      />

      {/* Clean Hotel Dining Footer */}
      <footer className="mt-20 pt-8 border-t border-blue-100 text-center space-y-1 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          {brandName} • Digital Table Ordering
        </p>
        <p className="text-[11px] text-slate-400">
          Fast & Contactless Dining Experience • All rights reserved
        </p>
      </footer>

    </div>
  );
};
