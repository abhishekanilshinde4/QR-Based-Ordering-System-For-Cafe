import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  ChefHat,
  Sparkles,
  UtensilsCrossed,
  CheckCircle2,
  Phone,
  Search,
  QrCode,
  ArrowLeft,
  Bell,
  Star,
  ShoppingBag,
  User,
  AlertCircle,
  RefreshCw,
  Edit3,
  Zap,
  Lock,
  CheckCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useCustomer } from '../context/CustomerContext';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { CallWaiterModal } from '../components/CallWaiterModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { apiClient } from '../services/apiClient';

export const CustomerTrackOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customerInfo, saveCustomerInfo } = useCustomer();
  const { language, t } = useLanguage();
  const { brandName } = useBrand();

  const initialPhone = searchParams.get('phone') || customerInfo?.phone || '';
  const initialOrderNumber = searchParams.get('order') || '';

  const [inputPhone, setInputPhone] = useState(initialPhone);
  const [inputOrderNumber, setInputOrderNumber] = useState(initialOrderNumber);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isFastOrder = Boolean(selectedOrder?.is_fast_order || selectedOrder?.notes?.includes('[FAST_ORDER]') || selectedOrder?.notes?.includes('[NO_CHANGE]'));
  const orderAgeSec = selectedOrder ? Math.max(0, Math.floor((now - new Date(selectedOrder.created_at).getTime()) / 1000)) : 999;
  const secondsRemaining = Math.max(0, 60 - orderAgeSec);
  const showGraceOptions = Boolean(selectedOrder && selectedOrder.status === 'pending' && secondsRemaining > 0 && !isFastOrder);

  const handleFastOrderConfirm = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await apiClient.finalizeOrder(selectedOrder.id);
      const withFlag = { ...updated, is_fast_order: true, is_finalized: true };
      setSelectedOrder(withFlag);
      setOrders((prev) => prev.map((o) => (o.id === withFlag.id ? withFlag : o)));
    } catch (e) {
      console.error(e);
    }
  };

  // Review submission state
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Perform search / login
  const handleSearch = async (phoneQuery?: string, orderQuery?: string) => {
    const phoneToUse = phoneQuery !== undefined ? phoneQuery : inputPhone;
    const orderToUse = orderQuery !== undefined ? orderQuery : inputOrderNumber;

    const cleanPhone = phoneToUse.trim().replace(/\D/g, '');
    const cleanOrder = orderToUse.trim();

    if (!cleanPhone && !cleanOrder) {
      setErrorMessage('Please enter your 10-digit mobile number or order number');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiClient.trackOrders({
        phone: cleanPhone || undefined,
        order_number: cleanOrder || undefined
      });

      if (data && data.orders && data.orders.length > 0) {
        setOrders(data.orders);
        setSelectedOrder(data.orders[0]);

        // Automatically log in / restore customer session if customer profile returned
        if (data.customer) {
          saveCustomerInfo({
            name: data.customer.name,
            phone: data.customer.phone || cleanPhone,
            table_number: data.customer.table_number || data.orders[0].table_number || 1
          });
        }
      } else {
        setOrders([]);
        setSelectedOrder(null);
        setErrorMessage(t.noOrdersFound);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error querying order records. Please try again.');
    } finally {
      setLoading(false);
      setSearchDone(true);
    }
  };

  // Auto-search on mount if phone or order number present
  useEffect(() => {
    if (initialPhone || initialOrderNumber) {
      handleSearch(initialPhone, initialOrderNumber);
    }
  }, []);

  // Poll for live status every 4 seconds
  useEffect(() => {
    if (!selectedOrder) return;
    const interval = setInterval(() => {
      const cleanPhone = (customerInfo?.phone || inputPhone).trim().replace(/\D/g, '');
      if (cleanPhone) {
        apiClient.trackOrders({ phone: cleanPhone }).then((res) => {
          if (res && res.orders) {
            setOrders(res.orders);
            setSelectedOrder((prev) => (prev ? res.orders.find((o) => o.id === prev.id) || res.orders[0] : res.orders[0]));
          }
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedOrder?.id, customerInfo?.phone, inputPhone]);

  // Real-time synchronization of order status via event bus / Socket.IO
  useEffect(() => {
    const unsubscribe = apiClient.onEvent((type, data) => {
      if (type === 'order:updated' && data && data.id === selectedOrder?.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...data } : data));
        setOrders((prev) => prev.map((o) => (o.id === data.id ? { ...o, ...data } : o)));
      }
    });
    return () => unsubscribe();
  }, [selectedOrder?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingReview(true);
    try {
      await apiClient.submitReview({
        order_id: selectedOrder.id,
        table_number: selectedOrder.table_number,
        customer_name: selectedOrder.customer_name || customerInfo?.name || 'Guest',
        rating,
        review_text: reviewText
      });
      setReviewSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const currentStatus: OrderStatus = selectedOrder?.status || 'pending';

  const statusSteps = [
    {
      key: 'pending',
      title: t.statusPending,
      desc: t.statusPendingDesc,
      icon: Clock,
      isActive: true,
      isDone: currentStatus !== 'pending' && currentStatus !== 'cancelled'
    },
    {
      key: 'preparing',
      title: t.statusPreparing,
      desc: t.statusPreparingDesc,
      icon: ChefHat,
      isActive: currentStatus === 'preparing' || currentStatus === 'ready' || currentStatus === 'served' || currentStatus === 'completed',
      isDone: currentStatus === 'ready' || currentStatus === 'served' || currentStatus === 'completed'
    },
    {
      key: 'ready',
      title: t.statusReady,
      desc: t.statusReadyDesc,
      icon: Sparkles,
      isActive: currentStatus === 'ready' || currentStatus === 'served' || currentStatus === 'completed',
      isDone: currentStatus === 'served' || currentStatus === 'completed'
    },
    {
      key: 'served',
      title: t.statusServed,
      desc: t.statusServedDesc,
      icon: UtensilsCrossed,
      isActive: currentStatus === 'served' || currentStatus === 'completed',
      isDone: currentStatus === 'completed'
    }
  ];

  return (
    <div className="min-h-screen pt-4 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Menu</span>
        </Link>

        {customerInfo && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs text-slate-800 shadow-2xs">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold">{customerInfo.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">(+91 {customerInfo.phone})</span>
          </div>
        )}
      </div>

      {/* Hero Header & Search Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-xs space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mb-1">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          {t.customerLoginTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {t.trackByMobileDesc}
        </p>

        {/* Lookup / Sign In Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2"
        >
          <div className="relative flex-1 flex rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
            <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="Enter mobile number"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Track Order</span>
          </button>
        </form>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Orders View */}
      {selectedOrder && (
        <div className="space-y-6">
          
          {/* If customer has multiple orders, show order selector tabs */}
          {orders.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Your Orders:</span>
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedOrder(ord)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedOrder.id === ord.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  #{ord.order_number} ({ord.status.toUpperCase()})
                </button>
              ))}
            </div>
          )}

          {/* Active Order Banner Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-6">
            
            {/* Header with Order No, Customer, Table */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-50 pb-5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center min-w-[4rem] w-auto h-auto px-3.5 py-2 rounded-2xl bg-blue-50 text-blue-700 font-bold font-mono text-sm border border-blue-200 shadow-2xs shrink-0 whitespace-nowrap">
                  #{selectedOrder.order_number}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900 truncate">
                      {selectedOrder.customer_name || customerInfo?.name || 'Guest'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 whitespace-nowrap shadow-2xs">
                      <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Table #{selectedOrder.table_number}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Placed at {new Date(selectedOrder.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Call Waiter CTA */}
              <button
                type="button"
                onClick={() => setIsWaiterModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Call Waiter to Table</span>
              </button>
            </div>

            {/* 1-Minute Grace Window: Change/Edit Order or Fast Order (Don't Change) */}
            {selectedOrder.status === 'pending' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-50/80 to-blue-50/50 border border-amber-200/80 space-y-3">
                {showGraceOptions ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-mono font-extrabold text-xs flex items-center justify-center shadow-xs animate-pulse">
                          {secondsRemaining}s
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <span>Order Modification Window</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              1 Min
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            You can add/remove dishes or confirm fast order within 1 minute.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono font-bold text-xs bg-white border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                        <span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
                      </div>
                    </div>

                    {/* Linear Progress Bar */}
                    <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(secondsRemaining / 60) * 100}%` }}
                      />
                    </div>

                    {/* The 2 required Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      {/* Option 1: Change / Edit Order */}
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="py-2.5 px-3.5 rounded-xl bg-white border border-blue-300 hover:border-blue-600 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-98 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Change / Edit Order</span>
                      </button>

                      {/* Option 2: Don't Change (Fast Order) */}
                      <button
                        type="button"
                        onClick={handleFastOrderConfirm}
                        className="py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Don't Change (Fast Delivery)</span>
                      </button>
                    </div>
                  </div>
                ) : isFastOrder ? (
                  <div className="flex items-center gap-2.5 text-xs text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <b>Fast Delivery Confirmed:</b> No changes requested. Kitchen has been notified to start preparing immediately!
                    </span>
                  </div>
                ) : selectedOrder.is_modified && secondsRemaining > 0 ? (
                  <div className="flex items-center gap-2.5 text-xs text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                    <span>
                      <b>Order Updated!</b> ({secondsRemaining}s remaining in 1-min window). Kitchen will begin cooking once window ends.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span><b>1-Minute Window Expired:</b> Order is locked and sent for preparation.</span>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Status Progress Pipeline */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                  <span>Live Kitchen Progress</span>
                </h3>
                <span className="text-[11px] text-slate-400">Auto-updates in real time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = currentStatus === step.key;

                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                          : step.isDone
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : step.isDone
                              ? 'bg-emerald-200 text-emerald-800'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                          Step {idx + 1}
                        </span>
                      </div>
                      <p className={`font-bold text-xs ${isCurrent ? 'text-white' : step.isDone ? 'text-emerald-950' : 'text-slate-700'}`}>
                        {step.title}
                      </p>
                      <p className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Receipt Breakdown */}
            <div className="border-t border-blue-50 pt-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dishes Ordered</h4>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{it.quantity}x</span>{' '}
                      <span className="font-semibold text-slate-800">{it.item_name}</span>
                      {it.notes && (
                        <span className="block text-[11px] text-amber-700 mt-0.5">
                          ↳ {it.notes}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{(it.item_price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="pt-3 flex justify-between items-center text-sm font-bold text-slate-900 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="font-mono text-base text-blue-600">
                    ₹{selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-blue-50 pt-4 flex flex-wrap gap-2.5">
              <Link
                to={`/menu?table=${selectedOrder.table_number}`}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order More Delicacies</span>
              </Link>
            </div>

            {/* Dining Review Form if served or completed */}
            <div className="border-t border-blue-50 pt-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">{t.rateExperience}</h4>
              {reviewSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.reviewSubmitted}</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">{rating} / 5 Stars</span>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t.feedbackPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : t.submitReview}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Call Waiter Dialog */}
      <CallWaiterModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableNumber={selectedOrder?.table_number || customerInfo?.table_number || 1}
      />

      {/* Edit Order Modal (1-minute grace window) */}
      {selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onOrderSaved={(updated) => {
            setSelectedOrder(updated);
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          }}
          secondsRemaining={secondsRemaining}
        />
      )}
    </div>
  );
};
