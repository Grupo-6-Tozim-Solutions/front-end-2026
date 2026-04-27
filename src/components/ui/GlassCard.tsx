import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';

type GlassCardVariant = 'subtle' | 'default' | 'elevated';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  variant?: GlassCardVariant;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentStyle,
  variant = 'default',
}) => {
  const { theme } = useTheme();

  const variantStyles = {
    subtle: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      intensity: theme.blur.subtle,
      elevation: theme.elevation.none,
    },
    default: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      intensity: theme.blur.card,
      elevation: theme.elevation.sm,
    },
    elevated: {
      backgroundColor: theme.colors.surfaceStrong,
      borderColor: theme.colors.borderStrong,
      intensity: theme.blur.modal,
      elevation: theme.elevation.md,
    },
  }[variant];

  return (
    <View
      style={[
        styles.shadowBase,
        {
          borderRadius: theme.radius.lg,
          shadowColor: theme.colors.shadow,
          ...variantStyles.elevation,
        },
        style,
      ]}
    >
      <BlurView
        intensity={variantStyles.intensity}
        tint="dark"
        style={[
          styles.blur,
          {
            borderRadius: theme.radius.lg,
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
          },
          contentStyle,
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowBase: {
    overflow: 'hidden',
  },
  blur: {
    borderWidth: 1,
    padding: 16,
  },
});
