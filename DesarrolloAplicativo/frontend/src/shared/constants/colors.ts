




export const PrimaryScale = {
  50:  '#cbb4f2',
  100: '#c6adf2',
  200: '#bd9ef2',
  300: '#b490f2',
  400: '#ab82f2',
  500: '#9f71ed',
  600: '#784fbd',
  700: '#54338e',
  800: '#351c5e',
  900: '#180b2f',
  DEFAULT: '#7C3AED',
} as const;


export const NeutralScale = {
  50:  '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  DEFAULT: '#6B7280',
} as const;


export const Colors = {
  
  primary:        PrimaryScale.DEFAULT,
  primaryDark:    PrimaryScale[600],
  primaryLight:   PrimaryScale[400],
  primaryLighter: PrimaryScale[200],
  primaryBg:      '#EDE9FE',
  primaryHeader:  PrimaryScale[100],

  
  gradientPrimary: ['#9333EA', '#7C3AED'] as [string, string],
  gradientPrimaryDeep: ['#9333EA', '#7C3AED', '#6D28D9'] as [string, string, string],

  
  background:     '#FFFFFF',
  backgroundGray: NeutralScale[50],
  surface:        '#FFFFFF',
  inputBg:        NeutralScale[100],

  
  textPrimary:    NeutralScale[800],
  textSecondary:  NeutralScale[500],
  textHint:       NeutralScale[400],
  textOnPrimary:  '#FFFFFF',
  textLink:       PrimaryScale.DEFAULT,

  
  success:  '#10B981',
  error:    '#EF4444',
  warning:  '#F59E0B',
  info:     '#3B82F6',
  danger:   '#EF4444',

  
  toggleOn:  PrimaryScale.DEFAULT,
  toggleOff: NeutralScale[300],

  
  border:      NeutralScale[200],
  borderInput: NeutralScale[300],

  
  modeActive:   PrimaryScale.DEFAULT,
  modeInactive: '#FFFFFF',

  
  google:   '#FFFFFF',
  facebook: '#1877F2',

  
  shadow:  'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;


export const DarkColors = {
  ...Colors,
  background:     '#111118',
  backgroundGray: '#111118',
  surface:        '#1E1E2A',
  inputBg:        '#252534',
  textPrimary:    '#EEEEF5',
  textSecondary:  '#9898B0',
  textHint:       '#5E5E78',
  border:         '#2D2D3E',
  primaryBg:      '#1E183A',
  primaryHeader:  '#1E183A',
  shadow:         'rgba(0,0,0,0.3)',
  modeInactive:   '#1E1E2A',
};


export const GreenColors = {
  ...Colors,
  primary:        '#4CAF82',
  primaryDark:    '#2E8B57',
  primaryLight:   '#7DC8A0',
  primaryLighter: '#A8D8BC',
  primaryBg:      '#E8F5EE',
  primaryHeader:  '#C3E6D0',
  gradientPrimary: ['#4CAF82', '#2E8B57'] as [string, string],
  gradientPrimaryDeep: ['#5DBF8F', '#4CAF82', '#2E8B57'] as [string, string, string],
  modeActive:  '#4CAF82',
  toggleOn:    '#4CAF82',
  textLink:    '#4CAF82',
};

export const GreenDarkColors = {
  ...DarkColors,
  primary:        '#4CAF82',
  primaryDark:    '#2E8B57',
  primaryLight:   '#7DC8A0',
  primaryLighter: '#A8D8BC',
  primaryBg:      '#0F2A1A',
  primaryHeader:  '#0F2A1A',
  
  background:     '#0E140F',
  backgroundGray: '#0E140F',
  surface:        '#172019',
  inputBg:        '#1E2820',
  border:         '#243027',
  modeInactive:   '#172019',
  textHint:       '#5E7866',
  gradientPrimary: ['#4CAF82', '#2E8B57'] as [string, string],
  gradientPrimaryDeep: ['#5DBF8F', '#4CAF82', '#2E8B57'] as [string, string, string],
  modeActive:  '#4CAF82',
  toggleOn:    '#4CAF82',
  textLink:    '#4CAF82',
};
