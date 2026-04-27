import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, AppIconName } from '../ui/AppIcon';

type InlineFeedbackTone = 'info' | 'success' | 'warning' | 'danger';

interface InlineFeedbackProps {
  message: string;
  tone?: InlineFeedbackTone;
  icon?: AppIconName;
  style?: ViewStyle;
}

const toneIconMap: Record<InlineFeedbackTone, AppIconName> = {
  info: 'info',
  success: 'checkCircle',
  warning: 'warning',
  danger: 'closeCircle',
};

export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  message,
  tone = 'info',
  icon,
  style,
}) => {
  const { theme } = useTheme();

  const toneStyles = {
    info: {
      backgroundColor: 'rgba(125, 211, 252, 0.16)',
      borderColor: 'rgba(125, 211, 252, 0.32)',
      color: theme.colors.accent,
    },
    success: {
      backgroundColor: 'rgba(52, 211, 153, 0.16)',
      borderColor: 'rgba(52, 211, 153, 0.32)',
      color: theme.colors.success,
    },
    warning: {
      backgroundColor: 'rgba(251, 191, 36, 0.16)',
      borderColor: 'rgba(251, 191, 36, 0.32)',
      color: theme.colors.warning,
    },
    danger: {
      backgroundColor: 'rgba(248, 113, 113, 0.16)',
      borderColor: 'rgba(248, 113, 113, 0.32)',
      color: theme.colors.danger,
    },
  }[tone];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: toneStyles.backgroundColor,
          borderColor: toneStyles.borderColor,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    >
      <AppIcon name={icon ?? toneIconMap[tone]} size={16} color={toneStyles.color} weight="bold" />
      <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
