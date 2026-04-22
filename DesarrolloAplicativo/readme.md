# DesarrolloAplicativo — Signia

Carpeta raíz del desarrollo de **Signia** (Traduce Señas), una aplicación móvil y web para la traducción del lenguaje de señas colombiano (LSC). Contiene las tres capas principales del proyecto más el modelo 3D interactivo.

---

## Estructura general

```
DesarrolloAplicativo/
├── app/        → Aplicación móvil y web (React Native + Expo)
├── backend/    → Servidor API REST (Node.js + Express + PostgreSQL)
└── readme.md   → Este archivo
```

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga | Para qué se usa |
|---|---|---|---|
| **Node.js** | 18+ | https://nodejs.org | Ejecutar la app y el servidor |
| **Git** | cualquiera | https://git-scm.com | Control de versiones |
| **Visual Studio Code** | cualquiera | https://code.visualstudio.com | Editor recomendado |
| **Docker Desktop** | cualquiera | https://www.docker.com/products/docker-desktop | Base de datos PostgreSQL |
| **Expo Go** | SDK 54 | App Store / Play Store | Ver la app en celular físico |
| **Blender** | 4.x+ | https://www.blender.org | Editar el modelo 3D del alfabeto |

Verifica Node.js en la terminal:
```bash
node --version    # v18 o superior
npm --version     # 9 o superior
```

---

## Instalación y ejecución

### Paso 1 — Abrir en VS Code

1. Abre VS Code → **Archivo → Abrir carpeta** → selecciona `DesarrolloAplicativo`
2. Abre la terminal integrada con **Ctrl + `**

### Paso 2 — Instalar dependencias de la app

```bash
cd app
npm install
```

Esto descarga todos los paquetes, incluyendo `react-native-webview` (necesario para el visor 3D del alfabeto).

### Paso 3 — Levantar la base de datos con Docker

```bash
docker run -d \
  --name postgres-signia \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=traduce_senas \
  -p 5433:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16
```

Verificar que corre: `docker ps`

### Paso 4 — Configurar variables de entorno del backend

Crea `backend/.env` (nunca subir a GitHub):

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=traduce_senas
JWT_SECRET=tu_clave_secreta
PORT=3000
```

### Paso 5 — Instalar dependencias del backend

```bash
cd backend
npm install
```

### Paso 6 — Ejecutar la app

```bash
# Navegador web (recomendado para desarrollo rápido)
cd app && npx expo start --web --port 8082

# Celular físico (escanear QR con Expo Go)
cd app && npx expo start

# Emulador Android
cd app && npx expo start --android

# Simulador iOS (solo Mac + Xcode)
cd app && npx expo start --ios
```

---

## Módulo 3D — Alfabeto LSC

La pantalla de **Alfabeto** integra un modelo 3D animado que reproduce la seña de cada letra en tiempo real. Es la funcionalidad más destacada del proyecto.

### Archivos del módulo

| Archivo | Ubicación | Descripción |
|---|---|---|
| `signia_model.glb` | `app/assets/` | Modelo 3D del personaje con 26 animaciones del alfabeto exportado desde Blender |
| `model_viewer.html` | `app/assets/` | Visor Three.js autocontenido, se carga dentro de un WebView |
| `AlphabetScreen.tsx` | `app/presentation/screens/Alphabet/` | Pantalla con grilla A-Z + sheet inferior con visor 3D |

### Diseño de la pantalla

La pantalla tiene dos capas:

1. **Grilla de letras (A–Z):** 26 cartas con imagen de la seña y badge de color. Ocupa toda la pantalla. El número de columnas se adapta al ancho: 5 cols en móvil, 7 en tablet, 9 en desktop.
2. **Modal centrado (al tocar una letra):** una tarjeta animada aparece centrada sobre un fondo oscuro semitransparente, mostrando el visor 3D con la animación de la seña seleccionada. Se cierra tocando fuera o el botón ✕.

```
┌────────────────────────┐
│  Alfabeto LSC   26 let.│  ← Cabecera
├──┬──┬──┬──┬────────────┤
│A │B │C │D │ E  ...     │  ← Grilla de cartas
│  │  │  │  │            │
│F │G │H │I │ J  ...     │
│  ...                   │
└────────────────────────┘
          ↓ (al tocar una carta)
     ┌──────────────┐
     │[A] Seña: A[✕]│  ← Header con gradiente
     ├──────────────┤
     │              │
     │  Visor 3D    │  ← WebView con Three.js
     │  (WebView)   │
     ├──────────────┤
     │ Tip de seña  │
     │ Toca fuera   │
     └──────────────┘
```

