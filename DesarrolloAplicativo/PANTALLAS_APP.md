# Pantallas de la App — TraduceSeña

Documento que describe las pantallas de **autenticación** y todas las pantallas
**posteriores al inicio de sesión**. Basado en el código real de
`DesarrolloAplicativo/app/src`.

La app está construida con **React Native + Expo**, es **responsive** (móvil,
tablet y web) y soporta **tema claro/oscuro**, **acento de color** (morado /
verde) y **4 idiomas** (ES, EN, FR, PT).

---

## 1. Arquitectura de navegación

El componente raíz `AppNavigator` decide qué mostrar según el estado de sesión
(`useAuth`):

```
AppNavigator
├── ¿Cargando sesión?        → Spinner (ActivityIndicator)
├── NO autenticado           → AuthNavigator   (stack de login/registro)
└── Autenticado              → MainStackNavigator
                                 ├── MainTabs (tabs inferiores / barra web)
                                 └── ForgotPassword / VerifyCode / NewPassword
                                     (accesibles también desde el Perfil)
```

- **Móvil:** las secciones principales viven en una **barra de pestañas inferior**
  (`MainTabNavigator`).
- **Web (ancho ≥ 1024px):** las pestañas se ocultan y se muestra una **barra
  superior** (`WebTopBar`) con enlaces horizontales.
- La pestaña **Admin** solo aparece si el usuario es administrador
  (`isAdmin(user)`, validado por email).

---

## 2. Pantallas de autenticación (`AuthNavigator`)

Stack sin header. Orden: `Landing → Login → Register → ForgotPassword →
VerifyCode → NewPassword` (+ `Terms` y `PrivacyPolicy`).

Estilo visual común: fondo lila (`#EDE9FE`), tarjetas moradas
(`#DDD6FE` / `primaryBg`), botón de retroceso circular flotante arriba a la
izquierda, y logo "TraduceSeña" en la esquina superior.

### 2.1 Landing (`LandingScreen`)
Página de aterrizaje / marketing. Es la primera pantalla para usuarios no
autenticados.

- **Header:** logo TraduceSeña + botones **Registrarse** e **Iniciar sesión**.
- **Tarjeta de notificación** simulada (descartable) que invita a abrir la app.
- **Hero:** badge con tagline, título grande y subtítulo.
- **Grid de features** (4 tarjetas de color): Traducción, Alfabeto LSC,
  Estadísticas, Historial.
- **Carrusel/slider** horizontal con 3 diapositivas (imágenes + texto), flechas
  y puntos de paginación.
- **Sección "¿Cómo funciona?"** en 3 pasos (abrir cámara → hacer la seña →
  obtener traducción).
- **Sección informativa sobre la LSC** (Lengua de Señas Colombiana): imagen,
  estadísticas (+500K personas sordas, 27 letras, 100% gratis), banner y CTA.
- **Testimonio** con avatar.
- **CTA final** con botón degradado "Comenzar" + enlace a iniciar sesión.

Toda acción (Registrarse / Iniciar sesión / Comenzar) navega a `Register` o
`Login`.

### 2.2 Login (`LoginScreen`)
Formulario de inicio de sesión.

- **Layout responsive:**
  - Ancho ≥ 1024px: **dos paneles** → imagen hero a la izquierda (con badge
    "TraduceSeña / Comunícate sin barreras") y formulario de 420px a la derecha.
  - Móvil: solo el formulario, centrado.
- **Contenido del formulario:**
  - Avatar circular con ícono de persona.
  - Input **Email** (ícono de sobre, teclado email).
  - Input **Contraseña** (ícono de candado, campo protegido con ojo de
    mostrar/ocultar).
  - Enlace **"¿Olvidaste tu contraseña?"** → `ForgotPassword`.
  - Fila con dos botones: **Registrarse** (secundario) y **Iniciar sesión**
    (primario; muestra estado de carga).
  - Botones sociales: **Continuar con Google** y **Continuar con Facebook**
    (con logos PNG).
  - Texto legal con enlaces a **Términos** y **Política de Privacidad**.
- **Validación** (`useLoginForm`): email requerido y con formato válido,
  contraseña requerida. El email se normaliza (`trim` + minúsculas).
- **Comportamiento:** el login está **simulado para demo** (no hay backend real);
  ante error se distingue error de red vs. credenciales. Al autenticarse,
  `AppNavigator` cambia automáticamente al `MainStackNavigator`.

### 2.3 Register (`RegisterScreen`)
Formulario de registro dentro de una tarjeta morada.

