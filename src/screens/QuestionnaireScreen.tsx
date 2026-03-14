import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    TouchableOpacity,
} from 'react-native';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { PrimaryButton } from '../components/PrimaryButton';
import { FormInput } from '../components/FormInput';
import { SliderInput } from '../components/SliderInput';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const QuestionnaireScreen: React.FC = () => {
    // Form state
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [screenTime, setScreenTime] = useState<number>(4);
    const [bedTime, setBedTime] = useState<Date>(new Date(2000, 0, 1, 23, 0));
    const [wakeTime, setWakeTime] = useState<Date>(new Date(2000, 0, 1, 7, 0));
    const [sleepQuality, setSleepQuality] = useState<number>(5);
    const [stressLevel, setStressLevel] = useState<number>(5);

    // Time picker visibility
    const [showBedTimePicker, setShowBedTimePicker] = useState<boolean>(false);
    const [showWakeTimePicker, setShowWakeTimePicker] = useState<boolean>(false);

    const onBedTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowBedTimePicker(Platform.OS === 'ios');
        if (selectedDate) setBedTime(selectedDate);
    };

    const onWakeTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowWakeTimePicker(Platform.OS === 'ios');
        if (selectedDate) setWakeTime(selectedDate);
    };

    const validate = (): boolean => {
        if (!age.trim()) {
            Alert.alert('Validation', 'Please enter your age.');
            return false;
        }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            Alert.alert('Validation', 'Please enter a valid age (1–120).');
            return false;
        }
        if (!gender) {
            Alert.alert('Validation', 'Please select your gender.');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const data = {
            age: parseInt(age, 10),
            gender,
            screenTime,
            bedTime: formatTime(bedTime),
            wakeTime: formatTime(wakeTime),
            sleepQuality,
            stressLevel,
        };

        console.log('=== Questionnaire Data ===');
        console.log(JSON.stringify(data, null, 2));
        console.log('=== Ready for API submission ===');

        Alert.alert(
            'Data Collected ✅',
            'Your responses have been recorded. In a future version, these will be sent to the analysis API.',
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>📋</Text>
                <Text style={styles.title}>Your Digital Profile</Text>
                <Text style={styles.subtitle}>
                    Tell us about your daily habits so we can provide personalized insights.
                </Text>
            </View>

            {/* Form */}
            <View style={styles.card}>
                {/* Section: Personal Info */}
                <Text style={styles.sectionTitle}>👤 Personal Information</Text>

                <FormInput
                    label="Age"
                    value={age}
                    onChange={setAge}
                    placeholder="e.g., 25"
                    keyboardType="numeric"
                />

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Gender</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={gender}
                            onValueChange={(value) => setGender(value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select gender..." value="" color={colors.textLight} />
                            {genderOptions.map((option) => (
                                <Picker.Item key={option} label={option} value={option} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                {/* Section: Screen Time */}
                <Text style={styles.sectionTitle}>📱 Screen Usage</Text>

                <SliderInput
                    label="Average daily screen time"
                    value={screenTime}
                    min={0}
                    max={12}
                    onChange={(v) => setScreenTime(Math.round(v))}
                    minLabel="0h"
                    maxLabel="12h"
                    unit="hours"
                />
            </View>

            <View style={styles.card}>
                {/* Section: Sleep */}
                <Text style={styles.sectionTitle}>😴 Sleep Schedule</Text>

                {/* Bed Time */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Average bedtime</Text>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowBedTimePicker(true)}
                    >
                        <Text style={styles.timeIcon}>🌙</Text>
                        <Text style={styles.timeText}>{formatTime(bedTime)}</Text>
                    </TouchableOpacity>
                    {showBedTimePicker && (
                        <DateTimePicker
                            value={bedTime}
                            mode="time"
                            is24Hour={true}
                            onChange={onBedTimeChange}
                        />
                    )}
                </View>

                {/* Wake Time */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Average wake time</Text>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowWakeTimePicker(true)}
                    >
                        <Text style={styles.timeIcon}>☀️</Text>
                        <Text style={styles.timeText}>{formatTime(wakeTime)}</Text>
                    </TouchableOpacity>
                    {showWakeTimePicker && (
                        <DateTimePicker
                            value={wakeTime}
                            mode="time"
                            is24Hour={true}
                            onChange={onWakeTimeChange}
                        />
                    )}
                </View>

                <SliderInput
                    label="Perceived sleep quality"
                    value={sleepQuality}
                    min={1}
                    max={10}
                    onChange={(v) => setSleepQuality(Math.round(v))}
                    minLabel="1 = Very Poor"
                    maxLabel="10 = Excellent"
                />
            </View>

            <View style={styles.card}>
                {/* Section: Stress */}
                <Text style={styles.sectionTitle}>🧠 Stress Level</Text>

                <SliderInput
                    label="Perceived stress level"
                    value={stressLevel}
                    min={1}
                    max={10}
                    onChange={(v) => setStressLevel(Math.round(v))}
                    minLabel="1 = Very Low"
                    maxLabel="10 = Very High"
                />
            </View>

            {/* Submit */}
            <View style={styles.submitSection}>
                <PrimaryButton
                    title="Generate My Analysis"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                />
                <Text style={styles.disclaimer}>
                    Your data is stored locally and will only be sent when connected to the
                    analysis API.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl + spacing.lg,
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
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    fieldContainer: {
        marginBottom: spacing.lg,
    },
    fieldLabel: {
        fontSize: typography.caption,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
        letterSpacing: 0.3,
    },
    pickerWrapper: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: colors.text,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    timeIcon: {
        fontSize: 20,
    },
    timeText: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primary,
    },
    submitSection: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    submitButton: {
        width: '100%',
    },
    disclaimer: {
        fontSize: typography.small,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 18,
    },
});
