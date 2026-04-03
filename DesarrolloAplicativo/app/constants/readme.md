# constants — Constantes Globales

Define los valores fijos reutilizables en toda la aplicación: colores, tamaños y textos de la interfaz.

## Archivos

| Archivo | Descripción |
|---|---|
| `colors.ts` | Paleta de colores completa del diseño (basada en el mockup oficial) |
| `sizes.ts` | Tamaños de fuentes, espaciados, radios de borde y alturas de componentes |
| `strings.ts` | Todos los textos visibles en la app centralizados para fácil traducción |

## Detalle de `colors.ts`

Define la paleta visual del diseño **púrpura/lavanda** del mockup:

| Constante | Color | Uso |
|---|---|---|
| `primary` | `#7C3AED` | Botones principales, acentos |
| `primaryHeader` | `#C4B5FD` | Fondo de la barra de navegación |
| `primaryBg` | `#EDE9FE` | Fondo de pantallas de autenticación |
| `background` | `#FFFFFF` | Fondo general de contenido |
| `inputBg` | `#F3F4F6` | Fondo de campos de texto |
| `error` | `#EF4444` | Mensajes de error y botón de eliminar |

## Detalle de `sizes.ts`

Espaciados (`xs` a `xxl`), tipografía (`fontXs` a `fontDisplay`), radios de borde y dimensiones de componentes estándar como inputs (52px) y botones (52px).

## Detalle de `strings.ts`

Centraliza más de 80 textos de la interfaz agrupados por sección: auth, tabs, traducción, léxico, historial, perfil, notificaciones, errores y acciones.
