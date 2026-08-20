# Cambios para dejar el agente de señas funcional (2026-06-10)

Objetivo: cerrar todos los pendientes del agente de reconocimiento de señas
para que el flujo completo funcione end-to-end: **login real → cámara →
reconocimiento → transcript → guardado en backend → historial real**.

> Estado: la primera tanda (auth + persistencia) ya fue commiteada y pusheada
> (`dff0c21 feat connect auth and translations to real backend`). La segunda
> tanda (señas con movimiento + palabras, sección 8) está pendiente de commit.

---

## 8. Señas con movimiento y palabras (segunda tanda — para conversación)

El agente ahora reconoce en **web**:

1. **Las 4 letras dinámicas LSC** que faltaban — J, Ñ, RR, Z — por heurísticas
   de trayectoria (forma de mano base + patrón de movimiento).
2. **Palabras completas** (HOLA, GRACIAS, lo que se entrene) — gestos grabados
   por el usuario y reconocidos por DTW (Dynamic Time Warping). Esto permite
   mantener una conversación con señas de palabra en vez de deletrear todo.

### Cómo funciona

- `mediapipeProvider.web.ts` corre un **loop interno de muestreo a ~8 fps**
  que lee directo del `<video>` de la cámara (el snapshot de 1.5 s del agente
  no alcanza para capturar movimiento). Cada muestra guarda los 21 landmarks,
  la letra estática del frame y el vector de 63 features.
- `motionClassifier.ts` (**nuevo**) analiza esa ventana (~2.2 s):
  - **Palabras** (prioridad): compara la secuencia actual contra las plantillas
    entrenadas usando DTW con banda de Sakoe-Chiba; acepta si la distancia
    normalizada es < 1.1.
  - **J**: forma I (meñique) que baja y hace gancho lateral.
  - **Z**: forma D (índice) trazando zigzag (≥2 reversas) con descenso neto.
  - **Ñ**: forma N + ondulación horizontal (la "tilde").
  - **RR**: forma R + vibración horizontal.
- `motionTemplateStore.ts` (**nuevo**): persistencia de los gestos en
  AsyncStorage (secuencias de 16 frames × 63 features), con export/import JSON.
- Mientras la mano se mueve, las letras estáticas se degradan a
  `low_confidence` (no se anexan poses intermedias del trazo).
- `useSignAgent`: las detecciones de movimiento se confirman en **1 frame**
  (el gesto ocurre una sola vez); `RR` se concatena sin espacio (dígrafo) y
  las palabras se anexan con espacio para formar la frase.

### Entrenamiento de palabras

`AdminTrainingScreen` tiene un panel nuevo **"Señas de palabras (con
movimiento)"**: se escribe la palabra, se presiona **Grabar gesto** y se hace
la seña completa frente a la cámara (~2.4 s). Varias tomas de la misma palabra
mejoran el reconocimiento. Cada palabra aparece como chip con su número de
tomas y se puede borrar individualmente.

### Archivos de esta tanda

| Archivo | Cambio |
|---|---|
| `app/services/vision/motionClassifier.ts` | **Nuevo** — buffer de trayectoria, heurísticas J/Ñ/RR/Z, matcher DTW de palabras, snapshot para entrenamiento |
| `app/services/vision/motionTemplateStore.ts` | **Nuevo** — persistencia de plantillas de gesto |
| `app/services/vision/mediapipeProvider.web.ts` | Loop de muestreo ~8 fps + prioridad del resultado de movimiento + compuerta "mano en movimiento" |
| `app/services/vision/index.ts` | Helpers de gestos: `beginGestureCapture`, `recordGesture`, `getGestureCounts`, `clearGestureLabel`, export/import |
| `app/hooks/useSignAgent.ts` | Confirmación en 1 frame para `source: 'motion'`; RR sin espacio; palabras con espacio |
| `app/types/index.ts` | `source` ahora incluye `'motion'` |
| `app/services/translations.service.ts` y `TranslationScreen.tsx` | El `source` real (motion/geometric/…) se guarda en el historial |
| `app/presentation/screens/Admin/AdminTrainingScreen.tsx` | Panel de entrenamiento de gestos de palabra |
| `app/i18n/locales/{es,en,fr,pt}.ts` | 12 claves nuevas `trainGesture*` |
| `app/services/vision/classifier.ts` y `readme.md` | Documentación actualizada |

