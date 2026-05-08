/**
 * @file services/vision/index.ts
 * @description Punto de entrada del agente de visión. Selecciona el provider
 * activo. Para pasar a Claude Vision o TFLite, basta con crear el archivo del
 * nuevo provider e intercambiarlo aquí — el resto de la app no cambia.
 */
import { mockProvider } from './mockProvider';
import type { SignVisionProvider } from './types';

export const signVisionProvider: SignVisionProvider = mockProvider;

export type { SignVisionProvider, VisionFrame, SignDetectionResult } from './types';
