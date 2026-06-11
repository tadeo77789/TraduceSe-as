/**
 * @file services/vision/templateStore.ts
 * @description Persistencia de plantillas de entrenamiento del KNN. Cada
 * plantilla es un vector normalizado de 63 features etiquetado con una letra.
 * Se guardan en AsyncStorage para que sobrevivan a recargas y persistan en
 * web (localStorage), Android y iOS.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@traduce_senas/sign_templates_v1';

export interface SignTemplate {
  /** Etiqueta (letra o palabra). */
  label: string;
  /** Vector de 63 features (21 puntos × xyz). */
  features: number[];
  /** Cuándo se grabó. */
  createdAt: string;
}

interface TemplatesPayload {
  templates: SignTemplate[];
}

let cache: SignTemplate[] | null = null;
let loadPromise: Promise<SignTemplate[]> | null = null;

const load = async (): Promise<SignTemplate[]> => {
  if (cache) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        cache = [];
        return cache;
      }
      const parsed = JSON.parse(raw) as TemplatesPayload;
      cache = Array.isArray(parsed.templates) ? parsed.templates : [];
      return cache;
    } catch {
      cache = [];
      return cache;
    }
  })();

  return loadPromise;
};

const persist = async (): Promise<void> => {
  if (!cache) return;
  try {
    const payload: TemplatesPayload = { templates: cache };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Si falla la persistencia, seguimos en memoria.
  }
};

export const templateStore = {
  /** Devuelve todas las plantillas guardadas. */
  async getAll(): Promise<SignTemplate[]> {
    return load();
  },

  /** Cuántas plantillas hay por etiqueta. */
  async countByLabel(): Promise<Record<string, number>> {
    const all = await load();
    const counts: Record<string, number> = {};
    for (const tpl of all) {
      counts[tpl.label] = (counts[tpl.label] ?? 0) + 1;
    }
    return counts;
  },

  /** Agrega una plantilla nueva (sin reemplazar las existentes). */
  async add(label: string, features: Float32Array): Promise<void> {
    await load();
    if (!cache) cache = [];
    cache.push({
      label,
      features: Array.from(features),
      createdAt: new Date().toISOString(),
    });
    await persist();
  },

  /** Borra todas las plantillas de una etiqueta. */
  async removeLabel(label: string): Promise<void> {
    await load();
    if (!cache) return;
    cache = cache.filter(t => t.label !== label);
    await persist();
  },

  /** Borra todo el dataset. */
  async clear(): Promise<void> {
    cache = [];
    await persist();
  },

  /** Serializa el dataset completo a JSON. */
  async exportJSON(): Promise<string> {
    const all = await load();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      templates: all,
    };
    return JSON.stringify(payload, null, 2);
  },

  /**
   * Importa plantillas desde un JSON exportado previamente.
   * @param json contenido del archivo JSON.
   * @param mode 'merge' agrega a las existentes; 'replace' las sobrescribe.
   * @returns número de plantillas importadas.
   */
  async importJSON(json: string, mode: 'merge' | 'replace' = 'merge'): Promise<number> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('JSON inválido');
    }

    const obj = parsed as { templates?: unknown };
    if (!Array.isArray(obj.templates)) {
      throw new Error('Formato no reconocido: falta el array "templates"');
    }

    const incoming: SignTemplate[] = [];
    for (const raw of obj.templates) {
      const t = raw as Partial<SignTemplate>;
      if (
        typeof t?.label === 'string' &&
        Array.isArray(t.features) &&
        t.features.length === 63 &&
        t.features.every((n: unknown) => typeof n === 'number')
      ) {
        incoming.push({
          label: t.label,
          features: t.features as number[],
          createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
        });
      }
    }

    if (incoming.length === 0) {
      throw new Error('No se encontraron plantillas válidas en el archivo');
    }

    await load();
    if (mode === 'replace' || !cache) {
      cache = incoming;
    } else {
      cache = [...cache, ...incoming];
    }
    await persist();
    return incoming.length;
  },
};
