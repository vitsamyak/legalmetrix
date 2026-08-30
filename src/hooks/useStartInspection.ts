import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable hook implementing the unified "Start Inspection" authentication check.
 * If user is authenticated, navigates directly to destination (/new-inspection).
 * If user is unauthenticated, stores destination and redirects to /login?redirect=...
 */
export const useStartInspection = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleStartInspection = (destination: string = '/new-inspection') => {
    if (isLoading) return;

    if (isAuthenticated) {
      navigate(destination);
    } else {
      try {
        sessionStorage.setItem('legalmetrix_intended_destination', destination);
      } catch {
        // Storage disabled/private mode fallback
      }
      navigate(`/login?redirect=${encodeURIComponent(destination)}`);
    }
  };

  return { handleStartInspection, isAuthenticated, isLoading };
};
