/**
 * @file strings.ts
 * @description Textos de la interfaz de usuario centralizados.
 * Contiene todos los strings visibles al usuario organizados por sección
 * (auth, tabs, traducción, léxico, historial, perfil, notificaciones, errores, acciones).
 * Estructura preparada para internacionalización (i18n).
 */

export const Strings = {
  appName: 'Traduce Señas',
  appTagline: 'Lengua de Señas Colombiana',

  // Auth
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  logout: 'Cerrar sesión',
  email: 'Correo electrónico',
  password: 'Contraseña',
  confirmPassword: 'Confirmar contraseña',
  name: 'Nombre completo',
  age: 'Edad',
  forgotPassword: '¿Olvidaste tu contraseña?',
  noAccount: '¿No tienes cuenta? ',
  hasAccount: '¿Ya tienes cuenta? ',
  terms: 'Acepto los términos y condiciones',
  loginWithGoogle: 'Continuar con Google',

  // Tabs
  home: 'Inicio',
  translation: 'Traducir',
  lexicon: 'Léxico',
  history: 'Historial',
  profile: 'Perfil',

  // Pantalla de inicio
  welcomeBack: 'Bienvenido de nuevo',
  quickAccess: 'Acceso rápido',
  recentTranslations: 'Traducciones recientes',
  seeAll: 'Ver todo',

  // Modos de traducción
  modeCamera: 'Seña → Texto',
  modeCameraDesc: 'Usa la cámara para traducir señas',
  modeText: 'Texto → Seña',
  modeTextDesc: 'Escribe para ver la seña',
  modeVoice: 'Voz → Seña',
  modeVoiceDesc: 'Habla para traducir',

  // Traducción
  startCamera: 'Iniciar cámara',
  stopCamera: 'Detener',
  enterText: 'Escribe aquí...',
  translate: 'Traducir',
  startRecording: 'Presiona para hablar',
  stopRecording: 'Soltar para traducir',
  result: 'Resultado',
  saveTranslation: 'Guardar traducción',
  clearText: 'Limpiar',
  copyResult: 'Copiar resultado',
  translating: 'Traduciendo...',
  detecting: 'Detectando seña...',
  listening: 'Escuchando...',

  // Léxico
  searchSigns: 'Buscar señas...',
  allCategories: 'Todas',
  letters: 'Letras',
  numbers: 'Números',
  words: 'Palabras',
  phrases: 'Frases',
  noResults: 'No se encontraron resultados',
  viewSign: 'Ver seña',

  // Historial
  deleteTranslation: 'Eliminar',
  confirmDelete: '¿Eliminar esta traducción?',
  emptyHistory: 'No hay traducciones guardadas',
  startTranslating: 'Comienza a traducir para ver tu historial',

  // Perfil
  editProfile: 'Editar perfil',
  language: 'Idioma',
  theme: 'Tema',
  themeLight: 'Claro',
  themeDark: 'Oscuro',
  notifications: 'Notificaciones',
  privacyPolicy: 'Política de privacidad',
  termsConditions: 'Términos y condiciones',
  about: 'Acerca de',

  // Notificaciones
  noNotifications: 'No tienes notificaciones',
  markAsRead: 'Marcar como leída',

  // Errores
  requiredField: 'Este campo es obligatorio',
  invalidEmail: 'Correo electrónico inválido',
  passwordMismatch: 'Las contraseñas no coinciden',
  shortPassword: 'La contraseña debe tener al menos 6 caracteres',
  cameraPermission: 'Se necesita permiso de cámara',
  micPermission: 'Se necesita permiso de micrófono',
  genericError: 'Ocurrió un error. Intenta de nuevo.',
  networkError: 'Sin conexión a internet',

  // Acciones
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Guardar',
  delete: 'Eliminar',
  edit: 'Editar',
  close: 'Cerrar',
  back: 'Atrás',
  next: 'Siguiente',
  done: 'Listo',
  loading: 'Cargando...',
};
