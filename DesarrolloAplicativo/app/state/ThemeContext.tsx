// @ubicacion app/state/ThemeContext.tsx
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
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'; // Importa React y los hooks: createContext (crear contexto), useContext (consumir contexto), useState (estado local), useCallback (memorizar funciones), useMemo (memorizar valores) — fuente: node_modules/react
import { ThemeMode } from '../types'; // Importa el tipo ThemeMode ('light' | 'dark') que restringe los valores válidos del tema — fuente: app/types/index.ts
import { Colors, DarkColors } from '../constants/colors'; // Importa las paletas de colores: Colors para el tema claro y DarkColors para el tema oscuro — fuente: app/constants/colors.ts

interface ThemeContextType { // Define la interfaz que describe la forma del contexto de tema visual
  mode: ThemeMode; // Modo actual del tema: acepta solo 'light' o 'dark' (restringido por el tipo ThemeMode)
  isDark: boolean; // Indicador booleano derivado de mode: true cuando el tema es 'dark', false cuando es 'light'
  toggleTheme: () => void; // Función para alternar entre tema claro y oscuro; no recibe parámetros ni devuelve valor
  resetTheme: () => void; // Función para restablecer el tema al modo claro ('light'); no recibe parámetros ni devuelve valor
} // Cierra la interfaz ThemeContextType

const ThemeContext = createContext<ThemeContextType | null>(null); // Crea el objeto de contexto de React tipado como ThemeContextType o null; null es el valor por defecto antes de que el proveedor lo inicialice

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { // Declara y exporta el componente proveedor del tema; acepta children para envolver la app y proveer el contexto de tema
  const [mode, setMode] = useState<ThemeMode>('light'); // Estado del modo de tema: controla si la app muestra el tema claro ('light') u oscuro ('dark'); valor inicial 'light'

  const toggleTheme = useCallback(() => { // Define la función de alternancia de tema memorizada con useCallback; se recrea solo si cambian sus dependencias
    setMode(prev => (prev === 'light' ? 'dark' : 'light')); // Alterna el modo: si era 'light' lo cambia a 'dark' y viceversa, usando el valor previo del estado para evitar lecturas desactualizadas
  }, []); // Array de dependencias vacío: toggleTheme no depende de ningún valor reactivo externo

  const resetTheme = useCallback(() => { // Define la función de restablecimiento del tema memorizada con useCallback
    setMode('light'); // Fuerza el modo a 'light' independientemente del modo actual, restableciendo el tema claro
  }, []); // Array de dependencias vacío: resetTheme no depende de ningún valor reactivo externo

  const value = useMemo<ThemeContextType>( // Crea el valor del contexto memorizado con useMemo para evitar re-renders innecesarios en los consumidores del contexto
    () => ({ mode, isDark: mode === 'dark', toggleTheme, resetTheme }), // Construye el objeto del contexto: incluye el modo actual, calcula isDark comparando mode con 'dark', y expone las dos acciones
    [mode, toggleTheme, resetTheme] // El valor se recalcula solo si cambia el modo o alguna de las funciones memorizadas
  ); // Cierra useMemo

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>; // Renderiza el proveedor del contexto de tema con el valor calculado, envolviendo todos los componentes hijos consumidores
}; // Cierra el componente ThemeProvider

export const useTheme = () => { // Declara y exporta el hook personalizado para consumir el contexto de tema desde cualquier componente
  const ctx = useContext(ThemeContext); // Obtiene el valor actual del contexto de tema; será null si se usa fuera del ThemeProvider
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider'); // Lanza un error descriptivo si el hook se usa fuera del árbol de ThemeProvider, evitando fallos silenciosos
  return ctx; // Devuelve el contexto validado con mode, isDark, toggleTheme y resetTheme
}; // Cierra el hook useTheme

export const useColors = () => { // Declara y exporta el hook utilitario para obtener la paleta de colores activa según el tema actual
  const { isDark } = useTheme(); // Obtiene el flag isDark del contexto de tema para determinar qué paleta devolver
  return isDark ? DarkColors : Colors; // Devuelve DarkColors si el tema es oscuro, o Colors si el tema es claro; permite a los componentes usar siempre los colores correctos sin lógica adicional
}; // Cierra el hook useColors
