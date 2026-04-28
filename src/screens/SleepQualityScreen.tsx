import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { formatQualityMetrics } from '../utils/sleepQualityCalculations';
import { AppScreen, Button, GlassCard, Header } from '../components/ui';
import { EmptyState, InlineFeedback } from '../components/states';

interface SleepQualityScreenProps {
  navigation?: any;
}

export const SleepQualityScreen: React.FC<SleepQualityScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      appContext.loadGlobalMetrics();
    }, [appContext]),
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await appContext.loadGlobalMetrics();
    } finally {
      setRefreshing(false);
    }
  }, [appContext]);

  const metrics = useMemo(() => formatQualityMetrics(appContext.userQualityStats()), [appContext]);

  const weeklyData = useMemo(() => {
    const rows: Array<{ day: string; quality: number | null }> = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = appContext.sleepLogs.find((entry) => entry.date === dateStr);
      rows.push({
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        quality: log ? parseInt(log.quality || '0', 10) : null,
      });
    }
    return rows;
  }, [appContext.sleepLogs]);

  const trendTone = metrics.trend === 'improving' ? 'success' : metrics.trend === 'declining' ? 'warning' : 'info';

  const navigateTab = useCallback(
    (tabName: string) => {
      const parent = navigation?.getParent?.();
      if (parent?.navigate) parent.navigate(tabName);
    },
    [navigation],
  );

  if (appContext.sleepLogs.length === 0) {
    return (
      <AppScreen>
        <Header title="Qualidade do sono" subtitle="Sem registros ainda" icon="chart" />
        <EmptyState
          title="Sem dados suficientes"
          description="Adicione registros para liberar comparações, tendência e análise semanal."
          actionLabel="Registrar primeiro sono"
          onAction={() => navigateTab('LoggingTab')}
          icon="moonStars"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}
      >
        <Header
          title="Qualidade do sono"
          subtitle="Comparativo entre sua evolução recente e a referência global"
          icon="chart"
        />

        <GlassCard variant="elevated" contentStyle={styles.metricsCard}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Média da semana</Text>
          <Text style={[styles.value, { color: theme.colors.accent }]}>{metrics.averageQualityText}</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricTitle, { color: theme.colors.textMuted }]}>Registros</Text>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{metrics.totalLogsInPeriod}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricTitle, { color: theme.colors.textMuted }]}>Sequência</Text>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{metrics.currentStreak} dia(s)</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricTitle, { color: theme.colors.textMuted }]}>Percentil</Text>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{metrics.percentileText}</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard variant="default" contentStyle={styles.compareCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Comparação com a média global</Text>

          <View style={styles.rowBar}>
            <Text style={[styles.barLabel, { color: theme.colors.textMuted }]}>Você</Text>
            <View style={[styles.barTrack, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.pill }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min((metrics.averageQuality / 10) * 100, 100)}%`,
                    backgroundColor: theme.colors.accent,
                    borderRadius: theme.radius.pill,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barValue, { color: theme.colors.text }]}>{metrics.averageQualityText}</Text>
          </View>

          <View style={styles.rowBar}>
            <Text style={[styles.barLabel, { color: theme.colors.textMuted }]}>Global</Text>
            <View style={[styles.barTrack, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.pill }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min((metrics.globalAverage / 10) * 100, 100)}%`,
                    backgroundColor: theme.colors.textSubtle,
                    borderRadius: theme.radius.pill,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barValue, { color: theme.colors.text }]}>{metrics.globalAverage.toFixed(1)}/10</Text>
          </View>
        </GlassCard>

        <InlineFeedback
          tone={trendTone}
          message={`Tendência atual: ${metrics.trendText}. Categoria geral: ${metrics.categoryText}.`}
        />

        <GlassCard variant="subtle" contentStyle={styles.weekGridCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Últimos 7 dias</Text>
          <View style={styles.weekGrid}>
            {weeklyData.map((day) => {
              const quality = day.quality;
              const tone =
                quality === null
                  ? theme.colors.surface
                  : quality >= 8
                    ? 'rgba(52, 211, 153, 0.32)'
                    : quality >= 6
                      ? 'rgba(125, 211, 252, 0.32)'
                      : quality >= 4
                        ? 'rgba(251, 191, 36, 0.32)'
                        : 'rgba(248, 113, 113, 0.32)';

              return (
                <View key={`${day.day}-${quality}`} style={styles.dayCol}>
                  <Text style={[styles.dayLabel, { color: theme.colors.textMuted }]}>{day.day}</Text>
                  <View
                    style={[
                      styles.dayBox,
                      {
                        borderRadius: theme.radius.md,
                        borderColor: theme.colors.border,
                        backgroundColor: tone,
                      },
                    ]}
                  >
                    <Text style={[styles.dayValue, { color: theme.colors.text }]}>{quality ?? '-'}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        <View style={styles.actions}>
          <Button title="Registrar novo sono" onPress={() => navigateTab('LoggingTab')} icon="moonStars" iconPosition="right" />
          <Button title="Abrir relatório semanal" onPress={() => navigation?.navigate?.('WeeklyReport')} variant="secondary" icon="chart" iconPosition="right" />
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: {
    gap: 12,
    paddingBottom: 30,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  metricsCard: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 44,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricItem: {
    flex: 1,
    gap: 4,
  },
  metricTitle: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  compareCard: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowBar: {
    gap: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  barTrack: {
    borderWidth: 1,
    height: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  barValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  weekGridCard: {
    gap: 10,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayBox: {
    alignItems: 'center',
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dayValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
