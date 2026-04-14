// Dark and Light theme tokens
export const dark = {
  background: '#0B0E1A',
  backgroundSecondary: '#0F1225',
  surface: 'rgba(255,255,255,0.07)',
  surfaceHigh: 'rgba(255,255,255,0.13)',
  border: 'rgba(255,255,255,0.10)',
  borderBright: 'rgba(255,255,255,0.22)',
  primary: '#FF6B2B',
  primaryLight: 'rgba(255,107,43,0.18)',
  text: '#F8FAFC',
  textSecondary: 'rgba(248,250,252,0.55)',
  textMuted: 'rgba(248,250,252,0.28)',
  success: '#10B981',
  successLight: 'rgba(16,185,129,0.18)',
  warning: '#F59E0B',
  warningLight: 'rgba(245,158,11,0.18)',
  error: '#EF4444',
  errorLight: 'rgba(239,68,68,0.18)',
  info: '#60A5FA',
  infoLight: 'rgba(96,165,250,0.18)',
  tabBar: '#0D1020',
  tabBorder: 'rgba(255,255,255,0.08)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(255,255,255,0.12)',
  overlay: 'rgba(0,0,0,0.65)',
  sheetBg: '#111425',
  isDark: true,
};

export const light = {
  background: '#F0F3FF',
  backgroundSecondary: '#E8ECFF',
  surface: '#FFFFFF',
  surfaceHigh: '#F8FAFF',
  border: '#E2E8F0',
  borderBright: '#CBD5E1',
  primary: '#F97316',
  primaryLight: 'rgba(249,115,22,0.12)',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  success: '#059669',
  successLight: 'rgba(5,150,105,0.10)',
  warning: '#D97706',
  warningLight: 'rgba(217,119,6,0.10)',
  error: '#DC2626',
  errorLight: 'rgba(220,38,38,0.10)',
  info: '#2563EB',
  infoLight: 'rgba(37,99,235,0.10)',
  tabBar: '#FFFFFF',
  tabBorder: '#E2E8F0',
  inputBg: '#F8FAFF',
  inputBorder: '#E2E8F0',
  overlay: 'rgba(0,0,0,0.45)',
  sheetBg: '#FFFFFF',
  isDark: false,
};

// Keep backward compat — defaults to dark tokens for existing imports
// Also includes legacy aliases used by screens not yet redesigned
export const colors = {
  ...dark,
  // Legacy aliases
  textPrimary: dark.text,
  textMuted: dark.textMuted,
  glass: dark.surface,
  glassBorder: dark.border,
  glassBorderBright: dark.borderBright,
  primaryGlow: dark.primaryLight,
  successGlow: dark.successLight,
  warningGlow: dark.warningLight,
  errorGlow: dark.errorLight,
  infoGlow: dark.infoLight,
  divider: 'rgba(255,255,255,0.06)',
  leave: 'rgba(245,158,11,0.15)',
  accent1: '#7C3AED',
  accent2: '#2563EB',
  accent3: '#059669',
};

// Legacy gradient presets (used by screens not yet redesigned)
export const gradients = {
  header: ['#1A0533', '#0A0A18'],
  orange: ['#FF6B2B', '#FF3D00'],
  purple: ['#7C3AED', '#4F46E5'],
  green: ['#059669', '#10B981'],
  card: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'],
  dark: ['#13132B', '#0A0A18'],
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48,
};

export const radius = {
  sm: 8, md: 14, lg: 20, xl: 28, pill: 100,
  // Legacy aliases
  small: 8, medium: 14, large: 20,
};

export const fontSizes = {
  h1: 28, h2: 22, h3: 18, body: 15, sm: 13, xs: 11,
  // Legacy aliases
  small: 13, tiny: 11, amount: 22,
};

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
};
