/**
 * @file hooks/useSignAgent.ts
 * @description Hook del agente de reconocimiento de senas. Toma una ref a
 * `CameraView`, captura frames a intervalo configurable, los envia al provider
 * de vision activo y expone el ultimo resultado, las transcripciones acumuladas
 * y el estado del agente.
 *
 * Logica de transcript:
 *  - Una letra se "confirma" cuando aparece en `confirmFrames` capturas
 *    consecutivas con confianza >= `minConfidence`. Esto evita parpadeos.
 *  - Una vez confirmada, la misma letra no se vuelve a anexar hasta que el
 *    agente vea otra letra distinta o un frame sin manos. Asi se puede
 *    escribir "AA" haciendo una pausa entre las dos A.
 *  - `backspace` borra el ultimo caracter; `appendSpace` agrega un espacio
 *    explicito para separar palabras.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraView } from 'expo-camera';
import { signVisionProvider } from '../services/vision';
import type { SignDetectionResult, SignAgentStatus } from '../types';

export interface UseSignAgentOptions {
  /** Intervalo entre capturas, ms. Default 1500. */
  intervalMs?: number;
  /** Confianza minima para considerar la letra como candidata. Default 0.7. */
  minConfidence?: number;
  /** Calidad jpeg para `takePictureAsync`. Default 0.4. */
  quality?: number;
  /** Frames consecutivos con la misma letra para confirmarla. Default 2. */
  confirmFrames?: number;
}

export interface UseSignAgentResult {
  /** true mientras el bucle de captura esta corriendo. */
  isRunning: boolean;
  /** Estado del ultimo frame procesado. */
  status: SignAgentStatus;
  /** Ultimo resultado bruto del provider. */
  lastResult: SignDetectionResult | null;
  /** Texto acumulado a partir de detecciones confirmadas. */
  transcript: string;
  /** Letra candidata aun no confirmada (se muestra como pendiente en la UI). */
  pendingLetter: string;
  /** Cuantas veces consecutivas se ha visto la letra pendiente. */
  pendingCount: number;
  /** Cuantos frames consecutivos hacen falta para confirmar. */
  confirmFrames: number;
  /** Inicia el bucle de captura. */
  start: () => void;
  /** Detiene el bucle y limpia. */
  stop: () => void;
  /** Limpia transcript y ultimo resultado sin detener el bucle. */
  reset: () => void;
  /** Borra el ultimo caracter del transcript. */
  backspace: () => void;
  /** Agrega un espacio al transcript para separar palabras. */
  appendSpace: () => void;
}

const isCameraViewWithCapture = (
  ref: CameraView | null,
): ref is CameraView & {
  takePictureAsync: (opts?: {
    base64?: boolean;
    quality?: number;
    skipProcessing?: boolean;
  }) => Promise<{ base64?: string; width: number; height: number; uri: string }>;
} => !!ref && typeof (ref as unknown as { takePictureAsync?: unknown }).takePictureAsync === 'function';

