/**
 * @file services/vision/index.ts
 * @description Punto de entrada del agente de visión. Selecciona el provider
 * activo y expone el dataset de plantillas KNN para que la UI de
 * entrenamiento agregue muestras nuevas.
 */
import { mediapipeProvider } from './mediapipeProvider';
import { templateStore } from './templateStore';
import { gestureStore } from './motionTemplateStore';
import {
  snapshotGestureSequence,
  clearMotionBuffer,
  setGestureCaptureMode,
} from './motionClassifier';
import type { SignVisionProvider } from './types';

export const signVisionProvider: SignVisionProvider = mediapipeProvider;

/** Graba una muestra etiquetada en el dataset KNN. La próxima detección
 *  ya considerará esta plantilla. */
export const recordSample = async (
  label: string,
  features: number[] | Float32Array,
): Promise<void> => {
  const arr = features instanceof Float32Array ? features : Float32Array.from(features);
  await templateStore.add(label, arr);
};

/** Cuántas muestras hay por etiqueta — para mostrar progreso en la UI. */
export const getSampleCounts = (): Promise<Record<string, number>> =>
  templateStore.countByLabel();

/** Borra todas las plantillas entrenadas. */
export const clearTrainingData = (): Promise<void> => templateStore.clear();

/** Borra solo las plantillas de una letra. */
export const clearLabel = (label: string): Promise<void> =>
  templateStore.removeLabel(label);

/** Serializa el dataset completo a JSON (string). */
export const exportTrainingJson = (): Promise<string> => templateStore.exportJSON();

/** Importa un JSON exportado previamente. mode='merge' agrega; 'replace' sobrescribe. */
export const importTrainingJson = (
  json: string,
  mode: 'merge' | 'replace' = 'merge',
): Promise<number> => templateStore.importJSON(json, mode);

// ── Gestos de palabra (señas con movimiento entrenables) ─────────────────────

/** Vacía el buffer de movimiento y suspende la detección de gestos — llamar
 *  justo antes de pedirle al usuario que haga la seña, así la plantilla solo
 *  contiene el gesto nuevo y el clasificador no lo consume a mitad de toma. */
export const beginGestureCapture = (): void => {
  clearMotionBuffer();
  setGestureCaptureMode(true);
};

/** Captura la trayectoria reciente del buffer de movimiento y la guarda como
 *  plantilla de gesto para `label` (ej. "HOLA"). Devuelve false si no hay
 *  suficiente movimiento capturado (mano quieta, cámara apagada, o
 *  plataforma sin loop de movimiento — solo web lo tiene). Siempre
 *  reactiva la detección de gestos al terminar. */
export const recordGesture = async (label: string): Promise<boolean> => {
  try {
    const seq = snapshotGestureSequence();
    if (!seq) return false;
    await gestureStore.add(label, seq);
    clearMotionBuffer();
    return true;
  } finally {
    setGestureCaptureMode(false);
  }
};

/** Cuántas plantillas de gesto hay por palabra. */
export const getGestureCounts = (): Promise<Record<string, number>> =>
  gestureStore.countByLabel();

/** Borra las plantillas de una palabra. */
export const clearGestureLabel = (label: string): Promise<void> =>
  gestureStore.removeLabel(label);

/** Borra todos los gestos entrenados. */
export const clearGestureData = (): Promise<void> => gestureStore.clear();

/** Export/import del dataset de gestos (JSON). */
export const exportGesturesJson = (): Promise<string> => gestureStore.exportJSON();
export const importGesturesJson = (
  json: string,
  mode: 'merge' | 'replace' = 'merge',
): Promise<number> => gestureStore.importJSON(json, mode);

export { mockProvider } from './mockProvider';
export { mediapipeProvider } from './mediapipeProvider';
export type { SignVisionProvider, VisionFrame, SignDetectionResult } from './types';
