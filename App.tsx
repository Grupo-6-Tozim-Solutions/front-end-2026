import React from 'react';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppProvider } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AppProvider>
  );
}