### Limitaciones

- El reconocimiento de movimiento es **solo web** (el provider TFJS de móvil
  clasifica frames sueltos; un modelo secuencial queda como mejora futura).
- Las heurísticas de J/Ñ/RR/Z son aproximadas; si fallan con tu forma de
  señar, entrena la letra como "gesto de palabra" con la etiqueta de la letra
  (ej. grabar el gesto "J") — la plantilla DTW tiene prioridad.

---

## 1. Base de datos (PostgreSQL en Docker)

La BD estaba **completamente vacía** (ni `users` ni `translations` existían).

| Qué | Dónde |
|---|---|
| **Nuevo** SQL versionado de `users` + `password_reset_token` | `backend/sql/000_users.sql` |
| SQL de `translations` (ya existía, ahora ejecutado) | `backend/sql/001_translations.sql` |

Ambos scripts fueron **ejecutados** contra el contenedor `postgres-container`
(puerto 5433, DB `traduce_senas`). Tablas creadas: `users`,
`password_reset_token`, `translations`.

Para recrear la BD desde cero:
```bash
docker start postgres-container
docker exec -i postgres-container psql -U postgres -d traduce_senas < backend/sql/000_users.sql
docker exec -i postgres-container psql -U postgres -d traduce_senas < backend/sql/001_translations.sql
```

## 2. Backend (`DesarrolloAplicativo/backend`)

| Archivo | Cambio |
|---|---|
| `src/services/auth.service.js` | **Bug fix:** faltaban `require('crypto')` y `require('nodemailer')` + la creación del `transporter` — el flujo forgot/reset-password crasheaba al invocarse. El transporter usa `EMAIL_USER`/`EMAIL_PASS` del `.env` (aún sin configurar, ver pendientes). |
| `src/routes/translations.routes.js` | **Activado `authMiddleware`** en todas las rutas de translations. Ahora exigen JWT válido (`Authorization: Bearer ...`); sin token responden 401. |
| `src/controllers/translations.controller.js` | Actualizado el comentario: el `user_id` ahora sale del JWT (`req.user`); el fallback body/query queda solo para pruebas con curl/Postman. |
| `src/app.js` | **Agregado CORS** (`app.use(cors())`) — sin esto el navegador bloqueaba las peticiones del frontend web (puerto distinto al backend). |
| `package.json` | Nueva dependencia: `cors`. |

## 3. Frontend (`DesarrolloAplicativo/app`)

| Archivo | Cambio |
|---|---|
| `state/AuthContext.tsx` | **Auth real conectado al backend** (el mock se eliminó). `login` llama a `POST /api/auth/login` y guarda el JWT real; `register` llama a `POST /api/auth/register` y hace login automático después (el registro no devuelve token). Se agregó `mapBackendUser` que traduce los campos del backend (`user_id`, `name`) al tipo `User` del frontend (`id_usuario`, `nombre`). Las sesiones mock viejas (`mock-token-123`) guardadas en AsyncStorage se descartan automáticamente al arrancar, forzando un login real. |
| `config/api.config.ts` | `API_BASE_URL` ahora depende de la plataforma en desarrollo: Android emulador → `http://10.0.2.2:3000/api`; **web/iOS → `http://localhost:3000/api`** (antes apuntaba siempre a 10.0.2.2 y en web fallaba). Para celular físico hay que poner la IP LAN del PC. |
| `presentation/screens/History/HistoryScreen.tsx` | **Historial real** (el mock `MOCK_HISTORY` se eliminó). Carga `GET /api/translations/history` cada vez que la pantalla recibe foco (`useFocusEffect`), muestra spinner mientras carga, y "Eliminar" llama a `DELETE /api/translations/:id` con confirmación vía `utils/dialogs` (SweetAlert2 en web, Alert nativo en móvil). Fecha y hora salen del `created_at` real. |
| `i18n/locales/{es,en,fr,pt}.ts` | Nueva clave `historyDeleteError` en los 4 idiomas. |
| `presentation/screens/Auth/ForgotPasswordScreen.tsx`, `VerifyCodeScreen.tsx` | Fix de 2 errores de TypeScript preexistentes en `navigation.navigate` (el patrón `as never, as never` ya no compilaba). `npx tsc --noEmit` queda en 0 errores. |
| `package.json` | Nuevas dependencias: `@tensorflow/tfjs` y `jpeg-js` — el provider TFJS de móvil ya las puede cargar (antes degradaba a mock por no estar instaladas). |

