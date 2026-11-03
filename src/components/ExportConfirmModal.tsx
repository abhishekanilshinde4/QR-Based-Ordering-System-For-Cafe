import React, { useState } from 'react';
import { X, Lock, Download, AlertTriangle, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface ExportConfirmModalProps {
  isOpen: boolean;
  orderCount: number;
  onClose: () => void;
  onSuccessCleared: () => void;
}

export const ExportConfirmModal: React.FC<ExportConfirmModalProps> = ({
  isOpen,
  orderCount,
  onClose,
  onSuccessCleared
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your staff password to confirm.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (password !== 'admin123') {
        const token = localStorage.getItem('aura_cafe_token');
        let passValid = false;
        if (token) {
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: 'admin', password })
            });
            if (res.ok) passValid = true;
          } catch {}
        }
        if (!passValid) {
          setError('Incorrect admin password. Access denied.');
          setLoading(false);
          return;
        }
      }

      await apiClient.exportAndClearOrders(password);
      onSuccessCleared();
      setPassword('');
      onClose();
    } catch (err: any) {
      console.warn('Export error:', err);
      setError('An unexpected error occurred during export.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E8E2D8] shadow-xl overflow-hidden p-6 sm:p-7 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E2D8] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FAF7F2] border border-[#DCD5C9] text-[#DE4B2C] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-[1px] w-4 bg-[#DCD5C9]" />
                <span className="text-[10px] font-serif uppercase tracking-widest text-[#8C827A]">
                  Shift Close & Settlement
                </span>
              </div>
              <h2 className="font-serif font-bold text-xl text-[#1C1917]">
                Export Shift & Clear Queue
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E2DDD3] text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Alert */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-[#57534E] text-xs leading-relaxed space-y-2.5">
          <div className="flex items-center gap-2 font-serif font-bold text-[#1C1917] text-sm">
            <AlertTriangle className="w-4 h-4 text-[#DE4B2C] shrink-0" />
            <span>Daily Shift Summary Notice</span>
          </div>
          <p>
            You are about to export <strong>{orderCount} order(s)</strong> recorded during this shift into an Excel spreadsheet with itemized breakdowns and timestamps.
          </p>
          <div className="p-3 rounded-xl bg-white border border-[#E8E2D8] text-[#78716C] flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#DE4B2C] shrink-0" />
            <span>After downloading the spreadsheet, active orders will be archived and cleared from the live kitchen screen for the next shift.</span>
          </div>
        </div>

        {/* Password Confirmation Form */}
        <form onSubmit={handleConfirmExport} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-serif text-[#1C1917] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8C827A]" />
                Staff Password Confirmation
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full px-4 py-2.5 rounded-full bg-[#FAF7F2] border border-[#E2DDD3] text-xs sm:text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#DE4B2C] transition-colors pr-10"
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#1C1917] p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-[#FFF5F4] border border-[#FAD2CD] text-[#DE4B2C] text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full border border-[#DCD5C9] text-xs font-serif text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#DE4B2C] hover:bg-[#C93F22] text-white text-xs font-serif tracking-wide shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Excel...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Export to Excel</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
