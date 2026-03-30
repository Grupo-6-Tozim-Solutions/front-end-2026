import * as Device from 'expo-device';
import { DeviceData } from '../types/user';

/**
 * Service para acessar dados do dispositivo
 * - Screen time (tempo de uso do dispositivo)
 * - Battery stats
 * - Device info
 * - Sensores (acelerómetro para detectar movimento)
 */

export const deviceDataService = {
  /**
   * Obtém tempo de tela (screen time) do dispositivo
   * Nota: Screen time não está disponível via Expo
   * Retorna null como fallback para input manual
   */
  async getScreenTimeData(): Promise<number | null> {
    try {
      // Screen time data not available via Expo APIs
      // Deve ser obtido do usuário manualmente na UI
      return null;
    } catch (error) {
      console.error('[DeviceData] Error getting screen time:', error);
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
        batteryLevel: undefined,
        isCharging: undefined,
      };
    } catch (error) {
      console.error('[DeviceData] Error getting device info:', error);
      return {};
    }
  },

  /**
   * Obtém nível de bateria
   */
  async getBatteryLevel(): Promise<number | null> {
    try {
      // Battery level not available via Expo without additional modules
      return null;
    } catch (error) {
      console.error('[DeviceData] Error getting battery level:', error);
      return null;
    }
  },

  /**
   * Verifica se dispositivo está carregando
   */
  async isCharging(): Promise<boolean> {
    try {
      // Charging status not available via Expo without additional modules
      return false;
    } catch (error) {
      console.error('[DeviceData] Error checking charging status:', error);
      return false;
    }
  },

  /**
   * Sugestão: Para dados de sono mais precisos no futuro:
   * - Integrar com Google Fit API (via @react-native-health/health)
   * - Usar acelerómetro para detectar movimento
   * - Integrar com apps de saúde do Android
   */
  async getSensorData(): Promise<{
    accelerometer?: { x: number; y: number; z: number };
  }> {
    try {
      // Placeholder para integração futura com sensores
      // Requer: react-native-sensors ou react-native-device-motion
      return {};
    } catch (error) {
      console.error('[DeviceData] Error getting sensor data:', error);
      return {};
    }
  },
};
