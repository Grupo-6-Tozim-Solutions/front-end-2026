import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../styles/theme';

interface StubScreenProps {
    icon: string;
    title: string;
    description: string;
}

const StubScreenTemplate: React.FC<StubScreenProps> = ({ icon, title, description }) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            <View style={styles.content}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={[styles.title, { color: colors.text }]}>
                    {title}
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {description}
                </Text>

                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                        🚀 Coming Soon
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    content: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 56,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.title - 4,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: typography.caption,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
        maxWidth: 280,
    },
    badge: {
        borderRadius: borderRadius.full,
        borderWidth: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    badgeText: {
        fontSize: typography.body,
        fontWeight: '600',
    },
});

export default StubScreenTemplate;
