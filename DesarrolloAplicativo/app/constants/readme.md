# constants — Constantes Globales

Define los valores fijos reutilizables en toda la aplicación: colores, tamaños, textos e tokens de diseño avanzados.

## Archivos

| Archivo | Descripción |
|---|---|
| `colors.ts` | Paleta de colores completa del diseño (basada en el mockup oficial) |
| `sizes.ts` | Tamaños de fuentes, espaciados, radios de borde y alturas de componentes |
| `strings.ts` | Todos los textos visibles en la app centralizados para fácil traducción |
| `theme.ts` | Tokens de diseño avanzados: `Spacing`, `FontSize`, `BorderRadius`, `Shadows`, `ZIndex`, `ComponentSizes`, `Animation` |

## Detalle de `colors.ts`

Define la paleta visual del diseño **púrpura/lavanda** del mockup:

| Constante | Color | Uso |
|---|---|---|
| `primary` | `#7C3AED` | Botones principales, acentos, toggles activos |
| `primaryLight` | `#A78BFA` | Iconos secundarios, estados hover |
| `primaryLighter` | `#C4B5FD` | Bordes de toggle, dots de slider, avatar |
| `primaryBg` | `#EDE9FE` | Fondo de pantallas de autenticación (Login, Registro) |
| `primaryHeader` | `#C4B5FD` | Fondo de la barra de navegación |
| `background` | `#FFFFFF` | Fondo general de todas las pantallas |
| `backgroundGray` | `#F9FAFB` | Fondo exterior en versión web |
| `inputBg` | `#F3F4F6` | Fondo de campos de texto |
| `error` | `#EF4444` | Mensajes de error y botón de eliminar |
| `toggleOn` | `#7C3AED` | Switch activo |
| `toggleOff` | `#D1D5DB` | Switch inactivo |
| `facebook` | `#1877F2` | Botón de Facebook en LoginScreen |

## Detalle de `sizes.ts`

Espaciados (`xs` a `xxl`), tipografía (`fontXs` a `fontDisplay`), radios de borde y dimensiones de componentes estándar como inputs (52px) y botones (52px).

## Detalle de `strings.ts`

Centraliza más de 80 textos de la interfaz agrupados por sección: auth, tabs, traducción, léxico, historial, perfil, notificaciones, errores y acciones.

## Detalle de `theme.ts`

Tokens más granulares que `sizes.ts`. Úsalos cuando necesites valores precisos de animación, sombras o z-index:

| Objeto | Ejemplos de propiedades |
|---|---|
| `Spacing` | `xs`, `sm`, `md`, `lg`, `xl`, `xxl` |
| `FontSize` | `xs` (11) a `display` (36) |
| `BorderRadius` | `sm` (8) a `full` (999) |
| `Shadows` | `sm`, `md`, `lg` — objetos con `shadowColor`, `elevation`, etc. |
| `ZIndex` | `base`, `dropdown`, `modal`, `toast` |
| `ComponentSizes` | `inputHeight`, `buttonHeight`, `tabBarHeight`, `headerHeight` |
| `Animation` | `fast` (150ms), `normal` (300ms), `slow` (500ms) |