export const useSignAgent = (
  cameraRef: React.RefObject<CameraView | null>,
  options: UseSignAgentOptions = {},
): UseSignAgentResult => {
  const {
    intervalMs = 1500,
    minConfidence = 0.7,
    quality = 0.4,
    confirmFrames = 2,
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<SignAgentStatus>('idle');
  const [lastResult, setLastResult] = useState<SignDetectionResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [pendingLetter, setPendingLetter] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const lastAppendedRef = useRef<string>('');
  const pendingLetterRef = useRef<string>('');
  const pendingCountRef = useRef(0);
  const runningRef = useRef(false);

  /** Resetea el estado de "letra pendiente" sin tocar el transcript. */
  const clearPending = useCallback(() => {
    pendingLetterRef.current = '';
    pendingCountRef.current = 0;
    setPendingLetter('');
    setPendingCount(0);
  }, []);

  const captureAndDetect = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const cam = cameraRef.current;
      const capturedAt = new Date().toISOString();

      let base64 = '';
      let width = 0;
      let height = 0;

      if (isCameraViewWithCapture(cam)) {
        try {
          const photo = await cam.takePictureAsync({
            base64: true,
            quality,
            skipProcessing: true,
          });
          base64 = photo?.base64 ?? '';
          width = photo?.width ?? 0;
          height = photo?.height ?? 0;
        } catch {
          // Web/some plataformas pueden fallar el snapshot — caemos al frame sintetico.
        }
      }

      if (!base64) {
        // Frame sintetico determinista por tiempo: mantiene el flujo del agente
        // funcionando aun cuando la plataforma no entrega base64.
        base64 = `synthetic-${capturedAt}-${Math.random().toString(36).slice(2, 10)}`;
      }

      const result = await signVisionProvider.detect({
        base64,
        width,
        height,
        capturedAt,
      });

      setLastResult(result);
      setStatus(result.status);

      // ── Si no hay manos, reseteamos la letra pendiente y permitimos repetir
      //    la ultima anexada (asi se puede escribir "AA" con una pausa).
      if (result.status === 'no_hands') {
        lastAppendedRef.current = '';
        if (pendingLetterRef.current) clearPending();
        return;
      }

      // ── Solo nos interesan detecciones confiables.
      const candidate = result.text;
      if (!candidate || result.confidence < minConfidence || result.status !== 'detecting') {
        // Si baja la confianza pero seguia la misma letra pendiente, la
        // dejamos quieta — quiza el proximo frame la confirma.
        return;
      }

      // ── Ventana de estabilidad: contar frames consecutivos con la misma letra.
      if (pendingLetterRef.current === candidate) {
        pendingCountRef.current += 1;
      } else {
        pendingLetterRef.current = candidate;
        pendingCountRef.current = 1;
      }
      setPendingLetter(pendingLetterRef.current);
      setPendingCount(pendingCountRef.current);

      // Las detecciones de movimiento (J/Ñ/RR/Z y palabras entrenadas) son un
      // gesto que ocurre UNA vez — no se puede esperar a verlo dos veces.
      const framesNeeded = result.source === 'motion' ? 1 : confirmFrames;

      // ── Confirmar y anexar.
      if (
        pendingCountRef.current >= framesNeeded &&
        candidate !== lastAppendedRef.current
      ) {
        lastAppendedRef.current = candidate;
        setTranscript(prev => {
          if (!prev) return candidate;
          // Letras (incluida RR, el dígrafo) se concatenan sin espacio;
          // palabras completas van con espacio para formar la frase.
          const isLetter = candidate.length === 1 || candidate === 'RR';
          return isLetter ? prev + candidate : `${prev} ${candidate}`;
        });
        clearPending();
      }
    } catch {
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, [cameraRef, minConfidence, quality, confirmFrames, clearPending]);

  useEffect(() => {
    if (!isRunning) return;

    let cancelled = false;
    runningRef.current = true;

    const tick = async () => {
      if (cancelled || !runningRef.current) return;
      await captureAndDetect();
      if (cancelled || !runningRef.current) return;
      timerRef.current = setTimeout(tick, intervalMs);
    };

    // Pre-carga del modelo (MediaPipe descarga ~7 MB en web la primera vez).
    signVisionProvider.init?.().catch(() => undefined);

    // Primer disparo: damos un pequeno respiro para que la camara renderice.
    timerRef.current = setTimeout(tick, 600);

    return () => {
      cancelled = true;
      runningRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, intervalMs, captureAndDetect]);

  useEffect(() => () => signVisionProvider.dispose?.(), []);

  const start = useCallback(() => {
    lastAppendedRef.current = '';
    clearPending();
    setStatus('starting');
    setIsRunning(true);
  }, [clearPending]);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    setStatus('idle');
    clearPending();
  }, [clearPending]);

  const reset = useCallback(() => {
    setTranscript('');
    setLastResult(null);
    lastAppendedRef.current = '';
    clearPending();
  }, [clearPending]);

  const backspace = useCallback(() => {
    setTranscript(prev => prev.slice(0, -1));
    lastAppendedRef.current = '';
  }, []);

  const appendSpace = useCallback(() => {
    setTranscript(prev => (prev.endsWith(' ') || prev.length === 0 ? prev : prev + ' '));
    lastAppendedRef.current = '';
  }, []);

  return {
    isRunning,
    status,
    lastResult,
    transcript,
    pendingLetter,
    pendingCount,
    confirmFrames,
    start,
    stop,
    reset,
    backspace,
    appendSpace,
  };
};
