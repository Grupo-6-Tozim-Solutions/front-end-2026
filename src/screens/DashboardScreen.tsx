import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Button,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { translations } from '../languages/pt';
import { QualityComparisonChart } from '../components/QualityComparisonChart';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface DashboardScreenProps {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
}

interface MenuItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    route: keyof RootStackParamList; // Enforce route matches RootStackParamList keys
    color: string;
    isPrimary?: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const appContext = useAppContext();
    const [refreshing, setRefreshing] = useState(false);
    const [lastSleepLog, setLastSleepLog] = useState<any>(null);

    useFocusEffect(
        React.useCallback(() => {
            updateLastSleepLog();
        }, [appContext.sleepLogs])
    );

    const updateLastSleepLog = () => {
        if (appContext.sleepLogs && appContext.sleepLogs.length > 0) {
            setLastSleepLog(appContext.sleepLogs[0]);
        } else {
            setLastSleepLog(null);
        }
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await appContext.syncWithBackend();
            updateLastSleepLog();
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const menuItems: MenuItem[] = [
        {
            id: 'sleep-logging',
            icon: '😴',
            title: translations.dashboard.registerSleep,
            description: translations.dashboard.registerSleepDesc,
            route: 'SleepLogging',
            color: '#6366F1',
            isPrimary: true,
        },
        {
            id: 'sleep-quality',
            icon: '⭐',
            title: translations.dashboard.sleepQuality,
            description: translations.dashboard.sleepQualityDesc,
            route: 'SleepQuality',
            color: '#F59E0B',
        },
        {
            id: 'clock',
            icon: '⏰',
            title: translations.dashboard.detailedAnalysis,
            description: translations.dashboard.detailedAnalysisDesc,
            route: 'DetailedAnalysis',
            color: '#8B5CF6',
        },
        {
            id: 'insights',
            icon: '💡',
            title: translations.dashboard.insights,
            description: translations.dashboard.insightsDesc,
            route: 'InsightsScreen',
            color: '#EC4899',
        },
        {
            id: 'sleep-coach',
            icon: '🤖',
            title: translations.dashboard.sleepCoach,
            description: translations.dashboard.sleepCoachDesc,
            route: 'SleepCoach',
            color: '#06B6D4',
        },
        {
            id: 'weekly-report',
            icon: '📈',
            title: translations.dashboard.weeklyReport,
            description: translations.dashboard.weeklyReportDesc,
            route: 'WeeklyReport',
            color: '#F59E0B',
        },
        {
            id: 'profile',
            icon: '👤',
            title: translations.dashboard.profile,
            description: translations.dashboard.profileDesc,
            route: 'Profile',
            color: '#64748B',
        },
    ];

    const handleMenuItemPress = (item: MenuItem) => {
        console.log('[Dashboard] Navigating to:', item.route);
        navigation?.navigate(item.route);
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
                <View>
                    <Text style={[styles.greeting, { color: colors.text }]}>
                        {translations.dashboard.greeting}
                    </Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {new Date().toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>
            </View>

            {/* Chart: Quality Comparison */}
            <QualityComparisonChart
                sleepLogs={appContext.sleepLogs}
                globalAverage={appContext.globalQualityAverage}
                userColor={colors.primary}
                globalColor="#94A3B8"
                backgroundColor={colors.surfaceElevated}
                textColor={colors.text}
            />

            {/* Last Sleep Log Card */}
            {lastSleepLog && (
                <View
                    style={[
                        styles.statusCard,
                        {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={styles.statusEmoji}>😴</Text>
                    <View style={styles.statusContent}>
                        <Text style={[styles.statusTitle, { color: colors.text }]}>
                            {translations.dashboard.lastNightSleep}
                        </Text>
                        <Text
                            style={[styles.statusValue, { color: colors.primary }]}
                        >
                            {lastSleepLog.hoursSlept} {translations.dashboard.hoursSlept}
                        </Text>
                        <Text
                            style={[styles.statusDate, { color: colors.textSecondary }]}
                        >
                            {new Date(lastSleepLog.date).toLocaleDateString('pt-BR')}
                        </Text>
                    </View>
                    {appContext.syncQueue.some(log => log.id === lastSleepLog.id) && (
                        <View
                            style={[
                                styles.syncBadge,
                                { backgroundColor: colors.primary },
                            ]}
                        >
                            <Text style={styles.syncBadgeText}>⏳</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Primary Action: Register Sleep */}
            <TouchableOpacity
                onPress={() =>
                    handleMenuItemPress(menuItems.find(m => m.id === 'sleep-logging')!)
                }
                style={[
                    styles.primaryMenuCard,
                    {
                        backgroundColor: colors.primary,
                    },
                ]}
            >
                <Text style={styles.primaryMenuEmoji}>😴</Text>
                <View style={styles.primaryMenuTextContainer}>
                    <Text style={styles.primaryMenuTitle}>{translations.dashboard.registerSleep}</Text>
                    <Text style={styles.primaryMenuDescription}>
                        Como você dormiu na noite passada?
                    </Text>
                </View>
                <Text style={styles.primaryMenuArrow}>→</Text>
            </TouchableOpacity>

            {/* Menu Grid */}
            <View style={styles.menuGrid}>
                {menuItems
                    .filter(item => !item.isPrimary)
                    .map(item => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => handleMenuItemPress(item)}
                            style={[
                                styles.menuCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.cardBorder,
                                    shadowColor: colors.shadow,
                                },
                            ]}
                        >
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                            <Text
                                style={[
                                    styles.menuTitle,
                                    { color: colors.text },
                                ]}
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>
                            <Text
                                style={[
                                    styles.menuDescription,
                                    { color: colors.textSecondary },
                                ]}
                                numberOfLines={1}
                            >
                                {item.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>

            {/* Sync Status */}
            {appContext.syncQueue.length > 0 && (
                <View
                    style={[
                        styles.syncStatusCard,
                        {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={styles.syncStatusEmoji}>📡</Text>
                    <Text style={[styles.syncStatusText, { color: colors.textSecondary }]}>
                        {appContext.syncQueue.length} item(ns) aguardando sincronização
                    </Text>
                </View>
            )}

            {/* Insights Button */}
            <Button
                title="Ver Insights"
                onPress={() => navigation.navigate('InsightsScreen')}
            />
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
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: typography.title - 4,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    date: {
        fontSize: typography.caption,
    },
    statusCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        marginBottom: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    statusEmoji: {
        fontSize: 32,
    },
    statusContent: {
        flex: 1,
    },
    statusTitle: {
        fontSize: typography.caption,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    statusValue: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    statusDate: {
        fontSize: typography.small,
    },
    syncBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncBadgeText: {
        fontSize: 16,
    },
    primaryMenuCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    primaryMenuEmoji: {
        fontSize: 40,
    },
    primaryMenuTextContainer: {
        flex: 1,
    },
    primaryMenuTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        color: 'white',
        marginBottom: spacing.xs,
    },
    primaryMenuDescription: {
        fontSize: typography.caption,
        color: 'rgba(255,255,255,0.8)',
    },
    primaryMenuArrow: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
        marginHorizontal: -spacing.sm,
    },
    menuCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        width: '50%',
        paddingHorizontal: spacing.sm,
        marginVertical: spacing.sm,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    menuIcon: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    menuTitle: {
        fontSize: typography.caption,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    menuDescription: {
        fontSize: typography.small,
        textAlign: 'center',
    },
    syncStatusCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    syncStatusEmoji: {
        fontSize: 20,
    },
    syncStatusText: {
        fontSize: typography.caption,
        flex: 1,
    },
    insightsButton: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
