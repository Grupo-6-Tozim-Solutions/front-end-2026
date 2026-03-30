import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { PrimaryButton } from '../components/PrimaryButton';
import { FormInput } from '../components/FormInput';
import { SliderInput } from '../components/SliderInput';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { deviceDataService } from '../services/deviceData';
import { permissionsService } from '../services/permissions';
import { typography, spacing, borderRadius } from '../styles/theme';
import { UserProfile } from '../types/user';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

interface QuestionnaireScreenProps {
    navigation?: any;
}

export const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const appContext = useAppContext();

    // Form state
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [screenTime, setScreenTime] = useState<string>('');
    const [screenTimesuggestion, setScreenTimeSuggestion] = useState<string>('');
    const [bedTime, setBedTime] = useState<Date>(new Date(2000, 0, 1, 23, 0));
    const [wakeTime, setWakeTime] = useState<Date>(new Date(2000, 0, 1, 7, 0));
    const [sleepQuality, setSleepQuality] = useState<number>(5);
    const [stressLevel, setStressLevel] = useState<number>(5);

    // Time picker visibility
    const [showBedTimePicker, setShowBedTimePicker] = useState<boolean>(false);
    const [showWakeTimePicker, setShowWakeTimePicker] = useState<boolean>(false);
    
    // Loading state
    const [isLoadingDeviceData, setIsLoadingDeviceData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ===== Load device data on mount =====
    useEffect(() => {
        const loadDeviceData = async () => {
            try {
                setIsLoadingDeviceData(true);

                // Request permissions first
                console.log('[Questionnaire] Requesting permissions...');
                await permissionsService.requestAllPermissions();

                // Try to get screen time
                console.log('[Questionnaire] Fetching screen time data...');
                const screenTimeData = await deviceDataService.getScreenTimeData();
                if (screenTimeData !== null) {
                    // screenTimeData in minutes, convert to hours
                    const hours = Math.round(screenTimeData / 60);
                    setScreenTimeSuggestion(`${hours} hours (from device)`);
                    setScreenTime(hours.toString());
                } else {
                    // Fallback: default suggestion
                    setScreenTimeSuggestion('–– Unable to read from device, please enter manually');
                    setScreenTime('');
                }

                // Get device info for logging
                const deviceInfo = await deviceDataService.getDeviceInfo();
                console.log('[Questionnaire] Device info:', deviceInfo);
            } catch (error) {
                console.error('[Questionnaire] Error loading device data:', error);
                setScreenTimeSuggestion('–– Unable to read device data');
            } finally {
                setIsLoadingDeviceData(false);
            }
        };

        loadDeviceData();
    }, []);

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
        if (!screenTime.trim()) {
            Alert.alert('Validation', 'Please enter your daily screen time.');
            return false;
        }
        const screenTimeNum = parseFloat(screenTime);
        if (isNaN(screenTimeNum) || screenTimeNum < 0 || screenTimeNum > 24) {
            Alert.alert('Validation', 'Please enter a valid screen time (0–24 hours).');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setIsSubmitting(true);

            const userData: UserProfile = {
                age,
                gender,
                screenTimePerDay: screenTime,
                bedTime: formatTime(bedTime),
                wakeTime: formatTime(wakeTime),
                sleepQuality: sleepQuality.toString(),
                stressLevel: stressLevel.toString(),
                createdAt: new Date().toISOString(),
            };

            // Save to context (includes local + async sync)
            await appContext.updateUserData(userData);
            
            // Mark as onboarded
            await appContext.setOnboarded(true);

            console.log('=== Questionnaire Data Saved ===');
            console.log(JSON.stringify(userData, null, 2));

            Alert.alert(
                'Profile Created ✅',
                'Your profile has been saved. Let\'s get started with tracking your sleep!',
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            // Navigation será automática via AppNavigator quando isOnboarded = true
                            // Mas se houver navegação explícita, pode descomente:
                            // navigation?.replace('Main');
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('[Questionnaire] Error submitting:', error);
            Alert.alert(
                'Error',
                'Failed to save your profile. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        try {
            setIsSubmitting(true);

            // Create dummy data for testing
            const userData: UserProfile = {
                age: '25',
                gender: 'Other',
                screenTimePerDay: '5',
                bedTime: '23:00',
                wakeTime: '07:00',
                sleepQuality: '7',
                stressLevel: '5',
                createdAt: new Date().toISOString(),
            };

            // Save to context
            await appContext.updateUserData(userData);
            
            // Mark as onboarded
            await appContext.setOnboarded(true);

            console.log('[Questionnaire] Skipped for testing - Default data saved');
        } catch (error) {
            console.error('[Questionnaire] Error skipping:', error);
            Alert.alert('Error', 'Failed to skip setup. Please try again.');
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
                    {isLoadingDeviceData && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {isLoadingDeviceData ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
                            Reading device data...
                        </Text>
                    </View>
                ) : (
                    <>
                        {screenTimesuggestion && (
                            <Text style={[styles.suggestion, { color: colors.primary }]}>
                                💡 {screenTimesuggestion}
                            </Text>
                        )}
                        <FormInput
                            label="Average daily screen time (hours)"
                            value={screenTime}
                            onChange={setScreenTime}
                            placeholder="e.g., 5"
                            keyboardType="decimal-pad"
                        />
                    </>
                )}
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
                {isSubmitting ? (
                    <View style={styles.submittingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.submittingText, { color: colors.textSecondary }]}>
                            Saving your profile...
                        </Text>
                    </View>
                ) : (
                    <>
                        <PrimaryButton
                            title="Generate My Analysis"
                            onPress={handleSubmit}
                            style={styles.submitButton}
                            disabled={isLoadingDeviceData || isSubmitting}
                        />
                        <TouchableOpacity
                            onPress={handleSkip}
                            disabled={isSubmitting}
                            style={styles.skipButton}
                        >
                            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                                Skip for testing
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.disclaimer, { color: colors.textLight }]}>
                            Your data is stored locally and synced securely when connected.
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
    skipButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
    },
    skipButtonText: {
        fontSize: typography.small,
        fontStyle: 'italic',
        textDecorationLine: 'underline',
    },
    disclaimer: {
        fontSize: typography.small,
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 18,
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    loaderText: {
        fontSize: typography.body,
        marginTop: spacing.md,
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
    suggestion: {
        fontSize: typography.caption,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
        fontWeight: '500',
    },
});
