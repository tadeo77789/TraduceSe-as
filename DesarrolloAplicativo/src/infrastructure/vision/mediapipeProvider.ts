/**
 * @file services/vision/mediapipeProvider.ts
 * @description Fallback nativo del provider de visión. En React Native
 * (iOS/Android) la librería `@mediapipe/tasks-vision` no está disponible
 * porque depende de WebAssembly + canvas del navegador.
 *
 * Estrategia: si `@tensorflow/tfjs` + `jpeg-js` están instalados y hay un
 * modelo Teachable Machine configurado en `TFJS_MODEL_URL`, usamos el
 * `tfjsProvider`. Si no, caemos al `mockProvider` para no romper el flujo
 * de la pantalla en celular.
 *
 * Metro resuelve este archivo en plataformas distintas a `web`.
 */
import { TFJS_MODEL_URL } from '../../shared/config/api.config';
import { mockProvider } from './mockProvider';
import { tfjsProvider } from './tfjsProvider';
import type { SignVisionProvider } from './types';

export const mediapipeProvider: SignVisionProvider = TFJS_MODEL_URL
  ? tfjsProvider
  : { ...mockProvider, name: 'native-fallback(mock)' };
