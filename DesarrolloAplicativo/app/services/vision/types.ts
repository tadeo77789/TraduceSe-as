/**
 * @file services/vision/types.ts
 * @description Contratos del agente de visión para reconocimiento de señas LSC.
 * Esta interfaz permite intercambiar la implementación (mock, Claude Vision,
 * TFLite local, etc.) sin tocar la pantalla de traducción.
 */
import type { SignDetectionResult } from '../../types';

export interface VisionFrame {
  /** Imagen base64 sin prefijo data: (jpeg recomendado). */
  base64: string;
  /** Ancho en píxeles del frame. */
  width: number;
  /** Alto en píxeles del frame. */
  height: number;
  /** ISO timestamp de la captura. */
  capturedAt: string;
}

export interface SignVisionProvider {
  /** Identificador legible (mock | claude | tflite). */
  readonly name: string;
  /** Inicialización opcional (cargar modelo, hacer ping al backend, etc.). */
  init?: () => Promise<void>;
  /** Analiza un frame y devuelve la seña reconocida. */
  detect: (frame: VisionFrame) => Promise<SignDetectionResult>;
  /** Liberación opcional de recursos. */
  dispose?: () => void;
}

export type { SignDetectionResult };
