/**
 * @file services/vision/mockProvider.ts
 * @description Provider mock determinista. Recorre el alfabeto LSC y palabras
 * frecuentes para que la pantalla de traducción reaccione como si la IA real
 * estuviera detectando. La progresión usa el hash del frame para que parezca
 * dependiente de la imagen y no un simple timer.
 */
import type { SignDetectionResult, SignVisionProvider, VisionFrame } from './types';

const ALPHABET_LSC = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S',
  'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const COMMON_WORDS = ['HOLA', 'GRACIAS', 'POR FAVOR', 'SÍ', 'NO', 'BIEN', 'AYUDA'];

const VOCAB = [...ALPHABET_LSC, ...COMMON_WORDS];

/** Hash rápido (djb2) sobre una porción del base64 para variar resultados. */
const hashFrame = (base64: string): number => {
  const sample = base64.length > 256 ? base64.slice(0, 128) + base64.slice(-128) : base64;
  let h = 5381;
  for (let i = 0; i < sample.length; i++) {
    h = ((h << 5) + h + sample.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

let frameCounter = 0;

export const mockProvider: SignVisionProvider = {
  name: 'mock',

  async detect(frame: VisionFrame): Promise<SignDetectionResult> {
    frameCounter += 1;
    const h = hashFrame(frame.base64);
    const dice = h % 100;

    // Simulación: 15% sin manos, 15% baja confianza, 70% detecta seña.
    if (dice < 15) {
      return {
        text: '',
        confidence: 0,
        status: 'no_hands',
        timestamp: frame.capturedAt,
      };
    }

    if (dice < 30) {
      return {
        text: VOCAB[h % VOCAB.length],
        confidence: 0.4 + (dice % 10) / 100,
        status: 'low_confidence',
        timestamp: frame.capturedAt,
      };
    }

    // Variar entre letras y palabras según el contador para que el demo
    // muestre progresión: alfabeto durante los primeros frames y luego palabras.
    const useWord = frameCounter % 5 === 0;
    const pool = useWord ? COMMON_WORDS : ALPHABET_LSC;
    const text = pool[h % pool.length];

    return {
      text,
      confidence: 0.78 + (h % 20) / 100,
      status: 'detecting',
      timestamp: frame.capturedAt,
    };
  },

  dispose() {
    frameCounter = 0;
  },
};
