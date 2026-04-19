import { PermissionStatus } from '../types/user';

/**
 * Service para gerenciar permissões do SO (iOS & Android via Expo)
 * - NOTIFICATIONS: Para lembretes e notificações (Expo-compatível)
 * 
 * Nota: Este app usa apenas permissões Expo-compatíveis.
 * Funcionalidades de rastreamento de sono são baseadas em entrada manual do usuário.
 */

export const permissionsService = {
  /**
   * Solicita permissão de notificações (Expo-compatível)
   * Retorna 'granted' se aceito, 'denied' se recusado
   */
  async requestNotificationPermission(): Promise<'granted' | 'denied'> {
    try {
      console.log('[Permissions] Requesting notifications permission...');
      
      // Para Expo, notificações são solicitadas via expo-notifications
      // Por enquanto, retornamos 'unknown' pois seria necessário expo-notifications package
      // TODO: Integrar expo-notifications quando disponível
      
      console.log('[Permissions] Note: Integrate expo-notifications for full notification support');
      return 'granted'; // Default: assume granted para MVP
    } catch (error) {
      console.error('[Permissions] Error requesting notification permission:', error);
      return 'denied';
    }
  },

  /**
   * Verifica status de notificações
   */
  async checkNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'unknown'> {
    try {
      console.log('[Permissions] Checking notification permission status...');
      
      // TODO: Implementar com expo-notifications
      return 'unknown';
    } catch (error) {
      console.error('[Permissions] Error checking notification permission:', error);
      return 'unknown';
    }
  },

  /**
   * Solicita todas as permissões necessárias (fluxo completo)
   */
  async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      console.log('[Permissions] Requesting all Expo-compatible permissions...');
      
      const notificationStatus = await permissionsService.requestNotificationPermission();
      
      const status: PermissionStatus = {
        notifications: notificationStatus,
      };

      console.log('[Permissions] Permission status:', status);
      return status;
    } catch (error) {
      console.error('[Permissions] Error requesting all permissions:', error);
      return {
        notifications: 'unknown',
      };
    }
  },

  /**
   * Info: Este app não requer permissões críticas do sistema
   * - Camera: Opcional (futuro)
   * - Location: Opcional (futuro)
   * - HealthKit/Samsung Health: Opcional (futuro)
   */
  getOptionalPermissionsInfo(): string {
    return `
      Este app funciona com dados de entrada manual do usuário.
      
      Permissões Opcionais (para recursos futuros):
      - 📸 Câmera: Para fotografar diário de sono
      - 📍 Localização: Para rastrear padrões por local
      - 🏥 Dados de Saúde: Para integração com Apple Health / Google Fit
    `;
  },
};
