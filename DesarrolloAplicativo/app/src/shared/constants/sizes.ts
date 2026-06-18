/**
 * @file sizes.ts
 * @description Tokens de tamaño globales de la app. // Descripción del propósito: valores numéricos reutilizables de tamaño
 * Define espaciado, tamaños de fuente, radios de borde, // Enumera los grupos de tokens definidos en este archivo
 * alturas de componentes e iconos. Usar estos valores en lugar // Indica la intención: reemplazar números hardcodeados
 * de números hardcodeados para mantener consistencia visual. // Beneficio de usarlo: consistencia en toda la UI
 * @ubicacion app/constants/sizes.ts // Ruta completa del archivo dentro del proyecto
 */

export const Sizes = { // Exporta el objeto con todos los tokens de tamaño de la app
  // Espaciado // Sub-sección: valores de margen, padding y separación entre elementos
  xs: 4, // Espaciado extra pequeño — 4 pt; usado para separación mínima (ej: entre ícono y texto)
  sm: 8, // Espaciado pequeño — 8 pt; usado para padding interno de chips y separaciones ajustadas
  md: 16, // Espaciado mediano — 16 pt; el más frecuente; padding horizontal estándar de pantallas
  lg: 24, // Espaciado grande — 24 pt; separación entre secciones o grupos de contenido
  xl: 32, // Espaciado extra grande — 32 pt; márgenes superiores de pantallas o espacios prominentes
  xxl: 48, // Espaciado extra extra grande — 48 pt; separaciones entre bloques mayores de contenido

  // Tipografía // Sub-sección: tamaños de fuente en puntos para los textos de la app
  fontXs: 11, // Fuente extra pequeña — 11 pt; usada en etiquetas, badges y notas de pie
  fontSm: 13, // Fuente pequeña — 13 pt; usada en captions, helper texts y metadatos
  fontMd: 15, // Fuente mediana — 15 pt; texto de cuerpo estándar en listas e inputs
  fontLg: 17, // Fuente grande — 17 pt; texto destacado, subtítulos de sección
  fontXl: 20, // Fuente extra grande — 20 pt; títulos de tarjeta o encabezados de pantalla medianos
  fontXxl: 24, // Fuente extra extra grande — 24 pt; títulos de sección prominentes
  fontTitle: 28, // Fuente de título — 28 pt; encabezados principales de pantalla (h2/h3)
  fontDisplay: 36, // Fuente de display — 36 pt; texto de gran impacto visual (pantalla de bienvenida)

  // Radios de borde // Sub-sección: valores de borderRadius para esquinas redondeadas
  radiusSm: 8, // Radio pequeño — 8 pt; bordes levemente redondeados (chips, badges, inputs)
  radiusMd: 12, // Radio mediano — 12 pt; bordes moderados (tarjetas, paneles)
  radiusLg: 16, // Radio grande — 16 pt; bordes bien redondeados (modales, bottom sheets)
  radiusXl: 24, // Radio extra grande — 24 pt; bordes muy redondeados (tarjetas destacadas)
  radiusFull: 999, // Radio completo — valor alto para crear formas completamente circulares o píldoras

  // Alturas de componentes // Sub-sección: alturas fijas para mantener consistencia entre componentes interactivos
  inputHeight: 52, // Altura de campos de texto — 52 pt; garantiza zona táctil cómoda en mobile
  buttonHeight: 52, // Altura de botones principales — 52 pt; alineado con la altura de los inputs
  tabBarHeight: 65, // Altura de la barra de navegación inferior — 65 pt; incluye área segura interna
  headerHeight: 56, // Altura del encabezado de pantalla — 56 pt; estándar para AppHeader en mobile
  cardHeight: 100, // Altura mínima de tarjetas de contenido — 100 pt; para ítems de lista y cards

  // Iconos // Sub-sección: tamaños para íconos en distintos contextos
  iconSm: 20, // Ícono pequeño — 20 pt; usado dentro de inputs o junto a texto compacto
  iconMd: 24, // Ícono mediano — 24 pt; tamaño estándar para íconos de navegación y acciones
  iconLg: 32, // Ícono grande — 32 pt; usado en tarjetas de acción o secciones destacadas
  iconXl: 48, // Ícono extra grande — 48 pt; usado en estados vacíos, onboarding o placeholders
}; // Cierre del objeto Sizes con todos los tokens de tamaño de la app
