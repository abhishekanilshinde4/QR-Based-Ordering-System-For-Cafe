import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('scandine_token') || localStorage.getItem('aura_cafe_token');

  if (!token) {
    // If not authenticated, redirect to /login and pass state so login shows a clear warning
    return <Navigate to="/login" state={{ from: location.pathname, unauthorized: true }} replace />;
  }

  return <>{children}</>;
};
