import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import CanteenProtectedRoute from './CanteenProtectedRoute';
import CanteenPublicRoute from './CanteenPublicRoute';
import { routeConfig } from './routeConfig';

export default function AppRoutes() {
  return (
    <Routes>
      {routeConfig.map((route) => {
        const Element = route.element;
        const isCanteenRoute = route.path.startsWith('/canteen');
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.isProtected ? (
                isCanteenRoute ? (
                  <CanteenProtectedRoute>
                    <Element />
                  </CanteenProtectedRoute>
                ) : (
                  <ProtectedRoute>
                    <Element />
                  </ProtectedRoute>
                )
              ) : route.isPublic ? (
                isCanteenRoute ? (
                  <CanteenPublicRoute>
                    <Element />
                  </CanteenPublicRoute>
                ) : (
                  <PublicRoute>
                    <Element />
                  </PublicRoute>
                )
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
