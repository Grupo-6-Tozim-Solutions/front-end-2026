import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const inMemoryFallback = new Map<string, string>();

const getSessionStorage = (): Storage | null => {
  if (Platform.OS !== 'web') {
    return null;
  }

  try {
    if (typeof globalThis === 'undefined' || !('sessionStorage' in globalThis)) {
      return null;
    }

    return globalThis.sessionStorage;
  } catch (error) {
    console.warn('[AppStorage] sessionStorage unavailable, using in-memory fallback.', error);
    return null;
  }
};

export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    const session = getSessionStorage();
    if (session) {
      try {
        return session.getItem(key);
      } catch (error) {
        console.warn('[AppStorage] sessionStorage read failed, using in-memory fallback.', error);
      }
    }

    if (Platform.OS === 'web') {
      return inMemoryFallback.get(key) ?? null;
    }

    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    const session = getSessionStorage();
    if (session) {
      try {
        session.setItem(key, value);
        return;
      } catch (error) {
        console.warn('[AppStorage] sessionStorage write failed, using in-memory fallback.', error);
      }
    }

    if (Platform.OS === 'web') {
      inMemoryFallback.set(key, value);
      return;
    }

    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    const session = getSessionStorage();
    if (session) {
      try {
        session.removeItem(key);
        return;
      } catch (error) {
        console.warn('[AppStorage] sessionStorage remove failed, using in-memory fallback.', error);
      }
    }

    if (Platform.OS === 'web') {
      inMemoryFallback.delete(key);
      return;
    }

    await AsyncStorage.removeItem(key);
  },
};
