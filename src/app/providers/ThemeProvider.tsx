import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // For now, we're using a simple theme provider
  // In the future, this can be extended to support dark mode, theme switching, etc.
  return <>{children}</>;
}
