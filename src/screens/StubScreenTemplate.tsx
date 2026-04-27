import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AppIconName, AppScreen, Button, GlassCard, Header } from '../components/ui';
import { EmptyState } from '../components/states';

interface StubScreenProps {
  icon: AppIconName;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

const StubScreenTemplate: React.FC<StubScreenProps> = ({
  icon,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  const { theme } = useTheme();

  return (
    <AppScreen>
      <View style={styles.container}>
        <Header title={title} subtitle="Módulo em evolução" icon={icon} />

        <GlassCard variant="elevated" contentStyle={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>
          <EmptyState
            title="Disponível em breve"
            description="Essa área será liberada na próxima etapa da evolução do produto."
            icon={icon}
          />
          {primaryActionLabel && onPrimaryAction ? (
            <Button title={primaryActionLabel} onPress={onPrimaryAction} icon="arrowRight" iconPosition="right" />
          ) : null}
        </GlassCard>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  card: {
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default StubScreenTemplate;
