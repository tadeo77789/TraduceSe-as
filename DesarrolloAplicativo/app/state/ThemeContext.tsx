import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = useCallback(() => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({ mode, isDark: mode === 'dark', toggleTheme }),
    [mode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
};
