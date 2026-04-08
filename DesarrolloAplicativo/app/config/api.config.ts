/**
 * @file api.config.ts
 * @description Configuración de la conexión al backend.
 * - `API_BASE_URL`: apunta a `http://10.0.2.2:3000/api` en desarrollo
 *   (emulador Android → localhost del PC) y a la URL de producción en release.
 * - `API_TIMEOUT`: tiempo máximo de espera para las peticiones (10 s).
 * - `ENDPOINTS`: mapa de todos los endpoints de la API (auth, traducciones,
 *   léxico, alarmas, estadísticas, perfil). Los endpoints con parámetro id
 *   son funciones que reciben el id y retornan la ruta completa.
 */

// URL base del backend — cambiar por la IP real al desplegar
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'   // Android emulador → localhost del PC
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

  // Alarmas
  alarms: '/alarms',
  createAlarm: '/alarms',
  updateAlarm: (id: number) => `/alarms/${id}`,
  deleteAlarm: (id: number) => `/alarms/${id}`,

  // Estadísticas
  stats: '/stats',

  // Perfil
  profile: '/users/profile',
  updateProfile: '/users/profile',
  deleteAccount: '/users/delete',
};
