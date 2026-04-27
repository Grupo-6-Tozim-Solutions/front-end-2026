import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface AppModalProps {
  visible: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: 'primary' | 'secondary' | 'ghost';
}

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
}) => {
  const { theme } = useTheme();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.colors.surfaceOverlay }]} onPress={onCancel}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalWrap}>
          <GlassCard variant="elevated" contentStyle={styles.card}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            {description ? <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text> : null}
            <View style={styles.actions}>
              <Button title={cancelText} onPress={onCancel} variant="ghost" style={styles.button} />
              <Button title={confirmText} onPress={onConfirm} variant={confirmVariant} style={styles.button} />
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalWrap: {
    width: '100%',
  },
  card: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  button: {
    minWidth: 112,
  },
});
