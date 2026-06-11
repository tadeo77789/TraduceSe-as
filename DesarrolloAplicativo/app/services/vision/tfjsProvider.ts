/**
 * @file services/vision/tfjsProvider.ts
 * @description Provider de vision para mobile basado en `@tensorflow/tfjs`
 * (sin prebuild). Carga un modelo `model.json` exportado de Teachable Machine
 * o entrenado a medida, y clasifica cada frame de la camara.
 *
 * Diseño:
 *  - Los imports de tfjs y jpeg-js son **dinamicos con try/catch** para que
 *    el provider compile y degrade a mock cuando los paquetes aun no estan
 *    instalados en el proyecto.
 *  - El modelo y sus etiquetas se descargan de `TFJS_MODEL_URL` /
 *    `TFJS_LABELS_URL` (configurables en `config/api.config.ts`).
 *  - El frame JPEG (base64) se decodifica con `jpeg-js` y se convierte en
 *    tensor 224x224x3, normalizado a [-1, 1] (convencion de MobileNet).
 *
 * Para activarlo:
 *  1) Instalar deps:
 *       npm install @tensorflow/tfjs jpeg-js
 *  2) Entrenar el modelo en https://teachablemachine.withgoogle.com/train/image
 *  3) Exportar como "Tensorflow.js" → carpeta con `model.json` + pesos.
 *  4) Subir esos archivos a una URL publica accesible desde el dispositivo
 *     (Firebase Hosting, GitHub Pages, S3, etc.) y poner la URL en
 *     `TFJS_MODEL_URL`.
 *  5) Crear un `labels.json` con `["A", "B", ...]` y hostearlo en
 *     `TFJS_LABELS_URL`.
 */
import { TFJS_MODEL_URL, TFJS_LABELS_URL } from '../../config/api.config';
import type { SignDetectionResult, SignVisionProvider, VisionFrame } from './types';

// ── Carga perezosa de deps opcionales ───────────────────────────────────────
type TfModule = {
  loadLayersModel: (url: string) => Promise<TfModel>;
  loadGraphModel: (url: string) => Promise<TfModel>;
  tensor3d: (data: ArrayLike<number>, shape: number[]) => TfTensor;
  tidy: <T>(fn: () => T) => T;
  ready?: () => Promise<void>;
};
type TfModel = {
  predict: (input: TfTensor) => TfTensor;
  dispose?: () => void;
};
type TfTensor = {
  expandDims: (axis?: number) => TfTensor;
  div: (n: number) => TfTensor;
  sub: (n: number) => TfTensor;
  dataSync: () => Float32Array;
  data: () => Promise<Float32Array>;
  dispose: () => void;
  reshape: (shape: number[]) => TfTensor;
};
type JpegModule = {
  decode: (buf: Uint8Array, opts?: { useTArray?: boolean }) => {
    width: number;
    height: number;
    data: Uint8Array;
  };
};

let tf: TfModule | null = null;
let jpeg: JpegModule | null = null;
let depsTried = false;

const loadDeps = (): { tf: TfModule | null; jpeg: JpegModule | null } => {
  if (depsTried) return { tf, jpeg };
  depsTried = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    tf = require('@tensorflow/tfjs') as TfModule;
  } catch {
    tf = null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jpeg = require('jpeg-js') as JpegModule;
  } catch {
    jpeg = null;
  }
  return { tf, jpeg };
};

// ── Estado del modelo ────────────────────────────────────────────────────────
let model: TfModel | null = null;
let labels: string[] = [];
let initPromise: Promise<void> | null = null;
const TARGET_SIZE = 224;

const decodeBase64 = (b64: string): Uint8Array => {
  // Atob existe en web; en RN Hermes hay polyfill via Buffer global o no.
  // Usamos un decoder universal sin deps.
  const clean = b64.replace(/^data:image\/\w+;base64,/, '');
  if (typeof atob === 'function') {
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  // Fallback manual
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  const len = clean.length;
  const outLen = (len * 3) / 4 - (clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0);
  const out = new Uint8Array(outLen);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const a = lookup[clean.charCodeAt(i)];
    const b = lookup[clean.charCodeAt(i + 1)];
    const c = lookup[clean.charCodeAt(i + 2)];
    const d = lookup[clean.charCodeAt(i + 3)];
    out[p++] = (a << 2) | (b >> 4);
    if (p < outLen) out[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < outLen) out[p++] = ((c & 3) << 6) | d;
  }
  return out;
};

/** Reducir/escalar la imagen RGBA decodificada a TARGET_SIZE × TARGET_SIZE
 *  usando nearest-neighbor — barato y suficiente para el clasificador. */
