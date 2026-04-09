import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { translations } from '../languages/pt';

interface ProfileScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const appContext = useAppContext();
  const userData = appContext.userData;

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair? Seus dados locais serão removidos.',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await appContext.clearAllData();
              // Navigation automatically reverts to OnboardingStack (Welcome screen)
              // because isOnboarded is now false
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
              console.error('Logout error:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStressLevelEmoji = (level: string) => {
    const numLevel = parseInt(level, 10);
    if (numLevel <= 3) return '😊';
    if (numLevel <= 6) return '😐';
    return '😰';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>👤</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Meu Perfil
        </Text>
      </View>

      {/* Profile Information Card */}
      {userData && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informações Pessoais
          </Text>

          {/* Age */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Idade
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userData.age} anos
            </Text>
          </View>

          {/* Gender */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Gênero
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userData.gender === 'male' ? 'Masculino' : 'Feminino'}
            </Text>
          </View>

          {/* Screen Time */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Tempo de Tela/Dia
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userData.screenTimePerDay}h
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
          </View>
        </View>
      )}

      {/* Stats Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Resumo de Dados
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Registros
            </Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {appContext.sleepLogs.length}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Qualidade Média
            </Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {appContext.userQualityStats().averageQuality.toFixed(1)}/10
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🔄</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Sincronização
            </Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {appContext.syncQueue.length === 0 ? '✓' : appContext.syncQueue.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={[
          styles.logoutButton,
          {
            backgroundColor: colors.error || '#EF4444',
          },
        ]}
      >
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Sleep & Screen v1.0
        </Text>
        <Text
          style={[styles.footerLink, { color: colors.primary }]}
          onPress={() =>
            Linking.openURL('https://github.com/your-repo/privacy')
          }
        >
          Privacidade
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.title - 4,
    fontWeight: '800',
    textAlign: 'center',
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  stressLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stressEmoji: {
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.small,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.title - 6,
    fontWeight: '800',
  },
  logoutButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  footerText: {
    fontSize: typography.small,
  },
  footerLink: {
    fontSize: typography.small,
    fontWeight: '600',
  },
});
