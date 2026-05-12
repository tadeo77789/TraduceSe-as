/**
 * @file services/translations.service.ts
 * @description Cliente HTTP del modulo translations del backend. Las
 * traducciones se persisten en `public.translations` con los campos:
 *   - input_text   (texto fuente)
 *   - output_text  (texto traducido / reconocido)
 *   - type         ('texto_sena' | 'sena_texto' | 'voz_sena')
 *   - confidence   (0..1, opcional, solo en sena_texto)
 *   - source       ('mediapipe' | 'knn' | 'mock' | 'manual', opcional)
 */
import { api, getCurrentUserId } from './api.service';
import { ENDPOINTS } from '../config/api.config';
import type { TipoTraduccion } from '../types';

export interface SaveTranslationInput {
  inputText: string;
  outputText: string;
  type: TipoTraduccion;
  confidence?: number;
  source?: 'mediapipe' | 'knn' | 'mock' | 'manual';
}

export interface SavedTranslation {
  translation_id: number;
  user_id: number | null;
  input_text: string;
  output_text: string;
  type: TipoTraduccion;
  confidence: number | null;
  source: string | null;
  is_deleted: boolean;
  created_at: string;
}

export const translationsService = {
  /** Persiste una traduccion en el backend. */
  async save(input: SaveTranslationInput): Promise<SavedTranslation> {
    const userId = await getCurrentUserId();
    const { data } = await api.post(ENDPOINTS.translate, {
      ...input,
      user_id: userId,
    });
    return data?.data as SavedTranslation;
  },

  /** Lista el historial del usuario actual. */
  async list(opts: { limit?: number; offset?: number } = {}): Promise<SavedTranslation[]> {
    const userId = await getCurrentUserId();
    const { data } = await api.get(ENDPOINTS.history, {
      params: { user_id: userId, ...opts },
    });
    return (data?.data ?? []) as SavedTranslation[];
  },

  /** Borrado logico de una traduccion. */
  async remove(translationId: number): Promise<void> {
    const userId = await getCurrentUserId();
    await api.delete(ENDPOINTS.deleteTranslation(translationId), {
      params: { user_id: userId },
    });
  },
};
