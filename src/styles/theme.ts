export interface ThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceStrong: string;
  surfaceOverlay: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  white: string;
  shadow: string;
}

export interface ThemeBlur {
  subtle: number;
  card: number;
  modal: number;
}

export interface ThemeOpacity {
  hairline: number;
  soft: number;
  medium: number;
  strong: number;
}

export interface ThemeElevation {
  none: {
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
    elevation: number;
  };
  sm: {
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
    elevation: number;
  };
  md: {
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
    elevation: number;
  };
  lg: {
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
    elevation: number;
  };
}

export interface ThemeTypography {
  family: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  size: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
    small: number;
  };
  lineHeight: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
    small: number;
  };
}

export interface AppTheme {
  colors: ThemeColors;
  spacing: Record<'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl', number>;
  radius: Record<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'pill', number>;
  typography: ThemeTypography;
  blur: ThemeBlur;
  opacity: ThemeOpacity;
  elevation: ThemeElevation;
}

export const theme: AppTheme = {
  colors: {
    background: '#0F0F10',
    backgroundElevated: '#121214',
    surface: 'rgba(255, 255, 255, 0.06)',
    surfaceStrong: 'rgba(255, 255, 255, 0.1)',
    surfaceOverlay: 'rgba(15, 15, 16, 0.72)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.22)',
    text: '#F3F4F6',
    textMuted: '#C7CBD1',
    textSubtle: '#9399A4',
    accent: '#7DD3FC',
    accentSoft: 'rgba(125, 211, 252, 0.24)',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    white: '#FFFFFF',
    shadow: '#000000',
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 56,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    pill: 999,
  },
  typography: {
    family: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    size: {
      title: 30,
      subtitle: 20,
      body: 16,
      caption: 14,
      small: 12,
    },
    lineHeight: {
      title: 36,
      subtitle: 26,
      body: 24,
      caption: 20,
      small: 16,
    },
  },
  blur: {
    subtle: 24,
    card: 36,
    modal: 56,
  },
  opacity: {
    hairline: 0.08,
    soft: 0.16,
    medium: 0.28,
    strong: 0.4,
  },
  elevation: {
    none: {
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    sm: {
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    md: {
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    lg: {
      shadowOpacity: 0.3,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
  },
};
