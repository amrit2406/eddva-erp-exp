import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { routeConfig } from './routeConfig';

export default function AppRoutes() {
  return (
    <Routes>
      {routeConfig.map((route) => {
        const Element = route.element;
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.isProtected ? (
                <ProtectedRoute>
                  <Element />
                </ProtectedRoute>
              ) : route.isPublic ? (
                <PublicRoute>
                  <Element />
                </PublicRoute>
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