### Cómo funciona

```
Usuario toca letra  →  AlphabetScreen  →  postMessage al WebView
                                               ↓
                                        model_viewer.html (Three.js)
                                               ↓
                                        signia_model.glb reproduce
                                        la animación "Letra_X"
```

1. Al montar la pantalla el `WebView` carga `model_viewer.html` en segundo plano (siempre montado).
2. React Native envía `{ type: 'LOAD_MODEL', url: '...' }` para cargar el GLB una sola vez.
3. Cuando el usuario toca una letra, el sheet se desliza hacia arriba y se envía `{ type: 'PLAY_ANIMATION', animation: 'Letra_A' }`.
4. Three.js reproduce la animación del esqueleto. El modelo permanece en memoria entre letras.

### Animaciones disponibles en el GLB

El modelo tiene **33 acciones** nombradas:

| Tipo | Nombres |
|---|---|
| **Alfabeto (26)** | `Letra_A` … `Letra_Z` |
| **Frases (6)** | `Hola_Saludo`, `Gracias`, `Te_Amo`, `Si_Afirmacion`, `No_Negacion`, `Pose_Neutral` |
| **Original Mixamo** | `mixamo.com` |

### Editar el modelo en Blender

El archivo fuente del modelo está en:
```
C:\Users\USUARIO\Documents\INSTRUCTOR CarlosJulio\PROYECTO\modelado\65-lowpolyboy (1)\cuerpo.blend
```

Después de modificar el modelo o las animaciones, exportarlo como GLB:

1. En Blender: **File → Export → glTF 2.0 (.glb/.gltf)**
2. Seleccionar **Format: GLB**
3. Activar: `Animations`, `Skinning`, `Materials`
4. Guardar en `app/assets/signia_model.glb` (sobreescribir)

### Agregar una nueva seña al alfabeto

1. Abrir `cuerpo.blend` en Blender.
2. Crear una nueva acción con el nombre `Letra_X` (donde X es la letra).
3. Animar los huesos del brazo y los dedos de la mano derecha.
4. Exportar el GLB actualizado a `app/assets/signia_model.glb`.
5. La pantalla la detecta automáticamente — no requiere cambios en código.

---

## Arquitectura del frontend

El frontend sigue una arquitectura en capas (Clean Architecture simplificada):

```
app/
├── presentation/          ← Capa visual
│   ├── screens/           → Pantallas (una carpeta por módulo)
│   ├── components/        → Componentes reutilizables
│   └── navigation/        → Navegación entre pantallas
│
├── state/                 ← Estado global (AuthContext, ThemeContext)
├── hooks/                 ← Lógica extraída de pantallas
│
├── assets/                ← Imágenes, modelo 3D, visor HTML
├── config/                ← URL del backend y mapa de endpoints
├── constants/             ← Sistema de diseño (colores, tamaños, strings)
├── types/                 ← Interfaces TypeScript globales
│
├── business/              ← Pendiente: lógica de negocio
├── data/                  ← Pendiente: repositorios de datos
├── services/              ← Pendiente: llamadas a la API
└── utils/                 ← Pendiente: funciones utilitarias
```

### Estado de implementación

| Capa | Estado | Contenido |
|---|---|---|
| `presentation/` | ✅ Completa | Todas las pantallas, componentes y navegación |
| `state/` | ✅ Completo | `AuthContext` y `ThemeContext` |
| `hooks/` | ✅ Completo | `useLoginForm`, `useRegisterForm` |
| `config/` | ✅ Completo | `api.config.ts` con todos los endpoints |
| `constants/` | ✅ Completo | Colores, tamaños, strings del sistema de diseño |
| `types/` | ✅ Completo | User, Auth, Traduccion, Lexico, Alarma, etc. |
| `assets/` | ✅ Completo | Imágenes, `signia_model.glb`, `model_viewer.html` |
| `services/` | ⏳ Pendiente | Se implementa al conectar el backend real |
| `data/` | ⏳ Pendiente | Se implementa con los servicios |
| `business/` | ⏳ Pendiente | Lógica compleja desacoplada de pantallas |
| `utils/` | ⏳ Pendiente | Formateo, validaciones genéricas |

### Flujo de datos previsto (al conectar backend)

```
Pantalla → Hook → Service → Data → API backend
```

---

## Pantallas disponibles

