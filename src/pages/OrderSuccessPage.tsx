import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  QrCode,
  PlusCircle,
  Clock,
  ChefHat,
  UtensilsCrossed,
  CheckCircle,
  Star,
  Bell,
  ArrowRight,
  Sparkles,
  Edit3,
  Zap,
  Lock
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCustomer } from '../context/CustomerContext';
import { useBrand } from '../context/BrandContext';
import { apiClient } from '../services/apiClient';
import { CallWaiterModal } from '../components/CallWaiterModal';
import { EditOrderModal } from '../components/EditOrderModal';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { customerInfo } = useCustomer();
  const { brandName } = useBrand();

  const initialOrder: Order | undefined = location.state?.order;
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // 1-Second real-time clock ticker for live countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute 1-minute grace window remaining seconds
  const isFastOrder = Boolean(order?.is_fast_order || order?.notes?.includes('[FAST_ORDER]') || order?.notes?.includes('[NO_CHANGE]'));
  const orderAgeSec = order ? Math.max(0, Math.floor((now - new Date(order.created_at).getTime()) / 1000)) : 999;
  const secondsRemaining = Math.max(0, 60 - orderAgeSec);
  const showGraceOptions = Boolean(order && order.status === 'pending' && secondsRemaining > 0 && !isFastOrder);

  const handleFastOrderConfirm = async () => {
    if (!order) return;
    try {
      const updated = await apiClient.finalizeOrder(order.id);
      setOrder({ ...updated, is_finalized: true, is_fast_order: true });
    } catch (e) {
      console.error(e);
    }
  };

  // Fallback: if user reloads page, try fetching latest order from local storage
  useEffect(() => {
    if (!order) {
      apiClient.getOrders().then((all) => {
        if (all.length > 0) {
          setOrder(all[0]);
        }
      });
    }
  }, [order]);

  // Real-time synchronization of order status from kitchen
  useEffect(() => {
    const unsubscribe = apiClient.onEvent((type, data) => {
      if (type === 'order:updated' && data && data.id === order?.id) {
        setOrder((prev) => (prev ? { ...prev, ...data } : data));
      }
    });
    return () => unsubscribe();
  }, [order?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingReview(true);
    try {
      await apiClient.submitReview({
        order_id: order.id,
        table_number: order.table_number,
        customer_name: order.customer_name || customerInfo?.name || 'Guest',
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

  // Steps for the State Machine: pending -> preparing -> ready -> served / completed
  const currentStatus: OrderStatus = order?.status || 'pending';

  const statusSteps = [
    {
      key: 'pending',
      title: t.statusPending,
      desc: t.statusPendingDesc,
      icon: Clock,
      isActive: true,
      isDone: currentStatus !== 'pending'
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto space-y-6">
      
      {/* PhonePe Style Animated Success Card Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-100 text-center space-y-4"
      >
        {/* PhonePe animated green pulse blink */}
        <div className="relative flex items-center justify-center mx-auto my-2 w-24 h-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: [1, 1.45, 1.9], opacity: [0.8, 0.35, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            className="absolute w-20 h-20 rounded-full bg-emerald-400"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.25, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.35, ease: "easeOut" }}
            className="absolute w-16 h-16 rounded-full bg-emerald-500"
          />
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="relative z-10 w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25"
          >
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </motion.div>
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            Order Transmitted to Kitchen
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t.orderReceivedSubtitle}
          </h1>
        </div>

        {/* Order Identifier, Customer & Table Badge */}
        {order && (
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-2 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-blue-100 shadow-2xs whitespace-nowrap">
              <span className="text-slate-400 text-[10px] font-semibold uppercase">{t.orderNumber}:</span>
              <span className="font-mono font-bold text-blue-600 text-sm">#{order.order_number}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-blue-100 shadow-2xs whitespace-nowrap">
              <span className="text-slate-400 text-[10px] font-semibold uppercase">Customer:</span>
              <span className="font-bold text-slate-800 text-sm">
                {order.customer_name || customerInfo?.name || 'Guest'}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-blue-100 shadow-2xs whitespace-nowrap">
              <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-400 text-[10px] font-semibold uppercase">{t.table}:</span>
              <span className="font-bold text-slate-800 text-sm">
                Table #{order.table_number}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* 1-Minute Grace Window: Change/Edit Order or Fast Order (Don't Change) */}
      {order && order.status === 'pending' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-blue-100 space-y-4">
          {showGraceOptions ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-mono font-extrabold text-sm flex items-center justify-center shadow-xs animate-pulse">
                    {secondsRemaining}s
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>Order Modification Window</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        1 Min Timer
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Want to change dishes or request fast cooking? Select an option below:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono font-bold text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining} left</span>
                </div>
              </div>

              {/* Countdown Linear Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-linear-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(secondsRemaining / 60) * 100}%` }}
                />
              </div>

              {/* The 2 required Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Option 1: Change / Edit Order */}
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="py-3 px-4 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50/50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-98 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Change / Edit Order</span>
                </button>

                {/* Option 2: Don't Change (Fast Delivery) */}
                <button
                  type="button"
                  onClick={handleFastOrderConfirm}
                  className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Don't Change (Fast Delivery)</span>
                </button>
              </div>
            </div>
          ) : isFastOrder ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">
                  Fast Delivery Confirmed (No Changes)
                </p>
                <p className="text-slate-600 text-[11px]">
                  You selected no changes. The kitchen has been notified to prepare your food immediately!
                </p>
              </div>
            </div>
          ) : order.is_modified && secondsRemaining > 0 ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
              <div>
                <p className="font-bold text-slate-900">Order Updated! ({secondsRemaining}s remaining in 1-min window)</p>
                <p className="text-slate-600 text-[11px]">
                  Your changes have been saved. The kitchen will begin cooking once the 1-minute window ends.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs">
              <Lock className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">1-Minute Edit Window Expired</p>
                <p className="text-slate-600 text-[11px]">
                  Order is locked and sent to the kitchen. Chef can now prepare your food.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time Order State Progress Machine */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-5">
        <div className="flex items-center justify-between border-b border-blue-50 pb-3">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>{t.orderStatus}</span>
          </h2>
          <button
            type="button"
            onClick={() => setIsWaiterModalOpen(true)}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.callWaiter}</span>
          </button>
        </div>

        {/* Vertical/Horizontal Stepper */}
        <div className="space-y-4">
          {statusSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-start gap-3.5">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      step.isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : step.isActive
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {step.isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 my-1 ${
                        step.isDone ? 'bg-emerald-500' : 'bg-blue-100'
                      }`}
                    />
                  )}
                </div>

                <div className="pt-1">
                  <h4 className={`text-xs sm:text-sm font-bold ${
                    step.isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      {order && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-blue-50 pb-2">
            Order Items Summary
          </h3>
          <div className="space-y-2">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between items-center text-slate-700">
                <span>{it.quantity}x {it.item_name} {it.notes ? `(${it.notes})` : ''}</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{(it.item_price * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-blue-100 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
            <span>{t.totalPayable}:</span>
            <span className="font-mono text-base text-blue-600">₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Customer Feedback & Review Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-4">
        <div className="border-b border-blue-50 pb-2">
          <h3 className="font-bold text-slate-900 text-sm">{t.rateExperience}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            How was the taste and service?
          </p>
        </div>

        {reviewSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1 text-emerald-800 text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
            <p className="font-semibold">{t.reviewSubmitted}</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            {/* 1-5 Star selector */}
            <div className="flex items-center gap-1.5 justify-center py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t.feedbackPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
            />

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : t.submitReview}
            </button>
          </form>
        )}
      </div>

      {/* Bottom Action: Order More */}
      <div className="text-center pt-2">
        <Link
          to={`/menu?table=${order?.table_number || 1}`}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.orderMore}</span>
        </Link>
      </div>

      {/* Call Waiter Modal */}
      <CallWaiterModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableNumber={order?.table_number || 1}
      />

      {/* Edit Order Modal (1-minute grace window) */}
      {order && (
        <EditOrderModal
          order={order}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onOrderSaved={(updated) => setOrder(updated)}
          secondsRemaining={secondsRemaining}
        />
      )}

    </div>
  );
};
