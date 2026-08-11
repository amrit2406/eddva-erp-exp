import type { ReactNode } from 'react';
import { useUIStore } from '../stores/ui.store';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Breadcrumbs from './components/Breadcrumbs';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ease-in-out ml-0 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        <Header />
        <main className="p-4 sm:p-6">
          <Breadcrumbs />
          <div className="mt-4 sm:mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