const resizeToSquare = (
  rgba: Uint8Array,
  srcW: number,
  srcH: number,
): Float32Array => {
  const out = new Float32Array(TARGET_SIZE * TARGET_SIZE * 3);
  const xRatio = srcW / TARGET_SIZE;
  const yRatio = srcH / TARGET_SIZE;
  for (let y = 0; y < TARGET_SIZE; y++) {
    const srcY = Math.floor(y * yRatio);
    for (let x = 0; x < TARGET_SIZE; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcIdx = (srcY * srcW + srcX) * 4;
      const dstIdx = (y * TARGET_SIZE + x) * 3;
      // Normaliza [0,255] -> [-1,1] (convencion MobileNet)
      out[dstIdx] = rgba[srcIdx] / 127.5 - 1;
      out[dstIdx + 1] = rgba[srcIdx + 1] / 127.5 - 1;
      out[dstIdx + 2] = rgba[srcIdx + 2] / 127.5 - 1;
    }
  }
  return out;
};

const loadLabels = async (): Promise<string[]> => {
  if (labels.length) return labels;
  try {
    const res = await fetch(TFJS_LABELS_URL);
    const json = await res.json();
    if (Array.isArray(json)) labels = json.map(String);
    else if (Array.isArray(json?.labels)) labels = json.labels.map(String);
  } catch {
    labels = [];
  }
  return labels;
};

const initModel = async (): Promise<void> => {
  if (model) return;
  if (initPromise) return initPromise;
  const { tf: tfMod } = loadDeps();
  if (!tfMod) throw new Error('@tensorflow/tfjs no esta instalado');

  initPromise = (async () => {
    if (tfMod.ready) await tfMod.ready();
    // Teachable Machine exporta LayersModel; ajustar si tu modelo es GraphModel.
    try {
      model = await tfMod.loadLayersModel(TFJS_MODEL_URL);
    } catch {
      model = await tfMod.loadGraphModel(TFJS_MODEL_URL);
    }
    await loadLabels();
  })();
  return initPromise;
};

export const tfjsProvider: SignVisionProvider = {
  name: 'tfjs-mobile',

  async init() {
    const { tf: tfMod, jpeg: jpegMod } = loadDeps();
    if (!tfMod || !jpegMod) {
      // Deps no instaladas — degradamos a mock silenciosamente. El primer
      // `detect` devolvera no_hands y la UI seguira funcional.
      return;
    }
    if (!TFJS_MODEL_URL) return;
    try {
      await initModel();
    } catch {
      // Modelo no accesible — el provider sigue, devolviendo no_hands.
    }
  },

  async detect(frame: VisionFrame): Promise<SignDetectionResult> {
    const { tf: tfMod, jpeg: jpegMod } = loadDeps();
    if (!tfMod || !jpegMod || !TFJS_MODEL_URL) {
      return {
        text: '',
        confidence: 0,
        status: 'no_hands',
        timestamp: frame.capturedAt,
      };
    }

    if (frame.base64.startsWith('synthetic-') || frame.base64.length < 100) {
      return {
        text: '',
        confidence: 0,
        status: 'no_hands',
        timestamp: frame.capturedAt,
      };
    }

    try {
      if (!model) await initModel();
      if (!model) throw new Error('Modelo no cargado');

      const bytes = decodeBase64(frame.base64);
      const decoded = jpegMod.decode(bytes, { useTArray: true });
      const pixels = resizeToSquare(decoded.data, decoded.width, decoded.height);

      const tfModSafe = tfMod;
      const probs = tfModSafe.tidy(() => {
        const input = tfModSafe.tensor3d(pixels, [TARGET_SIZE, TARGET_SIZE, 3]).expandDims(0);
        const output = model!.predict(input);
        return Array.from(output.dataSync());
      });

      // Argmax
      let bestIdx = 0;
      let bestProb = probs[0] ?? 0;
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > bestProb) { bestProb = probs[i]; bestIdx = i; }
      }

      const label = labels[bestIdx] ?? `clase_${bestIdx}`;
      return {
        text: label,
        confidence: bestProb,
        status: bestProb >= 0.7 ? 'detecting' : bestProb >= 0.4 ? 'low_confidence' : 'no_hands',
        timestamp: frame.capturedAt,
        source: 'knn',
      };
    } catch {
      return {
        text: '',
        confidence: 0,
        status: 'error',
        timestamp: frame.capturedAt,
      };
    }
  },

  dispose() {
    model?.dispose?.();
    model = null;
    initPromise = null;
  },
};
