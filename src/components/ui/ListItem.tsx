import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, AppIconName } from './AppIcon';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: AppIconName;
  trailing?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  icon,
  trailing,
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        {
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.leading,
            {
              backgroundColor: theme.colors.accentSoft,
              borderRadius: theme.radius.pill,
            },
          ]}
        >
          <AppIcon name={icon} color={theme.colors.accent} size={18} weight="bold" />
        </View>
      ) : null}

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text> : null}
      </View>

      {trailing ?? <AppIcon name="arrowRight" size={16} color={theme.colors.textSubtle} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leading: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
