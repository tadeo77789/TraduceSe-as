/**
 * @file ThemeContext.tsx
 * @description Contexto global de tema visual (claro / oscuro).
 *
 * Provee `mode` ('light' | 'dark'), `isDark` (boolean) y `toggleTheme`
 * para alternar entre temas desde cualquier pantalla.
 *
 * @exports ThemeProvider - Proveedor que debe envolver la app junto a `AuthProvider`.
 * @exports useTheme - Hook para consumir el contexto de tema.
 *
 * @note El modo oscuro está disponible en estado pero aún no se aplica
 *       a las pantallas individuales.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ThemeMode } from '../types';
import { Colors, DarkColors } from '../constants/colors';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = useCallback(() => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const resetTheme = useCallback(() => {
    setMode('light');
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({ mode, isDark: mode === 'dark', toggleTheme, resetTheme }),
    [mode, toggleTheme, resetTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
};

export const useColors = () => {
  const { isDark } = useTheme();
  return isDark ? DarkColors : Colors;
};
