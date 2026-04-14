export const colors = {
  // Core
  primary: '#FF6B2B',
  primaryGlow: 'rgba(255, 107, 43, 0.35)',
  primaryDark: '#CC4A0F',

  // Dark background layers
  background: '#0A0A18',
  backgroundCard: '#0F0F22',
  surface: 'rgba(255,255,255,0.07)',
  surfaceHigh: 'rgba(255,255,255,0.12)',

  // Glass
  glass: 'rgba(255,255,255,0.07)',
  glassBorder: 'rgba(255,255,255,0.14)',
  glassBorderBright: 'rgba(255,255,255,0.25)',

  // Accent gradients (used as solid fallbacks)
  accent1: '#7C3AED',   // purple
  accent2: '#2563EB',   // blue
  accent3: '#059669',   // green

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.30)',

  // Status
  success: '#10B981',
  successGlow: 'rgba(16,185,129,0.25)',
  warning: '#F59E0B',
  warningGlow: 'rgba(245,158,11,0.25)',
  error: '#EF4444',
  errorGlow: 'rgba(239,68,68,0.25)',
  info: '#3B82F6',
  infoGlow: 'rgba(59,130,246,0.25)',

  // Misc
  border: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(0,0,0,0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radius = {
  small: 10,
  medium: 16,
  large: 24,
  xl: 32,
  pill: 100,
};

export const fontSizes = {
  h1: 30,
  h2: 24,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
  amount: 22,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// Gradient presets (for use with expo-linear-gradient)
export const gradients = {
  header: ['#1A0533', '#0A0A18'],
  orange: ['#FF6B2B', '#FF3D00'],
  purple: ['#7C3AED', '#4F46E5'],
  green: ['#059669', '#10B981'],
  card: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'],
  dark: ['#13132B', '#0A0A18'],
};
