import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export type AppEnvironment = 'development' | 'production';

const resolveAppEnvironment = (): AppEnvironment => {
  const configuredEnv = process.env.EXPO_PUBLIC_APP_ENV?.trim().toLowerCase();

  if (configuredEnv === 'production') {
    return 'production';
  }

  if (configuredEnv === 'development') {
    return 'development';
  }

  return __DEV__ ? 'development' : 'production';
};

export const appEnvironment = resolveAppEnvironment();
export const isDevelopmentEnvironment = appEnvironment === 'development';
export const isProductionEnvironment = appEnvironment === 'production';
export const isWebPlatform = Platform.OS === 'web';
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Notifications are enabled only for native production builds by default.
 * This keeps development/web preview stable for demos.
 */
export const isNotificationsEnabled =
  isProductionEnvironment && !isWebPlatform && !isExpoGo;

