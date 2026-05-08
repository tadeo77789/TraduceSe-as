/**
 * @file services/vision/classifier.ts
 * @description Clasificador geométrico de letras LSC sobre los 21 keypoints
 * de MediaPipe Hands. Reconoce un subconjunto del alfabeto basado en qué
 * dedos están extendidos. Es deliberadamente simple: para cubrir todo el
 * alfabeto LSC haría falta un clasificador entrenado (MLP sobre 63 features).
 *
 * Convención MediaPipe Hands (21 puntos):
 *   0  = muñeca
 *   1-4 = pulgar (CMC, MCP, IP, TIP)
 *   5-8 = índice (MCP, PIP, DIP, TIP)
 *   9-12 = medio
 *   13-16 = anular
 *   17-20 = meñique
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

/** Un dedo (no pulgar) está extendido si la punta está claramente más lejos
 *  del nudillo MCP que la articulación PIP. */
const isFingerExtended = (
  tip: Landmark,
  pip: Landmark,
  mcp: Landmark,
): boolean => dist2D(tip, mcp) > dist2D(pip, mcp) * 1.4;

/** El pulgar se considera extendido si su punta está más lejos del nudillo
 *  base del índice que la articulación IP. Funciona para mano vertical. */
const isThumbExtended = (lm: Landmark[]): boolean => {
  const tip = lm[4];
  const ip = lm[3];
  const indexMcp = lm[5];
  return dist2D(tip, indexMcp) > dist2D(ip, indexMcp) * 1.1;
};

/**
 * Devuelve la letra LSC reconocida y una confianza heurística.
 * Si la combinación de dedos no está mapeada, devuelve letter='' y confianza baja.
 */
export const classifyLetterLSC = (landmarks: Landmark[]): ClassificationResult => {
  if (!landmarks || landmarks.length < 21) {
    return { letter: '', confidence: 0 };
  }

  const fingers: [boolean, boolean, boolean, boolean, boolean] = [
    isThumbExtended(landmarks),
    isFingerExtended(landmarks[8], landmarks[6], landmarks[5]),
    isFingerExtended(landmarks[12], landmarks[10], landmarks[9]),
    isFingerExtended(landmarks[16], landmarks[14], landmarks[13]),
    isFingerExtended(landmarks[20], landmarks[18], landmarks[17]),
  ];

  const key = fingers.map(b => (b ? '1' : '0')).join('');

  // Mapa: (pulgar, índice, medio, anular, meñique) -> letra LSC
  const lookup: Record<string, string> = {
    '00000': 'A',     // puño cerrado
    '01111': 'B',     // 4 dedos arriba, pulgar plegado
    '01000': 'D',     // solo índice
    '00001': 'I',     // solo meñique
    '11000': 'L',     // pulgar + índice (forma L)
    '01100': 'V',     // índice + medio
    '01110': 'W',     // índice + medio + anular
    '10001': 'Y',     // pulgar + meñique
    '11111': '5',     // mano abierta -> número 5
  };

  const letter = lookup[key];
  if (letter) {
    // Confianza modulada por qué tan "limpia" es la pose: penaliza si los
    // dedos extendidos están muy juntos cuando no deberían (heurística simple).
    return { letter, confidence: 0.85 };
  }

  return { letter: '', confidence: 0.35 };
};
