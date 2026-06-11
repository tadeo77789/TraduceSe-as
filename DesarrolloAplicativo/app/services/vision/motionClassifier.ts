/**
 * @file services/vision/motionClassifier.ts
 * @description Clasificador de señas LSC dinámicas (J, Ñ, RR, Z) sobre una
 * ventana temporal de landmarks. Las letras con movimiento no se pueden
 * reconocer con un frame estático: este módulo acumula muestras (~8/s, las
 * inyecta el loop de muestreo del provider web) y busca patrones de
 * trayectoria combinados con la forma de mano base que reporta el
 * clasificador geométrico estático:
 *
 *   J  → forma I (meñique extendido) + trazo hacia abajo con gancho lateral
 *   Z  → forma D (índice extendido) + zigzag: ≥2 reversas horizontales
 *        con descenso neto
 *   Ñ  → forma N (puño con pulgar cruzado) + ondulación horizontal
 *        (la "tilde": oscilación en x sin desplazamiento neto)
 *   RR → forma R (índice y medio cruzados) + vibración horizontal corta
 *
 * Todas las distancias se normalizan por el tamaño de palma promedio de la
 * ventana, así el patrón es invariante a la distancia a la cámara. Los
 * umbrales usan magnitudes y conteo de reversas (no direcciones absolutas)
 * para que funcionen igual con cámara espejada.
 *
 * SEÑAS DE PALABRA (gestos entrenables): además de las 4 letras dinámicas,
 * la misma ventana se compara vía DTW (Dynamic Time Warping) contra las
 * plantillas de gesto que el usuario graba en la pantalla de entrenamiento
 * (`gestureStore`). Eso permite reconocer palabras completas como "HOLA" o
 * "GRACIAS" — la base de una conversación — sin deletrear letra por letra.
 * Las palabras tienen prioridad sobre las letras dinámicas porque son
 * patrones más específicos (secuencia completa de la mano vs. trayectoria
 * de un solo punto).
 */
import type { Landmark } from './classifier';
import { normalizeLandmarks } from './normalize';
import { gestureStore, SEQ_LEN, FRAME_DIM } from './motionTemplateStore';

export interface MotionSample {
  /** Epoch ms de la muestra. */
  t: number;
  /** Letra estática detectada en ese frame ('' si no se reconoció). */
  staticLetter: string;
  /** Tamaño de palma en coords de imagen (muñeca → MCP medio). */
  palm: number;
  /** Posiciones crudas (0..1) de los puntos que usan las heurísticas. */
  wrist: { x: number; y: number };
  indexTip: { x: number; y: number };
  pinkyTip: { x: number; y: number };
  /** Vector normalizado de 63 features del frame (para el matcher DTW). */
  features: Float32Array;
}

export interface MotionResult {
  /** 'J' | 'Ñ' | 'RR' | 'Z' o una palabra entrenada (ej. 'HOLA'). */
  letter: string;
  confidence: number;
  /** true si vino de una plantilla de gesto entrenada (palabra). */
  isWord: boolean;
}

/** Ventana de análisis: cuánto pasado se conserva. */
const WINDOW_MS = 2200;
/** Mínimo de muestras con mano para intentar clasificar. */
const MIN_SAMPLES = 8;
/** Paso mínimo (en palmas) para contar un movimiento como real y no jitter. */
const MIN_STEP = 0.12;

let buffer: MotionSample[] = [];

/** Mientras se graba una plantilla de gesto, el clasificador no debe
 *  consumir el buffer (detectaría y vaciaría la trayectoria a mitad de
 *  grabación). La pantalla de entrenamiento activa/desactiva este modo. */
let captureMode = false;
export const setGestureCaptureMode = (active: boolean): void => {
  captureMode = active;
};

const dist2D = (a: Landmark, b: Landmark): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** Agrega una muestra al buffer (la llama el loop de muestreo del provider). */
export const pushMotionSample = (landmarks: Landmark[], staticLetter: string): void => {
  if (!landmarks || landmarks.length < 21) return;
  const now = Date.now();
  buffer.push({
    t: now,
    staticLetter,
    palm: dist2D(landmarks[0], landmarks[9]) || 1e-6,
    wrist: { x: landmarks[0].x, y: landmarks[0].y },
    indexTip: { x: landmarks[8].x, y: landmarks[8].y },
    pinkyTip: { x: landmarks[20].x, y: landmarks[20].y },
    features: normalizeLandmarks(landmarks),
  });
  buffer = buffer.filter(s => now - s.t <= WINDOW_MS);
};

/** Marca un hueco (frame sin mano): corta la trayectoria para no mezclar
 *  dos gestos separados por una pausa. */
export const pushMotionGap = (): void => {
  buffer = [];
};

