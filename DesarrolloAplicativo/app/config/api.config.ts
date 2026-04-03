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
