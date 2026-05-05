# DesarrolloAplicativo 

Carpeta raíz del desarrollo de Traduce Señas, una aplicación móvil y web para la traducción del lenguaje de señas colombiano (LSC). Contiene las tres capas principales del proyecto más el modelo 3D interactivo.

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
| `model_viewer.html` | `app/assets/` | Visor Three.js: fondo gradiente, spinner de carga, barra de progreso, auto-rotación, animación de entrada, aro de luz en el suelo |
| `AlphabetScreen.tsx` | `app/presentation/screens/Alphabet/` | Pantalla con grilla A-Z + modal centrado con visor 3D, navegación prev/next y botón Repetir |

### Diseño de la pantalla

La pantalla tiene dos capas:

1. **Grilla de letras (A–Z):** 26 cartas con imagen de la seña y badge de color. Ocupa toda la pantalla. El número de columnas se adapta al ancho: 5 cols en móvil, 7 en tablet, 9 en desktop.
2. **Modal centrado (al tocar una letra):** una tarjeta animada aparece centrada sobre un fondo oscuro semitransparente, mostrando el visor 3D con la animación de la seña seleccionada. Incluye flechas para navegar entre letras sin cerrar el modal. Se cierra tocando fuera o el botón ✕.

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
     ┌──────────────────┐
     │[‹][A] Seña: A[›][✕]│  ← Header con gradiente + nav prev/next
     ├──────────────────┤
     │                  │
     │    Visor 3D      │  ← WebView con Three.js (250 px)
     │    (WebView)     │
     ├──────────────────┤
     │  [↺ Repetir]     │  ← Botón para repetir la animación
     ├──────────────────┤
     │  Tip de seña     │
     │  Toca fuera      │
     └──────────────────┘
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
3. Cuando el usuario toca una letra, el modal se abre y se envía `{ type: 'PLAY_ANIMATION', animation: 'Letra_A' }`.
4. Three.js reproduce la animación con fade-in de 0.22 s. El modelo permanece en memoria al navegar entre letras con las flechas prev/next.
5. El botón **Repetir** reenvía el mismo mensaje sin recargar el modelo.

### Animaciones disponibles en el GLB

El modelo tiene **33 acciones** nombradas:

| Tipo | Nombres |
|---|---|
| **Alfabeto (26)** | `Letra_A` … `Letra_Z` |
| **Frases (6)** | `Hola_Saludo`, `Gracias`, `Te_Amo`, `Si_Afirmacion`, `No_Negacion`, `Pose_Neutral` |
| **Original Mixamo** | `mixamo.com` |

### Editar el modelo en Blender

El archivo fuente es `cuerpo.blend`, ubicado en la carpeta `modelado/` del repositorio del proyecto.

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
| **Historial** | `History/HistoryScreen.tsx` | Traducciones anteriores |
| **Estadísticas** | `Stats/StatsScreen.tsx` | KPIs y gráfica de uso |
| **Perfil** | `Profile/ProfileScreen.tsx` | Datos del usuario, acento de color, tema y configuración |
| **Términos y condiciones** | `Profile/TermsScreen.tsx` | 9 secciones legales accesibles desde Perfil |
| **Política de privacidad** | `Profile/PrivacyPolicyScreen.tsx` | 11 secciones (Ley 1581 de 2012) accesibles desde Perfil |

---

## Sistema de diseño

Todo el sistema visual está centralizado en `app/constants/`. Cambiar un valor aquí lo propaga a toda la app.

### Colores principales — `colors.ts`

El archivo expone **cuatro paletas** que se seleccionan automáticamente según el modo y el acento que el usuario configure desde Perfil:

| Paleta | Modo | Acento |
|---|---|---|
| `Colors` | Claro | Púrpura (default) |
| `DarkColors` | Oscuro | Púrpura |
| `GreenColors` | Claro | Verde |
| `GreenDarkColors` | Oscuro | Verde — superficies con sutil tinte verde |

Tokens semánticos (valores del modo claro púrpura):

| Token | Valor púrpura | Valor verde | Uso |
|---|---|---|---|
| `primary` | `#7C3AED` | `#4CAF82` | Botones, acentos, badges, activos |
| `primaryBg` | `#EDE9FE` | `#E8F5EE` | Fondos de pantallas de auth y badges suaves |
| `background` | `#FFFFFF` | `#FFFFFF` | Fondo general |
| `backgroundGray` | `#F9FAFB` | `#F9FAFB` | Fondo exterior web |
| `textPrimary` | `#1F2937` | `#1F2937` | Títulos y cuerpo |
| `textSecondary` | `#6B7280` | `#6B7280` | Labels, descripciones |
| `success` | `#10B981` | `#10B981` | Confirmaciones |
| `error` / `danger` | `#EF4444` | `#EF4444` | Errores, acciones destructivas |

> El acento solo afecta a las **pantallas internas** (Translation, Alphabet, Stats, History, Profile, Términos, Privacidad). Login, Registro y Landing conservan el morado de marca.

### Cómo consumir colores en un componente

Siempre usa el hook `useColors()` para que el componente reaccione al tema:

```tsx
import { useColors } from '../../state/ThemeContext';

const MyView = () => {
  const C = useColors();
  return <View style={{ backgroundColor: C.surface, borderColor: C.primary }} />;
};
```