## 4. Lo que NO se tocó (ya estaba operativo)

- `services/vision/*` — providers (MediaPipe web, TFJS móvil, mock), clasificador
  geométrico de 24 letras LSC, KNN entrenable, templateStore.
- `hooks/useSignAgent.ts` — ventana de estabilidad, backspace, espacio.
- `presentation/screens/Translation/TranslationScreen.tsx` — ya guardaba el
  transcript vía `translationsService.save()` (persistencia silenciosa).
- `services/api.service.ts` — el interceptor ya adjuntaba el JWT real y
  filtraba el mock.

## 5. Verificación realizada

Backend levantado (`node server.js`) contra el Postgres de Docker:

| Prueba | Resultado |
|---|---|
| `POST /api/auth/register` | ✅ 201, usuario creado en `public.users` |
| `POST /api/auth/login` | ✅ 200, devuelve JWT válido |
| `POST /api/translations` con JWT | ✅ 201, guarda con el `user_id` del token |
| `GET /api/translations/history` con JWT | ✅ 200, lista la traducción guardada |
| `GET /api/translations/history` **sin** token | ✅ 401 ("Formato de token inválido") |
| `DELETE /api/translations/:id` con JWT | ✅ 200, borrado lógico (historial queda vacío) |
| Preflight CORS (`OPTIONS` con `Origin`) | ✅ 204 con `Access-Control-Allow-Origin: *` |
| `npx tsc --noEmit` en `app/` | ✅ 0 errores |

## 6. Estado actual del agente

| Componente | Estado |
|---|---|
| Reconocimiento en **web** (MediaPipe + geométrico + KNN) | ✅ Funcional — 24 letras LSC estáticas + número 5 |
| Auth real (login/register contra backend) | ✅ Funcional |
| Persistencia de traducciones (con JWT) | ✅ Funcional |
| Historial real con borrado | ✅ Funcional |
| Reconocimiento en **móvil** (TFJS) | ⚠️ Deps instaladas, falta el modelo (ver pendientes) |
| Letras con movimiento (J, Ñ, RR, Z) en web | ✅ Funcional vía `motionClassifier` (ver sección 8) |
| Palabras completas (gestos entrenables) en web | ✅ Funcional vía DTW + panel de entrenamiento (ver sección 8) |

### Cómo correr todo

```bash
# 1. Base de datos
docker start postgres-container

# 2. Backend (puerto 3000)
cd DesarrolloAplicativo/backend && npm run dev

# 3. Frontend web
cd DesarrolloAplicativo/app && npm run web
```

Registrarse desde la app (la sesión mock vieja se limpia sola), ir a
**Traducción** en modo seña→texto, activar la cámara y deletrear; al detener,
el transcript se guarda y aparece en **Historial**.

## 7. Pendientes (requieren acción manual del usuario)

1. **Modelo TFJS para móvil**: entrenar en
   [Teachable Machine](https://teachablemachine.withgoogle.com/train/image),
   exportar como TensorFlow.js, hostear `model.json` + pesos + `labels.json`
   y poner las URLs en `app/config/api.config.ts`
   (`TFJS_MODEL_URL`, `TFJS_LABELS_URL`). Sin esto, móvil usa el provider mock.
2. **Correo de recuperación**: agregar `EMAIL_USER`, `EMAIL_PASS` (app password
   de Gmail) y `FRONTEND_URL` al `backend/.env` para que forgot-password envíe
   el email real.
3. **Celular físico**: cambiar `API_BASE_URL` a la IP LAN del PC.
