import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, AppIconName } from '../ui/AppIcon';

const routeIcon: Record<string, AppIconName> = {
  HomeTab: 'spark',
  LoggingTab: 'moonStars',
  QualityTab: 'chart',
  CoachTab: 'chat',
  ProfileTab: 'profile',
};

const routeLabel: Record<string, string> = {
  HomeTab: 'Home',
  LoggingTab: 'Registrar',
  QualityTab: 'Qualidade',
  CoachTab: 'Coach',
  ProfileTab: 'Perfil',
};

export const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <BlurView
        intensity={theme.blur.card}
        tint="dark"
        style={[
          styles.container,
          {
            borderColor: theme.colors.border,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surfaceOverlay,
            shadowColor: theme.colors.shadow,
            ...theme.elevation.md,
          },
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const iconName = routeIcon[route.name] ?? 'circle';
          const label = routeLabel[route.name] ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              hitSlop={8}
              style={({ pressed }) => [
                styles.tab,
                {
                  borderRadius: theme.radius.md,
                  backgroundColor: isFocused ? theme.colors.accentSoft : 'transparent',
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <AppIcon
                name={iconName}
                size={18}
                color={isFocused ? theme.colors.accent : theme.colors.textSubtle}
                weight={isFocused ? 'fill' : 'regular'}
              />
              <Text style={[styles.label, { color: isFocused ? theme.colors.text : theme.colors.textSubtle }]}>{label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  container: {
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
