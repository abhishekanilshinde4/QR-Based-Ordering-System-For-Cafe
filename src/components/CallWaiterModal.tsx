import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Droplets, Receipt, Utensils, HelpCircle, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCustomer } from '../context/CustomerContext';
import { apiClient } from '../services/apiClient';

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
}

export const CallWaiterModal: React.FC<CallWaiterModalProps> = ({
  isOpen,
  onClose,
  tableNumber
}) => {
  const { t } = useLanguage();
  const { customerInfo } = useCustomer();
  const [selectedReason, setSelectedReason] = useState<string>('Drinking Water');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reasons = [
    { id: 'Drinking Water', label: t.needWater, icon: Droplets },
    { id: 'Request Final Bill', label: t.needBill, icon: Receipt },
    { id: 'Extra Cutlery / Plates', label: t.needCutlery, icon: Utensils },
    { id: 'General Assistance', label: t.generalHelp, icon: HelpCircle }
  ];

  const handleCall = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.callWaiter({
        table_number: tableNumber,
        reason: selectedReason,
        customer_name: customerInfo?.name || 'Guest'
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (e) {
      console.error(e);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{t.callWaiter}</h3>
                <p className="text-xs text-slate-500">{t.table} #{tableNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">{t.waiterCalledSuccess}</h4>
              <p className="text-xs text-slate-500">
                Kitchen and floor staff have been alerted with an audible chime for Table #{tableNumber}.
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <p className="text-xs font-medium text-slate-600">{t.selectAssistance}</p>
              <div className="space-y-2">
                {reasons.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedReason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReason(r.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleCall}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t.callingWaiter : t.confirmCall}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
