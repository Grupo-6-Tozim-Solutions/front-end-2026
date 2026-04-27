import React, { createContext, useContext, useMemo } from 'react';
import { AppTheme, theme } from '../styles/theme';

interface ThemeContextData {
  isDark: true;
  theme: AppTheme;
  colors: AppTheme['colors'];
}

const ThemeContext = createContext<ThemeContextData>({
  isDark: true,
  theme,
  colors: theme.colors,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const value = useMemo<ThemeContextData>(
    () => ({
      isDark: true,
      theme,
      colors: theme.colors,
    }),
    [],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextData => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
