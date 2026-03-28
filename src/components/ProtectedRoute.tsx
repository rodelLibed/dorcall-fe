import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'agent' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={requiredRole === 'admin' ? '/admin-login' : '/agent-login'} replace />;
  }

  if (user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin-login' : '/agent-login'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
