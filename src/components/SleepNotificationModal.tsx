import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { SliderInput } from './SliderInput';

interface SleepNotificationModalProps {
  visible: boolean;
  type: 'bed_reminder' | 'wake_reminder' | null;
  onClose: () => void;
  onSubmit: (data: NotificationResponse) => void;
}

export interface NotificationResponse {
  type: 'bed_reminder' | 'wake_reminder';
  isGoingToBed?: boolean; // bed_reminder
  qualityScore?: string; // wake_reminder (1-10)
  hoursSlept?: string; // wake_reminder
  notes?: string; // wake_reminder
}

export const SleepNotificationModal: React.FC<SleepNotificationModalProps> = ({
  visible,
  type,
  onClose,
  onSubmit,
}) => {
  const { colors } = useTheme();
  const appContext = useAppContext();

  // Bed Reminder State
  const [isGoingToBed, setIsGoingToBed] = useState<boolean | null>(null);

  // Wake Reminder State
  const [qualityScore, setQualityScore] = useState('7');
  const [hoursSlept, setHoursSlept] = useState('7');
  const [notes, setNotes] = useState('');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setIsGoingToBed(null);
    setQualityScore('7');
    setHoursSlept('7');
    setNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (type === 'bed_reminder') {
      if (isGoingToBed === null) {
        Alert.alert('Validação', 'Por favor, responda se você está indo dormir.');
        return;
      }

      try {
        setIsSubmitting(true);
        if (isGoingToBed) {
          // Save as bedTimeActual
          const today = new Date().toISOString().split('T')[0];
          const now = new Date();
          const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

          await appContext.addSleepLog({
            date: today,
            bedTimeActual: time,
            hoursSlept: '0',
            quality: '0',
            timestamp: Date.now(),
          });

          Alert.alert('✅ Registrado', 'Seu horário de dormir foi registrado!');
        }

        onSubmit({
          type: 'bed_reminder',
          isGoingToBed,
        });
        handleClose();
      } catch (error) {
        console.error('[SleepNotificationModal] Error submitting bed reminder:', error);
        Alert.alert('Erro', 'Não foi possível registrar. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (type === 'wake_reminder') {
      try {
        setIsSubmitting(true);
        // Save sleep log with quality
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        await appContext.addSleepLog({
          date: today,
          wakeTimeActual: time,
          hoursSlept,
          quality: qualityScore,
          notes,
          timestamp: Date.now(),
        });

        Alert.alert('✅ Registrado', 'Sua qualidade de sono foi registrada!');

        onSubmit({
          type: 'wake_reminder',
          qualityScore,
          hoursSlept,
          notes,
        });
        handleClose();
      } catch (error) {
        console.error('[SleepNotificationModal] Error submitting wake reminder:', error);
        Alert.alert('Erro', 'Não foi possível registrar. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {type === 'bed_reminder' ? (
              // BED REMINDER CONTENT
              <View style={styles.content}>
                <Text style={[styles.modalEmoji]}>🛏️</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Hora de Dormir?
                </Text>
                <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                  Você está indo dormir agora?
                </Text>

                {/* Button Group */}
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.bedResponseButton,
                      {
                        backgroundColor:
                          isGoingToBed === true ? colors.primary : colors.surface,
                        borderColor: colors.primary,
                        borderWidth: isGoingToBed === true ? 0 : 2,
                      },
                    ]}
                    onPress={() => setIsGoingToBed(true)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.bedResponseButtonText,
                        {
                          color:
                            isGoingToBed === true ? 'white' : colors.primary,
                        },
                      ]}
                    >
                      Sim, Indo Dormir ✓
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.bedResponseButton,
                      {
                        backgroundColor:
                          isGoingToBed === false ? '#EF4444' : colors.surface,
                        borderColor: '#EF4444',
                        borderWidth: isGoingToBed === false ? 0 : 2,
                      },
                    ]}
                    onPress={() => setIsGoingToBed(false)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.bedResponseButtonText,
                        {
                          color:
                            isGoingToBed === false ? 'white' : '#EF4444',
                        },
                      ]}
                    >
                      Não, Ainda Acordado
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : type === 'wake_reminder' ? (
              // WAKE REMINDER CONTENT
              <View style={styles.content}>
                <Text style={[styles.modalEmoji]}>🌅</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Como Dormiu?
                </Text>
                <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                  Registre os dados do seu sono
                </Text>

                {/* Quality Score */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Qualidade do Sono (1-10)
                  </Text>
                  <SliderInput
                    label="Qualidade"
                    value={parseInt(qualityScore, 10)}
                    onChange={(val: number) => setQualityScore(String(val))}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <Text style={[styles.scoreDisplay, { color: colors.primary }]}>
                    {qualityScore}/10
                  </Text>
                </View>

                {/* Hours Slept */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Horas de Sono (1-12)
                  </Text>
                  <SliderInput
                    label="Horas"
                    value={parseInt(hoursSlept, 10)}
                    onChange={(val: number) => setHoursSlept(String(val))}
                    min={1}
                    max={12}
                    step={0.5}
                  />
                  <Text style={[styles.scoreDisplay, { color: colors.primary }]}>
                    {hoursSlept}h
                  </Text>
                </View>

                {/* Notes */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Notas (Opcional)
                  </Text>
                  <View
                    style={[
                      styles.notesInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                      Ex: "Dormi bem", "Pesadelo", "Acordei de madrugada", etc.
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {isSubmitting ? 'Registrando...' : 'Registrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '90%',
    borderTopWidth: 1,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.title - 8,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  bedResponseButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedResponseButtonText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  fieldContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  scoreDisplay: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  notesInput: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 60,
  },
  notesText: {
    fontSize: typography.small,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
});