| Pantalla | Archivo | Descripción |
|---|---|---|
| **Landing** | `LandingScreen.tsx` | Hero, carrusel con flechas/dots, features, testimonial |
| **Login** | `Auth/LoginScreen.tsx` | Split-screen con imagen en web, lavanda en móvil |
| **Registro** | `Auth/RegisterScreen.tsx` | Formulario con términos y condiciones |
| **Recuperar contraseña** | `Auth/ForgotPasswordScreen.tsx` | Envío de código por correo |
| **Verificar código** | `Auth/VerifyCodeScreen.tsx` | Ingreso del código de 6 dígitos |
| **Nueva contraseña** | `Auth/NewPasswordScreen.tsx` | Formulario de restablecimiento |
| **Traducción** | `Translation/TranslationScreen.tsx` | Cámara + toggle texto↔señas |
| **Alfabeto LSC** | `Alphabet/AlphabetScreen.tsx` | Modelo 3D interactivo + grilla A-Z |
| **Alarmas** | `Alarms/AlarmsScreen.tsx` | Lista de alarmas visuales |
| **Historial** | `History/HistoryScreen.tsx` | Traducciones anteriores |
| **Estadísticas** | `Stats/StatsScreen.tsx` | KPIs y gráfica de uso |
| **Perfil** | `Profile/ProfileScreen.tsx` | Datos del usuario, tema y configuración |

---

## Sistema de diseño

Todo el sistema visual está centralizado en `app/constants/`. Cambiar un valor aquí lo propaga a toda la app.

### Colores principales — `colors.ts`

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#7C3AED` | Botones, acentos, badges, activos |
| `primaryBg` | `#EDE9FE` | Fondos de pantallas de auth |
| `background` | `#FFFFFF` | Fondo general |
| `backgroundGray` | `#F9FAFB` | Fondo exterior web |
| `textPrimary` | `#1F2937` | Títulos y cuerpo |
| `textSecondary` | `#6B7280` | Labels, descripciones |
| `success` | `#10B981` | Confirmaciones |
| `error` | `#EF4444` | Errores, acciones destructivas |

Para cambiar el color primario de púrpura a azul:
```ts
// app/constants/colors.ts
primary:        '#2563EB',
primaryBg:      '#EFF6FF',
```

### Tamaños — `sizes.ts`

| Token | Valor | Uso |
|---|---|---|
| `inputHeight` | `52px` | Todos los campos de texto |
| `buttonHeight` | `52px` | Todos los botones |
| `tabBarHeight` | `65px` | Barra de tabs inferior |
| `radiusLg` | `16px` | Cards |
| `radiusXl` | `24px` | Modales |

### Diseño responsive

Todas las pantallas usan `useWindowDimensions()` para adaptarse:

| Breakpoint | Ancho | Comportamiento |
|---|---|---|
| Móvil pequeño | alto < 640px | 5 cols en alfabeto, visor 3D 200 px |
| Móvil normal | < 768px | 5 cols en alfabeto, visor 3D = 34% alto pantalla |
| Tablet | 768–1023px | 7 cols en alfabeto, visor 3D = 40% alto pantalla |
| Desktop/Web | ≥ 1024px | 9 cols en alfabeto, visor 3D = 40% alto pantalla |

```tsx
// Siempre dentro del componente, nunca a nivel de módulo
const { width, height } = useWindowDimensions();
const VIEWER_H = height < 640 ? 200 : width >= 768 ? Math.round(height * 0.40) : Math.round(height * 0.34);
```

---

## Configuración web (`app/web/`)

### Título de pestaña del navegador

El título se controla en dos niveles:

1. **Estático** — `app/web/index.html` define `<title>Traduce Señas</title>` como valor inicial.
2. **Dinámico** — `AppNavigator.tsx` usa la prop `documentTitle` de `NavigationContainer` para mantener siempre el mismo título al navegar:

```tsx
<NavigationContainer documentTitle={{ formatter: () => 'Traduce Señas' }}>
```

Si en el futuro se necesita mostrar el nombre de la pantalla (p. ej. `"Traducción | Traduce Señas"`), basta cambiar el formatter en `app/presentation/navigation/AppNavigator.tsx`.

### Ícono de la app en web (favicon)

El `index.html` ya incluye:

```html
<link rel="icon" type="image/png" href="/images/icono.png" />
<link rel="apple-touch-icon" href="/images/icono.png" />
```

El ícono vive en dos lugares con roles distintos:

| Archivo | Ruta | Para qué |
|---|---|---|
| Ícono en la app (código React Native) | `app/images/icono.png` | Referenciado con `require()` en pantallas |
| Favicon del navegador web | `app/web/images/icono.png` | Servido estáticamente en `/images/icono.png` |

