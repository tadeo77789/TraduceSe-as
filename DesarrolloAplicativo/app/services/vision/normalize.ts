/**
 * @file services/vision/normalize.ts
 * @description Normaliza los 21 keypoints de MediaPipe a un vector invariante
 * a posición y escala. Necesario para que el KNN compare poses sin importar
 * dónde está la mano en el cuadro ni qué tan cerca de la cámara está.
 *
 * Estrategia:
 *  1. Trasladar todos los puntos para que la muñeca (índice 0) quede en (0,0,0).
 *  2. Escalar por la distancia muñeca → MCP del dedo medio (índice 9). Esa
 *     distancia es proporcional al tamaño de la mano.
 *  3. Aplanar a un Float32Array de 63 elementos.
 */
import type { Landmark } from './classifier';

const FEATURE_LEN = 63;

export const normalizeLandmarks = (landmarks: Landmark[]): Float32Array => {
  const out = new Float32Array(FEATURE_LEN);
  if (!landmarks || landmarks.length < 21) return out;

  const wrist = landmarks[0];
  const middleMcp = landmarks[9];

  const dx = middleMcp.x - wrist.x;
  const dy = middleMcp.y - wrist.y;
  const dz = middleMcp.z - wrist.z;
  const scale = Math.hypot(dx, dy, dz) || 1;

  for (let i = 0; i < 21; i++) {
    const lm = landmarks[i];
    const idx = i * 3;
    out[idx] = (lm.x - wrist.x) / scale;
    out[idx + 1] = (lm.y - wrist.y) / scale;
    out[idx + 2] = (lm.z - wrist.z) / scale;
  }

  return out;
};

/** Distancia euclidiana entre dos vectores de mismas dimensiones. */
export const euclidean = (a: Float32Array, b: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
};
