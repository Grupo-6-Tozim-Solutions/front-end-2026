import React, { useMemo } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { LoadingState } from '../components/states';
import { GlassTabBar } from '../components/navigation/GlassTabBar';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { QuestionnaireScreen } from '../screens/QuestionnaireScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SleepLoggingScreen } from '../screens/SleepLoggingScreen';
import { SleepQualityScreen } from '../screens/SleepQualityScreen';
import { SleepCoachScreen } from '../screens/SleepCoachScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DetailedAnalysisScreen, InsightsScreen } from '../screens/StubScreens';
import { WeeklyReportScreen } from '../screens/WeeklyReportScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Permissions: undefined;
  Questionnaire: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  DetailedAnalysis: undefined;
  Insights: undefined;
  WeeklyReport: undefined;
};

export type LoggingStackParamList = {
  SleepLogging: undefined;
};

export type QualityStackParamList = {
  SleepQuality: undefined;
  WeeklyReport: undefined;
};

export type CoachStackParamList = {
  SleepCoach: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  LoggingTab: undefined;
  QualityTab: undefined;
  CoachTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  OnboardingFlow: undefined;
  MainTabs: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LoggingStack = createNativeStackNavigator<LoggingStackParamList>();
const QualityStack = createNativeStackNavigator<QualityStackParamList>();
const CoachStack = createNativeStackNavigator<CoachStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const hiddenHeaderOptions = {
  headerShown: false,
} as const;

const OnboardingNavigator: React.FC = () => {
  return (
    <OnboardingStack.Navigator screenOptions={hiddenHeaderOptions}>
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="Permissions" component={PermissionsScreen} />
      <OnboardingStack.Screen name="Questionnaire" component={QuestionnaireScreen} />
    </OnboardingStack.Navigator>
  );
};

const HomeNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator screenOptions={hiddenHeaderOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="DetailedAnalysis" component={DetailedAnalysisScreen} />
      <HomeStack.Screen name="Insights" component={InsightsScreen} />
      <HomeStack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
    </HomeStack.Navigator>
  );
};

const LoggingNavigator: React.FC = () => {
  return (
    <LoggingStack.Navigator screenOptions={hiddenHeaderOptions}>
      <LoggingStack.Screen name="SleepLogging" component={SleepLoggingScreen} />
    </LoggingStack.Navigator>
  );
};

const QualityNavigator: React.FC = () => {
  return (
    <QualityStack.Navigator screenOptions={hiddenHeaderOptions}>
      <QualityStack.Screen name="SleepQuality" component={SleepQualityScreen} />
      <QualityStack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
    </QualityStack.Navigator>
  );
};

const CoachNavigator: React.FC = () => {
  return (
    <CoachStack.Navigator screenOptions={hiddenHeaderOptions}>
      <CoachStack.Screen name="SleepCoach" component={SleepCoachScreen} />
    </CoachStack.Navigator>
  );
};

const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator screenOptions={hiddenHeaderOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
};

const MainTabsNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props: any) => <GlassTabBar {...props} />}
    >
      <MainTab.Screen name="HomeTab" component={HomeNavigator} />
      <MainTab.Screen name="LoggingTab" component={LoggingNavigator} />
      <MainTab.Screen name="QualityTab" component={QualityNavigator} />
      <MainTab.Screen name="CoachTab" component={CoachNavigator} />
      <MainTab.Screen name="ProfileTab" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { colors } = useTheme();
  const appContext = useAppContext();

  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.backgroundElevated,
        text: colors.text,
        border: colors.border,
        notification: colors.warning,
      },
    }),
    [colors],
  );

  if (appContext.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <LoadingState title="Preparando sua experiência" description="Sincronizando dados locais" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={hiddenHeaderOptions}>
        {appContext.isOnboarded ? (
          <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
        ) : (
          <RootStack.Screen name="OnboardingFlow" component={OnboardingNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
