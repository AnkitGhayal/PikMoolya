import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying session..." />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
