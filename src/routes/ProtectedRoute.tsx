import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ROUTES } from '../constants/routes';
import { config } from '../config/env';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated && !config.apiToken) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
