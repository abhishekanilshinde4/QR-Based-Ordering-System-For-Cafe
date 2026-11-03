import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { CustomerProvider } from './context/CustomerContext';
import { LanguageProvider } from './context/LanguageContext';
import { BrandProvider } from './context/BrandContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { CustomerMenu } from './pages/CustomerMenu';
import { CartPage } from './pages/CartPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { CustomerTrackOrder } from './pages/CustomerTrackOrder';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMenu } from './pages/AdminMenu';
import { AdminTables } from './pages/AdminTables';

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <BrandProvider>
          <LanguageProvider>
            <CartProvider>
              <CustomerProvider>
              <Router>
                <div className="min-h-screen bg-[#F0F7FF] text-slate-900 transition-colors font-sans selection:bg-blue-600 selection:text-white">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Navigate to="/menu" replace />} />
                      <Route path="/menu" element={<CustomerMenu />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/order-success" element={<OrderSuccessPage />} />
                      <Route path="/track" element={<CustomerTrackOrder />} />
                      
                      {/* Public Staff Login Page */}
                      <Route path="/login" element={<AdminLogin />} />

                      {/* Fully Protected Administrator and Kitchen Routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/menu"
                        element={
                          <ProtectedRoute>
                            <AdminMenu />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/tables"
                        element={
                          <ProtectedRoute>
                            <AdminTables />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch all redirect */}
                      <Route path="*" element={<Navigate to="/menu" replace />} />
                    </Routes>
                  </main>
                </div>
              </Router>
              </CustomerProvider>
            </CartProvider>
          </LanguageProvider>
        </BrandProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}
