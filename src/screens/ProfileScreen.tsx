import React, { useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { AppModal, AppScreen, Button, GlassCard, Header, ListItem } from '../components/ui';
import { EmptyState, InlineFeedback } from '../components/states';

interface ProfileScreenProps {
  navigation?: any;
}

const usageLabel: Record<string, string> = {
  before_22h: 'Uso antes das 22h',
  until_23h: 'Uso ate 23h',
  until_00h: 'Uso ate 00h',
  after_00h: 'Uso apos 00h',
};

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userData = appContext.userData;

  const quickStats = useMemo(
    () => ({
      totalLogs: appContext.sleepLogs.length,
      averageQuality: appContext.userQualityStats().averageQuality.toFixed(1),
      pendingSync: appContext.syncQueue.length,
    }),
    [appContext]
  );

  const handleLogout = async () => {
    try {
      await appContext.clearAllData();
    } catch (error) {
      console.error('[Profile] Logout error:', error);
      Alert.alert('Erro', 'Nao foi possivel limpar os dados locais.');
    }
  };

  if (!userData) {
    return (
      <AppScreen>
        <Header title="Perfil" subtitle="Sem dados de perfil" icon="profile" />
        <EmptyState
          title="Perfil ainda nao configurado"
          description="Complete o onboarding para visualizar preferencias e historico pessoal."
          icon="profile"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <Header title="Perfil" subtitle="Dados pessoais e status da conta local" icon="profile" />

      <GlassCard variant="elevated" contentStyle={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Informacoes pessoais
        </Text>
        <ListItem title="Idade" subtitle={`${userData.age} anos`} icon="profile" trailing={null} />
        <ListItem title="Genero" subtitle={userData.gender} icon="profile" trailing={null} />
        <ListItem
          title="Horario habitual"
          subtitle={`${userData.bedTime} - ${userData.wakeTime}`}
          icon="clock"
          trailing={null}
        />
        <ListItem
          title="Uso noturno de celular"
          subtitle={usageLabel[userData.phoneUsageEndTime] ?? userData.phoneUsageEndTime}
          icon="moon"
          trailing={null}
        />
        <ListItem
          title="Endereco base"
          subtitle={userData.homeAddress || 'Nao informado'}
          icon="location"
          trailing={null}
        />
      </GlassCard>

      <GlassCard variant="default" contentStyle={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Resumo de uso</Text>
        <View style={styles.statRow}>
          <View
            style={[
              styles.statItem,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Registros</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {quickStats.totalLogs}
            </Text>
          </View>
          <View
            style={[
              styles.statItem,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Qualidade media
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {quickStats.averageQuality}/10
            </Text>
          </View>
          <View
            style={[
              styles.statItem,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Pendencias</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {quickStats.pendingSync}
            </Text>
          </View>
        </View>

        {quickStats.pendingSync > 0 ? (
          <InlineFeedback
            tone="warning"
            message="Ha itens aguardando sincronizacao. Mantenha o app aberto com conexao para concluir."
          />
        ) : (
          <InlineFeedback tone="success" message="Todos os dados estao sincronizados." />
        )}
      </GlassCard>

      <GlassCard variant="subtle" contentStyle={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Privacidade e suporte
        </Text>
        <Button
          title="Abrir politica de privacidade"
          onPress={() => Linking.openURL('https://github.com/your-repo/privacy')}
          variant="secondary"
          icon="shield"
          iconPosition="right"
        />
        <Button
          title="Limpar dados locais"
          onPress={() => setShowLogoutModal(true)}
          variant="ghost"
          icon="signOut"
          iconPosition="right"
        />
      </GlassCard>

      <AppModal
        visible={showLogoutModal}
        title="Remover dados locais"
        description="Essa acao apaga o perfil e registros armazenados neste dispositivo."
        confirmText="Remover"
        cancelText="Cancelar"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
        confirmVariant="secondary"
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

