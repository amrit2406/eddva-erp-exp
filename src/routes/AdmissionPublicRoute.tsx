import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { config } from '../config/env';
import { isAdmissionAuthenticated } from '../features/admission/utils/ssoSession';

interface AdmissionPublicRouteProps {
  children: React.ReactNode;
}

// Guards /admission/login: anyone already signed in — core admin or admission
// staff — gets sent straight into the module instead of seeing the form.
export default function AdmissionPublicRoute({ children }: AdmissionPublicRouteProps) {
  const isCoreAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isCoreAuthenticated || config.apiToken || isAdmissionAuthenticated()) {
    return <Navigate to="/admission/permissions" replace />;
  }

  return <>{children}</>;
}
