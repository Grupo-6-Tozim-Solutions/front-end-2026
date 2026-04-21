import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceData } from '../types/user';
import { Platform } from 'react-native';

type UsageStatsModule = any;

/**
 * Service para acessar dados do dispositivo
 * - Device info (modelo, versão OS)
 * 
 * Nota: Tempo de tela é entrada manual do usuário (mais simples, Expo-compatível)
 */

export const deviceDataService = {
  /**
   * Tempo de tela é entrada manual do usuário
   * Removido: react-native-app-usage-stats (incompatibilidades)
   */
  async getScreenTimeData(): Promise<{ screenTimePerDay?: string; bedTime?: string; wakeTime?: string } | null> {
    try {
      const raw = await AsyncStorage.getItem('@app_user_data');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as any;
      const result: { screenTimePerDay?: string; bedTime?: string; wakeTime?: string } = {};
      if (parsed.screenTimePerDay) result.screenTimePerDay = parsed.screenTimePerDay;
      if (parsed.bedTime) result.bedTime = parsed.bedTime;
      if (parsed.wakeTime) result.wakeTime = parsed.wakeTime;
      return Object.keys(result).length ? result : null;
    } catch (error) {
      console.error('[DeviceData] Error reading stored screen time fallback:', error);
      return null;
    }
  },

  /**
   * Obtém informações gerais do dispositivo
   */
  async getDeviceInfo(): Promise<DeviceData> {
    try {
      const model = Device.modelName || Device.brand || 'Unknown Device';
      const osVersion = Device.osVersion || 'Unknown';

      return {
        deviceModel: model,
        osVersion: osVersion,
      };
    } catch (error) {
      console.error('[DeviceData] Error getting device info:', error);
      return {};
    }
  },

  /**
   * Tenta obter minutos de tempo de tela do Usage Stats (Android only).
   * Retorna número de minutos ou null se indisponível.
   */
  async getScreenTimeFromUsageStats(): Promise<number | null> {
    if (Platform.OS !== 'android') return null;

    try {
      // require dinamicamente para evitar crash em Expo/web/iOS
      const UsageStats: UsageStatsModule = require('react-native-app-usage-stats');
      if (!UsageStats) return null;

      // helper: check hasUsageAccess if available
      // Expose hasUsageAccess result to caller by returning null here so caller can open settings
      try {
        const hasAccessFn = (UsageStats as any).hasUsageAccess;
        if (typeof hasAccessFn === 'function') {
          const ok = await hasAccessFn();
          if (!ok) {
            console.warn('[DeviceData] UsageStats hasUsageAccess returned false');
            return null;
          }
        }
      } catch (e) {
        // ignore
      }

      // Tenta vários nomes de método populares na lib
      const methodCandidates = [
        'getUsageStatsForRange',
        'getUsageStats',
        'getUsage',
        'getScreenTime',
        'getDailyUsage',
        'queryUsageStats',
        // vendor-specific
        'getUsageByApps',
        'getUsageAllApps',
      ];

      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const start = now - oneDay;

      for (const name of methodCandidates) {
        const fn = (UsageStats as any)[name] || UsageStats;
        if (typeof fn === 'function') {
          try {
            const result = await fn(start, now);

            // Resultado pode ser number (minutes), array ou objeto.
            if (typeof result === 'number') {
              return Math.round(result);
            }

            // Se vier um objeto agregando minutos
            if (result && typeof result.totalMinutes === 'number') {
              return Math.round(result.totalMinutes);
            }

            // Se for array de pacotes com foregroundTime/name
            if (Array.isArray(result)) {
              let totalMs = 0;
              for (const item of result) {
                // common fields used by different libs
                const ms = (item.totalTime ?? item.foregroundTime ?? item.usageTime ?? item.usage ?? 0) as number;
                totalMs += typeof ms === 'number' ? ms : 0;
              }
              // many libs return ms, convert to minutes if large
              const minutes = totalMs > 10000 ? Math.round(totalMs / 60000) : Math.round(totalMs);
              return minutes;
            }

            // If result is object with per-day keys
            if (result && typeof result === 'object') {
              // sum numeric properties
              let sum = 0;
              for (const k of Object.keys(result)) {
                const v = (result as any)[k];
                if (typeof v === 'number') sum += v;
                else if (v && typeof v.totalTime === 'number') sum += v.totalTime;
              }
              if (sum > 0) {
                const minutes = sum > 10000 ? Math.round(sum / 60000) : Math.round(sum);
                return minutes;
              }
            }
          } catch (e) {
            // tente próximo método
            console.warn('[DeviceData] UsageStats method', name, 'failed:', e);
          }
        }
      }

      // Algumas libs exportam função padrão que retorna minutos diretamente
      if (typeof UsageStats === 'function') {
        try {
          const r = await (UsageStats as any)(start, now);
          if (typeof r === 'number') return Math.round(r);
        } catch (e) {
          // ignore
        }
      }

      // Some libs offer getUsageAllApps/getUsageByApps that return per-app usage
      try {
        const getAll = (UsageStats as any).getUsageAllApps || (UsageStats as any).getUsageByApps;
        if (typeof getAll === 'function') {
          const res = await getAll(start, now);
          if (Array.isArray(res)) {
            let totalMs = 0;
            for (const item of res) {
              const ms = (item.totalTime ?? item.foregroundTime ?? item.usageTime ?? item.usage ?? 0) as number;
              totalMs += typeof ms === 'number' ? ms : 0;
            }
            return totalMs > 10000 ? Math.round(totalMs / 60000) : Math.round(totalMs);
          }
          // if returns object with totals
          if (res && typeof res === 'object') {
            let sum = 0;
            for (const k of Object.keys(res)) {
              const v = (res as any)[k];
              if (typeof v === 'number') sum += v;
              else if (v && typeof v.totalTime === 'number') sum += v.totalTime;
            }
            if (sum > 0) return sum > 10000 ? Math.round(sum / 60000) : Math.round(sum);
          }
        }
      } catch (e) {
        // ignore
      }

      return null;
    } catch (error) {
      console.warn('[DeviceData] UsageStats not available or failed:', error);
      return null;
    }
  },

  /**
   * Obtém nível de bateria (não disponível em Expo)
   */
  async getBatteryLevel(): Promise<null> {
    return null;
  },

  /**
   * Verifica se dispositivo está carregando (não disponível em Expo)
   */
  async isCharging(): Promise<boolean> {
    return false;
  },

  /**
   * Dados de sensores (não disponível em Expo)
   */
  async getSensorData(): Promise<{}> {
    return {};
  },
};
