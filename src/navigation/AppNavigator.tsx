import React, { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography } from '../styles/theme';

// Import screens
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { QuestionnaireScreen } from '../screens/QuestionnaireScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SleepLoggingScreen } from '../screens/SleepLoggingScreen';
import { SleepQualityScreen } from '../screens/SleepQualityScreen';
import { SleepCoachScreen } from '../screens/SleepCoachScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import {
    DetailedAnalysisScreen,
    InsightsScreen,
    WeeklyReportScreen,
} from '../screens/StubScreens';
import { ThemeToggle } from '../components/ThemeToggle';

// Type definitions
export type RootStackParamList = {
    // Onboarding
    Welcome: undefined;
    Permissions: undefined;
    Questionnaire: undefined;

    // Main
    Dashboard: undefined;
    SleepLogging: undefined;
    SleepQuality: undefined;
    SleepCoach: undefined;
    DetailedAnalysis: undefined;
    InsightsScreen: undefined; // Updated to match the InsightsScreen key
    WeeklyReport: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const OnboardingStack: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: typography.subtitle,
                },
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: colors.background,
                },
                headerRight: () => <ThemeToggle />,
            }}
        >
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Permissions"
                component={PermissionsScreen}
                options={{
                    title: 'Permissions',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="Questionnaire"
                component={QuestionnaireScreen}
                options={{
                    title: 'Your Profile',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
};

const MainStack: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: typography.subtitle,
                },
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: colors.background,
                },
                headerRight: () => <ThemeToggle />,
            }}
        >
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SleepLogging"
                component={SleepLoggingScreen}
                options={{
                    title: 'Log Sleep',
                    headerBackTitle: 'Dashboard',
                }}
            />
            <Stack.Screen
                name="SleepQuality"
                component={SleepQualityScreen}
                options={{
                    title: 'Qualidade do Sono',
                    headerBackTitle: 'Dashboard',
                }}
            />
            <Stack.Screen
                name="SleepCoach"
                component={SleepCoachScreen}
                options={{
                    title: 'Coach do Sono',
                    headerBackTitle: 'Dashboard',
                }}
            />
            <Stack.Screen
                name="DetailedAnalysis"
                component={DetailedAnalysisScreen}
                options={{
                    title: 'Detailed Analysis',
                    headerBackTitle: 'Dashboard',
                }}
            />
            <Stack.Screen
                name="InsightsScreen"
                component={InsightsScreen}
                options={{
                    title: 'Insights',
                    headerBackTitle: 'Dashboard',
                }}
            />
            <Stack.Screen
                name="WeeklyReport"
                component={WeeklyReportScreen}
                options={{
                    title: 'Weekly Report',
                    headerBackTitle: 'Dashboard',
                }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    headerBackTitle: 'Dashboard',
                }}
            />
        </Stack.Navigator>
    );
};

export const AppNavigator: React.FC = () => {
    const { isDark, colors } = useTheme();
    const appContext = useAppContext();

    const navigationTheme = useMemo(() => ({
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.highlight,
        },
    }), [isDark, colors]);

    // Show loading screen while app context is initializing
    if (appContext.isLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.background,
            }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            {appContext.isOnboarded ? <MainStack /> : <OnboardingStack />}
        </NavigationContainer>
    );
};
