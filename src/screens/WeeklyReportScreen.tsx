import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { QualityComparisonChart } from '../components/QualityComparisonChart';

const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const WeeklyReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const appContext = useAppContext();

  const last7DaysLogs = useMemo(() => {
    if (!appContext.sleepLogs) return [];
    // take logs from the last 7 calendar days (best-effort)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return appContext.sleepLogs
      .filter(l => l.timestamp >= sevenDaysAgo)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [appContext.sleepLogs]);

  const weeklyHours = useMemo(() => {
    if (!last7DaysLogs || last7DaysLogs.length === 0) return 0;
    const total = last7DaysLogs.reduce((s, l) => s + Number(l.hoursSlept || 0), 0);
    return total / last7DaysLogs.length;
  }, [last7DaysLogs]);

  const weeklyScore = useMemo(() => {
    // crude mapping: average hours -> score (0-100) and fallback to appContext.metrics if available
    const score = Math.round((Math.min(9, weeklyHours) / 9) * 100);
    return score || 0;
  }, [weeklyHours]);

  const changeVsPrevWeek = useMemo(() => {
    // placeholder calculation: compare with previous 7-14 day period
    // find logs between 7-14 days ago
    if (!appContext.sleepLogs) return 0;
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const prev = appContext.sleepLogs
      .filter(l => l.timestamp >= fourteenDaysAgo && l.timestamp < sevenDaysAgo);
    const prevAvg = prev.length ? prev.reduce((s, l) => s + Number(l.hoursSlept || 0), 0) / prev.length : weeklyHours;
    const prevScore = Math.round((Math.min(9, prevAvg) / 9) * 100);
    return weeklyScore - prevScore;
  }, [appContext.sleepLogs, weeklyHours, weeklyScore]);

  const quickCards = [
    { key: 'sonoMedio', title: 'Sono médio', value: `${Math.floor(weeklyHours)}h${Math.round((weeklyHours%1)*60).toString().padStart(2,'0')}` },
    { key: 'usoNoturno', title: 'Uso noturno', value: 'Alto' },
    { key: 'consistencia', title: 'Consistência', value: 'Baixa' },
    { key: 'descanso', title: 'Recuperação', value: 'Baixa' },
  ];

  const perDay = useMemo(() => {
    // produce array for last 7 days with hours (fill missing days with 0)
    const now = new Date();
    const result: { label: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const dayIso = d.toISOString().slice(0, 10);
      const log = appContext.sleepLogs?.find(l => l.date === dayIso);
      result.push({ label: dayLabel, hours: log ? Number(log.hoursSlept || 0) : 0 });
    }
    return result;
  }, [appContext.sleepLogs]);

  // patterns & insight placeholders — in production these come from rules/LLM
  const detectedPatterns = [
    'Dormes mais tarde às quintas e sextas.',
    'Seu pior sono costuma ocorrer após noites com uso do celular após 00h.',
    'Tende a compensar o sono no fim de semana.',
  ];

  const mainInsight = 'Seu uso do celular após meia-noite nos dias úteis está reduzindo sua consistência de sono e afetando a recuperação.';

  const comparisonWithBase = [
    'Dormiu menos que 64% das pessoas',
    'Uso noturno maior que 78% da população',
    'Consistência abaixo da média',
  ];

  const recommendations = [
    'Evite celular após 23h durante a semana',
    'Tente manter horário de sono estável (±30min)',
    'Não compense sono no fim de semana',
  ];

  const last3Weeks = [72, weeklyScore, Math.max(0, weeklyScore - 4)];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      {/* Hero: weekly score */}
      <View style={[styles.hero, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Sua semana de sono</Text>
        <View style={styles.heroRow}>
          <Text style={[styles.heroScore, { color: colors.primary }]}>{weeklyScore} <Text style={[styles.heroSlash]}>/ 100</Text></Text>
          <Text style={[styles.heroChange, { color: changeVsPrevWeek < 0 ? '#EF4444' : '#10B981' }]}>{changeVsPrevWeek >= 0 ? `+${changeVsPrevWeek}` : `${changeVsPrevWeek}`} pts vs semana passada</Text>
        </View>
      </View>

      {/* Quick cards */}
      <View style={styles.cardsRow}>
        {quickCards.map(c => (
          <View key={c.key} style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.quickCardTitle, { color: colors.text }]}>{c.title}</Text>
            <Text style={[styles.quickCardValue, { color: colors.text }]}>{c.value}</Text>
          </View>
        ))}
      </View>

      {/* Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Horas por dia</Text>
        <QualityComparisonChart
          sleepLogs={appContext.sleepLogs}
          globalAverage={appContext.globalQualityAverage}
          userColor={colors.primary}
          globalColor="#94A3B8"
          backgroundColor={colors.surfaceElevated}
          textColor={colors.text}
        />
        <View style={styles.perDayRow}>
          {perDay.map(p => (
            <View key={p.label} style={styles.dayBarContainer}>
              <Text style={[styles.dayLabel, { color: colors.text }]}>{p.label}</Text>
              <View style={[styles.dayBar, { height: Math.min(120, p.hours * 14), backgroundColor: colors.primary }]} />
              <Text style={[styles.dayValue, { color: colors.textSecondary }]}>{p.hours}h</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Patterns detected */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Padrões detectados</Text>
        {detectedPatterns.map(p => (
          <Text key={p} style={[styles.listItem, { color: colors.textSecondary }]}>• {p}</Text>
        ))}
      </View>

      {/* Main insight */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Insight principal</Text>
        <Text style={[styles.insightText, { color: colors.text }]}>{mainInsight}</Text>
      </View>

      {/* Comparison with base */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Comparação com a base</Text>
        {comparisonWithBase.map(p => (
          <Text key={p} style={[styles.listItem, { color: colors.textSecondary }]}>• {p}</Text>
        ))}
      </View>

      {/* Recommendations */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recomendações para próxima semana</Text>
        {recommendations.map(r => (
          <Text key={r} style={[styles.listItem, { color: colors.text }]}>{'• '}{r}</Text>
        ))}
      </View>

      {/* Evolution */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Evolução</Text>
        <Text style={[styles.evoText, { color: colors.textSecondary }]}>{last3Weeks.join(' → ')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1 },
  heroTitle: { fontSize: typography.caption, fontWeight: '700', marginBottom: spacing.sm },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroScore: { fontSize: 40, fontWeight: '800' },
  heroSlash: { fontSize: 16, fontWeight: '700', color: 'gray' },
  heroChange: { fontSize: typography.small },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  quickCard: { width: '50%', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1 },
  quickCardTitle: { fontSize: typography.caption, fontWeight: '600' },
  quickCardValue: { fontSize: typography.subtitle, fontWeight: '700', marginTop: spacing.xs },
  chartCard: { borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1 },
  sectionTitle: { fontSize: typography.caption, fontWeight: '700', marginBottom: spacing.sm },
  perDayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  dayBarContainer: { alignItems: 'center', width: `${100/7}%` },
  dayLabel: { fontSize: typography.small, marginBottom: spacing.xs },
  dayBar: { width: 12, borderRadius: 6, marginBottom: spacing.xs },
  dayValue: { fontSize: 12 },
  sectionCard: { borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1 },
  listItem: { fontSize: typography.small, marginBottom: spacing.xs },
  insightText: { fontSize: typography.caption, fontWeight: '600' },
  evoText: { fontSize: typography.caption, fontWeight: '700' },
});

export default WeeklyReportScreen;
