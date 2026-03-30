import { PermissionsAndroid, Platform } from 'react-native';
import { PermissionStatus } from '../types/user';

/**
 * Service para gerenciar permissões do SO (Android)
 * - PACKAGE_USAGE_STATS: Para ler tempo de tela
 * - SENSORS: Para acesso a acelerómetro (futuro)
 */

export const permissionsService = {
  /**
   * Nota: PACKAGE_USAGE_STATS não pode ser solicitado em runtime
   * Deve ser declarado no AndroidManifest.xml
   */
  async requestPackageUsagePermission(): Promise<boolean> {
    try {
      console.log('[Permissions] PACKAGE_USAGE_STATS permission must be declared in AndroidManifest.xml');
      return true;
    } catch (error) {
      console.error('[Permissions] Error with package usage permission:', error);
      return false;
    }
  },

  /**
   * Solicita permissões de sensor (acelerómetro)
   * Para futuro: detectar movimento/sono
   */
  async requestSensorPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }

      // Android: SENSORS permission (não requer runtime request geralmente)
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BODY_SENSORS
      );

      if (!granted) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BODY_SENSORS,
          {
            title: 'Permissão de Sensores',
            message: 'O app precisa acessar sensores para melhorar análise de sono',
            buttonNeutral: 'Pergunte depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }

      return true;
    } catch (error) {
      console.error('[Permissions] Error requesting sensor permissions:', error);
      return false;
    }
  },

  /**
   * Verifica status de todas as permissões necessárias
   */
  async checkAllPermissionsStatus(): Promise<PermissionStatus> {
    const status: PermissionStatus = {
      screenTime: 'unknown',
      sensors: 'unknown',
    };

    try {
      if (Platform.OS === 'android') {
        // BODY_SENSORS status
        try {
          const sensorGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BODY_SENSORS
          );
          status.sensors = sensorGranted ? 'granted' : 'denied';
        } catch {
          status.sensors = 'unknown';
        }

        // Nota: PACKAGE_USAGE_STATS não é uma runtime permission
        // Deve ser declarada no AndroidManifest.xml
        status.screenTime = 'granted'; // Assumir que está configurado
      }
    } catch (error) {
      console.error('[Permissions] Error checking permissions:', error);
    }

    return status;
  },

  /**
   * Solicita todas as permissões necessárias (fluxo completo)
   */
  async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      if (Platform.OS !== 'android') {
        return {
          screenTime: 'unknown',
          sensors: 'unknown',
        };
      }

      const results = await Promise.all([
        permissionsService.requestPackageUsagePermission(),
        permissionsService.requestSensorPermissions(),
      ]);

      const status = await permissionsService.checkAllPermissionsStatus();
      return status;
    } catch (error) {
      console.error('[Permissions] Error requesting all permissions:', error);
      return {
        screenTime: 'unknown',
        sensors: 'unknown',
      };
    }
  },

  /**
   * Abre settings do app para usuario habilitar permissões manualmente
   */
  async openAppSettings(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        // No Android, poderia abrir via Linking.openSettings()
        // Por enquanto, apenas log
        console.log('[Permissions] Para habilitar acesso a Usage Stats, vá em:');
        console.log('Versão 6.0 ou superior: Configurações > Apps > Permissões > Uso de Apps');
      }
    } catch (error) {
      console.error('[Permissions] Error opening app settings:', error);
    }
  },
};
