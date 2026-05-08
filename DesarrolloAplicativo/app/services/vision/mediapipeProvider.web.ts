/**
 * @file services/vision/mediapipeProvider.web.ts
 * @description Provider de MediaPipe Hands para plataforma web. Carga el
 * modelo `hand_landmarker.task` desde el CDN de Google, detecta los 21
 * keypoints de la mano y aplica el clasificador geométrico para mapearlos a
 * una letra del alfabeto LSC.
 *
 * Solo se compila en web — Metro resuelve este archivo automáticamente
 * cuando la plataforma es `web`. En nativo se usa `mediapipeProvider.ts`.
 */
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyLetterLSC, type Landmark } from './classifier';
import type { SignDetectionResult, SignVisionProvider, VisionFrame } from './types';

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

let landmarker: HandLandmarker | null = null;
let initPromise: Promise<HandLandmarker> | null = null;

const getLandmarker = (): Promise<HandLandmarker> => {
  if (landmarker) return Promise.resolve(landmarker);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    const lm = await HandLandmarker.createFromOptions(vision, {
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
    // Frame sintético (sin imagen real) → no podemos detectar; reportamos sin manos.
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
