import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, CheckCircle2, QrCode, Clock, Utensils } from 'lucide-react';
import { Order } from '../types';

interface UnacknowledgedOrderModalProps {
  unacknowledgedOrders: Order[];
  onAcknowledge: (orderId: string) => void;
  onAcknowledgeAll: () => void;
}

export const UnacknowledgedOrderModal: React.FC<UnacknowledgedOrderModalProps> = ({
  unacknowledgedOrders,
  onAcknowledge,
  onAcknowledgeAll
}) => {
  if (unacknowledgedOrders.length === 0) return null;

  const currentOrder = unacknowledgedOrders[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E8E2D8] text-[#1C1917]"
        >
          {/* Header Banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFF5F4] border border-[#FAD2CD] text-[#DE4B2C] mb-5">
            <div className="w-10 h-10 rounded-full bg-white border border-[#FAD2CD] flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-[#DE4B2C] animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-serif uppercase tracking-widest block text-[#C93F22]">
                Incoming Table Order
              </span>
              <h3 className="font-serif font-bold text-base text-[#1C1917]">
                New Order Received
              </h3>
              <p className="text-[11px] text-[#78716C]">
                {unacknowledgedOrders.length > 1
                  ? `${unacknowledgedOrders.length} orders waiting for staff confirmation`
                  : 'Acknowledge to silence the kitchen chime'}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3.5 gap-2">
              <div>
                <span className="text-[10px] font-serif uppercase tracking-widest text-[#8C827A] block mb-1">
                  Order ID
                </span>
                <span className="inline-flex items-center justify-center min-w-[4rem] w-auto h-auto px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] font-mono font-bold text-base text-[#1C1917] whitespace-nowrap shadow-2xs">
                  #{currentOrder.order_number}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-serif uppercase tracking-widest text-[#8C827A] block mb-1">
                  Assigned Seating
                </span>
                <div className="inline-flex items-center justify-end gap-1.5 px-3 py-1 rounded-xl bg-[#FFF5F4] border border-[#FAD2CD] font-bold font-serif text-sm text-[#DE4B2C] whitespace-nowrap shadow-2xs">
                  <QrCode className="w-4 h-4 text-[#DE4B2C] shrink-0" />
                  <span>Table {currentOrder.table_number}</span>
                </div>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] font-serif uppercase tracking-widest text-[#8C827A] flex items-center gap-1.5">
                <Utensils className="w-3 h-3 text-[#DE4B2C]" /> Items Ordered ({(currentOrder.items || []).length})
              </span>
              <ul className="divide-y divide-[#F2ECE3] bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#E8E2D8]">
                {(currentOrder.items || []).map((item) => (
                  <li key={item.id} className="py-2 flex justify-between text-xs first:pt-0 last:pb-0">
                    <div>
                      <span className="font-serif text-sm font-semibold text-[#1C1917]">
                        {item.quantity}× {item.item_name}
                      </span>
                      {item.notes && (
                        <p className="text-[11px] text-[#78716C] italic font-sans mt-0.5">
                          Note: "{item.notes}"
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#DE4B2C]">
                      ₹{(item.item_price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {currentOrder.notes && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
                <span className="text-[10px] font-serif text-[#8C827A] uppercase tracking-wider block mb-0.5">
                  Special Instructions:
                </span>
                <p className="text-xs text-[#1C1917] italic">"{currentOrder.notes}"</p>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-[#E8E2D8]">
              <span className="text-xs font-serif text-[#78716C]">Total Bill:</span>
              <span className="text-lg font-mono font-bold text-[#DE4B2C]">
                ₹{currentOrder.total_amount.toFixed(2)}
              </span>
            </div>

            {/* Acknowledge Button */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => onAcknowledge(currentOrder.id)}
                className="w-full py-3 px-5 rounded-full bg-[#DE4B2C] hover:bg-[#C93F22] text-white font-serif tracking-wide text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge Order</span>
              </button>

              {unacknowledgedOrders.length > 1 && (
                <button
                  onClick={onAcknowledgeAll}
                  className="w-full py-2 text-xs font-serif text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
                >
                  Acknowledge All ({unacknowledgedOrders.length} orders)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
