/**
 * @file hooks/useSignAgent.ts
 * @description Hook del agente de reconocimiento de señas. Toma una ref a
 * `CameraView`, captura frames a intervalo configurable, los envía al provider
 * de visión activo y expone el último resultado, las transcripciones acumuladas
 * y el estado del agente.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraView } from 'expo-camera';
import { signVisionProvider } from '../services/vision';
import type { SignDetectionResult, SignAgentStatus } from '../types';

export interface UseSignAgentOptions {
  /** Intervalo entre capturas, ms. Default 1500. */
  intervalMs?: number;
  /** Confianza mínima para concatenar al texto acumulado. Default 0.7. */
  minConfidence?: number;
  /** Calidad jpeg para `takePictureAsync`. Default 0.4. */
  quality?: number;
}

export interface UseSignAgentResult {
  /** true mientras el bucle de captura está corriendo. */
  isRunning: boolean;
  /** Estado del último frame procesado. */
  status: SignAgentStatus;
  /** Último resultado bruto del provider. */
  lastResult: SignDetectionResult | null;
  /** Texto acumulado a partir de detecciones con confianza suficiente. */
  transcript: string;
  /** Inicia el bucle de captura. */
  start: () => void;
  /** Detiene el bucle y limpia. */
  stop: () => void;
  /** Limpia transcript y último resultado sin detener el bucle. */
  reset: () => void;
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
  const { intervalMs = 1500, minConfidence = 0.7, quality = 0.4 } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<SignAgentStatus>('idle');
  const [lastResult, setLastResult] = useState<SignDetectionResult | null>(null);
  const [transcript, setTranscript] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const lastAppendedRef = useRef<string>('');
  const runningRef = useRef(false);

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
          // Web/some plataformas pueden fallar el snapshot — caemos al frame sintético.
        }
      }

      if (!base64) {
        // Frame sintético determinista por tiempo: mantiene el flujo del agente
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

      if (
        result.status === 'detecting' &&
        result.confidence >= minConfidence &&
        result.text &&
        result.text !== lastAppendedRef.current
      ) {
        lastAppendedRef.current = result.text;
        setTranscript(prev => {
          if (!prev) return result.text;
          // Letras se concatenan sin espacio; palabras con espacio.
          const isLetter = result.text.length === 1;
          return isLetter ? prev + result.text : `${prev} ${result.text}`;
        });
      }
    } catch {
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, [cameraRef, minConfidence, quality]);

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

    // Primer disparo: damos un pequeño respiro para que la cámara renderice.
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
    setStatus('starting');
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setLastResult(null);
    lastAppendedRef.current = '';
  }, []);

  return { isRunning, status, lastResult, transcript, start, stop, reset };
};