/** Limpia el buffer (al consumir una detección o al pausar el agente). */
export const clearMotionBuffer = (): void => {
  buffer = [];
};

/** Desplazamiento de la muñeca en los últimos `ms` milisegundos, en palmas.
 *  Sirve para saber si la mano está "en movimiento" y suprimir las letras
 *  estáticas espurias mientras se dibuja un gesto. */
export const recentWristTravel = (ms = 450): number => {
  if (buffer.length < 2) return 0;
  const now = Date.now();
  const recent = buffer.filter(s => now - s.t <= ms);
  if (recent.length < 2) return 0;
  const palm = avgPalm(recent);
  let travel = 0;
  for (let i = 1; i < recent.length; i++) {
    travel += Math.hypot(
      recent[i].wrist.x - recent[i - 1].wrist.x,
      recent[i].wrist.y - recent[i - 1].wrist.y,
    );
  }
  return travel / palm;
};

const avgPalm = (samples: MotionSample[]): number =>
  samples.reduce((s, v) => s + v.palm, 0) / samples.length || 1e-6;

/** Cuenta reversas de dirección en una serie 1D ignorando pasos < minStep
 *  (en palmas). Devuelve también el recorrido total y el desplazamiento neto. */
const axisStats = (
  values: number[],
  palm: number,
  minStep = MIN_STEP,
): { reversals: number; travel: number; net: number } => {
  let reversals = 0;
  let travel = 0;
  let lastDir = 0;
  let anchor = values[0];
  for (let i = 1; i < values.length; i++) {
    const step = (values[i] - anchor) / palm;
    if (Math.abs(step) < minStep) continue; // jitter: no cuenta
    const dir = Math.sign(step);
    if (lastDir !== 0 && dir !== lastDir) reversals++;
    lastDir = dir;
    travel += Math.abs(step);
    anchor = values[i];
  }
  return { reversals, travel, net: (values[values.length - 1] - values[0]) / palm };
};

/** Proporción de muestras cuya letra estática está en `letters`. */
const shapeRatio = (samples: MotionSample[], letters: string[]): number => {
  const hits = samples.filter(s => letters.includes(s.staticLetter)).length;
  return hits / samples.length;
};

// ── Matcher DTW de gestos de palabra ─────────────────────────────────────────

/** Re-muestrea la secuencia de features del buffer a `SEQ_LEN` frames por
 *  interpolación de vecino más cercano sobre el eje temporal. */
const resampleSequence = (samples: MotionSample[]): number[][] | null => {
  if (samples.length < 2) return null;
  const out: number[][] = [];
  for (let i = 0; i < SEQ_LEN; i++) {
    const srcIdx = Math.min(
      samples.length - 1,
      Math.round((i * (samples.length - 1)) / (SEQ_LEN - 1)),
    );
    const f = samples[srcIdx].features;
    if (f.length !== FRAME_DIM) return null;
    out.push(Array.from(f));
  }
  return out;
};

const frameDist = (a: number[], b: number[]): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
};

/** Distancia DTW entre dos secuencias de SEQ_LEN frames, con banda de
 *  Sakoe-Chiba (radio 4) y normalizada por el largo del camino. Tolera
 *  diferencias de velocidad entre cómo se grabó el gesto y cómo se ejecuta. */
const dtwDistance = (a: number[][], b: number[][]): number => {
  const n = a.length;
  const m = b.length;
  const BAND = 4;
  const INF = Number.POSITIVE_INFINITY;
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
  cost[0][0] = 0;
  for (let i = 1; i <= n; i++) {
    const jMin = Math.max(1, i - BAND);
    const jMax = Math.min(m, i + BAND);
    for (let j = jMin; j <= jMax; j++) {
      const d = frameDist(a[i - 1], b[j - 1]);
      cost[i][j] = d + Math.min(cost[i - 1][j], cost[i][j - 1], cost[i - 1][j - 1]);
    }
  }
  // Normalizar por el largo aproximado del camino (n+m)/2 → distancia por frame.
  return cost[n][m] / ((n + m) / 2);
};

/** Distancia máxima por frame para aceptar un gesto (misma escala que el
 *  MAX_NEIGHBOR_DISTANCE del KNN estático). */
const MAX_GESTURE_DISTANCE = 1.1;

