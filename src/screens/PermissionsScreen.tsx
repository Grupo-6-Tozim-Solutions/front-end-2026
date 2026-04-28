import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/AppNavigator';
import { translations } from '../languages/pt';
import { permissionsService } from '../services/permissions';
import { PermissionStatus } from '../types/user';
import { AppModal, AppScreen, Button, GlassCard, Header, ListItem } from '../components/ui';
import { InlineFeedback } from '../components/states';
import { useTheme } from '../contexts/ThemeContext';

type PermissionsScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Permissions'>;
};

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [permissionsStatus, setPermissionsStatus] = useState<PermissionStatus>({
    notifications: 'unknown',
    microphone: 'unknown',
  });

  const notificationsGranted = useMemo(
    () => permissionsStatus.notifications === 'granted',
    [permissionsStatus.notifications],
  );

  const handleContinue = () => {
    navigation.navigate('Questionnaire');
  };

  const handleRequestPermissions = async () => {
    try {
      setIsRequesting(true);
      const status = await permissionsService.requestAllPermissions();
      setPermissionsStatus(status);

      if (status.notifications === 'granted') {
        Alert.alert(translations.permissions.granted, translations.permissions.grantedMessage, [
          {
            text: translations.common.continue,
            onPress: handleContinue,
          },
        ]);
        return;
      }

      Alert.alert(translations.permissions.optionalPermissions, translations.permissions.notificationsOptional, [
        {
          text: translations.common.continue,
          onPress: handleContinue,
        },
      ]);
    } catch (error) {
      console.error('[PermissionsScreen] Error requesting permissions:', error);
      Alert.alert(translations.common.error, translations.permissions.permissionError);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <AppScreen scroll>
      <Header
        title={translations.permissions.title}
        subtitle="Controle lembretes e captura de áudio para enriquecer sua experiência."
        icon="shield"
      />

      <GlassCard variant="elevated" contentStyle={styles.cardContent}>
        <ListItem
          icon="bell"
          title="Notificações"
          subtitle="Lembretes para manter horário regular de descanso."
          trailing={
            <InlineFeedback
              tone={notificationsGranted ? 'success' : 'warning'}
              message={notificationsGranted ? 'Ativa' : 'Opcional'}
              style={styles.inlineStatus}
            />
          }
        />
        <ListItem
          icon="microphone"
          title="Microfone"
          subtitle="Ative para conversar com o coach por voz."
          trailing={
            <InlineFeedback
              tone={permissionsStatus.microphone === 'granted' ? 'success' : 'info'}
              message={permissionsStatus.microphone === 'granted' ? 'Ativo' : 'Opcional'}
              style={styles.inlineStatus}
            />
          }
        />
      </GlassCard>

      <GlassCard variant="subtle" contentStyle={styles.privacyCard}>
        <InlineFeedback tone="info" message="Os dados ficam no dispositivo e só sincronizam quando houver conexão." />
      </GlassCard>

      <View style={styles.actions}>
        <Button
          title={isRequesting ? 'Solicitando permissões...' : 'Ativar permissões'}
          onPress={handleRequestPermissions}
          loading={isRequesting}
          icon="check"
          iconPosition="right"
        />
        <Button
          title="Pular por enquanto"
          onPress={() => setShowSkipModal(true)}
          variant="ghost"
          disabled={isRequesting}
        />
      </View>

      <AppModal
        visible={showSkipModal}
        title={translations.permissions.skipConfirm}
        description={translations.permissions.skipMessage}
        confirmText={translations.common.skip}
        cancelText={translations.common.cancel}
        onCancel={() => setShowSkipModal(false)}
        onConfirm={() => {
          setShowSkipModal(false);
          handleContinue();
        }}
        confirmVariant="secondary"
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    gap: 10,
  },
  inlineStatus: {
    minWidth: 96,
  },
  privacyCard: {
    paddingVertical: 12,
  },
  actions: {
    gap: 10,
    marginTop: 8,
    paddingBottom: 20,
  },
});
