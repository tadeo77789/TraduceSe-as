/**
 * @file services/vision/index.ts
 * @description Punto de entrada del agente de visión. Selecciona el provider
 * activo y expone el dataset de plantillas KNN para que la UI de
 * entrenamiento agregue muestras nuevas.
 */
import { mediapipeProvider } from './mediapipeProvider';
import { templateStore } from './templateStore';
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

export { mockProvider } from './mockProvider';
export { mediapipeProvider } from './mediapipeProvider';
export type { SignVisionProvider, VisionFrame, SignDetectionResult } from './types';
