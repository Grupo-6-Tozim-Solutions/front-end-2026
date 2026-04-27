import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppProvider } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
