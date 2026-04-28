import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { AppIcon } from '../ui/AppIcon';

interface ErrorStateProps {
  title?: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Não foi possível concluir esta ação',
  description,
  retryLabel = 'Tentar novamente',
  onRetry,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.danger,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <View style={[styles.iconShell, { backgroundColor: 'rgba(248, 113, 113, 0.2)', borderRadius: theme.radius.pill }]}>
        <AppIcon name="warning" size={20} color={theme.colors.danger} weight="bold" />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>
      {onRetry ? <Button title={retryLabel} onPress={onRetry} variant="secondary" icon="arrowRight" iconPosition="right" /> : null}
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
