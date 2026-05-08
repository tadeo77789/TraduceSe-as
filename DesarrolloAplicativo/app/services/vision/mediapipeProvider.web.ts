/**
 * @file services/vision/mediapipeProvider.web.ts
 * @description Provider de MediaPipe Hands para web. Carga el módulo
 * `@mediapipe/tasks-vision` desde CDN en runtime para evitar que Metro
 * intente bundlear el `vision_bundle.mjs` (que usa import() dinámicos
 * internos no soportados por el transformer de Metro).
 *
 * Detecta los 21 keypoints de la mano y aplica el clasificador geométrico
 * para mapearlos a una letra LSC. Solo se compila en web — Metro resuelve
 * este archivo automáticamente cuando la plataforma es `web`.
 */
import { classifyLetterLSC, type Landmark } from './classifier';
import type { SignDetectionResult, SignVisionProvider, VisionFrame } from './types';

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODULE_URL = `${CDN_BASE}/vision_bundle.mjs`;
const WASM_BASE = `${CDN_BASE}/wasm`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// ── Tipos mínimos para evitar dependencia con el paquete npm ────────────────
interface MpLandmark { x: number; y: number; z: number }

interface MpHandLandmarker {
  detect(image: HTMLImageElement | HTMLCanvasElement): {
    landmarks: MpLandmark[][];
  };
  close(): void;
}

interface MpModule {
  FilesetResolver: {
    forVisionTasks(wasmPath: string): Promise<unknown>;
  };
  HandLandmarker: {
    createFromOptions(vision: unknown, opts: object): Promise<MpHandLandmarker>;
  };
}

let landmarker: MpHandLandmarker | null = null;
let initPromise: Promise<MpHandLandmarker> | null = null;

/** Carga el módulo en runtime esquivando el análisis estático de Metro.
 *  `new Function('url', 'return import(url)')` se evalúa solo en el browser. */
const loadMpModule = (): Promise<MpModule> => {
  const dynImport = new Function('u', 'return import(u)') as (u: string) => Promise<MpModule>;
  return dynImport(MODULE_URL);
};

const getLandmarker = (): Promise<MpHandLandmarker> => {
  if (landmarker) return Promise.resolve(landmarker);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const mp = await loadMpModule();
    const vision = await mp.FilesetResolver.forVisionTasks(WASM_BASE);
    const lm = await mp.HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      numHands: 1,
      runningMode: 'IMAGE',
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    landmarker = lm;
    return lm;
  })();

  return initPromise;
};

const loadImage = (base64: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode frame'));
    img.src = base64.startsWith('data:')
      ? base64
      : `data:image/jpeg;base64,${base64}`;
  });

export const mediapipeProvider: SignVisionProvider = {
  name: 'mediapipe-web',

  async init() {
    await getLandmarker();
  },

  async detect(frame: VisionFrame): Promise<SignDetectionResult> {
    // Frame sintético (sin imagen real) → no podemos detectar.
    if (frame.base64.startsWith('synthetic-') || frame.base64.length < 100) {
      return {
        text: '',
        confidence: 0,
        status: 'no_hands',
        timestamp: frame.capturedAt,
      };
    }

    try {
      const lm = await getLandmarker();
      const img = await loadImage(frame.base64);
      const result = lm.detect(img);

      if (!result.landmarks || result.landmarks.length === 0) {
        return {
          text: '',
          confidence: 0,
          status: 'no_hands',
          timestamp: frame.capturedAt,
        };
      }

      const hand = result.landmarks[0] as Landmark[];
      const { letter, confidence } = classifyLetterLSC(hand);

      if (!letter) {
        return {
          text: '',
          confidence,
          status: 'low_confidence',
          timestamp: frame.capturedAt,
        };
      }

      return {
        text: letter,
        confidence,
        status: confidence >= 0.7 ? 'detecting' : 'low_confidence',
        timestamp: frame.capturedAt,
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
    landmarker?.close();
    landmarker = null;
    initPromise = null;
  },
};
