import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { config } from '../config/env';
import { isCanteenAuthenticated } from '../features/canteen/utils/ssoSession';

interface CanteenPublicRouteProps {
  children: React.ReactNode;
}

// Guards /canteen/login: anyone already signed in — core admin or canteen
// staff — gets sent straight into the module instead of seeing the form.
export default function CanteenPublicRoute({ children }: CanteenPublicRouteProps) {
  const isCoreAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isCoreAuthenticated || config.apiToken || isCanteenAuthenticated()) {
    return <Navigate to="/canteen/orders" replace />;
  }

  return <>{children}</>;
}
