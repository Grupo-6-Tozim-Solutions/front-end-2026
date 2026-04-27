import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../languages/pt';
import { SleepLog } from '../types/user';
import { AppIcon, AppScreen, Button, GlassCard, Header, Input } from '../components/ui';
import { InlineFeedback } from '../components/states';

interface SleepLoggingScreenProps {
  navigation?: any;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const SleepLoggingScreen: React.FC<SleepLoggingScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const appContext = useAppContext();

  const [date, setDate] = useState<Date>(new Date());
  const [hoursSlept, setHoursSlept] = useState('');
  const [bedTimeActual, setBedTimeActual] = useState<Date>(new Date(2000, 0, 1, 23, 0));
  const [wakeTimeActual, setWakeTimeActual] = useState<Date>(new Date(2000, 0, 1, 7, 0));
  const [quality, setQuality] = useState(5);
  const [notes, setNotes] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const qualityLabel = useMemo(() => `${quality}/10`, [quality]);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onBedTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowBedTimePicker(Platform.OS === 'ios');
    if (selectedDate) setBedTimeActual(selectedDate);
  };

  const onWakeTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowWakeTimePicker(Platform.OS === 'ios');
    if (selectedDate) setWakeTimeActual(selectedDate);
  };

  const validate = (): boolean => {
    if (!hoursSlept.trim()) {
      Alert.alert(translations.common.validation, translations.sleepLogging.validationHours);
      return false;
    }

    const hours = parseFloat(hoursSlept);
    if (Number.isNaN(hours) || hours < 0 || hours > 24) {
      Alert.alert(translations.common.validation, translations.sleepLogging.validationHoursRange);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const sleepLog: SleepLog = {
        date: formatDate(date),
        hoursSlept,
        bedTimeActual: formatTime(bedTimeActual),
        wakeTimeActual: formatTime(wakeTimeActual),
        quality: quality.toString(),
        notes: notes.trim() || undefined,
        timestamp: Date.now(),
        syncStatus: 'pending',
      };

      await appContext.addSleepLog(sleepLog);

      Alert.alert(translations.sleepLogging.success, translations.sleepLogging.successMessage, [
        {
          text: translations.common.ok,
          onPress: () => {
            setHoursSlept('');
            setNotes('');
            setQuality(5);
            setDate(new Date());
            navigation?.goBack?.();
          },
        },
      ]);
    } catch (error) {
      console.error('[SleepLogging] Error submitting:', error);
      Alert.alert(translations.common.error, translations.sleepLogging.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen scroll>
      <Header title={translations.sleepLogging.title} subtitle={translations.sleepLogging.subtitle} icon="moonStars" />

      <GlassCard variant="elevated" contentStyle={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data e horários</Text>

        <Pressable
          style={[styles.pickerButton, { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface }]}
          onPress={() => setShowDatePicker(true)}
        >
          <AppIcon name="calendar" color={theme.colors.accent} size={18} />
          <View>
            <Text style={[styles.pickerLabel, { color: theme.colors.textMuted }]}>{translations.sleepLogging.sleepDate}</Text>
            <Text style={[styles.pickerValue, { color: theme.colors.text }]}>{formatDate(date)}</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.pickerButton, { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface }]}
          onPress={() => setShowBedTimePicker(true)}
        >
          <AppIcon name="moon" color={theme.colors.accent} size={18} />
          <View>
            <Text style={[styles.pickerLabel, { color: theme.colors.textMuted }]}>{translations.sleepLogging.bedtime}</Text>
            <Text style={[styles.pickerValue, { color: theme.colors.text }]}>{formatTime(bedTimeActual)}</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.pickerButton, { borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface }]}
          onPress={() => setShowWakeTimePicker(true)}
        >
          <AppIcon name="sun" color={theme.colors.accent} size={18} />
          <View>
            <Text style={[styles.pickerLabel, { color: theme.colors.textMuted }]}>{translations.sleepLogging.wakeTime}</Text>
            <Text style={[styles.pickerValue, { color: theme.colors.text }]}>{formatTime(wakeTimeActual)}</Text>
          </View>
        </Pressable>

        {showDatePicker ? <DateTimePicker value={date} mode="date" onChange={onDateChange} /> : null}
        {showBedTimePicker ? <DateTimePicker value={bedTimeActual} mode="time" is24Hour onChange={onBedTimeChange} /> : null}
        {showWakeTimePicker ? <DateTimePicker value={wakeTimeActual} mode="time" is24Hour onChange={onWakeTimeChange} /> : null}
      </GlassCard>

      <GlassCard variant="default" contentStyle={styles.card}>
        <Input
          label={translations.sleepLogging.hoursOfSleep}
          value={hoursSlept}
          onChangeText={setHoursSlept}
          placeholder={translations.sleepLogging.placeholder}
          keyboardType="decimal-pad"
          icon="clock"
        />

        <View style={styles.qualityRow}>
          <Text style={[styles.qualityLabel, { color: theme.colors.textMuted }]}>Qualidade percebida</Text>
          <Text style={[styles.qualityValue, { color: theme.colors.accent }]}>{qualityLabel}</Text>
        </View>

        <View style={styles.qualityButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
            const selected = value === quality;
            return (
              <Pressable
                key={value}
                onPress={() => setQuality(value)}
                style={[
                  styles.qualityChip,
                  {
                    borderRadius: theme.radius.pill,
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.qualityChipText, { color: selected ? theme.colors.accent : theme.colors.textMuted }]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label={translations.sleepLogging.anyNotes}
          value={notes}
          onChangeText={setNotes}
          placeholder={translations.sleepLogging.notesPlaceholder}
          multiline
          icon="note"
        />
      </GlassCard>

      <InlineFeedback tone="info" message={translations.sleepLogging.disclaimer} />

      <View style={styles.footer}>
        <Button
          title={translations.sleepLogging.saveButton}
          onPress={handleSubmit}
          loading={isSubmitting}
          icon="check"
          iconPosition="right"
        />
        {isSubmitting ? (
          <View style={styles.loadingLine}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>{translations.sleepLogging.saving}</Text>
          </View>
        ) : null}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  pickerButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 14,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  qualityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  qualityValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  qualityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qualityChip: {
    alignItems: 'center',
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    minWidth: 34,
    paddingHorizontal: 8,
  },
  qualityChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    gap: 10,
    paddingBottom: 24,
  },
  loadingLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
});
