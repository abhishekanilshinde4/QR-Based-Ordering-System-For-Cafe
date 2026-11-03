import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, User, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { apiClient } from '../services/apiClient';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user was blocked by ProtectedRoute
  const wasBlocked = location.state?.unauthorized || location.state?.from;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiClient.login(username, password);
      if (res && res.token) {
        localStorage.setItem('scandine_token', res.token);
        localStorage.setItem('aura_cafe_token', res.token);
        localStorage.setItem('scandine_user', JSON.stringify(res.user));
        localStorage.setItem('aura_cafe_admin_user', JSON.stringify(res.user));
      }
      const destination = location.state?.from || '/admin';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-blue-100 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <Logo size="lg" />

          <div className="pt-2">
            <h1 className="text-xl font-bold text-slate-900">
              Staff & Kitchen Authentication
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Administrator & Staff Portal • Authorized Access Only
            </p>
          </div>
        </div>

        {/* Security Alert if user tried navigating to /admin directly */}
        {wasBlocked && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Security Alert: Access Restricted</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Direct access to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">/admin</code> is blocked. Please authenticate with administrator credentials below.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Menu</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
