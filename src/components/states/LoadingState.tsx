import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, AppIconName } from '../ui/AppIcon';

interface LoadingStateProps {
  title?: string;
  description?: string;
  icon?: AppIconName;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Carregando',
  description,
  icon = 'activity',
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconShell,
          {
            backgroundColor: theme.colors.accentSoft,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.pill,
          },
        ]}
      >
        <AppIcon name={icon} color={theme.colors.accent} size={20} weight="bold" />
      </View>
      <ActivityIndicator size="small" color={theme.colors.accent} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 10,
  },
  iconShell: {
    alignItems: 'center',
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
