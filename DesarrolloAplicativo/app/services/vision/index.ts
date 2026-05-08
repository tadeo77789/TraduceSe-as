/**
 * @file services/vision/index.ts
 * @description Punto de entrada del agente de visión. Selecciona el provider
 * activo. Hoy: MediaPipe Hands en web + clasificador geométrico LSC; en
 * nativo cae al mock hasta que se enchufe react-native-mediapipe o un .tflite.
 *
 * Para cambiar de provider basta con asignar otro a `signVisionProvider`.
 */
import { mediapipeProvider } from './mediapipeProvider';
import type { SignVisionProvider } from './types';

export const signVisionProvider: SignVisionProvider = mediapipeProvider;

export { mockProvider } from './mockProvider';
export { mediapipeProvider } from './mediapipeProvider';
export type { SignVisionProvider, VisionFrame, SignDetectionResult } from './types';
