import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2, Plus, Minus, QrCode, Send, MessageSquare, ShoppingBag, Utensils, AlertCircle, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { useLanguage } from '../context/LanguageContext';
import { CustomerInfoModal } from '../components/CustomerInfoModal';
import { apiClient } from '../services/apiClient';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    tableNumber,
    setTableNumber,
    orderNotes,
    setOrderNotes,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount
  } = useCart();
  const { customerInfo, openCustomerModal, isInfoComplete } = useCustomer();
  const { t } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    // 1. Mandatory Customer Information Check
    if (!isInfoComplete || !customerInfo) {
      openCustomerModal();
      setErrorMessage('Please enter your name and phone number. Customer information is mandatory.');
      return;
    }

    const effectiveTable = customerInfo.table_number || tableNumber || 1;
    if (!tableNumber) {
      setTableNumber(effectiveTable);
    }

    if (items.length === 0) {
      setErrorMessage(t.emptyCart);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        table_number: effectiveTable,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        notes: orderNotes,
        items: items.map((i) => ({
          menu_id: i.menu_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes
        }))
      };

      const createdOrder = await apiClient.placeOrder(payload);
      clearCart();
      navigate('/order-success', { state: { order: createdOrder } });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing order. Please notify staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.exploreMenu}</span>
        </Link>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Table Dining</span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            {t.yourCart}
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto shadow-2xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">{t.yourCart} is empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t.emptyCart}
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>{t.exploreMenu}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <motion.div
                key={item.cart_id}
                layout
                className="bg-white rounded-2xl p-4 border border-slate-200 flex gap-3.5 items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                  />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      ₹{item.price.toFixed(2)}
                    </span>
                    {item.notes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cart_id, -1)}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900 font-mono text-xs">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cart_id, 1)}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.cart_id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* General Order Instructions */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 shadow-2xs">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.specialInstructions}</span>
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder={t.specialInstructionsPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              {/* Dining Table & Customer Confirmation */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer:</span>
                  </span>
                  <button
                    type="button"
                    onClick={openCustomerModal}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    {isInfoComplete ? 'Edit Info' : 'Enter Info'}
                  </button>
                </div>
                {isInfoComplete && customerInfo ? (
                  <p className="text-xs font-semibold text-slate-800">
                    {customerInfo.name}{' '}
                    <span className="text-slate-500 font-normal text-[11px] font-mono">
                      (+91 {customerInfo.phone})
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-red-500 font-medium">
                    ⚠️ Mandatory information missing
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-200/60">
                  <span className="text-slate-600 flex items-center gap-1 font-medium">
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.table}:</span>
                  </span>
                  <select
                    value={tableNumber || 1}
                    onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
                    className="bg-white px-2 py-0.5 rounded-lg font-bold text-blue-700 border border-blue-200 focus:outline-hidden cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>Table #{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Items Total ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span className="font-mono font-medium text-slate-900">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Digital Service Fee</span>
                  <span>FREE</span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-sm text-slate-900">{t.totalPayable}</span>
                <span className="font-bold text-xl text-blue-600 font-mono">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              {/* Place Order CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? t.placingOrder : t.placeOrder}</span>
              </button>
            </div>

            {/* Quick Helper Note */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-800 leading-relaxed">
              💡 <b>Fast Table Delivery:</b> Orders are instantly dispatched to the kitchen display screen. You can track real-time preparation status after placing!
            </div>
          </div>

        </div>
      )}

      {/* Mandatory Customer Information Modal */}
      <CustomerInfoModal />
    </div>
  );
};
