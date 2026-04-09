import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { translations } from '../languages/pt';
import { formatQualityMetrics } from '../utils/sleepQualityCalculations';

interface SleepQualityScreenProps {
    navigation?: any;
}

const { width } = Dimensions.get('window');

export const SleepQualityScreen: React.FC<SleepQualityScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const appContext = useAppContext();
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            // Refresh global metrics when screen comes into focus
            appContext.loadGlobalMetrics();
        }, [appContext])
    );

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await appContext.loadGlobalMetrics();
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const metrics = useMemo(() => {
        const stats = appContext.userQualityStats();
        return formatQualityMetrics(stats);
    }, [appContext.sleepLogs, appContext.globalQualityAverage]);

    const weeklyData = useMemo(() => {
        // Get last 7 days of data
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const log = appContext.sleepLogs.find(l => l.date === dateStr);
            last7Days.push({
                date: dateStr,
                dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
                quality: log ? parseInt(log.quality || '0', 10) : null,
            });
        }
        return last7Days;
    }, [appContext.sleepLogs]);

    const getQualityColor = (quality: number | null) => {
        if (quality === null) return colors.textSecondary;
        if (quality >= 8) return '#10B981'; // excellent
        if (quality >= 6) return '#F59E0B'; // good
        if (quality >= 4) return '#F97316'; // fair
        return '#EF4444'; // poor
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Qualidade do Sono
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Compare sua qualidade com a média global
                </Text>
            </View>

            {/* User Score Card */}
            <View
                style={[
                    styles.scoreCard,
                    {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.scoreContent}>
                    <Text style={styles.scoreLabel}>Sua Qualidade Média</Text>
                    <View style={styles.scoreValue}>
                        <Text style={[styles.scoreNumber, { color: colors.primary }]}>
                            {metrics.averageQualityText}
                        </Text>
                        <Text style={[styles.scoreCategory, { color: colors.textSecondary }]}>
                            {metrics.categoryText}
                        </Text>
                    </View>
                </View>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreStats}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Registros
                        </Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {metrics.totalLogsInPeriod}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Sequência
                        </Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {metrics.currentStreak}d
                        </Text>
                    </View>
                </View>
            </View>

            {/* Comparison Card */}
            <View
                style={[
                    styles.comparisonCard,
                    {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Text style={[styles.comparisonTitle, { color: colors.text }]}>
                    Comparação com Média Global
                </Text>
                <View style={styles.comparisonBars}>
                    {/* User Bar */}
                    <View style={styles.barRow}>
                        <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                            Você
                        </Text>
                        <View
                            style={[
                                styles.barBackground,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                            ]}
                        >
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        width: `${Math.min((metrics.averageQuality / 10) * 100, 100)}%`,
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.barValue, { color: colors.text }]}>
                            {metrics.averageQualityText}
                        </Text>
                    </View>

                    {/* Global Bar */}
                    <View style={styles.barRow}>
                        <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                            Global
                        </Text>
                        <View
                            style={[
                                styles.barBackground,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                            ]}
                        >
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        width: `${Math.min((metrics.globalAverage / 10) * 100, 100)}%`,
                                        backgroundColor: '#94A3B8',
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.barValue, { color: colors.text }]}>
                            {metrics.globalAverage.toFixed(1)}/10
                        </Text>
                    </View>
                </View>

                {/* Percentile Info */}
                <View
                    style={[
                        styles.percentileInfo,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.percentileEmoji, { color: colors.primary }]}>
                        {metrics.percentile >= 75 ? '🏆' : metrics.percentile >= 50 ? '👍' : '💪'}
                    </Text>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.percentileText, { color: colors.text }]}>
                            Você está no {metrics.percentileText}
                        </Text>
                        <Text style={[styles.percentileSubtext, { color: colors.textSecondary }]}>
                            {metrics.percentile >= 75
                                ? 'Excelente! Melhor que a maioria'
                                : metrics.percentile >= 50
                                ? 'Acima da média'
                                : 'Continue melhorando!'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Trend Card */}
            <View
                style={[
                    styles.trendCard,
                    {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.trendHeader}>
                    <Text style={[styles.trendTitle, { color: colors.text }]}>
                        Tendência
                    </Text>
                    <Text style={[styles.trendStatus, { color: colors.primary }]}>
                        {metrics.trendText}
                    </Text>
                </View>
                <Text style={[styles.trendDescription, { color: colors.textSecondary }]}>
                    {metrics.trend === 'improving'
                        ? 'Sua qualidade de sono está melhorando! 📈'
                        : metrics.trend === 'declining'
                        ? 'Sua qualidade de sono está piorando. Tente melhorar seus hábitos. 📉'
                        : 'Sua qualidade de sono está estável. Continue assim! ➡️'}
                </Text>
            </View>

            {/* Weekly Summary */}
            <View
                style={[
                    styles.weeklyCard,
                    {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Text style={[styles.weeklyTitle, { color: colors.text }]}>
                    Qualidade por Dia (Últimos 7 dias)
                </Text>
                <View style={styles.weeklyGrid}>
                    {weeklyData.map((day, index) => (
                        <View key={index} style={styles.dayItem}>
                            <Text style={[styles.dayName, { color: colors.textSecondary }]}>
                                {day.dayName}
                            </Text>
                            <View
                                style={[
                                    styles.dayQualityBox,
                                    {
                                        backgroundColor: day.quality
                                            ? getQualityColor(day.quality)
                                            : colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayQualityText,
                                        {
                                            color: day.quality
                                                ? 'white'
                                                : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {day.quality !== null ? day.quality : '—'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
                onPress={() => navigation?.navigate('SleepLogging')}
                style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            >
                <Text style={styles.ctaButtonText}>Registrar Novo Sono →</Text>
            </TouchableOpacity>
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
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.title,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.caption,
    },
    scoreCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    scoreContent: {
        marginBottom: spacing.md,
    },
    scoreLabel: {
        fontSize: typography.caption,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: spacing.sm,
    },
    scoreValue: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.sm,
    },
    scoreNumber: {
        fontSize: 42,
        fontWeight: '700',
    },
    scoreCategory: {
        fontSize: typography.caption,
    },
    scoreDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: spacing.md,
    },
    scoreStats: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: typography.small,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: typography.subtitle,
        fontWeight: '700',
    },
    comparisonCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    comparisonTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    comparisonBars: {
        gap: spacing.lg,
        marginBottom: spacing.lg,
    },
    barRow: {
        width: '100%',
    },
    barLabel: {
        fontSize: typography.small,
        marginBottom: spacing.sm,
    },
    barBackground: {
        height: 24,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
        borderWidth: 1,
        flexDirection: 'row',
    },
    barFill: {
        height: '100%',
        borderRadius: borderRadius.sm,
    },
    barValue: {
        fontSize: typography.small,
        fontWeight: '600',
        marginTop: spacing.xs,
    },
    percentileInfo: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    percentileEmoji: {
        fontSize: 28,
    },
    percentileText: {
        fontSize: typography.caption,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    percentileSubtext: {
        fontSize: typography.small,
    },
    trendCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    trendTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
    },
    trendStatus: {
        fontSize: typography.caption,
        fontWeight: '600',
    },
    trendDescription: {
        fontSize: typography.caption,
    },
    weeklyCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    weeklyTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    weeklyGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    dayName: {
        fontSize: typography.small,
        fontWeight: '500',
    },
    dayQualityBox: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    dayQualityText: {
        fontSize: typography.caption,
        fontWeight: '700',
    },
    ctaButton: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        marginTop: spacing.lg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    ctaButtonText: {
        color: 'white',
        fontSize: typography.subtitle,
        fontWeight: '700',
    },
});
