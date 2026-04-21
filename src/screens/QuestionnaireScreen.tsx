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
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { getCoordsFromCEP, getCurrentLocation } from '../services/geolocation';
import { typography, spacing, borderRadius } from '../styles/theme';
import { UserProfile } from '../types/user';
import { translations } from '../languages/pt';

const TOTAL_STEPS = 8;

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

    // === STEP MANAGEMENT ===
    const [currentStep, setCurrentStep] = useState<number>(0);

    // === FORM DATA ===
    // Step 0: Sleep Schedule
    const [bedTime, setBedTime] = useState<Date>(new Date(2000, 0, 1, 23, 0));
    const [wakeTime, setWakeTime] = useState<Date>(new Date(2000, 0, 1, 7, 0));
    const [showBedTimePicker, setShowBedTimePicker] = useState<boolean>(false);
    const [showWakeTimePicker, setShowWakeTimePicker] = useState<boolean>(false);

    // Step 1: Phone Usage End Time
    const [phoneUsageEndTime, setPhoneUsageEndTime] = useState<string>('');

    // Step 2: Phone in Bed
    const [phoneInBed, setPhoneInBed] = useState<string>('');

    // Step 3: Sleep Consistency
    const [sleepConsistency, setSleepConsistency] = useState<string>('');

    // Step 4: Wake Restfulness
    const [wakeRestfulness, setWakeRestfulness] = useState<string>('');

    // Step 5: Fall Asleep Duration
    const [fallAsleepDuration, setFallAsleepDuration] = useState<string>('');

    // Step 6: Location
    const [homeZipCode, setHomeZipCode] = useState<string>('');
    const [homeAddress, setHomeAddress] = useState<string>('');
    const [homeStreet, setHomeStreet] = useState<string | undefined>(undefined);
    const [homeCity, setHomeCity] = useState<string | undefined>(undefined);
    const [homeState, setHomeState] = useState<string | undefined>(undefined);
    const [homeLatitude, setHomeLatitude] = useState<number | undefined>(undefined);
    const [homeLongitude, setHomeLongitude] = useState<number | undefined>(undefined);
    const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

    // Step 7: Personal Info
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<string>('');

    // === SUBMISSION STATE ===
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ===== LOCATION HANDLERS =====
    const handleZipCodeChange = async (value: string) => {
        setHomeZipCode(value);

        const cleanValue = value.replace('-', '');
        if (cleanValue.length === 8 && /^\d{8}$/.test(cleanValue)) {
            try {
                setIsLoadingCoordinates(true);
                const coords = await getCoordsFromCEP(value);

                if (coords) {
                    setHomeLatitude(coords.latitude);
                    setHomeLongitude(coords.longitude);
                    setHomeStreet(coords.street);
                    setHomeCity(coords.city);
                    setHomeState(coords.state);
                    setHomeAddress(`${coords.street || ''}, ${coords.city || ''}, ${coords.state || ''}`);
                    console.log('[Questionnaire] CEP resolved to coordinates:', coords);
                } else {
                    Alert.alert(
                        translations.questionnaire.validationZipCode,
                        translations.questionnaire.coordinatesNotFound
                    );
                    setHomeLatitude(undefined);
                    setHomeLongitude(undefined);
                    setHomeStreet(undefined);
                    setHomeCity(undefined);
                    setHomeState(undefined);
                    setHomeAddress('');
                }
            } catch (error) {
                console.error('[Questionnaire] Error resolving CEP:', error);
                Alert.alert(translations.common.error, translations.questionnaire.coordinatesNotFound);
            } finally {
                setIsLoadingCoordinates(false);
            }
        }
    };

    const handleGetCurrentLocation = async () => {
        try {
            setIsGettingCurrentLocation(true);
            console.log('[Questionnaire] Starting location request...');

            const location = await getCurrentLocation();

            if (location) {
                setHomeLatitude(location.latitude);
                setHomeLongitude(location.longitude);
                setHomeStreet(location.street);
                setHomeCity(location.city);
                setHomeState(location.state);
                setHomeAddress(`${location.street || ''}, ${location.city || ''}, ${location.state || ''}`);
                setHomeZipCode('');

                console.log('[Questionnaire] Current location set:', location);
            } else {
                Alert.alert(
                    translations.questionnaire.locationPermissionRequired,
                    translations.questionnaire.locationError
                );
            }
        } catch (error) {
            console.error('[Questionnaire] Error getting location:', error);
            Alert.alert(translations.common.error, translations.questionnaire.locationError);
        } finally {
            setIsGettingCurrentLocation(false);
        }
    };

    // ===== TIME PICKERS =====
    const onBedTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowBedTimePicker(Platform.OS === 'ios');
        if (selectedDate) setBedTime(selectedDate);
    };

    const onWakeTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowWakeTimePicker(Platform.OS === 'ios');
        if (selectedDate) setWakeTime(selectedDate);
    };

    // ===== VALIDATION =====
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0:
                // Sleep Schedule - times are always set, no validation needed
                return true;
            case 1:
                if (!phoneUsageEndTime) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationPhoneUsageEndTime
                    );
                    return false;
                }
                return true;
            case 2:
                if (!phoneInBed) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationPhoneInBed
                    );
                    return false;
                }
                return true;
            case 3:
                if (!sleepConsistency) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationSleepConsistency
                    );
                    return false;
                }
                return true;
            case 4:
                if (!wakeRestfulness) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationWakeRestfulness
                    );
                    return false;
                }
                return true;
            case 5:
                if (!fallAsleepDuration) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationFallAsleepDuration
                    );
                    return false;
                }
                return true;
            case 6:
                // Location: at least CEP or current location must be set
                if (!homeAddress.trim()) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationZipCode
                    );
                    return false;
                }
                if (homeLatitude === undefined || homeLongitude === undefined) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.coordinatesNotFound
                    );
                    return false;
                }
                return true;
            case 7:
                // Personal Info
                if (!age.trim()) {
                    Alert.alert(translations.common.validation, translations.questionnaire.validationAge);
                    return false;
                }
                const ageNum = parseInt(age, 10);
                if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationAgeRange
                    );
                    return false;
                }
                if (!gender) {
                    Alert.alert(
                        translations.common.validation,
                        translations.questionnaire.validationGender
                    );
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    // ===== NAVIGATION =====
    const handleNext = () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // ===== SUBMISSION =====
    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        try {
            setIsSubmitting(true);

            const userData: UserProfile = {
                age,
                gender,
                bedTime: formatTime(bedTime),
                wakeTime: formatTime(wakeTime),
                phoneUsageEndTime,
                phoneInBed,
                sleepConsistency,
                wakeRestfulness,
                fallAsleepDuration,
                homeZipCode,
                homeAddress,
                homeLatitude,
                homeLongitude,
                sleepQuality: '5', // Default value
                stressLevel: '5', // Default value
                createdAt: new Date().toISOString(),
            };

            // Save to context
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
                            // Navigation will happen automatically via AppNavigator
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

    // ===== RENDER STEP CONTENT =====
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>😴</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.sleepScheduleTitle}
                            </Text>
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.sleepScheduleDesc}
                        </Text>

                        {/* Bed Time */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                {translations.questionnaire.bedTimeLabel}
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
                                {translations.questionnaire.wakeTimeLabel}
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
                    </View>
                );

            case 1:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>🌙</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.phoneUsageEndTimeTitle}
                            </Text>
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.phoneUsageEndTimeDesc}
                        </Text>

                        <View style={styles.radioGroupContainer}>
                            {[
                                { label: translations.questionnaire.phoneUsageEndTimeBefore22, value: 'before_22h' },
                                { label: translations.questionnaire.phoneUsageEndTimeUntil23, value: 'until_23h' },
                                { label: translations.questionnaire.phoneUsageEndTimeUntil00, value: 'until_00h' },
                                { label: translations.questionnaire.phoneUsageEndTimeAfter00, value: 'after_00h' },
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.radioButton,
                                        {
                                            backgroundColor: colors.surfaceElevated,
                                            borderColor: phoneUsageEndTime === option.value ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => setPhoneUsageEndTime(option.value)}
                                >
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            {
                                                backgroundColor:
                                                    phoneUsageEndTime === option.value ? colors.primary : 'transparent',
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.radioLabel, { color: colors.text }]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>📱</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.phoneInBedTitle}
                            </Text>
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.phoneInBedDesc}
                        </Text>

                        <View style={styles.radioGroupContainer}>
                            {[
                                { label: translations.questionnaire.phoneInBedNever, value: 'never' },
                                { label: translations.questionnaire.phoneInBedSometimes, value: 'sometimes' },
                                { label: translations.questionnaire.phoneInBedAlways, value: 'always' },
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.radioButton,
                                        {
                                            backgroundColor: colors.surfaceElevated,
                                            borderColor: phoneInBed === option.value ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => setPhoneInBed(option.value)}
                                >
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            {
                                                backgroundColor: phoneInBed === option.value ? colors.primary : 'transparent',
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.radioLabel, { color: colors.text }]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>🔁</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.sleepConsistencyTitle}
                            </Text>
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.sleepConsistencyDesc}
                        </Text>

                        <View style={styles.radioGroupContainer}>
                            {[
                                { label: translations.questionnaire.sleepConsistencyRegular, value: 'regular' },
                                { label: translations.questionnaire.sleepConsistencySlightVariation, value: 'slight_variation' },
                                { label: translations.questionnaire.sleepConsistencyHighVariation, value: 'high_variation' },
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.radioButton,
                                        {
                                            backgroundColor: colors.surfaceElevated,
                                            borderColor: sleepConsistency === option.value ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => setSleepConsistency(option.value)}
                                >
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            {
                                                backgroundColor: sleepConsistency === option.value ? colors.primary : 'transparent',
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.radioLabel, { color: colors.text }]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>😃</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.wakeRestfulnessTitle}
                            </Text>
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.wakeRestfulnessDesc}
                        </Text>

                        <View style={styles.radioGroupContainer}>
                            {[
                                { label: translations.questionnaire.wakeRestfulnessAlways, value: 'always' },
                                { label: translations.questionnaire.wakeRestfulnessSometimes, value: 'sometimes' },
                                { label: translations.questionnaire.wakeRestfulnessNever, value: 'never' },
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.radioButton,
                                        {
                                            backgroundColor: colors.surfaceElevated,
                                            borderColor: wakeRestfulness === option.value ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => setWakeRestfulness(option.value)}
                                >
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            {
                                                backgroundColor: wakeRestfulness === option.value ? colors.primary : 'transparent',
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.radioLabel, { color: colors.text }]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 5:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>⏳</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.fallAsleepDurationTitle}
                            </Text>
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.fallAsleepDurationDesc}
                        </Text>

                        <View style={styles.radioGroupContainer}>
                            {[
                                { label: translations.questionnaire.fallAsleepDurationLess15, value: 'less_15min' },
                                { label: translations.questionnaire.fallAsleepDuration15_30, value: '15_30min' },
                                { label: translations.questionnaire.fallAsleepDuration30_60, value: '30_60min' },
                                { label: translations.questionnaire.fallAsleepDurationMore60, value: 'more_60min' },
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.radioButton,
                                        {
                                            backgroundColor: colors.surfaceElevated,
                                            borderColor: fallAsleepDuration === option.value ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => setFallAsleepDuration(option.value)}
                                >
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            {
                                                backgroundColor: fallAsleepDuration === option.value ? colors.primary : 'transparent',
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.radioLabel, { color: colors.text }]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 6:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>📍</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.locationTitle}
                            </Text>
                            {(isLoadingCoordinates || isGettingCurrentLocation) && (
                                <ActivityIndicator size="small" color={colors.primary} />
                            )}
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.locationDesc}
                        </Text>

                        <FormInput
                            label={translations.questionnaire.homeZipCode}
                            value={homeZipCode}
                            onChange={handleZipCodeChange}
                            placeholder={translations.questionnaire.homeZipCodePlaceholder}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            style={[
                                styles.locationButton,
                                {
                                    backgroundColor: colors.primary,
                                    opacity: isGettingCurrentLocation ? 0.6 : 1,
                                },
                            ]}
                            onPress={handleGetCurrentLocation}
                            disabled={isGettingCurrentLocation}
                        >
                            {isGettingCurrentLocation ? (
                                <>
                                    <ActivityIndicator size="small" color={colors.surface} style={{ marginRight: spacing.sm }} />
                                    <Text style={[styles.locationButtonText, { color: colors.surface }]}>
                                        {translations.questionnaire.gettingLocation}
                                    </Text>
                                </>
                            ) : (
                                <Text style={[styles.locationButtonText, { color: colors.surface }]}>
                                    📍 {translations.questionnaire.getMyLocation}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {homeAddress && homeLatitude !== undefined && homeLongitude !== undefined && (
                            <View style={[styles.successMessage, { backgroundColor: colors.success }]}>
                                <Text style={[styles.successMessageText, { color: colors.text, fontWeight: 'bold' }]}>
                                    ✅ Endereço confirmado
                                </Text>
                                <Text style={[styles.addressText, { color: colors.text }]}>
                                    {homeStreet && <Text>{homeStreet}</Text>}
                                    {homeCity && homeStreet && <Text>\n</Text>}
                                    {homeCity && <Text>{homeCity}</Text>}
                                    {homeState && homeCity && <Text>, </Text>}
                                    {homeState && <Text>{homeState}</Text>}
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 7:
                return (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>👤</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {translations.questionnaire.personalInfoTitle}
                            </Text>
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {translations.questionnaire.personalInfoDesc}
                        </Text>

                        <FormInput
                            label={translations.questionnaire.age}
                            value={age}
                            onChange={setAge}
                            placeholder="ex: 25"
                            keyboardType="numeric"
                        />

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.fieldLabel, { color: colors.text }]}>
                                {translations.questionnaire.gender}
                            </Text>
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
                );

            default:
                return null;
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
                    {translations.questionnaire.title}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {translations.questionnaire.subtitle}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%`,
                            backgroundColor: colors.primary,
                        },
                    ]}
                />
            </View>

            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Etapa {currentStep + 1} de {TOTAL_STEPS}
            </Text>

            {/* Step Content Card */}
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
                {renderStepContent()}
            </View>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
                {isSubmitting ? (
                    <View style={styles.submittingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.submittingText, { color: colors.textSecondary }]}>
                            {translations.questionnaire.submitting}
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.buttonRow}>
                            {currentStep > 0 && (
                                <TouchableOpacity
                                    style={[styles.secondaryButton, { borderColor: colors.primary }]}
                                    onPress={handlePrevious}
                                >
                                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                                        {translations.questionnaire.previousButton}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {currentStep < TOTAL_STEPS - 1 ? (
                                <PrimaryButton
                                    title={translations.questionnaire.nextButton}
                                    onPress={handleNext}
                                    style={currentStep === 0 ? { ...styles.nextButton, flex: 1 } : styles.nextButton}
                                />
                            ) : (
                                <PrimaryButton
                                    title={translations.questionnaire.submitButton}
                                    onPress={handleSubmit}
                                    style={{ ...styles.nextButton, flex: 1 }}
                                />
                            )}
                        </View>

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
    progressContainer: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    progressLabel: {
        fontSize: typography.small,
        textAlign: 'center',
        marginBottom: spacing.lg,
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
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    sectionEmoji: {
        fontSize: 20,
    },
    sectionTitle: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        flex: 1,
    },
    stepDesc: {
        fontSize: typography.body,
        marginBottom: spacing.lg,
        lineHeight: 20,
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
    radioGroupContainer: {
        gap: spacing.md,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.md,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    radioLabel: {
        fontSize: typography.body,
        fontWeight: '500',
        flex: 1,
    },
    navigationContainer: {
        marginTop: spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
    },
    secondaryButton: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    secondaryButtonText: {
        fontSize: typography.body,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        marginVertical: spacing.md,
    },
    locationButtonText: {
        fontSize: typography.body,
        fontWeight: '600',
    },
    successMessage: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginVertical: spacing.sm,
        alignItems: 'center',
    },
    successMessageText: {
        fontSize: typography.caption,
        fontWeight: '500',
    },
    addressText: {
        fontSize: typography.caption,
        marginTop: spacing.sm,
        lineHeight: 18,
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
    disclaimer: {
        fontSize: typography.small,
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 18,
    },
});
