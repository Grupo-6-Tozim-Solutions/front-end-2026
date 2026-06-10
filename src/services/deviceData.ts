import * as Device from 'expo-device';
import { DeviceData } from '../types/user';
import { appStorage } from './appStorage';

/**
 * Expo Go friendly device-data service.
 * Screen-time data is based on manual user input stored during onboarding.
 */
export const deviceDataService = {
  async getScreenTimeData(): Promise<{
    screenTimePerDay?: string;
    bedTime?: string;
    wakeTime?: string;
  } | null> {
    try {
      const raw = await appStorage.getItem('@app_user_data');
      if (!raw) return null;

      const parsed = JSON.parse(raw) as {
        screenTimePerDay?: string;
        bedTime?: string;
        wakeTime?: string;
      };

      const result: {
        screenTimePerDay?: string;
        bedTime?: string;
        wakeTime?: string;
      } = {};

      if (parsed.screenTimePerDay) result.screenTimePerDay = parsed.screenTimePerDay;
      if (parsed.bedTime) result.bedTime = parsed.bedTime;
      if (parsed.wakeTime) result.wakeTime = parsed.wakeTime;

      return Object.keys(result).length ? result : null;
    } catch (error) {
      console.error('[DeviceData] Error reading stored screen time fallback:', error);
      return null;
    }
  },

  async getDeviceInfo(): Promise<DeviceData> {
    try {
      return {
        deviceModel: Device.modelName || Device.brand || 'Unknown Device',
        osVersion: Device.osVersion || 'Unknown',
      };
    } catch (error) {
      console.error('[DeviceData] Error getting device info:', error);
      return {};
    }
  },

  async getScreenTimeFromUsageStats(): Promise<number | null> {
    return null;
  },

  async getBatteryLevel(): Promise<null> {
    return null;
  },

  async isCharging(): Promise<boolean> {
    return false;
  },

  async getSensorData(): Promise<{}> {
    return {};
  },
};

