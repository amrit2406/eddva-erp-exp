import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { config } from '../config/env';
import { isAdmissionAuthenticated } from '../features/admission/utils/ssoSession';

interface AdmissionProtectedRouteProps {
  children: React.ReactNode;
}

// Admission routes accept either a core-authenticated session (institute admins,
// exchanged transparently for a admission_token by the axios interceptor) or a
// admission staff direct-login session — see src/features/admission/utils/ssoSession.ts.
export default function AdmissionProtectedRoute({ children }: AdmissionProtectedRouteProps) {
  const isCoreAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isCoreAuthenticated && !config.apiToken && !isAdmissionAuthenticated()) {
    return <Navigate to="/admission/login" replace />;
  }

  return <>{children}</>;
}
