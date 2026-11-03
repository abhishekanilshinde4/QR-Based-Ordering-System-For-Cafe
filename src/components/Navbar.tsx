import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, QrCode, Globe, Bell, LogOut, UtensilsCrossed, LayoutDashboard, Clock, KeyRound } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { Logo } from './Logo';
import { CallWaiterModal } from './CallWaiterModal';
import { AdminAccountModal } from './AdminAccountModal';
import { Language } from '../types';

export const Navbar: React.FC = () => {
  const { itemCount, tableNumber, setTableNumber } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { brandName } = useBrand();
  const location = useLocation();
  const navigate = useNavigate();

  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/login';

  const handleLogout = () => {
    localStorage.removeItem('scandine_token');
    localStorage.removeItem('aura_cafe_token');
    localStorage.removeItem('scandine_user');
    localStorage.removeItem('aura_cafe_admin_user');
    navigate('/login');
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'mr', label: 'मराठी' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-blue-100 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo with dynamic restaurant name */}
          <Link to="/menu" className="flex items-center group hover:opacity-90 transition-opacity shrink-0">
            <Logo size="md" />
          </Link>

          {/* Center Table Indicator (Customer View) */}
          {!isAdminRoute && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-slate-700 text-xs">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-slate-600">{t.table}:</span>
              <select
                value={tableNumber || 1}
                onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
                className="bg-transparent font-bold text-blue-700 focus:outline-none cursor-pointer"
                title="Select dining table"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>Table #{n}</option>
                ))}
              </select>
            </div>
          )}

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Multi-Language Selector (English, Hindi, Marathi) */}
            <div className="flex items-center rounded-lg border border-blue-200 bg-blue-50/60 p-0.5 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-blue-500 ml-1.5 mr-1" />
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-1 rounded-md text-[11px] transition-all font-semibold ${
                    language === l.code
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-blue-100/60'
                  }`}
                  title={`Switch language to ${l.label}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Customer Side: Call Waiter Button */}
            {!isAdminRoute && (
              <button
                type="button"
                onClick={() => setIsWaiterModalOpen(true)}
                className="px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Call waiter to your table"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">{t.callWaiter}</span>
              </button>
            )}

            {/* Customer Side: Track Live Order Link */}
            {!isAdminRoute && (
              <Link
                to="/track"
                className="px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Track live order status"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{t.trackOrderTab}</span>
              </Link>
            )}

            {/* Customer Side: Cart / Order Tray Link */}
            {!isAdminRoute && (
              <Link
                to="/cart"
                className="relative px-3.5 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xs cursor-pointer font-semibold text-xs"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">{t.yourCart}</span>
                {itemCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Staff / Admin Controls */}
            {isAdminRoute && location.pathname !== '/login' ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-blue-50'
                  }`}
                >
                  Live Kitchen
                </Link>
                <Link
                  to="/admin/menu"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/admin/menu'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-blue-50'
                  }`}
                >
                  Menu
                </Link>
                <Link
                  to="/admin/tables"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/admin/tables'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-blue-50'
                  }`}
                >
                  QR Tables
                </Link>
                <Link
                  to="/menu"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50 border border-blue-200 transition-colors hidden sm:inline-block"
                >
                  Customer View
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Change Admin Username & Password"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Change Login</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Sign Out of Admin"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : !isAdminRoute ? (
              <Link
                to="/admin"
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-2xs"
                title="Hotel Staff & Kitchen Login"
              >
                Staff Login
              </Link>
            ) : null}

          </div>

        </div>
      </header>

      {/* Call Waiter Dialog */}
      <CallWaiterModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableNumber={tableNumber || 1}
      />

      {/* Admin Account Credentials Modal */}
      <AdminAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
};
