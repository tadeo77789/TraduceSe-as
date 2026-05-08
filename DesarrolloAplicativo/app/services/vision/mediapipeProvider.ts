/**
 * @file services/vision/mediapipeProvider.ts
 * @description Fallback nativo del provider MediaPipe. En React Native
 * (iOS/Android) la librería `@mediapipe/tasks-vision` no está disponible
 * porque depende de WebAssembly + canvas del navegador. Para integración
 * nativa hay que usar `react-native-mediapipe` (requiere expo prebuild) o
 * un .tflite local con `react-native-fast-tflite`.
 *
 * Por ahora delegamos al provider mock para no romper el flujo en mobile.
 * Metro resuelve este archivo en plataformas distintas a `web`.
 */
import { mockProvider } from './mockProvider';
import type { SignVisionProvider } from './types';

export const mediapipeProvider: SignVisionProvider = {
  ...mockProvider,
  name: 'mediapipe-native-fallback(mock)',
};
