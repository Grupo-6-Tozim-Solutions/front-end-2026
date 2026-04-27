import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppIcon, AppIconName } from './AppIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: AppIconName;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, icon, right, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {icon ? (
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
            <AppIcon name={icon} color={theme.colors.accent} size={18} weight="bold" />
          </View>
        ) : null}

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  left: {
    flexDirection: 'row',
    gap: 12,
    maxWidth: '78%',
  },
  iconShell: {
    alignItems: 'center',
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