- Título "Crear cuenta".
- Inputs: **Nombre**, **Email**, **Contraseña** (con hint).
- **Medidor de fuerza de contraseña** (`PasswordStrengthMeter`).
- **Checkbox de términos** con enlace a la pantalla `Terms`; es obligatorio.
- Botón **Registrarse** (con estado de carga).
- Enlace inferior "¿Ya tienes cuenta? Inicia sesión" → `Login`.
- Responsive: en ancho ≥ 768px el formulario se centra en 480px con el logo
  flotante en la esquina. El registro también está **simulado** (demo).

### 2.4 Recuperación de contraseña (flujo de 3 pasos)
Este flujo se usa tanto desde el Login como desde el **Perfil** (parámetro
`fromProfile`, que adapta títulos y respeta el tema oscuro/color del usuario).

1. **ForgotPassword** — Input de email + botón "Enviar". Valida formato de
   email. Al confirmar navega a `VerifyCode`.
2. **VerifyCode** — Campo **OTP de 6 dígitos** (auto-avance entre casillas,
   retroceso con Backspace). Botón "Verificar" + enlace para reenviar código.
   Navega a `NewPassword`.
3. **NewPassword** — Inputs **Nueva contraseña** y **Confirmar** (mínimo 8
   caracteres, deben coincidir). Al confirmar: si viene del Perfil vuelve al
   inicio del stack (`popToTop`), si no, regresa a `Login`.

> Nota: todo el flujo está simulado con `setTimeout` (no hay envío real de
> código).

### 2.5 Terms y PrivacyPolicy
Pantallas de contenido legal (Términos y Condiciones / Política de Privacidad),
accesibles desde Login, Register y Perfil.

---

## 3. Cabeceras compartidas (post-login)

- **`AppHeader`** (móvil): barra superior con degradado morado, logo + nombre
  "TraduceSeña". Opcionalmente botón de retroceso o de perfil. En **web devuelve
  `null`** (se usa la barra web en su lugar).
- **`WebTopBar`** (web ancho): barra superior fija con logo, enlaces
  horizontales a las secciones (Traducción, Alfabeto, Estadísticas, Historial,
  Admin si aplica) con subrayado en la sección activa, y avatar → Perfil.

---

## 4. Pantallas después de iniciar sesión (`MainTabNavigator`)

Pestañas: **Traducción**, **Alfabeto**, **Estadísticas**, **Historial**,
**Admin** (solo admin) y **Perfil**. Iconos Ionicons con variante activa.

### 4.1 Traducción (`TranslationScreen`) — pestaña principal
Pantalla central de la app. Traduce en dos modos.

- **Toggle de modo** (con degradado en el activo):
  - **Seña → Texto** (cámara)
  - **Texto → Seña**
- **Modo Seña → Texto:**
  - Tarjeta de **cámara** (`CameraView`, frontal). Antes de iniciar muestra una
    imagen placeholder.
  - Badge **"EN VIVO"**, **marco de detección** con esquinas, y **burbuja** que
    muestra la letra pendiente con barra de progreso de confirmación.
  - Etiqueta de estado del agente (`idle`, detectando, baja confianza, sin
    manos, error) y **% de confianza**.
  - **Chips de consejos** (buena iluminación, etc.).
  - Usa el hook `useSignAgent` (reconocimiento por frames, MediaPipe).
- **Modo Texto → Seña:**
  - Tarjeta con **área de texto** multilínea y contador de caracteres.
- **Tarjeta de resultado:** encabezado con badge "Esperando" / "Listo" y cuerpo
  con el texto traducido. Acciones: **Copiar**, y en modo seña: **Borrar**
  (backspace), **Espacio** y **Limpiar** el transcript.
- **Botón de acción principal** (degradado): *Iniciar/Detener cámara* (rojo al
  estar activa) o *Traducir*.
- Al detener la cámara o traducir texto, la traducción se **guarda en el
  historial** (`translationsService`).

### 4.2 Alfabeto (`AlphabetScreen`)
Catálogo del alfabeto dactilológico (A–Z, 26 letras).

- **Encabezado** con título, subtítulo (tagline) y badge "26 letras".
- **Grid** de tarjetas de colores (5/7/9 columnas según ancho). Cada tarjeta
  muestra la imagen de la seña (GIF de lifeprint.com) y la letra en un badge.
