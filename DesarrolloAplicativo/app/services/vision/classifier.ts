/**
 * @file services/vision/classifier.ts
 * @description Clasificador geometrico de letras LSC sobre los 21 keypoints
 * de MediaPipe Hands. Reconoce el alfabeto LSC estatico: A B C D E F G H I K
 * L M N O P Q R S T U V W X Y, mas el numero 5 (mano abierta).
 *
 * Letras NO soportadas (requieren trayectoria de movimiento que un frame
 * estatico no captura):
 *   J  - mecanique trazando J
 *   N  - N con movimiento ondulante
 *   RR - vibracion del puno
 *   Z  - indice trazando Z en el aire
 *
 * Estrategia general:
 *  1. Calcular vector de "dedos extendidos" (pulgar + 4 dedos) y curvatura.
 *  2. Resolver el grupo grueso (puno cerrado, solo indice, V, etc).
 *  3. Refinar dentro del grupo usando posicion del pulgar relativa a los
 *     nudillos y dedos vecinos.
 *
 * Convencion MediaPipe Hands (21 puntos):
 *   0  = muneca
 *   1-4 = pulgar (CMC, MCP, IP, TIP)
 *   5-8 = indice (MCP, PIP, DIP, TIP)
 *   9-12 = medio
 *   13-16 = anular
 *   17-20 = menique
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface ClassificationResult {
  letter: string;
  confidence: number;
}

const dist2D = (a: Landmark, b: Landmark): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** Tamano de la palma: muneca -> MCP del dedo medio. Sirve como escala. */
const palmSize = (lm: Landmark[]): number => dist2D(lm[0], lm[9]) || 1;

/** Un dedo (no pulgar) esta extendido si la punta esta claramente mas lejos
 *  del nudillo MCP que la articulacion PIP. */
const isFingerExtended = (
  tip: Landmark,
  pip: Landmark,
  mcp: Landmark,
): boolean => dist2D(tip, mcp) > dist2D(pip, mcp) * 1.4;

/** Dedo doblado/curvo: ni completamente extendido ni del todo cerrado.
 *  La punta cae cerca de la PIP — util para distinguir C, O, X. */
const isFingerCurled = (
  tip: Landmark,
  pip: Landmark,
  mcp: Landmark,
): boolean => {
  const ext = dist2D(tip, mcp);
  const pipDist = dist2D(pip, mcp);
  // Entre 0.7x y 1.3x la distancia al PIP = doblado en gancho/curva.
  return ext > pipDist * 0.7 && ext < pipDist * 1.3;
};

/** El pulgar se considera extendido si su punta esta lejos del nudillo
 *  base del indice. Funciona para mano vertical. */
const isThumbExtended = (lm: Landmark[]): boolean => {
  const tip = lm[4];
  const ip = lm[3];
  const indexMcp = lm[5];
  return dist2D(tip, indexMcp) > dist2D(ip, indexMcp) * 1.1;
};

/** Pulgar cruzado sobre la palma: punta del pulgar mas cerca del menique
 *  que del indice. Marca M, N, S, T (puno cerrado con pulgar al frente). */
const isThumbAcrossPalm = (lm: Landmark[]): boolean => {
  const tip = lm[4];
  const indexMcp = lm[5];
  const pinkyMcp = lm[17];
  return dist2D(tip, pinkyMcp) < dist2D(tip, indexMcp);
};

/** Distancia normalizada entre dos puntas (relativa al tamano de palma). */
const tipGap = (a: Landmark, b: Landmark, lm: Landmark[]): number =>
  dist2D(a, b) / palmSize(lm);

/** Dos dedos pegados: gap < 0.35 palmas. */
const fingersTogether = (a: Landmark, b: Landmark, lm: Landmark[]): boolean =>
  tipGap(a, b, lm) < 0.35;

/** Indice y medio cruzados: la punta del medio queda hacia el lado del
 *  indice (medio.x < indice.x si mano derecha vertical) o viceversa. */
const isIndexMiddleCrossed = (lm: Landmark[]): boolean => {
  // Eje "horizontal" relativo al MCP de cada uno. Si las puntas se cruzan,
  // el orden lateral se invierte respecto a los MCP.
  const indexSide = lm[8].x - lm[5].x;
  const middleSide = lm[12].x - lm[9].x;
  return indexSide * middleSide < 0 && Math.abs(indexSide) > 0.02;
};

/** Pulgar metido entre los dedos indice y medio (letras K, P, T).
 *  La punta del pulgar queda entre las posiciones x del indice y medio. */
