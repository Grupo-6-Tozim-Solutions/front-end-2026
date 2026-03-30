import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';

interface DashboardScreenProps {
    navigation?: any;
}

interface MenuItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    route: string;
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
            title: 'Register Sleep',
            description: 'Log your sleep session',
            route: 'SleepLogging',
            color: '#6366F1',
            isPrimary: true,
        },
        {
            id: 'analysis',
            icon: '📊',
            title: 'Detailed Analysis',
            description: 'View comprehensive sleep data',
            route: 'DetailedAnalysis',
            color: '#8B5CF6',
        },
        {
            id: 'insights',
            icon: '💡',
            title: 'Insights',
            description: 'Get personalized recommendations',
            route: 'Insights',
            color: '#EC4899',
        },
        {
            id: 'weekly-report',
            icon: '📈',
            title: 'Weekly Report',
            description: 'See your sleep trends',
            route: 'WeeklyReport',
            color: '#F59E0B',
        },
        {
            id: 'experiments',
            icon: '🧪',
            title: 'Experiments',
            description: 'Track sleep experiments',
            route: 'Experiments',
            color: '#14B8A6',
        },
        {
            id: 'prediction',
            icon: '🔮',
            title: 'Sleep Prediction',
            description: 'Predict your sleep quality',
            route: 'SleepPrediction',
            color: '#06B6D4',
        },
        {
            id: 'profile',
            icon: '👤',
            title: 'Profile',
            description: 'Edit your information',
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
                        Welcome Back! 👋
                    </Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>
            </View>

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
                            Last Night's Sleep
                        </Text>
                        <Text
                            style={[styles.statusValue, { color: colors.primary }]}
                        >
                            {lastSleepLog.hoursSlept} hours
                        </Text>
                        <Text
                            style={[styles.statusDate, { color: colors.textSecondary }]}
                        >
                            {new Date(lastSleepLog.date).toLocaleDateString()}
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
                    <Text style={styles.primaryMenuTitle}>Register Sleep</Text>
                    <Text style={styles.primaryMenuDescription}>
                        How did you sleep last night?
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
                        {appContext.syncQueue.length} item(s) pending sync
                    </Text>
                </View>
            )}
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
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    menuCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        width: '48%',
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
});
