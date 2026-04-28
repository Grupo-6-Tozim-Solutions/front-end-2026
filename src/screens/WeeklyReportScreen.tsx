import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { AppScreen, Button, GlassCard, Header } from '../components/ui';
import { QualityComparisonChart } from '../components/QualityComparisonChart';
import { EmptyState } from '../components/states';
import { generateWeeklyAISummary } from '../services/aiAnalysisService';
import { calculateAverageHours, filterLogsWithRecordedSleep, hasRecordedSleep, parseHoursSlept } from '../utils/sleepMetrics';

const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

interface WeeklyReportScreenProps {
  navigation?: any;
}

export const WeeklyReportScreen: React.FC<WeeklyReportScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const last7DaysLogs = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return appContext.sleepLogs
      .filter((log) => log.timestamp >= sevenDaysAgo)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [appContext.sleepLogs]);

  const weeklyHours = useMemo(() => {
    return calculateAverageHours(last7DaysLogs);
  }, [last7DaysLogs]);

  const last7DaysWithSleep = useMemo(() => filterLogsWithRecordedSleep(last7DaysLogs), [last7DaysLogs]);

  const weeklyScore = useMemo(() => Math.round((Math.min(9, weeklyHours) / 9) * 100), [weeklyHours]);

  const changeVsPrevWeek = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const previous = appContext.sleepLogs.filter((log) => log.timestamp >= fourteenDaysAgo && log.timestamp < sevenDaysAgo);
    const previousAvg = calculateAverageHours(previous) || weeklyHours;
    const previousScore = Math.round((Math.min(9, previousAvg) / 9) * 100);
    return weeklyScore - previousScore;
  }, [appContext.sleepLogs, weeklyHours, weeklyScore]);

  const perDay = useMemo(() => {
    const now = new Date();
    const result: Array<{ label: string; hours: number }> = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const dayIso = date.toISOString().slice(0, 10);
      const log = appContext.sleepLogs.find((entry) => entry.date === dayIso);
      result.push({ label: dayLabel, hours: hasRecordedSleep(log) ? parseHoursSlept(log.hoursSlept) : 0 });
    }

    return result;
  }, [appContext.sleepLogs]);

  // Gerar resumo com IA quando os dados mudarem
  useEffect(() => {
    if (last7DaysWithSleep.length > 0) {
      console.log('[WeeklyReport] Dados calculados:', {
        weeklyHours: weeklyHours.toFixed(2),
        weeklyScore,
        changeVsPrevWeek,
        last7DaysLogs: last7DaysWithSleep.length,
      });
      generateAISummary();
    } else {
      setAiSummary('Registre noites com horas dormidas para gerar próximos passos personalizados.');
    }
  }, [last7DaysWithSleep.length, weeklyHours, weeklyScore, changeVsPrevWeek]);

  const generateAISummary = async () => {
    try {
      setIsLoadingAI(true);
      setAiSummary(null);

      console.log('[WeeklyReport] Chamando serviço de IA com parâmetros:', {
        weeklyScore,
        weeklyHours: weeklyHours.toFixed(2),
        changeVsPrevWeek,
        daysLogged: last7DaysWithSleep.length,
      });
      
      const summary = await generateWeeklyAISummary(
        weeklyScore,
        weeklyHours,
        changeVsPrevWeek,
        last7DaysWithSleep.length
      );
      
      setAiSummary(summary);
      console.log('[WeeklyReport] AI Summary gerado com sucesso');
    } catch (error) {
      console.error('[WeeklyReport] Erro ao gerar resumo com IA:', error);
      // Se falhar, usar resumo padrão
      setAiSummary('Dados insuficientes para gerar análise. Tente novamente.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (!appContext.sleepLogs.length) {
    return (
      <AppScreen>
        <Header title="Relatório semanal" subtitle="Sem dados suficientes" icon="chart" />
        <EmptyState
          title="Ainda não há dados para o relatório"
          description="Registre algumas noites para receber análise semanal e recomendações." 
          actionLabel="Registrar sono"
          onAction={() => navigation?.getParent?.()?.navigate?.('LoggingTab')}
          icon="moonStars"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <Header
        title="Relatório semanal"
        subtitle="Resumo consolidado da sua semana de sono"
        icon="chart"
      />

      <GlassCard variant="elevated" contentStyle={styles.heroCard}>
        <Text style={[styles.heroLabel, { color: theme.colors.textMuted }]}>Pontuação da semana</Text>
        <View style={styles.heroRow}>
          <Text style={[styles.heroValue, { color: theme.colors.accent }]}>{weeklyScore}/100</Text>
          <Text style={[styles.heroDelta, { color: changeVsPrevWeek >= 0 ? theme.colors.success : theme.colors.warning }]}>
            {changeVsPrevWeek >= 0 ? '+' : ''}
            {changeVsPrevWeek} pts vs semana anterior
          </Text>
        </View>
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

      <GlassCard variant="subtle" contentStyle={styles.dayCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Horas por dia</Text>
        <View style={styles.dayRow}>
          {perDay.map((entry) => (
            <View key={entry.label} style={styles.dayCol}>
              <Text style={[styles.dayLabel, { color: theme.colors.textMuted }]}>{entry.label}</Text>
              <View style={[styles.dayBarWrap, { borderRadius: theme.radius.sm, backgroundColor: theme.colors.surface }]}>
                <View
                  style={[
                    styles.dayBar,
                    {
                      height: Math.min(90, entry.hours * 12),
                      borderRadius: theme.radius.sm,
                      backgroundColor: theme.colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayValue, { color: theme.colors.text }]}>{entry.hours.toFixed(0)}h</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <GlassCard variant="default" contentStyle={styles.summaryCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Resumo e próximos passos</Text>
        
        {isLoadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
              Gerando análise com IA...
            </Text>
          </View>
        ) : aiSummary ? (
          <Text style={[styles.summaryText, { color: theme.colors.textMuted }]}>
            {aiSummary}
          </Text>
        ) : (
          <Text style={[styles.summaryText, { color: theme.colors.textMuted }]}>
            Não foi possível gerar análise. Tente novamente.
          </Text>
        )}
      </GlassCard>

      <View style={styles.actions}>
        <Button title="Registrar nova noite" onPress={() => navigation?.getParent?.()?.navigate?.('LoggingTab')} icon="moonStars" iconPosition="right" />
        <Button title="Ver qualidade detalhada" onPress={() => navigation?.goBack?.()} variant="secondary" icon="arrowLeft" />
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    gap: 8,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 42,
  },
  heroDelta: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartCard: {
    gap: 8,
  },
  dayCard: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayBarWrap: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'flex-end',
    width: 14,
  },
  dayBar: {
    width: '100%',
  },
  dayValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    gap: 6,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    gap: 10,
    paddingBottom: 20,
  },
});
