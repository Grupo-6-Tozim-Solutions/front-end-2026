import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, AppIconName } from './AppIcon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: AppIconName;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      container: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
      },
      text: {
        color: '#04131C',
      },
      icon: '#04131C',
    },
    secondary: {
      container: {
        backgroundColor: theme.colors.surfaceStrong,
        borderColor: theme.colors.borderStrong,
      },
      text: {
        color: theme.colors.text,
      },
      icon: theme.colors.text,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
      },
      text: {
        color: theme.colors.textMuted,
      },
      icon: theme.colors.textMuted,
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: theme.radius.md,
          borderColor: variantStyles.container.borderColor,
          backgroundColor: variantStyles.container.backgroundColor,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' ? (
            <AppIcon name={icon} size={18} color={variantStyles.icon} weight="bold" />
          ) : null}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.text.color,
                fontSize: theme.typography.size.body,
                lineHeight: theme.typography.lineHeight.body,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' ? (
            <AppIcon name={icon} size={18} color={variantStyles.icon} weight="bold" />
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
