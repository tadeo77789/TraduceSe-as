/**
 * @file colors.ts
 * @description Paleta de colores del sistema de diseño de TraduceSeña. // Descripción general del archivo de colores
 * - `PrimaryScale`: escala completa del color primario púrpura (#7C3AED). // Escala de 9 tonos del color primario
 * - `NeutralScale`: escala de grises del sistema. // Escala de grises del 50 al 900
 * - `Colors`: tokens semánticos (primario, fondos, texto, estados, sombras, etc.) // Paleta semántica lista para usar en componentes
 *   listos para usar en componentes y estilos. // Referencia de uso
 * @ubicacion app/constants/colors.ts // Ruta completa del archivo dentro del proyecto
 */

// ─── Design System — Generado desde brand color #7C3AED (Púrpura) ──────────── // Separador visual de sección; el color de marca es púrpura #7C3AED

// Escala completa del primario (generada por design_token_generator.py) // Comentario de origen: la escala fue generada por script de Python
export const PrimaryScale = { // Exporta el objeto inmutable con todos los tonos del color primario púrpura
  50:  '#cbb4f2', // Tono 50 — el más claro de la escala, lavanda pálido; usado en fondos suaves
  100: '#c6adf2', // Tono 100 — lavanda claro; referenciado por Colors.primaryHeader
  200: '#bd9ef2', // Tono 200 — lavanda medio-claro; referenciado por Colors.primaryLighter
  300: '#b490f2', // Tono 300 — lavanda medio; disponible para hover states o variantes claras
  400: '#ab82f2', // Tono 400 — lavanda saturado; referenciado por Colors.primaryLight
  500: '#9f71ed', // Tono 500 — púrpura intermedio; útil para estados deshabilitados del primario
  600: '#784fbd', // Tono 600 — púrpura oscuro; referenciado por Colors.primaryDark (botones presionados)
  700: '#54338e', // Tono 700 — púrpura muy oscuro; contraste alto sobre fondos claros
  800: '#351c5e', // Tono 800 — púrpura casi negro; uso en textos sobre superficies primarias
  900: '#180b2f', // Tono 900 — el más oscuro de la escala; equivale a casi negro con matiz púrpura
  DEFAULT: '#7C3AED', // Valor por defecto de la escala; color principal de la marca TraduceSeñas
} as const; // Marca el objeto como de solo lectura (TypeScript inmutable) para evitar modificaciones accidentales

// Escala neutral (grises del sistema) // Comentario de sección: grises usados en textos, bordes y fondos
export const NeutralScale = { // Exporta el objeto inmutable con todos los tonos de gris del sistema
  50:  '#F9FAFB', // Tono 50 — blanco roto; usado en fondos alternos (Colors.backgroundGray)
  100: '#F3F4F6', // Tono 100 — gris muy claro; fondo de inputs (Colors.inputBg)
  200: '#E5E7EB', // Tono 200 — gris claro; bordes generales (Colors.border)
  300: '#D1D5DB', // Tono 300 — gris medio-claro; bordes de inputs y toggles inactivos
  400: '#9CA3AF', // Tono 400 — gris medio; texto de pistas (placeholder) en inputs
  500: '#6B7280', // Tono 500 — gris estándar; texto secundario y valor DEFAULT
  600: '#4B5563', // Tono 600 — gris oscuro; disponible para texto de menor jerarquía
  700: '#374151', // Tono 700 — gris muy oscuro; contraste moderado sobre fondos claros
  800: '#1F2937', // Tono 800 — casi negro; texto principal de la app (Colors.textPrimary)
  900: '#111827', // Tono 900 — negro puro con matiz frío; máximo contraste
  DEFAULT: '#6B7280', // Valor por defecto de la escala; equivale al tono 500 (gris estándar)
} as const; // Marca el objeto como de solo lectura para evitar modificaciones accidentales

