import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  QrCode,
  DollarSign,
  ShoppingBag,
  Bell,
  Utensils,
  LogOut,
  RefreshCw,
  BellOff,
  Trash2,
  X,
  ChefHat,
  Sparkles,
  TrendingUp,
  Star,
  Layers,
  ArrowUpRight,
  Edit2,
  Check,
  User,
  Phone,
  Edit3,
  Zap,
  Lock,
  KeyRound
} from 'lucide-react';
import { Order, OrderStatus, WaiterCall, Review } from '../types';
import { useSocket } from '../context/SocketContext';
import { useBrand } from '../context/BrandContext';
import { apiClient } from '../services/apiClient';
import { AdminAccountModal } from '../components/AdminAccountModal';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { brandName, updateBrand } = useBrand();

  const [orders, setOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'ready' | 'completed' | 'waiter' | 'reviews'>('active');
  const [isExporting, setIsExporting] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Editable Brand / Website Name state
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [tempBrandName, setTempBrandName] = useState(brandName);

  // Real-time clock ticker for 1-minute customer grace period countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTempBrandName(brandName);
  }, [brandName]);

  // Authenticate token check
  useEffect(() => {
    const token = localStorage.getItem('scandine_token') || localStorage.getItem('aura_cafe_token');
    if (!token) {
      navigate('/login', { replace: true, state: { unauthorized: true } });
    }
  }, [navigate]);

  // Fetch all orders & data
  const fetchData = async () => {
    try {
      const [orderData, callData, reviewData] = await Promise.all([
        apiClient.getOrders(),
        apiClient.getWaiterCalls(),
        apiClient.getReviews()
      ]);
      if (Array.isArray(orderData)) setOrders(orderData);
      if (Array.isArray(callData)) setWaiterCalls(callData);
      if (Array.isArray(reviewData)) setReviews(reviewData);
    } catch (e) {
      console.warn('Network issue fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);


  // Listen to Real-time events
  useEffect(() => {
    const unsubscribe = apiClient.onEvent((type, data) => {
      if (type === 'order:placed') {
        const newOrder = data as Order;
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        setSuccessBanner(`New Order #${newOrder.order_number} from Table ${newOrder.table_number}!`);
        setTimeout(() => setSuccessBanner(null), 5000);
      } else if (type === 'order:updated') {
        const updated = data as Order;
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
        if (updated.is_modified) {
          setSuccessBanner(`Order #${updated.order_number} modified by customer! Items updated.`);
          setTimeout(() => setSuccessBanner(null), 6000);
        } else if (updated.is_finalized) {
          setSuccessBanner(`Order #${updated.order_number} confirmed (Fast Order)! Ready to prepare.`);
          setTimeout(() => setSuccessBanner(null), 5000);
        }
      } else if (type === 'order:deleted') {
        const { id } = data as { id: string };
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } else if (type === 'waiter:called') {
        const call = data as WaiterCall;
        setWaiterCalls((prev) => [call, ...prev.filter((c) => c.id !== call.id)]);
        setSuccessBanner(`Table ${call.table_number} requests: ${call.reason}`);
        setTimeout(() => setSuccessBanner(null), 5000);
      } else if (type === 'waiter:attended') {
        const { id } = data as { id: string };
        setWaiterCalls((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'attended' } : c)));
      } else if (type === 'review:created') {
        const review = data as Review;
        setReviews((prev) => [review, ...prev.filter((r) => r.id !== review.id)]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Socket.IO listener
  useEffect(() => {
    if (!socket) return;
    const handleOrderPlaced = (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    };
    const handleOrderUpdated = (updatedOrder: Order) => {
      const is_fast_order = Boolean(
        updatedOrder.is_fast_order ||
        updatedOrder.notes?.includes('[FAST_ORDER]') ||
        updatedOrder.notes?.includes('[NO_CHANGE]')
      );
      const is_finalized = Boolean(
        updatedOrder.is_finalized ||
        updatedOrder.notes?.includes('[FINALIZED]') ||
        is_fast_order
      );
      const is_modified = Boolean(
        updatedOrder.is_modified ||
        updatedOrder.notes?.includes('[MODIFIED]')
      );
      const formatted: Order = {
        ...updatedOrder,
        is_fast_order,
        is_finalized,
        is_modified
      };
      setOrders((prev) =>
        prev.map((o) => (o.id === formatted.id || o.order_number === formatted.order_number ? { ...o, ...formatted } : o))
      );
      if (formatted.is_fast_order) {
        setSuccessBanner(`Order #${formatted.order_number} confirmed by customer (Fast Delivery)! Ready to prepare.`);
        setTimeout(() => setSuccessBanner(null), 5000);
      } else if (formatted.is_modified) {
        setSuccessBanner(`Order #${formatted.order_number} was modified by customer! Items updated.`);
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    };

    socket.on('order:placed', handleOrderPlaced);
    socket.on('order:updated', handleOrderUpdated);
    return () => {
      socket.off('order:placed', handleOrderPlaced);
      socket.off('order:updated', handleOrderUpdated);
    };
  }, [socket]);

  // Order status transition actions: pending -> preparing -> ready -> served -> completed
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setSuccessBanner(null);

    // Rule 1 & Rule 2 Check: Cook/Admin can only prepare if 1 minute passed OR customer chose Fast Delivery
    if (nextStatus === 'preparing') {
      const target = orders.find((o) => o.id === orderId);
      if (target && target.status === 'pending') {
        const isFast = Boolean(target.is_fast_order || target.notes?.includes('[FAST_ORDER]') || target.notes?.includes('[NO_CHANGE]'));
        const ageSec = Math.max(0, Math.floor((Date.now() - new Date(target.created_at).getTime()) / 1000));
        if (ageSec < 60 && !isFast) {
          alert(`Customer 1-minute decision window is active (${60 - ageSec}s remaining). Admin can prepare only after 1 minute or once customer selects Fast Delivery.`);
          return;
        }
      }
    }

    await apiClient.updateOrderStatus(orderId, nextStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus, completed: nextStatus === 'completed' } : o))
    );
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel and remove this order?')) {
      await apiClient.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const handleAttendWaiter = async (callId: string) => {
    await apiClient.attendWaiterCall(callId);
    setWaiterCalls((prev) => prev.map((c) => (c.id === callId ? { ...c, status: 'attended' } : c)));
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await apiClient.exportOrdersToExcel();
      setSuccessBanner('Orders successfully exported to Excel (.xlsx)!');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveBrandName = async () => {
    if (tempBrandName.trim()) {
      await updateBrand(tempBrandName.trim());
      setIsEditingBrand(false);
      setSuccessBanner(`Restaurant name updated to "${tempBrandName.trim()}"!`);
      setTimeout(() => setSuccessBanner(null), 3000);
    }
  };

  // Analytics Metrics
  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const readyOrders = orders.filter((o) => o.status === 'ready' || o.status === 'served');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const pendingCalls = waiterCalls.filter((c) => c.status === 'pending');

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const activeTablesCount = new Set(activeOrders.map((o) => o.table_number)).size;

  return (
    <div className="min-h-screen bg-[#F0F7FF] pt-4 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Alert when active notification or new order is ringing */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 rounded-2xl bg-blue-600 text-white font-medium text-xs flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => {
                setSuccessBanner(null);
              }}
              className="text-white hover:bg-blue-700 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Editable Website/Restaurant Name and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">Live Kitchen Terminal</span>
          </div>

          {/* Editable Brand / Website Name Section */}
          <div className="flex items-center gap-2 mt-1">
            {isEditingBrand ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempBrandName}
                  onChange={(e) => setTempBrandName(e.target.value)}
                  placeholder="Enter Restaurant Name"
                  className="px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50/50 text-slate-900 font-extrabold text-lg focus:outline-none focus:border-blue-600"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveBrandName}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  title="Save Name"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempBrandName(brandName);
                    setIsEditingBrand(false);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {brandName} Kitchen & Manager Console
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingBrand(true)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                  title="Edit Restaurant Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Edit Name</span>
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time table orders, kitchen preparation queue, and shift records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-blue-200 text-slate-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAccountModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Change Admin Username and Password"
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Change Login</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Revenue</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-blue-600">
            ₹{totalRevenue.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400">From {orders.length} total orders</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Kitchen Orders</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-amber-600">
            {activeOrders.length}
          </p>
          <span className="text-[10px] text-slate-400">Needs preparation / service</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Seated Active Tables</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
            {activeTablesCount} Tables
          </p>
          <span className="text-[10px] text-slate-400">Occupied dining tables</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Waiter Calls Pending</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-red-600">
            {pendingCalls.length}
          </p>
          <span className="text-[10px] text-slate-400">Customers requesting help</span>
        </div>
      </div>

      {/* Active Waiter Call Assistance Alerts Banner */}
      {pendingCalls.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Active Customer Assistance Calls ({pendingCalls.length})</span>
            </h3>
            <button
              onClick={() => setActiveTab('waiter')}
              className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
            >
              View All Calls →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {pendingCalls.map((call) => (
              <div
                key={call.id}
                className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900">Table #{call.table_number}:</span>
                  <span className="ml-1 text-amber-800 font-semibold">{call.reason}</span>
                  <span className="block text-[10px] text-slate-400">
                    {new Date(call.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAttendWaiter(call.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                >
                  Attended ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-blue-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-blue-100 hover:bg-blue-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Orders ({activeOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ready'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-blue-100 hover:bg-blue-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ready & Served ({readyOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-blue-100 hover:bg-blue-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({completedOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('waiter')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'waiter'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-blue-100 hover:bg-blue-50'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Waiter Calls ({waiterCalls.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-blue-100 hover:bg-blue-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Customer Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* Tab 1 & 2: Orders Grid */}
      {(activeTab === 'active' || activeTab === 'ready' || activeTab === 'completed') && (
        <div>
          {(() => {
            const displayOrders =
              activeTab === 'active' ? activeOrders :
              activeTab === 'ready' ? readyOrders : completedOrders;

            if (displayOrders.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center space-y-2">
                  <Utensils className="w-10 h-10 text-blue-300 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-sm">No orders in this tab</h3>
                  <p className="text-xs text-slate-500">Orders placed by customers will automatically show up here in real time.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayOrders.map((order) => {
                  const status = order.status || (order.completed ? 'completed' : 'pending');

                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-800 border-amber-300',
                    preparing: 'bg-blue-50 text-blue-800 border-blue-300',
                    ready: 'bg-purple-50 text-purple-800 border-purple-300',
                    served: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                    completed: 'bg-slate-100 text-slate-700 border-slate-200',
                    cancelled: 'bg-red-50 text-red-800 border-red-200'
                  };

                  // 1-Minute Grace Window calculation
                  const isFastDelivery = Boolean(
                    order.is_fast_order ||
                    order.notes?.includes('[FAST_ORDER]') ||
                    order.notes?.includes('[NO_CHANGE]')
                  );
                  const isModified = Boolean(
                    order.is_modified ||
                    order.notes?.includes('[MODIFIED]')
                  );
                  const orderAgeSec = Math.max(0, Math.floor((now - new Date(order.created_at).getTime()) / 1000));
                  const graceSecondsRemaining = Math.max(0, 60 - orderAgeSec);
                  const isTimerCounting = status === 'pending' && graceSecondsRemaining > 0 && !isFastDelivery;
                  const canPrepareOrder = isFastDelivery || graceSecondsRemaining === 0;

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 ${
                        status === 'pending' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-blue-100'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Order Header */}
                        <div className="flex items-center justify-between border-b border-blue-50 pb-3 gap-2 flex-wrap sm:flex-nowrap">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="inline-flex items-center justify-center min-w-[4rem] w-auto h-auto px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold font-mono text-xs border border-blue-200 shrink-0 shadow-2xs whitespace-nowrap">
                              #{order.order_number}
                            </span>
                            <div className="min-w-0">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 whitespace-nowrap shadow-2xs">
                                <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Table #{order.table_number}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(order.created_at).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </div>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 ${statusColors[status] || statusColors.pending}`}>
                            {status}
                          </span>
                        </div>

                        {/* 1-Minute Grace Window & Modification Indicators for Kitchen */}
                        {status === 'pending' && (
                          <div className="space-y-1.5">
                            {isTimerCounting ? (
                              <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="relative flex h-3 w-3 shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    </span>
                                    <span className="font-bold text-xs truncate">
                                      {isModified ? '✏️ Customer Updated Order!' : '⏳ 1-Min Customer Window Active'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-amber-200/90 border border-amber-400/50 px-2.5 py-1 rounded-xl text-amber-950 font-mono font-black text-xs shadow-2xs shrink-0 whitespace-nowrap">
                                    <Clock className="w-3.5 h-3.5 text-amber-800 animate-spin" />
                                    <span>00:{graceSecondsRemaining < 10 ? `0${graceSecondsRemaining}` : graceSecondsRemaining}</span>
                                  </div>
                                </div>

                                {/* Live linear countdown bar */}
                                <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden border border-amber-300/40">
                                  <div
                                    className="bg-linear-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-1000 ease-linear"
                                    style={{ width: `${(graceSecondsRemaining / 60) * 100}%` }}
                                  />
                                </div>

                                <p className="text-[11px] text-amber-800 font-medium">
                                  {isModified
                                    ? `Customer modified dishes within 1 min. Kitchen prepare button unlocks when timer reaches 00:00 (${graceSecondsRemaining}s left).`
                                    : `Customer can modify dishes or select Fast Delivery. Prepare button unlocks in ${graceSecondsRemaining}s.`}
                                </p>
                              </div>
                            ) : isFastDelivery ? (
                              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-semibold shadow-2xs">
                                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                  <Zap className="w-4 h-4 fill-white" />
                                </div>
                                <div>
                                  <span className="font-bold text-emerald-900 block">⚡ Fast Delivery Confirmed (No Changes)</span>
                                  <span className="text-[11px] text-emerald-700">Customer confirmed no changes. Ready to prepare immediately!</span>
                                </div>
                              </div>
                            ) : isModified ? (
                              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50 border-2 border-blue-300 text-blue-900 text-xs font-semibold shadow-2xs">
                                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                  <Edit3 className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-bold text-blue-900 block">✅ 1-Min Window Closed (Order Modified)</span>
                                  <span className="text-[11px] text-blue-700">Customer finished edits. Ready for kitchen preparation!</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs">
                                <div className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-bold text-blue-900 block">✅ 1-Min Window Closed</span>
                                  <span className="text-[11px] text-blue-700">No edits received. Ready for kitchen preparation!</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Customer Information Badge */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-bold">{order.customer_name || 'Guest Customer'}</span>
                          </div>
                          {order.customer_phone && (
                            <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              +91 {order.customer_phone}
                            </span>
                          )}
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-1.5 text-xs">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start text-slate-800">
                              <div>
                                <span className="font-bold text-slate-900">{item.quantity}x</span>{' '}
                                <span>{item.item_name}</span>
                                {item.notes && (
                                  <span className="block text-[11px] text-amber-700 font-medium">
                                    ↳ {item.notes}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-slate-600 whitespace-nowrap">
                                ₹{(item.item_price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Special General Notes */}
                        {order.notes && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                            <b>Instructions:</b>{' '}
                            {order.notes
                              .replace(/\[MODIFIED\]/g, '')
                              .replace(/\[FINALIZED\]/g, '')
                              .replace(/\[FAST_ORDER\]/g, '')
                              .replace(/\[NO_CHANGE\]/g, '')
                              .trim() || 'None'}
                          </div>
                        )}
                      </div>

                      {/* Card Footer with Price and Status Transition Machine Buttons */}
                      <div className="border-t border-blue-50 pt-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-500">Order Total:</span>
                          <span className="font-mono font-bold text-base text-blue-600">
                            ₹{order.total_amount.toFixed(2)}
                          </span>
                        </div>

                        {/* State Machine Transition Action Buttons */}
                        <div className="flex gap-1.5 pt-1">
                          {status === 'pending' && (
                            !canPrepareOrder ? (
                              <div className="flex-1 space-y-1.5">
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none shadow-2xs"
                                  title={`Locked during customer 1-minute window (${graceSecondsRemaining}s remaining)`}
                                >
                                  <Lock className="w-4 h-4 text-slate-400" />
                                  <span>Locked: Wait 1-Min Window ({graceSecondsRemaining}s)</span>
                                </button>
                                <p className="text-[10px] text-center text-slate-400 font-medium">
                                  Unlocks at 00:00 or when customer selects "Don't Change (Fast Delivery)"
                                </p>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md animate-pulse"
                                title="Start preparing order"
                              >
                                <ChefHat className="w-4 h-4" />
                                <span>Start Preparing (Acknowledge)</span>
                              </button>
                            )
                          )}

                          {status === 'preparing' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'ready')}
                              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Mark Food Ready</span>
                            </button>
                          )}

                          {status === 'ready' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'served')}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Served</span>
                            </button>
                          )}

                          {status === 'served' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete Order</span>
                            </button>
                          )}

                          {status !== 'completed' && status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                              title="Cancel Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 3: Waiter Calls Management */}
      {activeTab === 'waiter' && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 space-y-4 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm">Table Assistance Calls Log</h3>
          {waiterCalls.length === 0 ? (
            <p className="text-xs text-slate-400">No waiter assistance calls logged yet.</p>
          ) : (
            <div className="space-y-2">
              {waiterCalls.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                    c.status === 'pending'
                      ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Table #{c.table_number}:</span>{' '}
                    <span className="font-semibold text-blue-700">{c.reason}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        {c.customer_name || 'Guest'}
                      </span>
                      <span>•</span>
                      <span>{new Date(c.created_at).toLocaleTimeString('en-IN')}</span>
                    </div>
                  </div>

                  {c.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleAttendWaiter(c.id)}
                      className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Mark Attended
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                      Attended ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Customer Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Customer Feedback & Dining Reviews</h3>
            <p className="text-xs text-slate-500">Reviews submitted by dining customers from table orders.</p>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No customer reviews submitted yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">Table #{r.table_number}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5 font-medium">
                        ({r.customer_name || 'Guest Customer'})
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.review_text && (
                    <p className="text-xs text-slate-700 italic">"{r.review_text}"</p>
                  )}
                  <span className="block text-[10px] text-slate-400">
                    {new Date(r.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Account Credentials Modal */}
      <AdminAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSuccess={(newName) => {
          setSuccessBanner(`Admin username successfully updated to "${newName}"!`);
          setTimeout(() => setSuccessBanner(null), 5000);
        }}
      />

    </div>
  );
};