> Importar `Colors` directamente filtra el morado al cambiar a verde u oscuro. Resérvalo solo para Login/Registro/Landing.

Para cambiar el color primario púrpura por uno distinto, edita `PrimaryScale.DEFAULT` y los tokens semánticos en `Colors`. Para añadir un acento nuevo, crea otra paleta tipo `GreenColors`/`GreenDarkColors` y agrégala al `useColors()` de `state/ThemeContext.tsx`.

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
| Móvil pequeño | alto < 600px | 5 cols en alfabeto, visor 3D 200 px |
| Móvil normal | < 768px | 5 cols en alfabeto, visor 3D 250 px |
| Tablet | 768–1023px | 7 cols en alfabeto, visor 3D 250 px |
| Desktop/Web | ≥ 1024px | 9 cols en alfabeto, visor 3D 250 px |

```tsx
// Siempre dentro del componente, nunca a nivel de módulo
const { width, height } = useWindowDimensions();
const VIEWER_H = height < 640 ? 200 : width >= 768 ? Math.round(height * 0.40) : Math.round(height * 0.34);
```

---

## Internacionalización (i18n)

La app soporta **4 idiomas** seleccionables desde la pantalla de Perfil: Español, Inglés, Francés y Portugués.

### Archivos del sistema

| Archivo | Descripción |
|---|---|
| `app/i18n/locales/es.ts` | Fuente de verdad con ~150 claves en español |
| `app/i18n/locales/en.ts` | Traducciones al inglés (tipadas como `typeof es`) |
| `app/i18n/locales/fr.ts` | Traducciones al francés |
| `app/i18n/locales/pt.ts` | Traducciones al portugués |
| `app/i18n/index.ts` | Hook `useTranslation()` con fallback `es` |
| `app/state/LanguageContext.tsx` | Contexto global + persistencia en AsyncStorage |

### Cómo funciona

1. El usuario elige un idioma en **Perfil → Idioma de la app**.
2. `LanguageContext` guarda la selección en `AsyncStorage` con la clave `@app_language` y la propaga a todos los componentes hijos.
3. Cualquier pantalla llama `const { t } = useTranslation()` y usa `t('clave')` para obtener el texto en el idioma activo.
4. Si una clave no existe en el idioma elegido, se usa el valor en español como fallback.

```tsx
// Ejemplo de uso en cualquier componente
import { useTranslation } from '../../i18n';

const MyScreen = () => {
  const { t } = useTranslation();
  return <Text>{t('loginBtn')}</Text>; // → "Sign In" en inglés, "Ingresar" en español
};
```

### Cómo agregar un idioma nuevo

1. Crear `app/i18n/locales/xx.ts` tipado como `typeof es` y completar todas las claves.
2. Importarlo en `app/i18n/index.ts` y agregarlo al objeto `translations`.
3. Agregar el código al tipo `LanguageCode` y su nombre en `LANGUAGE_NAMES` en `app/state/LanguageContext.tsx`.
4. El selector en `ProfileScreen` lo detecta automáticamente.

### Cómo agregar una nueva clave

1. Agregar la clave con su valor en español a `app/i18n/locales/es.ts`.
2. Agregar la traducción equivalente en `en.ts`, `fr.ts` y `pt.ts` (TypeScript marcará un error si falta).
3. Usar `t('nuevaClave')` en el componente.

### Pantallas traducidas

Todas las pantallas de la app usan `useTranslation()`:

| Pantalla | Estado |
|---|---|
| LandingScreen | ✅ |
| LoginScreen | ✅ |
| RegisterScreen | ✅ |
| ForgotPasswordScreen | ✅ |
| VerifyCodeScreen | ✅ |
| NewPasswordScreen | ✅ |
| TranslationScreen | ✅ |
| AlphabetScreen | ✅ |
| AlarmsScreen | ✅ |
| HistoryScreen | ✅ |
| StatsScreen | ✅ |
| ProfileScreen | ✅ |
| MainTabNavigator / WebTopBar | ✅ |

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
| `comunicate-sinbarreras.png` | `app/assets/images/` | LandingScreen — slide 1 del carrusel |
| `traducion-real.png` | `app/assets/images/` | LandingScreen — slide 2 del carrusel |
| `historial.png` | `app/assets/images/` | LandingScreen — slide 3 del carrusel |
| `alfabeto.png` | `app/assets/images/` | LandingScreen — banner "Aprende el alfabeto dactilológico" |
| `slide1.jpg` / `slide2.jpg` / `slide3.jpg` | `app/assets/images/` | LoginScreen / RegisterScreen (split-screen en web) y card "Reconocida oficialmente" del Landing |
| `testimonial.jpg` | `app/assets/images/` | LandingScreen — avatar del testimonio |
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
| Modelo 3D no carga en iOS | Rutas `file://` no resueltas en iOS Expo | El código usa `expo-asset` para obtener el `localUri` real; verificar que `expo-asset` esté instalado |
| WebView en blanco | `react-native-webview` no instalado | `npm install react-native-webview` |
| Visor 3D sin fondo / negro | Three.js no cargó desde CDN (sin internet) | El visor requiere conexión para cargar Three.js r160 desde jsDelivr |
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
