import { BrowserRouter } from 'react-router-dom';
import AppProviders from './providers/AppProviders';
import AppRoutes from '../routes/AppRoutes';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const isKioskPage = location.pathname.startsWith('/kiosk');
  const isGpsIngestPage = location.pathname.startsWith('/gps-ingest');

  if (isAuthPage || isKioskPage || isGpsIngestPage) {
    return (
      <AuthLayout>
        <AppRoutes />
      </AuthLayout>
    );
  }

  return (
    <DashboardLayout>
      <AppRoutes />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </BrowserRouter>
  );
}
