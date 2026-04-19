import * as Device from 'expo-device';
import { DeviceData } from '../types/user';

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
  async getScreenTimeData(): Promise<null> {
    return null;
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
