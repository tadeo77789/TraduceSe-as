# DesarrolloAplicativo

Carpeta raíz del desarrollo del sistema **Traduce Señas**. Contiene las tres capas principales del proyecto.

## Estructura

```
DesarrolloAplicativo/
├── app/        → Aplicación móvil y web (React Native + Expo)
├── backend/    → Servidor API REST (Node.js + Express)
└── BD/         → Scripts y modelo de base de datos (PostgreSQL)
```

---

## Por qué existe el archivo `.gitignore`

El archivo `.gitignore` (ubicado en la raíz del repositorio) le indica a Git qué archivos y carpetas **no debe subir a GitHub**.

### `node_modules/` — el caso más importante

Cuando ejecutas `npm install`, npm descarga todos los paquetes del proyecto dentro de la carpeta `node_modules/`. Esta carpeta:

- Puede pesar **más de 500 MB** y contener **miles de archivos**
- Es **generada automáticamente** a partir de `package.json`
- Es **específica de cada máquina** (rutas internas, binarios compilados)
- Ya está documentada en `package.json` y `package-lock.json`

**Subir `node_modules/` a GitHub sería como subir todos los libros de una biblioteca en lugar del índice.** Cualquier persona que clone el repositorio solo necesita ejecutar `npm install` para regenerarla en segundos.

### `.expo/` — caché de desarrollo

Expo genera esta carpeta al iniciar el servidor. Contiene configuración y caché local de la máquina que no tiene sentido compartir.

### `.env` — datos sensibles

Los archivos de variables de entorno contienen claves de API, contraseñas de base de datos y otros secretos. **Nunca deben subirse a un repositorio**, especialmente si es público.

### Regla general

> Si un archivo puede **regenerarse automáticamente** o contiene **información privada de tu máquina o equipo**, va en `.gitignore`.

---

## Cómo inicializar y ejecutar el proyecto

### Requisitos previos

Instala estas herramientas antes de comenzar:

| Herramienta | Descarga | Para qué se usa |
|---|---|---|
| **Node.js** (versión 18 o superior) | https://nodejs.org | Ejecutar el servidor y la app |
| **Git** | https://git-scm.com | Control de versiones |
| **Visual Studio Code** | https://code.visualstudio.com | Editor de código recomendado |
| **Docker Desktop** | https://www.docker.com/products/docker-desktop | Base de datos PostgreSQL en contenedor |
| **Expo Go** (opcional) | App Store / Play Store | Ver la app en tu celular físico |

Verifica que Node.js esté instalado abriendo una terminal y ejecutando:
```bash
node --version    # debe mostrar v18 o superior
npm --version     # debe mostrar 9 o superior
```

---

### Paso 1 — Abrir el proyecto en Visual Studio Code

1. Abre **Visual Studio Code**
2. Ve a **Archivo → Abrir carpeta**
3. Selecciona la carpeta `DesarrolloAplicativo`
4. Abre la terminal integrada con **Ctrl + `** (tecla de acento grave)

---

### Paso 2 — Instalar dependencias de la app

En la terminal integrada de VS Code, ejecuta:

```bash
cd app
npm install
```

Esto descarga todos los paquetes necesarios en la carpeta `node_modules/`. Solo se hace **una vez** (o cuando se agreguen nuevos paquetes).

---

### Paso 3 — Levantar la base de datos con Docker

Asegúrate de tener **Docker Desktop** abierto y ejecuta:

```bash
docker run -d \
  --name postgres-traducsenas \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=traduce_senas \
  -p 5433:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16
```

Para verificar que el contenedor está corriendo:
```bash
docker ps
```

---

### Paso 4 — Configurar variables de entorno del backend

Crea el archivo `backend/.env` con el siguiente contenido (nunca lo subas a GitHub):

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=traduce_senas
JWT_SECRET=tu_clave_secreta
PORT=3000
```

---

### Paso 5 — Instalar dependencias del backend

```bash
cd backend
npm install
```

---

### Paso 6 — Ejecutar la app

#### Ver en el navegador web (más rápido para desarrollo)

```bash
cd app
npx expo start --web --port 8082
```

Luego abre tu navegador en: **`http://localhost:8082`**

#### Ver en celular físico (Android o iPhone)

```bash
cd app
npx expo start
```

