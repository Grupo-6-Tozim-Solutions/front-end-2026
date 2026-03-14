import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, spacing } from '../styles/theme';

type RootStackParamList = {
    Welcome: undefined;
    Questionnaire: undefined;
};

type WelcomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.content}>
                {/* Logo Area */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🌙</Text>
                    </View>
                    <View style={styles.logoAccent}>
                        <Text style={styles.accentEmoji}>📱</Text>
                    </View>
                </View>

                {/* Titles */}
                <Text style={styles.appName}>Sleep & Screen</Text>
                <Text style={styles.title}>Understand Your{'\n'}Digital Habits</Text>
                <Text style={styles.description}>
                    Analyze your screen time, sleep patterns and stress indicators.{' '}
                    Get personalized insights based on real population data.
                </Text>
            </View>

            {/* Decorative dots */}
            <View style={styles.dots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
            </View>

            {/* CTA */}
            <View style={styles.footer}>
                <PrimaryButton
                    title="Start Analysis"
                    onPress={() => navigation.navigate('Questionnaire')}
                    style={styles.button}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        position: 'relative',
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '25',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEmoji: {
        fontSize: 40,
    },
    logoAccent: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.accent + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accentEmoji: {
        fontSize: 20,
    },
    appName: {
        fontSize: typography.caption,
        fontWeight: '600',
        color: colors.primary,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.title + 4,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: spacing.md,
    },
    description: {
        fontSize: typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.md,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    dotActive: {
        width: 24,
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    footer: {
        paddingBottom: spacing.xxl,
    },
    button: {
        width: '100%',
    },
});
