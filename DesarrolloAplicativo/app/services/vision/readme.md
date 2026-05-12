# services/vision — Agente de reconocimiento de señas

## Arquitectura

El agente expone un único contrato `SignVisionProvider` (`types.ts`) y elige
el provider activo según la plataforma:

| Plataforma | Provider activo | Estrategia |
|---|---|---|
| Web | `mediapipeProvider.web.ts` | MediaPipe Hands (CDN) + clasificador geométrico LSC + KNN sobre plantillas del usuario |
| iOS/Android | `mediapipeProvider.ts` | TFJS + modelo Teachable Machine si está configurado; si no, `mockProvider` |

`index.ts` exporta el provider seleccionado por Metro y los helpers para la
pantalla de entrenamiento (`recordSample`, `getSampleCounts`, etc.).

## Componentes

| Archivo | Rol |
|---|---|
| `classifier.ts` | Clasificador geométrico sobre los 21 keypoints de MediaPipe. Cubre A-Z LSC estático (excluye J, Ñ, RR, Z que requieren movimiento) + número 5 |
| `knnClassifier.ts` | K-Nearest-Neighbors sobre los vectores normalizados de plantillas guardadas |
| `normalize.ts` | Convierte 21 landmarks → vector de 63 features invariante a posición/escala |
| `templateStore.ts` | Persistencia del dataset KNN en AsyncStorage. Soporta import/export JSON |
| `mediapipeProvider.web.ts` | Provider web (MediaPipe + clasificador + KNN) |
| `mediapipeProvider.ts` | Provider mobile (TFJS opcional + fallback mock) |
| `tfjsProvider.ts` | Carga un modelo TFJS y clasifica frames (decodifica el JPEG con `jpeg-js`, normaliza a 224×224×3, ejecuta inferencia) |
| `mockProvider.ts` | Provider determinista para demo |

## Cómo activar el reconocimiento real en celular

### 1) Instalar dependencias

```bash
cd app
npm install @tensorflow/tfjs jpeg-js
```

Ambos paquetes son JS puro y compatibles con Expo managed workflow (no
requieren `expo prebuild`).

### 2) Entrenar el modelo en Teachable Machine

1. Ir a https://teachablemachine.withgoogle.com/train/image
2. Crear una clase por cada letra del alfabeto LSC que quieras reconocer.
3. Capturar mínimo ~150 imágenes por clase (mano centrada, fondos variados,
   ilumiación variada). Más datos = mejor precisión.
4. Click en **Train Model** y esperar.
5. **Export Model → Tensorflow.js → Download my model**. Te entrega un zip con:
   - `model.json` (arquitectura)
   - `weights.bin` (pesos)
   - `metadata.json` (incluye las etiquetas en `labels`)

### 3) Hostear los archivos

Subí `model.json` y `weights.bin` a una URL pública accesible desde el
celular. Opciones:

- **Firebase Hosting** (gratis y rápido). Habilitá CORS.
- **GitHub Pages** (commiteás los archivos al repo o a una rama gh-pages).
- **AWS S3** con bucket público.

Crea adicionalmente un `labels.json` con un array de strings en el mismo
orden que las clases del modelo:

```json
["A", "B", "C", "D", "E", "F"]
```

### 4) Configurar URLs en la app

Editar `app/config/api.config.ts`:

```ts
export const TFJS_MODEL_URL = 'https://midominio.com/modelo/model.json';
export const TFJS_LABELS_URL = 'https://midominio.com/modelo/labels.json';
```

Reiniciar Metro y al activar la cámara en celular el provider TFJS tomará
el lugar del mock automáticamente.

## Cómo extender el clasificador geométrico (web)

Agregar nuevos casos en `classifier.ts` siguiendo el patrón existente.
Cada letra LSC tiene una configuración característica de dedos extendidos
+ posición del pulgar — usar los helpers `isFingerExtended`,
`isFingerCurled`, `isThumbAcrossPalm`, `isThumbBetweenIndexMiddle`,
`isHandHorizontal`, `isHandPointingDown`.

## Letras NO soportadas

J, Ñ, RR, Z requieren trayectoria de movimiento que un frame estático no
captura. Para soportarlas haría falta:
- Buffer temporal de los últimos N frames de keypoints
- Clasificador secuencial (LSTM / Transformer) o reglas sobre trayectoria

Queda como mejora futura.