// ─── Paleta de la app (referencia semántica) ────────────────────────────────── // Separador visual: comienza la paleta de tokens semánticos para usar en toda la app
export const Colors = { // Exporta el objeto principal de colores semánticos de la app
  // Primarios — Púrpura // Sub-sección: tokens del color primario y sus variantes
  primary:        PrimaryScale.DEFAULT,   // #7C3AED — color primario principal; usado en botones, íconos y toggles activos
  primaryDark:    PrimaryScale[600],      // #784fbd — variante oscura del primario; usada en estados presionados
  primaryLight:   PrimaryScale[400],      // #ab82f2 — variante clara del primario; usada en highlights y badges
  primaryLighter: PrimaryScale[200],      // #bd9ef2 — variante muy clara; usada en fondos de chips o tags
  primaryBg:      '#EDE9FE',             // Lavanda muy claro — fondo de pantallas de autenticación (mantenido fijo)
  primaryHeader:  PrimaryScale[100],      // #c6adf2 — color de fondo del encabezado con acento primario

  // Gradientes (usados con expo-linear-gradient) // Sub-sección: arrays de colores para gradientes lineales
  gradientPrimary: ['#9333EA', '#7C3AED'] as [string, string], // Gradiente de 2 pasos: violeta → púrpura; usado en headers y botones principales
  gradientPrimaryDeep: ['#9333EA', '#7C3AED', '#6D28D9'] as [string, string, string], // Gradiente de 3 pasos más profundo: violeta → púrpura → índigo; usado en fondos de landing

  // Fondos y superficies // Sub-sección: colores de fondo para pantallas y tarjetas
  background:     '#FFFFFF', // Fondo principal de la app en modo claro — blanco puro
  backgroundGray: NeutralScale[50],       // #F9FAFB — fondo alterno gris muy claro; usado en listas y secciones
  surface:        '#FFFFFF', // Fondo de superficies elevadas (tarjetas, modales) en modo claro
  inputBg:        NeutralScale[100],      // #F3F4F6 — fondo de campos de texto e inputs del formulario

  // Texto // Sub-sección: colores de texto organizados por jerarquía visual
  textPrimary:    NeutralScale[800],      // #1F2937 — texto principal; máxima legibilidad en modo claro
  textSecondary:  NeutralScale[500],      // #6B7280 — texto secundario; subtítulos y descripciones
  textHint:       NeutralScale[400],      // #9CA3AF — texto de pista o placeholder; menor jerarquía visual
  textOnPrimary:  '#FFFFFF', // Texto blanco para usar sobre fondos de color primario (botones, badges)
  textLink:       PrimaryScale.DEFAULT, // #7C3AED — color del texto de los vínculos y acciones de texto

  // Semánticos // Sub-sección: colores con significado de estado (feedback al usuario)
  success:  '#10B981', // Verde — indica éxito, confirmación o acción completada correctamente
  error:    '#EF4444', // Rojo — indica error, fallo de validación o acción destructiva
  warning:  '#F59E0B', // Ámbar — indica advertencia o acción que requiere atención
  info:     '#3B82F6', // Azul — indica información neutral o mensaje informativo
  danger:   '#EF4444', // Rojo — alias de error; usado explícitamente en acciones peligrosas (eliminar)

  // Toggle // Sub-sección: colores del componente interruptor (switch)
  toggleOn:  PrimaryScale.DEFAULT, // #7C3AED — color del toggle cuando está activado
  toggleOff: NeutralScale[300],           // #D1D5DB — color del toggle cuando está desactivado (gris neutro)

  // Bordes // Sub-sección: colores para líneas divisoras y contornos de componentes
  border:      NeutralScale[200],         // #E5E7EB — borde general de tarjetas y separadores
  borderInput: NeutralScale[300],         // #D1D5DB — borde de campos de texto en estado normal

  // Modos de traducción // Sub-sección: colores del selector de modo en la pantalla de traducción
  modeActive:   PrimaryScale.DEFAULT, // #7C3AED — fondo del modo de traducción actualmente seleccionado
  modeInactive: '#FFFFFF', // Blanco — fondo de los modos de traducción no seleccionados

  // Social // Sub-sección: colores de marca para botones de inicio de sesión social
  google:   '#FFFFFF', // Blanco — fondo del botón de inicio de sesión con Google (según guía de marca)
  facebook: '#1877F2', // Azul Facebook — fondo del botón de inicio de sesión con Facebook

  // Sombra y overlay // Sub-sección: colores semi-transparentes para sombras y capas de oscurecimiento
  shadow:  'rgba(0, 0, 0, 0.08)', // Negro con 8% de opacidad — sombra suave para tarjetas y superficies elevadas
  overlay: 'rgba(0, 0, 0, 0.5)', // Negro con 50% de opacidad — capa oscura sobre el fondo en modales y drawers
} as const; // Marca el objeto como de solo lectura para prevenir mutaciones en tiempo de ejecución