1. Instala la app **Expo Go** en tu celular desde la tienda de aplicaciones
2. Escanea el código QR que aparece en la terminal con la cámara del celular
3. La app abrirá automáticamente en Expo Go

#### Ver en emulador Android (requiere Android Studio instalado)

```bash
cd app
npx expo start --android
```

#### Ver en simulador iPhone (solo en Mac, requiere Xcode)

```bash
cd app
npx expo start --ios
```

---

### Extensiones recomendadas para Visual Studio Code

Instálalas desde el panel de extensiones (**Ctrl + Shift + X**):

| Extensión | ID | Para qué sirve |
|---|---|---|
| **ES7+ React/Redux/React-Native snippets** | `dsznajder.es7-react-js-snippets` | Autocompletado de componentes React |
| **Prettier - Code formatter** | `esbenp.prettier-vscode` | Formatea el código automáticamente al guardar |
| **TypeScript Importer** | `pmneo.tsimporter` | Agrega imports automáticamente |
| **Expo Tools** | `expo.vscode-expo-tools` | Soporte oficial de Expo en VS Code |
| **React Native Tools** | `msjsdiag.vscode-react-native` | Depuración de apps React Native |
| **PlantUML** | `jebbs.plantuml` | Ver los diagramas `.puml` del proyecto |
| **GitLens** | `eamodio.gitlens` | Ver historial de cambios por línea |

---

### Solución de errores comunes al iniciar

| Error | Causa | Solución |
|---|---|---|
| `expo: command not found` | Expo no está instalado globalmente | Usar `npx expo` en lugar de `expo` |
| `Port 8082 already in use` | Otro proceso usa ese puerto | Cambiar a `--port 8083` o cerrar el proceso anterior |
| Pantalla en blanco en el navegador | Error de JavaScript en tiempo de ejecución | Abrir **F12 → Console** y revisar el error en rojo |
| `Cannot find module '...'` | Falta instalar dependencias | Ejecutar `npm install` nuevamente |
| `node_modules` no existe | Dependencias no instaladas | Ejecutar `npm install` dentro de la carpeta `app/` |
| Imagen en blanco en el carrusel | Ruta `require()` incorrecta | Verificar que la ruta relativa apunte a `app/assets/images/` |

---

## Diseño responsivo

Todas las pantallas adaptan su layout automáticamente según el ancho de la pantalla usando `useWindowDimensions()`.

| Breakpoint | Ancho | Comportamiento |
|---|---|---|
| **Móvil** | < 768px | Layout en columna, una sola columna |
| **Tablet** | 768px – 1023px | Layout en fila, dos columnas en listas |
| **Desktop / Web** | ≥ 1024px | Máximo ancho limitado, columnas adicionales |

### Regla de uso

Nunca uses `Dimensions.get('window')` a nivel de módulo — los valores no se actualizan al girar la pantalla o redimensionar la ventana. Siempre usa `useWindowDimensions()` dentro del componente:

```tsx
const { width } = useWindowDimensions();
const isTablet = width >= 768;
const isDesktop = width >= 1024;
```

---

## Imágenes locales

Las imágenes usadas en la app están almacenadas en `app/assets/images/` para evitar dependencias de URLs externas.

| Archivo | Usado en |
|---|---|
| `slide1.jpg` | LandingScreen (slide 1), LoginScreen (panel web), RegisterScreen (panel web) |
| `slide2.jpg` | LandingScreen (slide 2) |
| `slide3.jpg` | LandingScreen (slide 3) |
| `testimonial.jpg` | LandingScreen (sección testimonial) |
| `camera_placeholder.jpg` | TranslationScreen (área de cámara) |

Para referenciar una imagen local en el código:

```tsx
// Correcto — imagen local
<Image source={require('../../assets/images/slide1.jpg')} />

// Incorrecto para imágenes locales — solo para URLs remotas
<Image source={{ uri: 'https://...' }} />
```

> **Nota sobre rutas:** la ruta relativa en `require()` depende de dónde esté el archivo que lo usa. Desde `app/presentation/screens/` se usa `../../assets/images/`, desde `app/presentation/screens/Auth/` se usa `../../../assets/images/`.

---

## Guía de modificaciones estéticas y de tamaños

Todo el sistema visual de la app está centralizado en archivos dentro de `app/constants/`. **No es necesario tocar los componentes ni las pantallas** para cambiar colores, tamaños o textos — solo se modifican estos archivos.

---

