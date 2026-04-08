/**
 * @file colors.ts
 * @description Paleta de colores del sistema de diseño de TraduceSeña.
 * - `PrimaryScale`: escala completa del color primario púrpura (#7C3AED).
 * - `NeutralScale`: escala de grises del sistema.
 * - `Colors`: tokens semánticos (primario, fondos, texto, estados, sombras, etc.)
 *   listos para usar en componentes y estilos.
 */

// ─── Design System — Generado desde brand color #7C3AED (Púrpura) ────────────

// Escala completa del primario (generada por design_token_generator.py)
export const PrimaryScale = {
  50:  '#cbb4f2',
  100: '#c6adf2',
  200: '#bd9ef2',
  300: '#b490f2',
  400: '#ab82f2',
  500: '#9f71ed',
  600: '#784fbd',
  700: '#54338e',
  800: '#351c5e',
  900: '#180b2f',
  DEFAULT: '#7C3AED',
} as const;

// Escala neutral (grises del sistema)
export const NeutralScale = {
  50:  '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  DEFAULT: '#6B7280',
} as const;

// ─── Paleta de la app (referencia semántica) ──────────────────────────────────
export const Colors = {
  // Primarios — Púrpura
  primary:        PrimaryScale.DEFAULT,   // #7C3AED
  primaryDark:    PrimaryScale[600],      // #784fbd
  primaryLight:   PrimaryScale[400],      // #ab82f2
  primaryLighter: PrimaryScale[200],      // #bd9ef2
  primaryBg:      '#EDE9FE',             // lavanda muy claro (mantener para auth screens)
  primaryHeader:  PrimaryScale[100],      // #c6adf2

  // Gradientes (usados con expo-linear-gradient)
  gradientPrimary: ['#9333EA', '#7C3AED'] as [string, string],
  gradientPrimaryDeep: ['#9333EA', '#7C3AED', '#6D28D9'] as [string, string, string],

  // Fondos y superficies
  background:     '#FFFFFF',
  backgroundGray: NeutralScale[50],       // #F9FAFB
  surface:        '#FFFFFF',
  inputBg:        NeutralScale[100],      // #F3F4F6

  // Texto
  textPrimary:    NeutralScale[800],      // #1F2937
  textSecondary:  NeutralScale[500],      // #6B7280
  textHint:       NeutralScale[400],      // #9CA3AF
  textOnPrimary:  '#FFFFFF',
  textLink:       PrimaryScale.DEFAULT,

  // Semánticos
  success:  '#10B981',
  error:    '#EF4444',
  warning:  '#F59E0B',
  info:     '#3B82F6',
  danger:   '#EF4444',

  // Toggle
  toggleOn:  PrimaryScale.DEFAULT,
  toggleOff: NeutralScale[300],           // #D1D5DB

  // Bordes
  border:      NeutralScale[200],         // #E5E7EB
  borderInput: NeutralScale[300],         // #D1D5DB

  // Modos de traducción
  modeActive:   PrimaryScale.DEFAULT,
  modeInactive: '#FFFFFF',

  // Social
  google:   '#FFFFFF',
  facebook: '#1877F2',

  // Sombra y overlay
  shadow:  'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;
