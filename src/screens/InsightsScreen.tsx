import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { getInsights, InsightItem, ComparisonMetrics } from '../services/api';
import { AppScreen, Button, GlassCard, Header } from '../components/ui';
import { AppIcon, AppIconName } from '../components/ui/AppIcon';
import { EmptyState, InlineFeedback } from '../components/states';
import { RootStackParamList } from '../navigation/AppNavigator';

interface InsightsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const appContext = useAppContext();

  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async (isRefresh = false) => {
    if (!appContext.userData) {
      setError('Complete seu perfil de onboarding primeiro para gerar insights.');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Chamada real para o backend Python (retorna { insights, comparison_metrics })
      const data = await getInsights(appContext.userData, appContext.sleepLogs);
      setInsights(data.insights);
      setMetrics(data.comparison_metrics);
    } catch (err) {
      console.error('[InsightsScreen] Error loading insights:', err);
      setError('Não foi possível conectar ao servidor para gerar seus insights de IA. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appContext.userData, appContext.sleepLogs]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const onRefresh = useCallback(() => {
    loadInsights(true);
  }, [loadInsights]);

  // Auxiliares para estilizar conforme gravidade
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          color: theme.colors.danger,
          bg: 'rgba(248, 113, 113, 0.12)',
          label: 'Atenção Crítica',
          icon: 'warning' as AppIconName,
        };
      case 'medium':
        return {
          color: theme.colors.warning,
          bg: 'rgba(251, 191, 36, 0.12)',
          label: 'Alerta de Rotina',
          icon: 'info' as AppIconName,
        };
      case 'low':
      default:
        return {
          color: theme.colors.success,
          bg: 'rgba(52, 211, 153, 0.12)',
          label: 'Bom Sinal',
          icon: 'checkCircle' as AppIconName,
        };
    }
  };

  // Ícones específicos por categoria
  const getCategoryIcon = (category: string): AppIconName => {
    switch (category) {
      case 'tempo_tela':
        return 'flame';
      case 'duracao_sono':
        return 'moonStars';
      case 'estresse_qualidade':
      case 'estresse':
        return 'brain';
      case 'consistencia':
        return 'trendUp';
      default:
        return 'spark';
    }
  };

  // Renderiza uma linha de medidor comparativo no dashboard de KPIs
  const renderKpiMetric = (
    title: string,
    userVal: number,
    popVal: number,
    maxValue: number,
    unit: string,
    lowerIsBetter = false
  ) => {
    const userPercent = Math.min(100, (userVal / maxValue) * 100);
    const popPercent = Math.min(100, (popVal / maxValue) * 100);
    
    // Determinar se o usuário está melhor ou pior que a população
    let isBetter = false;
    if (lowerIsBetter) {
      isBetter = userVal <= popVal;
    } else {
      isBetter = userVal >= popVal;
    }

    const metricColor = isBetter ? theme.colors.success : theme.colors.warning;

    return (
      <View style={styles.kpiRow}>
        <View style={styles.kpiRowHeader}>
          <Text style={[styles.kpiRowTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.kpiRowValues, { color: theme.colors.textSubtle }]}>
            Você:{' '}
            <Text style={{ color: metricColor, fontWeight: 'bold' }}>
              {userVal.toFixed(1)}
              {unit}
            </Text>{' '}
            | Pop: {popVal.toFixed(1)}
            {unit}
          </Text>
        </View>

        {/* Medidor visual */}
        <View style={[styles.gaugeTrack, { backgroundColor: theme.colors.background }]}>
          {/* Barra do Usuário */}
          <View
            style={[
              styles.gaugeFill,
              {
                width: `${userPercent}%`,
                backgroundColor: metricColor,
              },
            ]}
          />
          {/* Marcador da População */}
          <View
            style={[
              styles.gaugeMarker,
              {
                left: `${popPercent}%`,
                backgroundColor: theme.colors.white,
              },
            ]}
          />
        </View>

        <Text style={[styles.kpiFeedbackText, { color: theme.colors.textSubtle }]}>
          {isBetter 
            ? `Seu índice está saudável em comparação ao benchmark populacional.` 
            : `Foco de melhoria recomendado: seu índice está abaixo da referência populacional.`}
        </Text>
      </View>
    );
  };

  return (
    <AppScreen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        <Header
          title="Insights & Métricas"
          subtitle="Análise personalizada e comparação de KPIs com a população"
          icon="brain"
        />

        {loading ? (
          <View style={styles.centerContainer}>
            <GlassCard variant="elevated" contentStyle={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
                Analisando seus padrões de sono...
              </Text>
              <Text style={[styles.loadingDescription, { color: theme.colors.textMuted }]}>
                Cruzando dados de hábitos de tela e buscando benchmarks populacionais no banco de dados.
              </Text>
            </GlassCard>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <InlineFeedback tone="danger" message={error} />
            <Button
              title="Tentar novamente"
              onPress={() => loadInsights(false)}
              icon="cloudSync"
              style={styles.retryButton}
            />
          </View>
        ) : insights.length === 0 ? (
          <EmptyState
            title="Nenhum insight disponível"
            description="Registre mais dados no diário de sono para liberar insights preditivos."
            actionLabel="Ir para registros"
            onAction={() => {
              const parent = navigation.getParent();
              if (parent?.navigate) {
                parent.navigate('LoggingTab');
              }
            }}
            icon="moonStars"
          />
        ) : (
          <View style={styles.insightsList}>
            <View style={styles.introCard}>
              <Text style={[styles.introText, { color: theme.colors.textMuted }]}>
                Geramos esses 3 insights cruzando seus dados com as estatísticas reais no nosso banco de dados.
              </Text>
            </View>

            {/* Renderização dos 3 insights de IA */}
            {insights.map((insight) => {
              const styleMeta = getSeverityStyle(insight.severity);
              const categoryIcon = getCategoryIcon(insight.category);

              return (
                <GlassCard key={insight.id} variant="elevated" style={styles.cardContainer}>
                  <View style={styles.cardHeader}>
                    {/* Badge de categoria com ícone correspondente */}
                    <View style={[styles.badge, { backgroundColor: theme.colors.surfaceStrong }]}>
                      <AppIcon name={categoryIcon} size={14} color={theme.colors.accent} style={styles.badgeIcon} />
                      <Text style={[styles.badgeText, { color: theme.colors.textMuted }]}>
                        {insight.category.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>

                    {/* Badge de severidade */}
                    <View style={[styles.severityBadge, { backgroundColor: styleMeta.bg }]}>
                      <AppIcon name={styleMeta.icon} size={12} color={styleMeta.color} style={styles.badgeIcon} />
                      <Text style={[styles.severityText, { color: styleMeta.color }]}>
                        {styleMeta.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
                    {insight.title}
                  </Text>

                  <Text style={[styles.insightDescription, { color: theme.colors.textMuted }]}>
                    {insight.description}
                  </Text>

                  <View style={[styles.recommendationBox, { backgroundColor: theme.colors.accentSoft }]}>
                    <View style={styles.recommendationHeader}>
                      <AppIcon name="spark" size={14} color={theme.colors.accent} style={styles.badgeIcon} />
                      <Text style={[styles.recommendationTitle, { color: theme.colors.accent }]}>
                        RECOMENDAÇÃO PRÁTICA:
                      </Text>
                    </View>
                    <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
                      {insight.recommendation}
                    </Text>
                  </View>
                </GlassCard>
              );
            })}

            {/* Seção do Dashboard comparativo de KPIs */}
            {metrics && (
              <View style={styles.dashboardSection}>
                <View style={styles.sectionHeader}>
                  <AppIcon name="chart" size={18} color={theme.colors.accent} style={styles.badgeIcon} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Painel Comparativo de KPIs
                  </Text>
                </View>
                
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                  Veja como suas métricas recentes se comparam aos benchmarks históricos da população.
                </Text>

                <GlassCard variant="default" style={styles.dashboardCard}>
                  {renderKpiMetric(
                    'Duração do Sono',
                    metrics.user_sleep_hours,
                    metrics.pop_sleep_hours,
                    12,
                    'h'
                  )}
                  
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                  {renderKpiMetric(
                    'Qualidade do Sono',
                    metrics.user_sleep_quality,
                    metrics.pop_sleep_quality,
                    10,
                    '/10'
                  )}
                  
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                  {renderKpiMetric(
                    'Nível de Estresse',
                    metrics.user_stress_level,
                    metrics.pop_stress_level,
                    10,
                    '/10',
                    true // lower stress is better
                  )}
                </GlassCard>
                
                <View style={styles.dashboardLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: theme.colors.white }]} />
                    <Text style={[styles.legendLabel, { color: theme.colors.textSubtle }]}>Referência Populacional</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
    textAlign: 'center',
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  loadingDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  errorContainer: {
    gap: 16,
    marginTop: 20,
  },
  retryButton: {
    alignSelf: 'center',
    minWidth: 180,
  },
  insightsList: {
    gap: 16,
  },
  introCard: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardContainer: {
    gap: 12,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  severityBadge: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  recommendationBox: {
    borderRadius: 12,
    marginTop: 8,
    padding: 12,
  },
  recommendationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  recommendationTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recommendationText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  dashboardSection: {
    gap: 10,
    marginTop: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  dashboardCard: {
    gap: 16,
    padding: 16,
  },
  kpiRow: {
    gap: 8,
  },
  kpiRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  kpiRowValues: {
    fontSize: 13,
  },
  gaugeTrack: {
    borderRadius: 6,
    height: 10,
    position: 'relative',
    width: '100%',
  },
  gaugeFill: {
    borderRadius: 6,
    height: '100%',
  },
  gaugeMarker: {
    height: 14,
    marginTop: -2,
    position: 'absolute',
    top: 0,
    width: 3,
  },
  kpiFeedbackText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  dashboardLegend: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendIndicator: {
    borderRadius: 2,
    height: 10,
    width: 3,
  },
  legendLabel: {
    fontSize: 11,
  },
});