### 1. Colores — `app/constants/colors.ts`

Archivo con toda la paleta del diseño. Para cambiar un color, edita el valor hexadecimal correspondiente.

#### Colores principales

| Constante | Valor actual | Dónde se usa |
|---|---|---|
| `primary` | `#7C3AED` | Botones principales, acentos, toggles activos |
| `primaryLight` | `#A78BFA` | Iconos secundarios, estados hover |
| `primaryLighter` | `#C4B5FD` | Bordes de toggle, dots de slider, avatar |
| `primaryBg` | `#EDE9FE` | Fondo de las pantallas de autenticación |
| `primaryHeader` | `#C4B5FD` | Fondo de la barra de navegación superior |

#### Colores de fondo y superficies

| Constante | Valor actual | Dónde se usa |
|---|---|---|
| `background` | `#FFFFFF` | Fondo general de todas las pantallas |
| `backgroundGray` | `#F9FAFB` | Fondo exterior en la versión web |
| `surface` | `#FFFFFF` | Fondo de cards, modales y elementos flotantes |
| `inputBg` | `#F3F4F6` | Fondo de todos los campos de texto |

#### Colores de texto

| Constante | Valor actual | Dónde se usa |
|---|---|---|
| `textPrimary` | `#1F2937` | Títulos y textos principales |
| `textSecondary` | `#6B7280` | Subtítulos, labels, descripciones |
| `textHint` | `#9CA3AF` | Placeholders de inputs |
| `textOnPrimary` | `#FFFFFF` | Texto dentro de botones de color primario |
| `textLink` | `#7C3AED` | Links y texto clickeable |

#### Colores de estado

| Constante | Valor actual | Dónde se usa |
|---|---|---|
| `success` | `#10B981` | Confirmaciones, operaciones exitosas |
| `error` | `#EF4444` | Mensajes de error, botón "Eliminar cuenta" |
| `warning` | `#F59E0B` | Advertencias |
| `info` | `#3B82F6` | Información general |
| `danger` | `#EF4444` | Variante `danger` del botón |

#### Colores de bordes y otros

| Constante | Valor actual | Dónde se usa |
|---|---|---|
| `border` | `#E5E7EB` | Bordes de cards, separadores, inputs |
| `borderInput` | `#D1D5DB` | Borde específico de campos de texto |
| `toggleOn` | `#7C3AED` | Color del Switch cuando está activado |
| `toggleOff` | `#D1D5DB` | Color del Switch cuando está desactivado |
| `facebook` | `#1877F2` | Botón de Facebook en la pantalla de login |

#### Ejemplo: cambiar el color primario de púrpura a azul

```ts
// En app/constants/colors.ts
primary: '#1D4ED8',        // antes: #7C3AED
primaryLight: '#3B82F6',   // antes: #A78BFA
primaryLighter: '#93C5FD', // antes: #C4B5FD
primaryBg: '#EFF6FF',      // antes: #EDE9FE
primaryHeader: '#93C5FD',  // antes: #C4B5FD
```

---

### 2. Tamaños y espaciados — `app/constants/sizes.ts`

Controla el espaciado, tipografía, radios de borde y dimensiones de componentes.

#### Espaciado

| Constante | Valor | Equivalente |
|---|---|---|
| `xs` | `4px` | Espacio mínimo entre elementos |
| `sm` | `8px` | Padding interno pequeño |
| `md` | `16px` | Padding estándar de pantallas |
| `lg` | `24px` | Separación entre secciones |
| `xl` | `32px` | Padding de cards y modales |
| `xxl` | `48px` | Espaciado grande, secciones principales |

#### Tipografía

| Constante | Valor | Uso recomendado |
|---|---|---|
| `fontXs` | `11px` | Textos auxiliares, badges |
| `fontSm` | `13px` | Labels, hints, notas al pie |
| `fontMd` | `15px` | Texto de cuerpo, inputs |
| `fontLg` | `17px` | Texto principal |
| `fontXl` | `20px` | Subtítulos |
| `fontXxl` | `24px` | Títulos de sección |
| `fontTitle` | `28px` | Títulos de pantalla |
| `fontDisplay` | `36px` | Títulos grandes (landing) |

#### Radios de borde (bordes redondeados)

