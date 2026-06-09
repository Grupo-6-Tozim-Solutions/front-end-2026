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
import { getInsights, InsightItem } from '../services/api';
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

      // Chamada real para o backend Python
      const data = await getInsights(appContext.userData, appContext.sleepLogs);
      setInsights(data);
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
      case 'estresse':
        return 'brain';
      case 'consistencia':
        return 'trendUp';
      default:
        return 'spark';
    }
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
          title="Insights de IA"
          subtitle="Comparações em tempo real entre seus dados e a população"
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
                Geramos esses insights analisando seu perfil e cruzando-o com dados reais de saúde e estatísticas populacionais do sistema.
              </Text>
            </View>

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
    fontSize: 18,
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
});
