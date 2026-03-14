import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing } from '../styles/theme';

type RootStackParamList = {
    Welcome: undefined;
    Questionnaire: undefined;
};

type WelcomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
    const { isDark, colors, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* Theme Toggle */}
            <TouchableOpacity
                style={styles.themeToggle}
                onPress={toggleTheme}
                activeOpacity={0.7}
                accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                <Text style={styles.toggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                {/* Logo */}
                <View style={[styles.logoContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Image
                        source={require('../../assets/logo-completa.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Decorative stars */}
                <View style={styles.starsRow}>
                    <Text style={[styles.star, { color: colors.highlight }]}>✦</Text>
                    <Text style={[styles.starSmall, { color: colors.accent }]}>✦</Text>
                    <Text style={[styles.star, { color: colors.highlight }]}>✦</Text>
                </View>

                {/* Titles */}
                <Text style={[styles.appName, { color: colors.primary }]}>SLEEP & SCREEN</Text>
                <Text style={[styles.title, { color: colors.text }]}>
                    Understand Your{'\n'}Digital Habits
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Analyze your screen time, sleep patterns and stress indicators.{' '}
                    Get personalized insights based on real population data.
                </Text>
            </View>

            {/* Decorative dots */}
            <View style={styles.dots}>
                <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: colors.accentLight }]} />
                <View style={[styles.dot, { backgroundColor: colors.border }]} />
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
        paddingHorizontal: spacing.lg,
    },
    themeToggle: {
        position: 'absolute',
        top: 54,
        right: spacing.lg,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    toggleIcon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logoImage: {
        width: 160,
        height: 160,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    star: {
        fontSize: 16,
    },
    starSmall: {
        fontSize: 12,
    },
    appName: {
        fontSize: typography.caption,
        fontWeight: '600',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.title + 4,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: spacing.md,
    },
    description: {
        fontSize: typography.body,
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
    },
    dotActive: {
        width: 24,
        borderRadius: 4,
    },
    footer: {
        paddingBottom: spacing.xxl,
    },
    button: {
        width: '100%',
    },
});
