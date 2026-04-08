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
import { translations } from '../languages/pt';

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
                    setScreenTimeSuggestion(`${hours} ${translations.questionnaire.deviceScreenTime}`);
                    setScreenTime(hours.toString());
                } else {
                    // Fallback: default suggestion
                    setScreenTimeSuggestion(translations.questionnaire.unableToReadDevice);
                    setScreenTime('');
                }

                // Get device info for logging
                const deviceInfo = await deviceDataService.getDeviceInfo();
                console.log('[Questionnaire] Device info:', deviceInfo);
            } catch (error) {
                console.error('[Questionnaire] Error loading device data:', error);
                setScreenTimeSuggestion(translations.questionnaire.unableToReadDevice);
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
            Alert.alert(translations.common.validation, translations.questionnaire.validationAge);
            return false;
        }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            Alert.alert(translations.common.validation, translations.questionnaire.validationAgeRange);
            return false;
        }
        if (!gender) {
            Alert.alert(translations.common.validation, translations.questionnaire.validationGender);
            return false;
        }
        if (!screenTime.trim()) {
            Alert.alert(translations.common.validation, translations.questionnaire.validationScreenTime);
            return false;
        }
        const screenTimeNum = parseFloat(screenTime);
        if (isNaN(screenTimeNum) || screenTimeNum < 0 || screenTimeNum > 24) {
            Alert.alert(translations.common.validation, translations.questionnaire.validationScreenTimeRange);
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
                translations.questionnaire.success,
                translations.questionnaire.successMessage,
                [
                    {
                        text: translations.common.continue,
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
                translations.common.error,
                translations.questionnaire.errorMessage,
                [{ text: translations.common.ok }]
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
            Alert.alert(translations.common.error, translations.questionnaire.errorMessage);
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
                    Seu Perfil Digital
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Conte-nos sobre seus hábitos diários para que possamos fornecer insights personalizados.
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
                        Informações Pessoais
                    </Text>
                </View>

                <FormInput
                    label={translations.questionnaire.age}
                    value={age}
                    onChange={setAge}
                    placeholder="ex: 25"
                    keyboardType="numeric"
                />

                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>{translations.questionnaire.gender}</Text>
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
                                label="Selecione o gênero..."
                                value=""
                                color={colors.textLight}
                            />
                            <Picker.Item label={translations.questionnaire.male} value="Male" />
                            <Picker.Item label={translations.questionnaire.female} value="Female" />
                            <Picker.Item label={translations.questionnaire.other} value="Other" />
                            <Picker.Item label={translations.questionnaire.preferNotToSay} value="Prefer not to say" />
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
                        Tempo de Tela
                    </Text>
                    {isLoadingDeviceData && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {isLoadingDeviceData ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
                            {translations.questionnaire.loadingDeviceData}
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
                            label={translations.questionnaire.screenTime}
                            value={screenTime}
                            onChange={setScreenTime}
                            placeholder="ex: 5"
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
                        Cronograma de Sono
                    </Text>
                </View>

                {/* Bed Time */}
                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Hora média de dormir
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
                        Hora média de acordar
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
                    label="Qualidade de sono percebida"
                    value={sleepQuality}
                    min={1}
                    max={10}
                    onChange={(v) => setSleepQuality(Math.round(v))}
                    minLabel={translations.questionnaire.veryPoor}
                    maxLabel={translations.questionnaire.excellent}
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
                        Nível de Estresse
                    </Text>
                </View>

                <SliderInput
                    label="Nível de estresse percebido"
                    value={stressLevel}
                    min={1}
                    max={10}
                    onChange={(v) => setStressLevel(Math.round(v))}
                    minLabel={translations.questionnaire.lowStress}
                    maxLabel={translations.questionnaire.highStress}
                />
            </View>

            {/* Submit */}
            <View style={styles.submitSection}>
                {isSubmitting ? (
                    <View style={styles.submittingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.submittingText, { color: colors.textSecondary }]}>
                            {translations.questionnaire.submitting}
                        </Text>
                    </View>
                ) : (
                    <>
                        <PrimaryButton
                            title={translations.questionnaire.submitButton}
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
                                {translations.questionnaire.skipButton}
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.disclaimer, { color: colors.textLight }]}>
                            Seus dados são armazenados localmente e sincronizados com segurança quando conectado.
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