> **Por qué dos copias:** Expo con Metro procesa y hashea los archivos de `app/assets/` — no son accesibles como rutas URL simples. Solo los archivos dentro de `app/web/` se sirven estáticamente. Si actualizas el ícono, cópialo en ambas ubicaciones.

---

## Assets locales

| Archivo | Ubicación | Usado en |
|---|---|---|
| `slide1.jpg` | `app/assets/images/` | LandingScreen, LoginScreen (web), RegisterScreen (web) |
| `slide2.jpg` | `app/assets/images/` | LandingScreen |
| `slide3.jpg` | `app/assets/images/` | LandingScreen |
| `testimonial.jpg` | `app/assets/images/` | LandingScreen |
| `camera_placeholder.jpg` | `app/assets/images/` | TranslationScreen |
| `signia_model.glb` | `app/assets/` | AlphabetScreen (modelo 3D del personaje) |
| `model_viewer.html` | `app/assets/` | AlphabetScreen (visor Three.js cargado en WebView) |
| `icono.png` | `app/assets/images/` | Favicon y apple-touch-icon en web |

---

## Dependencias clave

| Paquete | Versión | Para qué |
|---|---|---|
| `expo` | ~54.0.0 | Framework base |
| `react` | 19.1.0 | Motor de UI |
| `react-native` | 0.81.5 | UI nativa (versión requerida por Expo SDK 54) |
| `react-native-webview` | 13.15.0 | Visor 3D del alfabeto (Three.js) |
| `react-native-reanimated` | ~4.1.1 | Animaciones nativas del sheet |
| `expo-linear-gradient` | ~15.0.8 | Gradientes en UI |
| `@expo/vector-icons` | ^15.0.3 | Iconos Ionicons |
| `@react-navigation/native` | ^6.1.17 | Navegación entre pantallas |
| `expo-camera` | ~17.0.10 | Cámara para traducción |
| `expo-av` | ~16.0.8 | Audio y video |
| `expo-notifications` | ~0.32.16 | Notificaciones push |

> **Nota:** `react-native-worklets` **no debe declararse** en `package.json` — es una dependencia interna de `react-native-reanimated` que npm resuelve automáticamente. Declararlo manualmente en versión incorrecta causa el error `PlatformConstants could not be found` en móvil.

---

## Solución de errores comunes

| Error | Causa | Solución |
|---|---|---|
| `expo: command not found` | Expo no instalado globalmente | Usar `npx expo` |
| `Port 8082 already in use` | Puerto ocupado | Cambiar a `--port 8083` |
| Pantalla en blanco | Error de JS | Abrir **F12 → Console** |
| `Cannot find module '...'` | Dependencias faltantes | `npm install` |
| Modelo 3D no carga | GLB no copiado a assets | Verificar `app/assets/signia_model.glb` |
| WebView en blanco | `react-native-webview` no instalado | `npm install react-native-webview` |
| `node_modules` no existe | Primera ejecución | `npm install` en `app/` |
| `Project is incompatible with this version of Expo Go` | SDK desactualizado | Ejecutar `npm install --legacy-peer-deps` en `app/` (proyecto ya actualizado a SDK 54) |
| **`PlatformConstants could not be found` en móvil** | `react-native-worklets` declarado manualmente en versión incorrecta, conflicto con TurboModules de RN 0.81 | Eliminar `react-native-worklets` de `package.json`, luego `rm -rf node_modules && npm install && npx expo start --clear` |

---

## Extensiones recomendadas para VS Code

| Extensión | ID |
|---|---|
| ES7+ React/Redux snippets | `dsznajder.es7-react-js-snippets` |
| Prettier | `esbenp.prettier-vscode` |
| TypeScript Importer | `pmneo.tsimporter` |
| Expo Tools | `expo.vscode-expo-tools` |
| React Native Tools | `msjsdiag.vscode-react-native` |
| PlantUML | `jebbs.plantuml` |
| GitLens | `eamodio.gitlens` |

---

## Por qué el `.gitignore` excluye ciertas carpetas

| Carpeta/Archivo | Razón |
|---|---|
| `node_modules/` | Pesa +500 MB, se regenera con `npm install` |
| `.expo/` | Caché local de la máquina de desarrollo |
| `android/` / `ios/` | Generadas por Expo Build, no son código fuente |
| `.env` | Contiene contraseñas y claves — nunca al repositorio |
| `*.log` | Logs de errores locales |
| `.claude/` | Configuración del agente de desarrollo |

> **Regla:** si un archivo se puede regenerar automáticamente o contiene datos privados de tu máquina, va en `.gitignore`.
