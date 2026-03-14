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
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../styles/theme';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const QuestionnaireScreen: React.FC = () => {
    const { colors } = useTheme();

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
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>📋</Text>
                <Text style={[styles.title, { color: colors.text }]}>
                    Your Digital Profile
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Tell us about your daily habits so we can provide personalized insights.
                </Text>
            </View>

            {/* Form */}
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
                {/* Section: Personal Info */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>👤</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Personal Information
                    </Text>
                </View>

                <FormInput
                    label="Age"
                    value={age}
                    onChange={setAge}
                    placeholder="e.g., 25"
                    keyboardType="numeric"
                />

                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Gender</Text>
                    <View
                        style={[
                            styles.pickerWrapper,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Picker
                            selectedValue={gender}
                            onValueChange={(value) => setGender(value)}
                            style={[styles.picker, { color: colors.text }]}
                        >
                            <Picker.Item
                                label="Select gender..."
                                value=""
                                color={colors.textLight}
                            />
                            {genderOptions.map((option) => (
                                <Picker.Item key={option} label={option} value={option} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>

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
                {/* Section: Screen Time */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>📱</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Screen Usage
                    </Text>
                </View>

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
                {/* Section: Sleep */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>😴</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Sleep Schedule
                    </Text>
                </View>

                {/* Bed Time */}
                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Average bedtime
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.timeButton,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => setShowBedTimePicker(true)}
                    >
                        <Text style={styles.timeIcon}>🌙</Text>
                        <Text style={[styles.timeText, { color: colors.primary }]}>
                            {formatTime(bedTime)}
                        </Text>
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
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Average wake time
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.timeButton,
                            {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => setShowWakeTimePicker(true)}
                    >
                        <Text style={styles.timeIcon}>☀️</Text>
                        <Text style={[styles.timeText, { color: colors.primary }]}>
                            {formatTime(wakeTime)}
                        </Text>
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
                {/* Section: Stress */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>🧠</Text>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Stress Level
                    </Text>
                </View>

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
                <Text style={[styles.disclaimer, { color: colors.textLight }]}>
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
    pickerWrapper: {
        borderWidth: 1,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
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
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 18,
    },
});
