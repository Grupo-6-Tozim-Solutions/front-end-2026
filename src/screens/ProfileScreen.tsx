import React, { useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
<<<<<<< HEAD
import { AppModal, AppScreen, Button, GlassCard, Header, ListItem } from '../components/ui';
import { EmptyState, InlineFeedback } from '../components/states';
=======
import { typography, spacing, borderRadius } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { translations } from '../languages/pt';
>>>>>>> notificações-acordar-dormit

interface ProfileScreenProps {
  navigation?: any;
}

const usageLabel: Record<string, string> = {
  before_22h: 'Uso antes das 22h',
  until_23h: 'Uso até 23h',
  until_00h: 'Uso até 00h',
  after_00h: 'Uso após 00h',
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
    [appContext],
  );

  const handleLogout = async () => {
    try {
      await appContext.clearAllData();
    } catch (error) {
      console.error('[Profile] Logout error:', error);
      Alert.alert('Erro', 'Não foi possível limpar os dados locais.');
    }
  };

  if (!userData) {
    return (
      <AppScreen>
        <Header title="Perfil" subtitle="Sem dados de perfil" icon="profile" />
        <EmptyState
          title="Perfil ainda não configurado"
          description="Complete o onboarding para visualizar preferências e histórico pessoal."
          icon="profile"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <Header title="Perfil" subtitle="Dados pessoais e status da conta local" icon="profile" />

      <GlassCard variant="elevated" contentStyle={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informações pessoais</Text>
        <ListItem title="Idade" subtitle={`${userData.age} anos`} icon="profile" trailing={null} />
        <ListItem title="Gênero" subtitle={userData.gender} icon="profile" trailing={null} />
        <ListItem title="Horário habitual" subtitle={`${userData.bedTime} - ${userData.wakeTime}`} icon="clock" trailing={null} />
        <ListItem
          title="Uso noturno de celular"
          subtitle={usageLabel[userData.phoneUsageEndTime] ?? userData.phoneUsageEndTime}
          icon="moon"
          trailing={null}
        />
        <ListItem title="Endereço base" subtitle={userData.homeAddress || 'Não informado'} icon="location" trailing={null} />
      </GlassCard>

      <GlassCard variant="default" contentStyle={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Resumo de uso</Text>
        <View style={styles.statRow}>
          <View style={[styles.statItem, { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface }]}> 
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Registros</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{quickStats.totalLogs}</Text>
          </View>
          <View style={[styles.statItem, { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface }]}> 
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Qualidade média</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{quickStats.averageQuality}/10</Text>
          </View>
<<<<<<< HEAD
          <View style={[styles.statItem, { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface }]}> 
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Pendências</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{quickStats.pendingSync}</Text>
=======

          {/* Phone Usage End Time */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Fim do Uso de Celular
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userData.phoneUsageEndTime}
            </Text>
          </View>

          {/* Phone in Bed */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Celular na Cama
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userData.phoneInBed}
            </Text>
          </View>

          {/* Bed Time */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Horário de Dormir
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userData.bedTime}
            </Text>
          </View>

          {/* Wake Time */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Horário de Acordar
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userData.wakeTime}
            </Text>
          </View>

          {/* Stress Level */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Nível de Estresse
            </Text>
            <View style={styles.stressLevelContainer}>
              <Text style={styles.stressEmoji}>
                {getStressLevelEmoji(userData.stressLevel)}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {userData.stressLevel}/10
              </Text>
            </View>
>>>>>>> notificações-acordar-dormit
          </View>
        </View>

        {quickStats.pendingSync > 0 ? (
          <InlineFeedback tone="warning" message="Há itens aguardando sincronização. Mantenha o app aberto com conexão para concluir." />
        ) : (
          <InlineFeedback tone="success" message="Todos os dados estão sincronizados." />
        )}
      </GlassCard>

      <GlassCard variant="subtle" contentStyle={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Privacidade e suporte</Text>
        <Button
          title="Abrir política de privacidade"
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
        description="Essa ação apaga o perfil e registros armazenados neste dispositivo."
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