/** Compara la ventana actual contra las plantillas de gesto entrenadas. */
const matchWordGesture = async (samples: MotionSample[]): Promise<MotionResult | null> => {
  const templates = await gestureStore.getAll();
  if (templates.length === 0) return null;
  const seq = resampleSequence(samples);
  if (!seq) return null;

  let bestLabel = '';
  let bestDist = Number.POSITIVE_INFINITY;
  for (const tpl of templates) {
    const d = dtwDistance(seq, tpl.frames);
    if (d < bestDist) {
      bestDist = d;
      bestLabel = tpl.label;
    }
  }

  if (!bestLabel || bestDist > MAX_GESTURE_DISTANCE) return null;
  // Más cerca → más confianza; calibrada para superar el umbral 0.7 del
  // agente cuando el gesto se parece de verdad a la plantilla.
  const confidence = Math.min(0.95, Math.max(0.5, 1 - bestDist * 0.35));
  return { letter: bestLabel, confidence, isWord: true };
};

/** Snapshot de la ventana actual re-muestreada — lo usa la pantalla de
 *  entrenamiento para grabar una plantilla de gesto nueva. Devuelve null si
 *  no hay suficiente trayectoria capturada. */
export const snapshotGestureSequence = (): number[][] | null => {
  if (buffer.length < MIN_SAMPLES) return null;
  return resampleSequence(buffer);
};

/**
 * Analiza la ventana actual y devuelve la seña dinámica detectada o null.
 * Orden: 1) palabras entrenadas (DTW), 2) letras dinámicas (heurísticas).
 * Si detecta, CONSUME el buffer (lo vacía) para no re-disparar el mismo trazo.
 */
export const classifyMotion = async (): Promise<MotionResult | null> => {
  if (captureMode) return null; // Grabando plantilla: no consumir el buffer.
  if (buffer.length < MIN_SAMPLES) return null;
  const samples = buffer;
  const palm = avgPalm(samples);

  // ── Palabras entrenadas: prioridad sobre las letras dinámicas. ───────────
  const word = await matchWordGesture(samples);
  if (word && word.confidence >= 0.7) {
    clearMotionBuffer();
    return word;
  }

  const wristX = axisStats(samples.map(s => s.wrist.x), palm);
  const wristY = axisStats(samples.map(s => s.wrist.y), palm);

  // ── Ñ: forma N sostenida + ondulación horizontal (sin desplazarse). ──────
  // El M/N del clasificador estático es inestable durante el movimiento, así
  // que aceptamos ambos (y S, el puño genérico) como forma base.
  if (
    shapeRatio(samples, ['N', 'M', 'S']) >= 0.5 &&
    wristX.reversals >= 2 &&
    wristX.travel >= 1.0 &&
    Math.abs(wristX.net) <= 0.8 &&
    wristY.travel <= wristX.travel * 0.7
  ) {
    const result: MotionResult = { letter: 'Ñ', confidence: 0.8, isWord: false };
    clearMotionBuffer();
    return result;
  }

  // ── RR: forma R (dedos cruzados) + vibración horizontal. ─────────────────
  // Los dedos cruzados parpadean a U/V en frames intermedios.
  if (
    shapeRatio(samples, ['R']) >= 0.3 &&
    shapeRatio(samples, ['R', 'U', 'V', '']) >= 0.7 &&
    wristX.reversals >= 2 &&
    wristX.travel >= 0.8 &&
    Math.abs(wristX.net) <= 0.8 &&
    wristY.travel <= wristX.travel * 0.7
  ) {
    const result: MotionResult = { letter: 'RR', confidence: 0.78, isWord: false };
    clearMotionBuffer();
    return result;
  }

  // ── Z: forma D (índice) trazando zigzag con descenso neto. ───────────────
  const indexX = axisStats(samples.map(s => s.indexTip.x), palm);
  const indexY = axisStats(samples.map(s => s.indexTip.y), palm);
  if (
    shapeRatio(samples, ['D', 'G', '']) >= 0.6 &&
    shapeRatio(samples, ['D', 'G']) >= 0.35 &&
    indexX.reversals >= 2 &&
    indexX.travel >= 1.3 &&
    indexY.net >= 0.35 // en coords de imagen, y crece hacia abajo
  ) {
    const result: MotionResult = { letter: 'Z', confidence: 0.8, isWord: false };
    clearMotionBuffer();
    return result;
  }

  // ── J: forma I (meñique) que baja y hace gancho lateral. ─────────────────
  const pinkyX = axisStats(samples.map(s => s.pinkyTip.x), palm);
  const pinkyY = axisStats(samples.map(s => s.pinkyTip.y), palm);
  if (
    shapeRatio(samples, ['I', 'Y', '']) >= 0.6 &&
    shapeRatio(samples, ['I', 'Y']) >= 0.35 &&
    pinkyY.net >= 0.45 && // descenso neto
    pinkyX.travel >= 0.35 && // desviación lateral (el gancho)
    pinkyX.reversals <= 2 // un trazo curvo, no una vibración
  ) {
    const result: MotionResult = { letter: 'J', confidence: 0.78, isWord: false };
    clearMotionBuffer();
    return result;
  }

  return null;
};