const isThumbBetweenIndexMiddle = (lm: Landmark[]): boolean => {
  const thumb = lm[4];
  const indexBase = lm[5];
  const middleBase = lm[9];
  const minX = Math.min(indexBase.x, middleBase.x);
  const maxX = Math.max(indexBase.x, middleBase.x);
  return thumb.x >= minX - 0.02 && thumb.x <= maxX + 0.02;
};

/** Pulgar tocando al indice formando un anillo (F): distancia pulgar-indice
 *  menor que 0.25 palmas. */
const isThumbIndexPinch = (lm: Landmark[]): boolean =>
  tipGap(lm[4], lm[8], lm) < 0.25;

/** Mano en orientacion horizontal: la mano apunta a izquierda/derecha en
 *  vez de hacia arriba. Util para G, H, P, Q. Detectamos via el vector
 *  muneca -> MCP medio: si el delta x supera al delta y, esta horizontal. */
const isHandHorizontal = (lm: Landmark[]): boolean => {
  const dx = Math.abs(lm[9].x - lm[0].x);
  const dy = Math.abs(lm[9].y - lm[0].y);
  return dx > dy * 1.1;
};

/** Mano apuntando hacia abajo: MCP medio por debajo de la muneca (en
 *  imagen, y crece hacia abajo). Marca P, Q, sentido invertido. */
const isHandPointingDown = (lm: Landmark[]): boolean => lm[9].y > lm[0].y + 0.05;

/** Promedio de la distancia punta-MCP de los 4 dedos. Mide cuanto estan
 *  "curvados/cerrados" en conjunto: <0.6 palmas indica todos doblados. */
const avgFingerExtension = (lm: Landmark[]): number => {
  const ratios = [
    dist2D(lm[8], lm[5]) / palmSize(lm),
    dist2D(lm[12], lm[9]) / palmSize(lm),
    dist2D(lm[16], lm[13]) / palmSize(lm),
    dist2D(lm[20], lm[17]) / palmSize(lm),
  ];
  return ratios.reduce((s, v) => s + v, 0) / ratios.length;
};

/**
 * Devuelve la letra LSC reconocida y una confianza heuristica.
 * Si la combinacion no se reconoce, devuelve letter='' y confianza baja.
 */