| Constante | Valor | Resultado visual |
|---|---|---|
| `radiusSm` | `8px` | Bordes ligeramente redondeados (inputs, badges) |
| `radiusMd` | `12px` | Redondeado medio (botones) |
| `radiusLg` | `16px` | Redondeado grande (cards) |
| `radiusXl` | `24px` | Muy redondeado (modales, cards auth) |
| `radiusFull` | `999px` | Completamente circular (avatares, chips) |

#### Dimensiones de componentes

| Constante | Valor | Componente |
|---|---|---|
| `inputHeight` | `52px` | Altura de todos los campos de texto |
| `buttonHeight` | `52px` | Altura de todos los botones |
| `tabBarHeight` | `65px` | Altura de la barra de tabs inferior (móvil) |
| `headerHeight` | `56px` | Altura del header de navegación |

---

### 3. Textos de la interfaz — `app/constants/strings.ts`

Todos los textos visibles en la app están centralizados aquí. Para cambiar cualquier texto (título, botón, mensaje de error, placeholder), edita este archivo.

---

### 4. Modificar una pantalla específica

| Si quieres cambiar... | Archivo a editar | Notas |
|---|---|---|
| La pantalla de inicio (slider, notificación, testimonial) | `app/presentation/screens/LandingScreen.tsx` | Rediseñada — hero, carrusel con flechas/dots, cards de features, testimonial |
| El formulario de login | `app/presentation/screens/Auth/LoginScreen.tsx` | Fondo lavanda (móvil), split-screen con imagen (web ≥768px) |
| El formulario de registro | `app/presentation/screens/Auth/RegisterScreen.tsx` | Logo esquina superior izquierda, card lavanda centrada, botón centrado |
| La pantalla de traducción (cámara/toggle) | `app/presentation/screens/Translation/TranslationScreen.tsx` | Imagen de cámara local (`camera_placeholder.jpg`) |
| La lista de alarmas y el reloj | `app/presentation/screens/Alarms/AlarmsScreen.tsx` | Columna en móvil, fila en tablet+ |
| El grid del alfabeto de señas | `app/presentation/screens/Alphabet/AlphabetScreen.tsx` | 5 cols (móvil) / 7 (tablet) / 9 (desktop), columnas dinámicas |
| Las gráficas de estadísticas | `app/presentation/screens/Stats/StatsScreen.tsx` | KPIs 2-col (móvil) / 4-col (desktop), gráfica de línea con `onLayout` |
| La lista del historial | `app/presentation/screens/History/HistoryScreen.tsx` | 1 columna (móvil), 2 columnas (tablet+) |
| El perfil del usuario | `app/presentation/screens/Profile/ProfileScreen.tsx` | Centrado max-width 640px en web, logout compatible web/móvil |
| La barra de navegación superior (web) | `app/presentation/components/common/WebTopBar.tsx` | Logo 40px, avatar 42px, subrayado activo 2.5px |
| La barra de navegación (móvil/tabs) | `app/presentation/navigation/MainTabNavigator.tsx` | Altura 74px, sombra superior, labels font-weight 600 |

---

### 5. Modificar componentes base

Los componentes reutilizables están en `app/presentation/components/common/`. Cambiarlos afecta **todas** las pantallas que los usan.

| Componente | Archivo | Qué controla |
|---|---|---|
| `Button` | `Button.tsx` | Forma, tamaño, colores y variantes de todos los botones |
| `Input` | `Input.tsx` | Estilo de todos los campos de texto (altura, radio, colores) |
| `AppHeader` | `AppHeader.tsx` | Header con logo en la versión móvil |
| `WebTopBar` | `WebTopBar.tsx` | Barra superior con navegación en la versión web |

#### Variantes disponibles del botón `Button`

| Variante | Color de fondo | Uso |
|---|---|---|
| `primary` | `#7C3AED` (púrpura) | Acción principal |
| `secondary` | `#C4B5FD` (lavanda) | Acción secundaria |
| `danger` | `#EF4444` (rojo) | Eliminar o acción destructiva |
| `outline` | Transparente con borde | Acción alternativa |
| `ghost` | Transparente sin borde | Acción sutil |

---

### 6. Ejecutar la app para ver los cambios

```bash
cd app
npx expo start --web --port 8082   # Ver en navegador
npx expo start --android            # Ver en Android
npx expo start --ios                # Ver en iOS
```

Expo recarga automáticamente los cambios al guardar un archivo. No es necesario reiniciar el servidor para cambios de colores, textos o estilos.
