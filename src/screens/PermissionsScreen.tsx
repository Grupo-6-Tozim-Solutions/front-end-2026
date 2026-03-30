import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../contexts/ThemeContext';
import { permissionsService } from '../services/permissions';
import { PermissionStatus } from '../types/user';
import { typography, spacing, borderRadius } from '../styles/theme';

interface PermissionsScreenProps {
    navigation?: any;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const [isRequesting, setIsRequesting] = useState(false);
    const [permissionsStatus, setPermissionsStatus] = useState<PermissionStatus>({
        screenTime: 'unknown',
        sensors: 'unknown',
    });

    const handleRequestPermissions = async () => {
        try {
            setIsRequesting(true);

            console.log('[PermissionsScreen] Requesting permissions...');
            const status = await permissionsService.requestAllPermissions();
            setPermissionsStatus(status);

            console.log('[PermissionsScreen] Permissions status:', status);

            if (Platform.OS === 'android' &&
                (status.screenTime === 'granted' || status.sensors === 'granted')) {
                Alert.alert(
                    'Permissions Granted',
                    'Thank you! We can now read more accurate data from your device.',
                    [
                        {
                            text: 'Continue',
                            onPress: () => handleContinue(),
                        },
                    ]
                );
            } else {
                // Permissões não foram todas granted, mas continuar mesmo assim
                Alert.alert(
                    'Permissions',
                    'Some permissions were not granted. You can still use the app, but some features may be limited.',
                    [
                        {
                            text: 'Continue',
                            onPress: () => handleContinue(),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('[PermissionsScreen] Error requesting permissions:', error);
            Alert.alert('Error', 'Failed to request permissions. Please try again.');
        } finally {
            setIsRequesting(false);
        }
    };

    const handleSkip = () => {
        Alert.alert(
            'Skip Permissions?',
            'Some personalization features might not work perfectly, but you can continue using the app.',
            [
                {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Skip',
                    onPress: () => handleContinue(),
                    style: 'default',
                },
            ]
        );
    };

    const handleContinue = () => {
        navigation?.navigate('Questionnaire');
    };

    const permissionItem = (
        icon: string,
        title: string,
        description: string
    ) => (
        <View style={styles.permissionItemContainer}>
            <Text style={styles.permissionIcon}>{icon}</Text>
            <View style={styles.permissionTextContainer}>
                <Text style={[styles.permissionTitle, { color: colors.text }]}>
                    {title}
                </Text>
                <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                    {description}
                </Text>
            </View>
        </View>
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>🔐</Text>
                <Text style={[styles.title, { color: colors.text }]}>
                    Enable Permissions
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    To provide personalized sleep analysis, we need to access some device information.
                    Your data stays on your device and is never shared.
                </Text>
            </View>

            {/* Card with permission items */}
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
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>📊</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Required Permissions
                    </Text>
                </View>

                {permissionItem(
                    '📱',
                    'Device Usage',
                    'Read your daily app usage time to correlate with sleep patterns'
                )}

                {permissionItem(
                    '📍',
                    'Motion Sensors',
                    'Detect movement patterns to better understand your sleep'
                )}

                {permissionItem(
                    '🔋',
                    'Battery & Device Info',
                    'Monitor device charging status and system information'
                )}
            </View>

            {/* Privacy notice */}
            <View
                style={[
                    styles.privacyCard,
                    {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Text style={styles.privacyEmoji}>🛡️</Text>
                <Text style={[styles.privacyTitle, { color: colors.text }]}>
                    Your Privacy is Protected
                </Text>
                <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                    • All data is stored locally on your device{'\n'}
                    • We never access personal apps or messages{'\n'}
                    • Syncing is encrypted and optional{'\n'}
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <PrimaryButton
                    title={isRequesting ? 'Requesting...' : 'Enable Permissions'}
                    onPress={handleRequestPermissions}
                    disabled={isRequesting}
                    style={styles.primaryButton}
                />

                <TouchableOpacity
                    onPress={handleSkip}
                    disabled={isRequesting}
                    style={styles.secondaryButton}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                        Skip for now
                    </Text>
                </TouchableOpacity>
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
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.caption,
        textAlign: 'center',
        lineHeight: 20,
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    sectionEmoji: {
        fontSize: 20,
    },
    sectionTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
    },
    permissionItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    permissionIcon: {
        fontSize: 24,
        marginTop: spacing.xs,
    },
    permissionTextContainer: {
        flex: 1,
    },
    permissionTitle: {
        fontSize: typography.subtitle - 2,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    permissionDescription: {
        fontSize: typography.caption,
        lineHeight: 18,
    },
    privacyCard: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    privacyEmoji: {
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    privacyTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    privacyText: {
        fontSize: typography.caption,
        textAlign: 'left',
        lineHeight: 20,
    },
    buttonContainer: {
        gap: spacing.md,
    },
    primaryButton: {
        width: '100%',
    },
    secondaryButton: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: typography.body,
        fontWeight: '600',
    },
});
