# components — Componentes Reutilizables

Contiene los componentes de interfaz de usuario que se usan en múltiples pantallas de la aplicación.

## Estructura

```
components/
└── common/          → Componentes base del sistema de diseño
```

## Carpeta `common/`

| Archivo | Descripción |
|---|---|
| `AppHeader.tsx` | Barra de encabezado con logo "TraduceSeña" y botón de perfil. Se oculta automáticamente en web (la navegación web está en `WebTopBar`) |
| `Button.tsx` | Botón reutilizable con 5 variantes: `primary`, `secondary`, `danger`, `outline`, `ghost`. Soporta estado de carga y deshabilitado |
| `Input.tsx` | Campo de texto con soporte para: etiqueta, ícono izquierdo/derecho, modo contraseña (ojo), mensajes de error y pistas |
| `WebTopBar.tsx` | Barra de navegación horizontal superior para la versión web. Muestra el logo, los enlaces de navegación con subrayado activo y el avatar de perfil |

## Criterio para crear un componente aquí

Un componente se coloca en `common/` cuando:
- Se usa en **2 o más pantallas distintas**
- Forma parte del **sistema de diseño** visual (colores, tamaños, tipografía del mockup)
- Es independiente de la lógica de negocio

Los componentes específicos de una sola pantalla se crean directamente dentro de esa pantalla.
