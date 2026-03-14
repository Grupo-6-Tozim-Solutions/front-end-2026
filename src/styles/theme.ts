export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  highlight: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  error: string;
  success: string;
  white: string;
  shadow: string;
  cardBorder: string;
}

export const lightColors: ThemeColors = {
  primary: '#7EC8E3',
  primaryDark: '#5BA3C9',
  primaryLight: '#B8E2F2',
  accent: '#B8A9D4',
  accentLight: '#D6CCE8',
  highlight: '#FFD966',
  background: '#F0F4FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFF',
  text: '#2D2D3F',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E2E6F0',
  error: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
  shadow: '#4A5568',
  cardBorder: '#E8E0F0',
};

export const darkColors: ThemeColors = {
  primary: '#7EC8E3',
  primaryDark: '#5BA3C9',
  primaryLight: '#3A7A9B',
  accent: '#C4B5E0',
  accentLight: '#9B8AC2',
  highlight: '#FFD966',
  background: '#1A1B2E',
  surface: '#252740',
  surfaceElevated: '#2E3050',
  text: '#E8E8F0',
  textSecondary: '#9CA3B8',
  textLight: '#6B7490',
  border: '#3A3D56',
  error: '#F87171',
  success: '#34D399',
  white: '#FFFFFF',
  shadow: '#000000',
  cardBorder: '#3E3A56',
};

export const typography = {
  title: 28,
  subtitle: 18,
  body: 16,
  caption: 14,
  small: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
