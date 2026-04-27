import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, AppIconName } from '../ui/AppIcon';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: AppIconName;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'list',
  actionLabel,
  onAction,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <View style={[styles.iconShell, { backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.pill }]}>
        <AppIcon name={icon} size={20} color={theme.colors.accent} weight="bold" />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  iconShell: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
