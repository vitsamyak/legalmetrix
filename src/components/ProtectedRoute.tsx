import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandedLoader } from './BrandedLoader';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show branded loading screen while resolving authentication
  if (isLoading) {
    return (
      <BrandedLoader
        message="Verifying Authorization"
        subMessage="Validating active inspector session credentials..."
        fullScreen={true}
      />
    );
  }

  // Redirect unauthenticated user with encoded intended destination
  if (!isAuthenticated) {
    const intendedPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(intendedPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};
