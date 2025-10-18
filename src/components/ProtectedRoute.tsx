// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  component: React.ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = '/auth';
    return null;
  }

  return <Component />;
};

export default ProtectedRoute;