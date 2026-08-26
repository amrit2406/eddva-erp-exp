import type { ReactNode } from 'react';
import QueryProvider from './QueryProvider';
import ThemeProvider from './ThemeProvider';
import { ToastProvider } from '../../hooks/useToast';
import ToastContainer from '../../components/ui/Toast';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