- Al tocar una letra se abre un **bottom sheet animado** (spring + backdrop) con:
  - Cabecera con la letra grande, subtítulo "LSC" y flechas **anterior/siguiente**.
  - **Video reproductor** del clip de la letra (`.mp4` local, autoplay + loop),
    con overlay de carga.
  - Botón **"Repetir"** (reinicia el video).
  - **Consejo** específico de la letra.
  - Texto "toca fuera para cerrar".

### 4.3 Estadísticas (`StatsScreen`)
Panel de métricas de uso (datos de ejemplo/mock).

- **4 tarjetas KPI** con degradado: Traducciones (1,248), Usuarios activos (342),
  Horas aprendidas (89h), Señas aprendidas (84).
- **4 tarjetas de gráficos** (tocables para ampliar en un modal):
  - **Barras** — actividad semanal (Lun–Dom).
  - **Líneas** — evolución mensual (Ene–Dic).
  - **Barras** — volumen por semana.
  - **Torta/porcentajes** — distribución por sección (Traducción/Alfabeto/
    Historial).
- **Modal de detalle:** al tocar una tarjeta se abre un modal con el gráfico
  ampliado (con ejes), una **tabla de cardinalidad** y una descripción.

### 4.4 Historial (`HistoryScreen`)
Lista de traducciones guardadas (sí consulta el backend real).

- **Encabezado** con título y badge del total de registros.
- **Buscador** (filtra por texto de entrada).
- **Lista** (1 columna en móvil, 2 en tablet) de tarjetas, cada una con:
  - Badge de **tipo** (Seña→Texto / Texto→Seña / Voz→Seña) con ícono y color.
  - Texto de la traducción.
  - Pie con **fecha y hora**, y acciones **Reutilizar** y **Eliminar**
    (con confirmación).
- **Estados:** spinner mientras carga; ilustración de **vacío** si no hay
  registros. Se recarga al enfocar la pantalla (`useFocusEffect`).

### 4.5 Perfil (`ProfileScreen`)
Cuenta, preferencias y acciones de sesión.

- **Avatar** con degradado + nombre (derivado del email) y email.
- **Fila de stats** del usuario (Traducciones, Aprendidas).
- **Sección "Cuenta":** email y contraseña (solo lectura) + enlace **"Cambiar
  contraseña"** → flujo `ForgotPassword` con `fromProfile: true`.
- **Sección "Preferencias":**
  - **Color de la app:** chips Morado / Verde (`colorAccent`).
  - **Tema** claro/oscuro (Switch).
  - **Notificaciones** (Switch).
  - **Idioma:** chips ES / EN / FR / PT.
- **Sección "Acerca de":** versión (1.0.0), enlace a **Términos** y a **Política
  de Privacidad**.
- **Acciones:** botón **Cerrar sesión** (con confirmación; resetea el tema) y
  **Eliminar cuenta** (variante peligro, con confirmación).

### 4.6 Admin (solo administradores)
Stack propio (`AdminStackNavigator`) con dos pantallas.

**4.6.1 Dashboard (`AdminDashboardScreen`)**
- Título "Panel de administración".
- **Estado de la IA:** métricas (muestras totales, letras cubiertas X/28,
  cobertura %), píldora Activa/Inactiva, y **barras por letra** del alfabeto LSC
  (incluye Ñ y el número 5 → 28 símbolos).
- **Sistema:** versión, plataforma (Web/iOS/Android), idioma, proveedor de
  visión y email del admin.
- **Acciones rápidas:** ir a **Entrenamiento**, **Exportar dataset** (JSON) e
  **Importar dataset** (merge/replace).

**4.6.2 Entrenamiento (`AdminTrainingScreen`)**
- Captura muestras con la **cámara** para entrenar el reconocimiento por letra
  del alfabeto LSC, y captura de **gestos/palabras** completas.
- Muestra conteos por letra y permite limpiar datos de entrenamiento.

---

## 5. Resumen de flujo

```
Landing ──► Login ──► (autenticado) ──► MainTabs
   │          │                          ├── Traducción  (principal)
   │          ├─► Register               ├── Alfabeto
   │          └─► ForgotPassword         ├── Estadísticas
   │                └─► VerifyCode        ├── Historial
   │                     └─► NewPassword  ├── Admin (solo admin)
   │                                      └── Perfil
   └──► Terms / PrivacyPolicy                 └─► Cambiar contraseña
                                                  (ForgotPassword · fromProfile)
```

> Recordatorio: en la build de demo, **login y registro están simulados** (sin
> backend). El **historial** sí consulta el backend, y el flujo de recuperación
> de contraseña usa temporizadores simulados.