export const classifyLetterLSC = (landmarks: Landmark[]): ClassificationResult => {
  if (!landmarks || landmarks.length < 21) {
    return { letter: '', confidence: 0 };
  }

  const lm = landmarks;
  const thumbExt = isThumbExtended(lm);
  const indexExt = isFingerExtended(lm[8], lm[6], lm[5]);
  const middleExt = isFingerExtended(lm[12], lm[10], lm[9]);
  const ringExt = isFingerExtended(lm[16], lm[14], lm[13]);
  const pinkyExt = isFingerExtended(lm[20], lm[18], lm[17]);

  const indexCurl = !indexExt && isFingerCurled(lm[8], lm[6], lm[5]);
  const middleCurl = !middleExt && isFingerCurled(lm[12], lm[10], lm[9]);
  const ringCurl = !ringExt && isFingerCurled(lm[16], lm[14], lm[13]);
  const pinkyCurl = !pinkyExt && isFingerCurled(lm[20], lm[18], lm[17]);

  // ─── Caso 1: PUNO CERRADO (todos plegados) ──────────────────────────
  // Distingue A / E / M / N / S / T por posicion y curvatura del pulgar.
  if (!indexExt && !middleExt && !ringExt && !pinkyExt && !indexCurl && !middleCurl) {
    if (isThumbAcrossPalm(lm)) {
      // Pulgar cruzado sobre la palma.
      if (isThumbBetweenIndexMiddle(lm)) {
        return { letter: 'T', confidence: 0.78 };
      }
      // M: pulgar bajo 3 dedos (indice, medio, anular).
      // N: pulgar bajo 2 dedos (indice y medio).
      // Aproximamos con la posicion x: si el pulgar pasa del MCP del anular
      // hacia el menique, es M; si queda cerca de medio/indice, es N.
      const thumbTip = lm[4];
      const ringMcp = lm[13];
      if (Math.abs(thumbTip.x - ringMcp.x) < 0.04) {
        return { letter: 'M', confidence: 0.72 };
      }
      return { letter: 'N', confidence: 0.7 };
    }

    if (thumbExt) {
      // Pulgar visible al costado del puno → A clasica LSC.
      return { letter: 'A', confidence: 0.85 };
    }

    // Pulgar plegado al frente del puno → S.
    // Diferenciamos E (pulgar tocando la falange de los dedos doblados).
    const thumbToIndexTip = tipGap(lm[4], lm[8], lm);
    if (thumbToIndexTip < 0.3) {
      return { letter: 'E', confidence: 0.7 };
    }
    return { letter: 'S', confidence: 0.78 };
  }

  // ─── Caso 2: DEDOS CURVADOS (forma de garra / C / O) ────────────────
  // Cuando ningun dedo esta plenamente extendido pero todos estan doblados
  // en arco, distinguimos C vs O por la apertura entre pulgar e indice.
  if (
    !indexExt && !middleExt && !ringExt && !pinkyExt &&
    indexCurl && middleCurl && ringCurl && pinkyCurl
  ) {
    const pinch = tipGap(lm[4], lm[8], lm);
    if (pinch < 0.2) {
      return { letter: 'O', confidence: 0.78 };
    }
    if (pinch < 0.55) {
      return { letter: 'C', confidence: 0.78 };
    }
  }

  // ─── Caso 3: SOLO INDICE ARRIBA ─────────────────────────────────────
  // D (indice recto) vs X (indice en gancho).
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    if (isHandHorizontal(lm) && !thumbExt) {
      return { letter: 'G', confidence: 0.75 };
    }
    return { letter: 'D', confidence: 0.85 };
  }
  if (!indexExt && indexCurl && !middleExt && !ringExt && !pinkyExt) {
    return { letter: 'X', confidence: 0.72 };
  }

  // ─── Caso 4: INDICE + MEDIO ─────────────────────────────────────────
  // V (separados), U (juntos), R (cruzados), K (pulgar entre ambos),
  // H (horizontal).
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    if (isHandHorizontal(lm)) {
      return { letter: 'H', confidence: 0.74 };
    }
    if (isIndexMiddleCrossed(lm)) {
      return { letter: 'R', confidence: 0.74 };
    }
    if (thumbExt && isThumbBetweenIndexMiddle(lm)) {
      return { letter: 'K', confidence: 0.74 };
    }
    if (fingersTogether(lm[8], lm[12], lm)) {
      return { letter: 'U', confidence: 0.8 };
    }
    return { letter: 'V', confidence: 0.85 };
  }

  // ─── Caso 5: INDICE + MEDIO + ANULAR ────────────────────────────────
  if (indexExt && middleExt && ringExt && !pinkyExt) {
    return { letter: 'W', confidence: 0.85 };
  }

  // ─── Caso 6: CUATRO DEDOS ARRIBA, PULGAR PLEGADO ────────────────────
  if (indexExt && middleExt && ringExt && pinkyExt && !thumbExt) {
    return { letter: 'B', confidence: 0.85 };
  }

  // ─── Caso 7: MANO TOTALMENTE ABIERTA ────────────────────────────────
  if (indexExt && middleExt && ringExt && pinkyExt && thumbExt) {
    return { letter: '5', confidence: 0.85 };
  }

  // ─── Caso 8: PULGAR + INDICE (L o F o G) ────────────────────────────
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    return { letter: 'L', confidence: 0.85 };
  }

  // ─── Caso 9: PULGAR + MENIQUE ───────────────────────────────────────
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { letter: 'Y', confidence: 0.85 };
  }

  // ─── Caso 10: SOLO MENIQUE ──────────────────────────────────────────
  if (!indexExt && !middleExt && !ringExt && pinkyExt && !thumbExt) {
    return { letter: 'I', confidence: 0.85 };
  }

  // ─── Caso 11: F (pulgar e indice formando anillo, otros 3 arriba) ───
  if (middleExt && ringExt && pinkyExt && isThumbIndexPinch(lm)) {
    return { letter: 'F', confidence: 0.78 };
  }

  // ─── Caso 12: P y Q (variantes invertidas de K y G) ─────────────────
  // P: mano apuntando hacia abajo con configuracion tipo K.
  // Q: mano apuntando hacia abajo con configuracion tipo G.
  if (isHandPointingDown(lm)) {
    if (indexExt && middleExt && thumbExt && isThumbBetweenIndexMiddle(lm)) {
      return { letter: 'P', confidence: 0.7 };
    }
    if (indexExt && !middleExt && !ringExt && !pinkyExt && thumbExt) {
      return { letter: 'Q', confidence: 0.7 };
    }
  }

  // No reconocido: confianza baja y letter vacia.
  // Heuristica de descarte: si la extension promedio es muy baja, mano cerrada
  // en pose no canonica; si es alta, mano abierta no estandar.
  const avg = avgFingerExtension(lm);
  return { letter: '', confidence: avg < 0.5 ? 0.3 : 0.35 };
};