// ─── Paleta oscura ─────────────────────────────────────────────────────────── // Separador visual: comienza la paleta para el modo oscuro de la app
export const DarkColors = { // Exporta el objeto de colores para el tema oscuro; extiende Colors y sobreescribe los necesarios
  ...Colors, // Hereda todos los colores de la paleta clara como base del tema oscuro
  background:     '#111118', // Fondo principal en modo oscuro — casi negro con matiz azulado
  backgroundGray: '#111118', // Fondo alterno en modo oscuro — igual al principal para evitar distinción excesiva
  surface:        '#1E1E2A', // Fondo de tarjetas y superficies elevadas en modo oscuro — gris oscuro azulado
  inputBg:        '#252534', // Fondo de inputs en modo oscuro — ligeramente más claro que la superficie
  textPrimary:    '#EEEEF5', // Texto principal en modo oscuro — blanco suave con leve matiz frío
  textSecondary:  '#9898B0', // Texto secundario en modo oscuro — gris azulado medio
  textHint:       '#5E5E78', // Texto de pista en modo oscuro — gris oscuro con matiz púrpura
  border:         '#2D2D3E', // Color de borde en modo oscuro — gris oscuro azulado para divisores sutiles
  primaryBg:      '#1E183A', // Fondo de pantallas de auth en modo oscuro — azul-púrpura muy oscuro
  primaryHeader:  '#1E183A', // Fondo del header con acento en modo oscuro — igual a primaryBg
  shadow:         'rgba(0,0,0,0.3)', // Sombra en modo oscuro — negro con 30% de opacidad (más intensa que en claro)
  modeInactive:   '#1E1E2A', // Fondo de modo de traducción inactivo en modo oscuro — mismo color que surface
}; // Cierre del objeto DarkColors con todos los tokens del tema oscuro

// ─── Paleta verde pastel (tema alternativo) ──────────────────────────────────
export const GreenColors = {
  ...Colors,
  primary:        '#4CAF82',
  primaryDark:    '#2E8B57',
  primaryLight:   '#7DC8A0',
  primaryLighter: '#A8D8BC',
  primaryBg:      '#E8F5EE',
  primaryHeader:  '#C3E6D0',
  gradientPrimary: ['#4CAF82', '#2E8B57'] as [string, string],
  gradientPrimaryDeep: ['#5DBF8F', '#4CAF82', '#2E8B57'] as [string, string, string],
  modeActive:  '#4CAF82',
  toggleOn:    '#4CAF82',
  textLink:    '#4CAF82',
};

export const GreenDarkColors = {
  ...DarkColors,
  primary:        '#4CAF82',
  primaryDark:    '#2E8B57',
  primaryLight:   '#7DC8A0',
  primaryLighter: '#A8D8BC',
  primaryBg:      '#0F2A1A',
  primaryHeader:  '#0F2A1A',
  // Superficies con sutil tinte verde para que el modo oscuro no se sienta morado/azulado
  background:     '#0E140F',
  backgroundGray: '#0E140F',
  surface:        '#172019',
  inputBg:        '#1E2820',
  border:         '#243027',
  modeInactive:   '#172019',
  textHint:       '#5E7866',
  gradientPrimary: ['#4CAF82', '#2E8B57'] as [string, string],
  gradientPrimaryDeep: ['#5DBF8F', '#4CAF82', '#2E8B57'] as [string, string, string],
  modeActive:  '#4CAF82',
  toggleOn:    '#4CAF82',
  textLink:    '#4CAF82',
};
