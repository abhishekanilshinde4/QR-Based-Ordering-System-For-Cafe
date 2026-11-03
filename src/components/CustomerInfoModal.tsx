import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, Hash, Users, Sparkles, CheckCircle2, AlertCircle, ShieldCheck, Clock, Search, RefreshCw } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { apiClient } from '../services/apiClient';

interface CustomerInfoModalProps {
  forceOpen?: boolean;
}

export const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({ forceOpen = false }) => {
  const navigate = useNavigate();
  const { customerInfo, saveCustomerInfo, isCustomerModalOpen, closeCustomerModal, isInfoComplete } = useCustomer();
  const { tableNumber: cartTableNumber, setTableNumber } = useCart();
  const { t } = useLanguage();
  const { brandName } = useBrand();

  const [tab, setTab] = useState<'new' | 'relogin'>('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [table, setTable] = useState<number>(cartTableNumber || 1);
  const [guests, setGuests] = useState<number>(2);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; table?: string }>({});

  // Re-login state
  const [loginPhone, setLoginPhone] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync initial state when customerInfo changes
  useEffect(() => {
    if (customerInfo) {
      setName(customerInfo.name);
      setPhone(customerInfo.phone);
      setTable(customerInfo.table_number);
    } else if (cartTableNumber) {
      setTable(cartTableNumber);
    }
  }, [customerInfo, cartTableNumber]);

  // Determine if modal should be shown:
  // Must show if customer info is incomplete, or if opened manually by the user
  const isOpen = forceOpen || isCustomerModalOpen || !isInfoComplete;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string; table?: string } = {};

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const numTable = Number(table);

    if (!cleanName || cleanName.length < 2) {
      newErrors.name = t.enterValidName;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      newErrors.phone = t.enterValidPhone;
    }

    if (!numTable || isNaN(numTable) || numTable < 1) {
      newErrors.table = t.enterValidTable;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    saveCustomerInfo({
      name: cleanName,
      phone: cleanPhone,
      table_number: numTable
    });
    setTableNumber(numTable);
  };

  const handleReLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = loginPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setLoginError(t.enterValidPhone);
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const data = await apiClient.trackOrders({ phone: cleanPhone });
      if (data && data.orders && data.orders.length > 0) {
        const custName = data.customer?.name || data.orders[0].customer_name || 'Valued Customer';
        const tblNum = data.customer?.table_number || data.orders[0].table_number || 1;

        saveCustomerInfo({
          name: custName,
          phone: cleanPhone,
          table_number: tblNum
        });
        setTableNumber(tblNum);
        navigate(`/track?phone=${cleanPhone}`);
      } else {
        setLoginError(t.noOrdersFound);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error looking up customer orders.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with lite blue glass blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden z-10"
          >
            {/* Top decorative banner */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-5 text-white text-center relative">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md mb-2.5 shadow-inner">
                {tab === 'new' ? <User className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {tab === 'new' ? t.customerInfoTitle : t.customerLoginTitle}
              </h2>
              <p className="text-xs text-blue-100 mt-1 max-w-sm mx-auto leading-relaxed">
                {tab === 'new' ? t.customerInfoSubtitle : t.trackByMobileDesc}
              </p>

              {/* Tab Switcher: New Customer vs Existing Order Lookup */}
              <div className="mt-4 flex p-1 rounded-2xl bg-black/15 backdrop-blur-md border border-white/10 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setTab('new')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    tab === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {t.newSessionTab}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('relogin')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    tab === 'relogin' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {t.existingCustomerTab}
                </button>
              </div>
            </div>

            {/* Form 1: New Customer Entry */}
            {tab === 'new' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Customer Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      {t.customerNameLabel}
                    </span>
                    <span className="text-[10px] text-red-500 font-normal">Required</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder={t.customerNamePlaceholder}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                        errors.name ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Customer Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      {t.customerPhoneLabel}
                    </span>
                    <span className="text-[10px] text-red-500 font-normal">10 Digits</span>
                  </label>
                  <div className="relative flex rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden">
                    <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder={t.customerPhonePlaceholder}
                      required
                      className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Table Number & Guests selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-blue-600" />
                      {t.tableNumberLabel}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={table}
                      onChange={(e) => {
                        setTable(Math.max(1, parseInt(e.target.value, 10) || 1));
                        if (errors.table) setErrors((prev) => ({ ...prev, table: undefined }));
                      }}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {t.guestsCountLabel}
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={5}>5+ Guests</option>
                    </select>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.startOrderingBtn}</span>
                  </button>
                </div>

                {/* Footer reassurance */}
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  🔒 Your contact details are safely shared only with kitchen & serving staff for this dining session.
                </p>
              </form>
            )}

            {/* Form 2: Customer Re-Login & Order Lookup */}
            {tab === 'relogin' && (
              <form onSubmit={handleReLogin} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Enter Registered Mobile Number</span>
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">10 Digits</span>
                  </label>
                  <div className="relative flex rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden">
                    <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={loginPhone}
                      onChange={(e) => {
                        setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Find My Orders & View Live Status</span>
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setTab('new')}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    ← First time dining today? Place a new order
                  </button>
                </div>
              </form>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
