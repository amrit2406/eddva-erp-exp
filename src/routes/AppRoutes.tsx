import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import CanteenProtectedRoute from './CanteenProtectedRoute';
import CanteenPublicRoute from './CanteenPublicRoute';
import AdmissionProtectedRoute from './AdmissionProtectedRoute';
import AdmissionPublicRoute from './AdmissionPublicRoute';
import { routeConfig } from './routeConfig';

// Modules with their own auth island get their own guards (staff can sign in
// directly without a core session); everything else uses the core guards.
function guardsFor(path: string) {
  if (path.startsWith('/canteen')) return { Protected: CanteenProtectedRoute, Public: CanteenPublicRoute };
  if (path.startsWith('/admission')) return { Protected: AdmissionProtectedRoute, Public: AdmissionPublicRoute };
  return { Protected: ProtectedRoute, Public: PublicRoute };
}

export default function AppRoutes() {
  return (
    <Routes>
      {routeConfig.map((route) => {
        const Element = route.element;
        const { Protected, Public } = guardsFor(route.path);
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.isProtected ? (
                <Protected>
                  <Element />
                </Protected>
              ) : route.isPublic ? (
                <Public>
                  <Element />
                </Public>
              ) : (
                <Element />
              )
            }
          />
        );
      })}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
