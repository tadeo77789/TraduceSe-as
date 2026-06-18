/**
 * @file services/vision/knnClassifier.ts
 * @description Clasificador K-Nearest-Neighbors sobre los vectores normalizados
 * de los keypoints. Para cada frame compara contra todas las plantillas
 * almacenadas y elige la etiqueta mayoritaria entre los K más cercanos.
 *
 * La confianza se calcula como (#vecinos que votaron por la etiqueta ganadora / K)
 * ponderada por la cercanía promedio. Si el vecino más cercano está demasiado
 * lejos, devolvemos baja confianza para que el provider caiga al clasificador
 * geométrico de respaldo.
 */
import { templateStore, type SignTemplate } from './templateStore';
import { euclidean } from './normalize';
import type { ClassificationResult } from './classifier';

const K = 3;
/** Distancia máxima aceptable al vecino más cercano. Vectores normalizados
 *  típicamente caen en rango [0, ~5]. */
const MAX_NEIGHBOR_DISTANCE = 1.2;

export interface KnnResult extends ClassificationResult {
  /** True cuando se uso el dataset entrenado, false cuando no había muestras. */
  used: boolean;
}

export const knnClassify = async (features: Float32Array): Promise<KnnResult> => {
  const templates = await templateStore.getAll();
  if (templates.length === 0) {
    return { letter: '', confidence: 0, used: false };
  }

  const distances: Array<{ tpl: SignTemplate; dist: number }> = [];
  for (const tpl of templates) {
    const tplFeatures = Float32Array.from(tpl.features);
    if (tplFeatures.length !== features.length) continue;
    distances.push({ tpl, dist: euclidean(features, tplFeatures) });
  }

  if (distances.length === 0) {
    return { letter: '', confidence: 0, used: false };
  }

  distances.sort((a, b) => a.dist - b.dist);
  const nearest = distances.slice(0, K);

  if (nearest[0].dist > MAX_NEIGHBOR_DISTANCE) {
    return { letter: '', confidence: 0.2, used: true };
  }

  // Voto mayoritario ponderado por cercanía (1/dist).
  const votes: Record<string, number> = {};
  for (const n of nearest) {
    const w = 1 / (n.dist + 1e-6);
    votes[n.tpl.label] = (votes[n.tpl.label] ?? 0) + w;
  }

  let bestLabel = '';
  let bestScore = -Infinity;
  let totalScore = 0;
  for (const [label, score] of Object.entries(votes)) {
    totalScore += score;
    if (score > bestScore) {
      bestScore = score;
      bestLabel = label;
    }
  }

  // Confianza = proporción del voto ganador, modulada por qué tan cerca
  // está el vecino más cercano (más cerca → más confianza).
  const voteRatio = bestScore / totalScore;
  const proximity = Math.max(0, 1 - nearest[0].dist / MAX_NEIGHBOR_DISTANCE);
  const confidence = Math.min(0.98, voteRatio * 0.6 + proximity * 0.4);

  return { letter: bestLabel, confidence, used: true };
};
