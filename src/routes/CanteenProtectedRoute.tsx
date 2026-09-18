import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { config } from '../config/env';
import { isCanteenAuthenticated } from '../features/canteen/utils/ssoSession';

interface CanteenProtectedRouteProps {
  children: React.ReactNode;
}

// Canteen routes accept either a core-authenticated session (institute admins,
// exchanged transparently for a canteen_token by the axios interceptor) or a
// canteen staff direct-login session — see src/features/canteen/utils/ssoSession.ts.
export default function CanteenProtectedRoute({ children }: CanteenProtectedRouteProps) {
  const isCoreAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isCoreAuthenticated && !config.apiToken && !isCanteenAuthenticated()) {
    return <Navigate to="/canteen/login" replace />;
  }

  return <>{children}</>;
}
