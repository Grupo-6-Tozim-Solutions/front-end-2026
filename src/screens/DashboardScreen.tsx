import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../languages/pt';
import { QualityComparisonChart } from '../components/QualityComparisonChart';
import { AppScreen, Button, GlassCard, Header, ListItem } from '../components/ui';
import { EmptyState, InlineFeedback } from '../components/states';

interface DashboardScreenProps {
  navigation?: any;
}

interface ShortcutItem {
  id: string;
  title: string;
  description: string;
  icon: 'chart' | 'list' | 'chat' | 'profile';
  action: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [lastSleepLogId, setLastSleepLogId] = useState<string | null>(null);

  const lastSleepLog = useMemo(
    () => appContext.sleepLogs.find((log) => log.id === lastSleepLogId) ?? appContext.sleepLogs[0],
    [appContext.sleepLogs, lastSleepLogId],
  );

  useFocusEffect(
    useCallback(() => {
      setLastSleepLogId(appContext.sleepLogs[0]?.id ?? null);
    }, [appContext.sleepLogs]),
  );

  const navigateTab = useCallback(
    (tabName: string) => {
      const parent = navigation?.getParent?.();
      if (parent?.navigate) {
        parent.navigate(tabName);
      }
    },
    [navigation],
  );

  const shortcuts = useMemo<ShortcutItem[]>(
    () => [
      {
        id: 'logging',
        icon: 'chart',
        title: translations.dashboard.registerSleep,
        description: translations.dashboard.registerSleepDesc,
        action: () => navigateTab('LoggingTab'),
      },
      {
        id: 'quality',
        icon: 'chart',
        title: translations.dashboard.sleepQuality,
        description: translations.dashboard.sleepQualityDesc,
        action: () => navigateTab('QualityTab'),
      },
      {
        id: 'alarm',
        icon: 'list',
        title: translations.dashboard.smartAlarm,
        description: translations.dashboard.smartAlarmDesc,
        action: () => navigation?.navigate?.('Alarm'),
      },
      {
        id: 'analysis',
        icon: 'list',
        title: 'Análise Detalhada',
        description: translations.dashboard.detailedAnalysisDesc,
        action: () => navigation?.navigate?.('DetailedAnalysis'),
      },
      {
        id: 'insights',
        icon: 'list',
        title: translations.dashboard.insights,
        description: translations.dashboard.insightsDesc,
        action: () => navigation?.navigate?.('Insights'),
      },
      {
        id: 'coach',
        icon: 'chat',
        title: translations.dashboard.sleepCoach,
        description: translations.dashboard.sleepCoachDesc,
        action: () => navigateTab('CoachTab'),
      },
      {
        id: 'weekly',
        icon: 'chart',
        title: translations.dashboard.weeklyReport,
        description: translations.dashboard.weeklyReportDesc,
        action: () => navigation?.navigate?.('WeeklyReport'),
      },
      {
        id: 'profile',
        icon: 'profile',
        title: translations.dashboard.profile,
        description: translations.dashboard.profileDesc,
        action: () => navigateTab('ProfileTab'),
      },
    ],
    [navigateTab, navigation],
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await appContext.syncWithBackend();
      await appContext.loadGlobalMetrics();
    } catch (error) {
      console.error('[Dashboard] Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [appContext]);

  const renderShortcut = useCallback(
    ({ item }: { item: ShortcutItem }) => (
      <ListItem
        icon={item.icon}
        title={item.title}
        subtitle={item.description}
        onPress={item.action}
      />
    ),
    [],
  );

  return (
    <AppScreen style={styles.screen}>
      <FlatList
        data={shortcuts}
        keyExtractor={(item) => item.id}
        renderItem={renderShortcut}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Header
              title={translations.dashboard.greeting}
              subtitle={new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
              icon="spark"
            />

            <GlassCard variant="elevated" contentStyle={styles.quickActionCard}>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>Registro rápido</Text>
              <Text style={[styles.quickActionDescription, { color: theme.colors.textMuted }]}>Adicione o registro da noite passada em poucos toques.</Text>
              <Button
                title={translations.dashboard.registerSleep}
                onPress={() => navigateTab('LoggingTab')}
                icon="moonStars"
                iconPosition="right"
              />
            </GlassCard>

            <GlassCard variant="default" contentStyle={styles.chartCard}>
              <QualityComparisonChart
                sleepLogs={appContext.sleepLogs}
                globalAverage={appContext.globalQualityAverage}
                userColor={theme.colors.accent}
                globalColor={theme.colors.textSubtle}
                backgroundColor={theme.colors.surface}
                textColor={theme.colors.text}
              />
            </GlassCard>

            {lastSleepLog ? (
              <GlassCard variant="subtle" contentStyle={styles.statusCard}>
                <View style={styles.statusHead}>
                  <Text style={[styles.statusTitle, { color: theme.colors.text }]}>Último registro</Text>
                  <InlineFeedback
                    tone={appContext.syncQueue.some((log) => log.id === lastSleepLog.id) ? 'warning' : 'success'}
                    message={appContext.syncQueue.some((log) => log.id === lastSleepLog.id) ? 'Aguardando sync' : 'Sincronizado'}
                    style={styles.inlineStatus}
                  />
                </View>
                <Text style={[styles.statusValue, { color: theme.colors.accent }]}>Horas: {lastSleepLog.hoursSlept}</Text>
                <Text style={[styles.statusDescription, { color: theme.colors.textMuted }]}>
                  Data: {new Date(lastSleepLog.date).toLocaleDateString('pt-BR')}
                </Text>
              </GlassCard>
            ) : (
              <EmptyState
                title="Sem registros ainda"
                description="Registre seu sono para liberar métricas de tendência e comparações semanais."
                actionLabel={translations.dashboard.registerSleep}
                onAction={() => navigateTab('LoggingTab')}
                icon="moonStars"
              />
            )}

            {appContext.syncQueue.length > 0 ? (
              <InlineFeedback
                tone="warning"
                message={`${appContext.syncQueue.length} registro(s) pendente(s) de sincronização.`}
              />
            ) : null}

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Atalhos</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: {
    gap: 0,
    paddingBottom: 36,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listHeader: {
    gap: 12,
    marginBottom: 12,
  },
  quickActionCard: {
    gap: 10,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  quickActionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  chartCard: {
    gap: 8,
  },
  statusCard: {
    gap: 8,
  },
  statusHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  inlineStatus: {
    minWidth: 130,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusDescription: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  separator: {
    height: 10,
  },
});
