import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { PrimaryButton } from '../components/PrimaryButton';
import { FormInput } from '../components/FormInput';
import { SliderInput } from '../components/SliderInput';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { SleepLog } from '../types/user';

interface SleepLoggingScreenProps {
    navigation?: any;
}

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const SleepLoggingScreen: React.FC<SleepLoggingScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const appContext = useAppContext();

    // Form state
    const [date, setDate] = useState<Date>(new Date());
    const [hoursSlept, setHoursSlept] = useState<string>('');
    const [bedTimeActual, setBedTimeActual] = useState<Date>(new Date(2000, 0, 1, 23, 0));
    const [wakeTimeActual, setWakeTimeActual] = useState<Date>(new Date(2000, 0, 1, 7, 0));
    const [quality, setQuality] = useState<number>(5);
    const [notes, setNotes] = useState<string>('');

    // UI state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showBedTimePicker, setShowBedTimePicker] = useState(false);
    const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            Alert.alert('Validation', 'Please enter how many hours you slept.');
            return false;
        }

        const hours = parseFloat(hoursSlept);
        if (isNaN(hours) || hours < 0 || hours > 24) {
            Alert.alert('Validation', 'Please enter a valid number of hours (0–24).');
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

            console.log('[SleepLogging] Submitting:', sleepLog);

            // Add to context (triggers auto-sync)
            await appContext.addSleepLog(sleepLog);

            Alert.alert(
                'Sleep Logged ✅',
                'Your sleep has been recorded and scheduled for sync.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setHoursSlept('');
                            setNotes('');
                            setQuality(5);
                            setDate(new Date());

                            // Navigate back to dashboard
                            navigation?.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('[SleepLogging] Error submitting:', error);
            Alert.alert(
                'Error',
                'Failed to save sleep log. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>😴</Text>
                <Text style={[styles.title, { color: colors.text }]}>
                    Log Your Sleep
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Tell us about last night's rest.
                </Text>
            </View>

            {/* Date & Time Section */}
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadow,
                    },
                ]}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>📅</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Sleep Date & Times
                    </Text>
                </View>

                {/* Date Picker */}
                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Sleep Date
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.pickerButton,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.pickerIcon}>📆</Text>
                        <Text style={[styles.pickerText, { color: colors.primary }]}>
                            {formatDate(date)}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            onChange={onDateChange}
                        />
                    )}
                </View>

                {/* Bed Time */}
                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Bedtime
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.pickerButton,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => setShowBedTimePicker(true)}
                    >
                        <Text style={styles.pickerIcon}>🌙</Text>
                        <Text style={[styles.pickerText, { color: colors.primary }]}>
                            {formatTime(bedTimeActual)}
                        </Text>
                    </TouchableOpacity>
                    {showBedTimePicker && (
                        <DateTimePicker
                            value={bedTimeActual}
                            mode="time"
                            is24Hour={true}
                            onChange={onBedTimeChange}
                        />
                    )}
                </View>

                {/* Wake Time */}
                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Wake Time
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.pickerButton,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => setShowWakeTimePicker(true)}
                    >
                        <Text style={styles.pickerIcon}>☀️</Text>
                        <Text style={[styles.pickerText, { color: colors.primary }]}>
                            {formatTime(wakeTimeActual)}
                        </Text>
                    </TouchableOpacity>
                    {showWakeTimePicker && (
                        <DateTimePicker
                            value={wakeTimeActual}
                            mode="time"
                            is24Hour={true}
                            onChange={onWakeTimeChange}
                        />
                    )}
                </View>
            </View>

            {/* Sleep Duration Section */}
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadow,
                    },
                ]}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>⏱️</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Sleep Duration
                    </Text>
                </View>

                <FormInput
                    label="Hours of sleep"
                    value={hoursSlept}
                    onChange={setHoursSlept}
                    placeholder="e.g., 7.5"
                    keyboardType="decimal-pad"
                />
            </View>

            {/* Quality Section */}
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadow,
                    },
                ]}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>⭐</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Sleep Quality
                    </Text>
                </View>

                <SliderInput
                    label="How was the quality of your sleep?"
                    value={quality}
                    min={1}
                    max={10}
                    onChange={(v) => setQuality(Math.round(v))}
                    minLabel="1 = Very Poor"
                    maxLabel="10 = Excellent"
                />
            </View>

            {/* Notes Section */}
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.cardBorder,
                        shadowColor: colors.shadow,
                    },
                ]}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>📝</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Notes (Optional)
                    </Text>
                </View>

                <FormInput
                    label="Any additional notes?"
                    value={notes}
                    onChange={setNotes}
                    placeholder="e.g., had more coffee, stressed about work..."
                />
            </View>

            {/* Submit */}
            <View style={styles.submitSection}>
                {isSubmitting ? (
                    <View style={styles.submittingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.submittingText, { color: colors.textSecondary }]}>
                            Saving your sleep log...
                        </Text>
                    </View>
                ) : (
                    <>
                        <PrimaryButton
                            title="Save Sleep Log"
                            onPress={handleSubmit}
                            style={styles.submitButton}
                        />
                        <Text style={[styles.disclaimer, { color: colors.textLight }]}>
                            Your sleep data will be synced securely.
                        </Text>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerEmoji: {
        fontSize: 36,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.title - 4,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.caption,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    sectionEmoji: {
        fontSize: 20,
    },
    sectionTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
    },
    fieldContainer: {
        marginBottom: spacing.lg,
    },
    fieldLabel: {
        fontSize: typography.caption,
        fontWeight: '600',
        marginBottom: spacing.sm,
        letterSpacing: 0.3,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    pickerIcon: {
        fontSize: 20,
    },
    pickerText: {
        fontSize: typography.body,
        fontWeight: '600',
        flex: 1,
    },
    submitSection: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    submittingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    submittingText: {
        fontSize: typography.body,
        marginTop: spacing.md,
    },
    submitButton: {
        width: '100%',
    },
    disclaimer: {
        fontSize: typography.small,
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 18,
    },
});
