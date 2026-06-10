/**
 * @file api.config.ts
 * @description Configuración de la conexión al backend.
 * - `API_BASE_URL`: apunta a `http://10.0.2.2:3000/api` en desarrollo
 *   (emulador Android → localhost del PC) y a la URL de producción en release.
 * - `API_TIMEOUT`: tiempo máximo de espera para las peticiones (10 s).
 * - `ENDPOINTS`: mapa de todos los endpoints de la API (auth, traducciones,
 *   léxico, estadísticas, perfil). Los endpoints con parámetro id
 *   son funciones que reciben el id y retornan la ruta completa.
 */

import { Platform } from 'react-native';

// URL base del backend — cambiar por la IP real al desplegar.
// En desarrollo: el emulador Android ve el localhost del PC como 10.0.2.2;
// web y simulador iOS usan localhost directo. Para un celular físico,
// reemplazar por la IP LAN del PC (ej. http://192.168.1.50:3000/api).
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://localhost:3000/api'
  : Platform.OS === 'web'
    ? '/api' // build web servido por nginx: el proxy /api/ reenvía al backend
    : 'https://api.traducsenas.com/api';

export const API_TIMEOUT = 10_000; // 10 segundos

export const ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  verifyCode: '/auth/verify-code',
  resetPassword: '/auth/reset-password',

  // Traducciones
  translate: '/translations',
  history: '/translations/history',
  deleteTranslation: (id: number) => `/translations/${id}`,

  // Léxico
  lexicon: '/lexicon',
  lexiconSearch: '/lexicon/search',

  // Estadísticas
  stats: '/stats',

  // Perfil
  profile: '/users/profile',
  updateProfile: '/users/profile',
  deleteAccount: '/users/delete',
};

// ── Modelo de reconocimiento de señas para móvil (TFJS) ─────────────────────
// El provider TFJS de mobile carga estos artefactos al inicializarse. Si las
// URLs están vacías o el modelo no es accesible, el provider degrada a mock
// sin romper la UI. Para usarlo:
//   1) Entrenar el modelo en https://teachablemachine.withgoogle.com/train/image
//   2) Exportar como "Tensorflow.js" → carpeta con model.json + pesos.bin
//   3) Subir esos archivos a una URL pública (Firebase Hosting, GitHub Pages, etc.)
//   4) Crear labels.json con ["A","B","C", ...] (orden igual al de Teachable Machine)
//   5) Apuntar TFJS_MODEL_URL y TFJS_LABELS_URL a esos archivos.
export const TFJS_MODEL_URL = '';   // ej. 'https://midominio.com/modelo/model.json'
export const TFJS_LABELS_URL = '';  // ej. 'https://midominio.com/modelo/labels.json'
