/**
 * @file types/index.ts
 * @description Tipos e interfaces TypeScript globales de la app.
 * Define las estructuras de datos principales:
 * - `User` / `AuthState` / `LoginPayload` / `RegisterPayload`: autenticación.
 * - `Traduccion` / `TipoTraduccion`: traducciones de señas.
 * - `LexicoSena` / `RecursoMultimedia` / `TipoLexico`: léxico LSC.
 * - `Notificacion` / `Alarma`: notificaciones y alarmas.
 * - `ThemeMode` / `ThemeState`: tema visual.
 * - `ApiResponse<T>` / `PaginatedResponse<T>`: respuestas genéricas del backend.
 */

// ─── Usuario ────────────────────────────────────────────────────────────────
export interface User {
  id_usuario: number;
  nombre: string;
  edad: number;
  email: string;
  tema: boolean;
  idioma: string;
  termino_acept: boolean;
  fecha_terminos?: string;
}

// ─── Autenticación ───────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  edad: number;
  email: string;
  password: string;
  termino_acept: boolean;
}

// ─── Traducción ──────────────────────────────────────────────────────────────
export type TipoTraduccion = 'texto_sena' | 'sena_texto' | 'voz_sena';

export interface Traduccion {
  id_traduccion: number;
  texto_entrada: string;
  texto_traducido: string;
  tipo: TipoTraduccion;
  fecha_traduccion: string;
  is_deleted: boolean;
}

// ─── Léxico ──────────────────────────────────────────────────────────────────
export type TipoLexico = 'letra' | 'numero' | 'palabra' | 'frase';

export interface LexicoSena {
  id_lexico: number;
  palabras: string;
  tipo: TipoLexico;
  letra?: string;
  idioma: string;
  recursos?: RecursoMultimedia[];
}

export interface RecursoMultimedia {
  id_recurso: number;
  tipo: 'video' | 'imagen' | 'gif';
  url: string;
  mime_type: string;
  orden: number;
}

// ─── Notificaciones ──────────────────────────────────────────────────────────
export interface Notificacion {
  id_notif: number;
  titulo: string;
  cuerpo: string;
  leida: boolean;
  created_at: string;
}

// ─── Alarma ──────────────────────────────────────────────────────────────────
export interface Alarma {
  id_alarma: number;
  hora: string;
  mensaje: string;
  activa: boolean;
  id_usuario: number;
}

// ─── Tema ────────────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
