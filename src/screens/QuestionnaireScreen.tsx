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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCoordsFromCEP, getCurrentLocation } from '../services/geolocation';
import { useAppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../languages/pt';
import { UserProfile } from '../types/user';
import { OnboardingStackParamList } from '../navigation/AppNavigator';
import { AppIcon, AppScreen, Button, GlassCard, Header, Input } from '../components/ui';
import { InlineFeedback } from '../components/states';

const TOTAL_STEPS = 8;

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

interface QuestionnaireScreenProps {
  navigation?: NativeStackNavigationProp<OnboardingStackParamList, 'Questionnaire'>;
}

interface Option {
  label: string;
  value: string;
}

export const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = () => {
  const { theme } = useTheme();
  const appContext = useAppContext();

  const [currentStep, setCurrentStep] = useState(0);

  const [bedTime, setBedTime] = useState<Date>(new Date(2000, 0, 1, 23, 0));
  const [wakeTime, setWakeTime] = useState<Date>(new Date(2000, 0, 1, 7, 0));
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const [phoneUsageEndTime, setPhoneUsageEndTime] = useState('');
  const [phoneInBed, setPhoneInBed] = useState('');
  const [sleepConsistency, setSleepConsistency] = useState('');
  const [wakeRestfulness, setWakeRestfulness] = useState('');
  const [fallAsleepDuration, setFallAsleepDuration] = useState('');

  const [homeZipCode, setHomeZipCode] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [homeStreet, setHomeStreet] = useState<string | undefined>(undefined);
  const [homeCity, setHomeCity] = useState<string | undefined>(undefined);
  const [homeState, setHomeState] = useState<string | undefined>(undefined);
  const [homeLatitude, setHomeLatitude] = useState<number | undefined>(undefined);
  const [homeLongitude, setHomeLongitude] = useState<number | undefined>(undefined);

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progressValue = useMemo(() => ((currentStep + 1) / TOTAL_STEPS) * 100, [currentStep]);

  const onBedTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowBedTimePicker(Platform.OS === 'ios');
    if (selectedDate) setBedTime(selectedDate);
  };

  const onWakeTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowWakeTimePicker(Platform.OS === 'ios');
    if (selectedDate) setWakeTime(selectedDate);
  };

  const handleZipCodeChange = async (value: string) => {
    setHomeZipCode(value);

    const cleanValue = value.replace('-', '');
    if (cleanValue.length === 8 && /^\d{8}$/.test(cleanValue)) {
      try {
        setIsLoadingCoordinates(true);
        const coords = await getCoordsFromCEP(value);

        if (!coords) {
          Alert.alert(translations.common.validation, translations.questionnaire.coordinatesNotFound);
          setHomeLatitude(undefined);
          setHomeLongitude(undefined);
          setHomeStreet(undefined);
          setHomeCity(undefined);
          setHomeState(undefined);
          setHomeAddress('');
          return;
        }

        setHomeLatitude(coords.latitude);
        setHomeLongitude(coords.longitude);
        setHomeStreet(coords.street);
        setHomeCity(coords.city);
        setHomeState(coords.state);
        setHomeAddress(`${coords.street || ''}, ${coords.city || ''}, ${coords.state || ''}`.replace(/^,\s*|,\s*$/g, ''));
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
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert(translations.questionnaire.locationPermissionRequired, translations.questionnaire.locationError);
        return;
      }

      setHomeLatitude(location.latitude);
      setHomeLongitude(location.longitude);
      setHomeStreet(location.street);
      setHomeCity(location.city);
      setHomeState(location.state);
      setHomeAddress(`${location.street || ''}, ${location.city || ''}, ${location.state || ''}`.replace(/^,\s*|,\s*$/g, ''));
      setHomeZipCode('');
    } catch (error) {
      console.error('[Questionnaire] Error getting location:', error);
      Alert.alert(translations.common.error, translations.questionnaire.locationError);
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!phoneUsageEndTime) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationPhoneUsageEndTime);
          return false;
        }
        return true;
      case 2:
        if (!phoneInBed) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationPhoneInBed);
          return false;
        }
        return true;
      case 3:
        if (!sleepConsistency) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationSleepConsistency);
          return false;
        }
        return true;
      case 4:
        if (!wakeRestfulness) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationWakeRestfulness);
          return false;
        }
        return true;
      case 5:
        if (!fallAsleepDuration) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationFallAsleepDuration);
          return false;
        }
        return true;
      case 6:
        if (!homeAddress.trim()) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationZipCode);
          return false;
        }
        if (homeLatitude === undefined || homeLongitude === undefined) {
          Alert.alert(translations.common.validation, translations.questionnaire.coordinatesNotFound);
          return false;
        }
        return true;
      case 7:
        if (!age.trim()) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationAge);
          return false;
        }

        const ageNum = parseInt(age, 10);
        if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationAgeRange);
          return false;
        }

        if (!gender) {
          Alert.alert(translations.common.validation, translations.questionnaire.validationGender);
          return false;
        }

        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((previous) => previous + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((previous) => previous - 1);
    }
  };

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
        sleepQuality: '5',
        stressLevel: '5',
        createdAt: new Date().toISOString(),
      };

      await appContext.updateUserData(userData);
      await appContext.setOnboarded(true);

      Alert.alert(translations.questionnaire.success, translations.questionnaire.successMessage);
    } catch (error) {
      console.error('[Questionnaire] Error submitting:', error);
      Alert.alert(translations.common.error, translations.questionnaire.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOption = (
    option: Option,
    selected: string,
    onSelect: (value: string) => void,
  ) => {
    const isSelected = selected === option.value;

    return (
      <Pressable
        key={option.value}
        onPress={() => onSelect(option.value)}
        style={[
          styles.option,
          {
            borderColor: isSelected ? theme.colors.accent : theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: isSelected ? theme.colors.accentSoft : theme.colors.surface,
          },
        ]}
      >
        <AppIcon
          name={isSelected ? 'checkCircle' : 'circle'}
          size={18}
          color={isSelected ? theme.colors.accent : theme.colors.textSubtle}
          weight={isSelected ? 'fill' : 'regular'}
        />
        <Text style={[styles.optionLabel, { color: theme.colors.text }]}>{option.label}</Text>
      </Pressable>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.sleepScheduleTitle}
              subtitle={translations.questionnaire.sleepScheduleDesc}
              icon="moonStars"
            />

            <Pressable
              style={[
                styles.timeButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                },
              ]}
              onPress={() => setShowBedTimePicker(true)}
            >
              <AppIcon name="moon" color={theme.colors.accent} size={18} />
              <View style={styles.timeTextWrap}>
                <Text style={[styles.timeLabel, { color: theme.colors.textMuted }]}>{translations.questionnaire.bedTimeLabel}</Text>
                <Text style={[styles.timeValue, { color: theme.colors.text }]}>{formatTime(bedTime)}</Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.timeButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                },
              ]}
              onPress={() => setShowWakeTimePicker(true)}
            >
              <AppIcon name="sun" color={theme.colors.accent} size={18} />
              <View style={styles.timeTextWrap}>
                <Text style={[styles.timeLabel, { color: theme.colors.textMuted }]}>{translations.questionnaire.wakeTimeLabel}</Text>
                <Text style={[styles.timeValue, { color: theme.colors.text }]}>{formatTime(wakeTime)}</Text>
              </View>
            </Pressable>

            {showBedTimePicker ? <DateTimePicker value={bedTime} mode="time" is24Hour onChange={onBedTimeChange} /> : null}
            {showWakeTimePicker ? <DateTimePicker value={wakeTime} mode="time" is24Hour onChange={onWakeTimeChange} /> : null}
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.phoneUsageEndTimeTitle}
              subtitle={translations.questionnaire.phoneUsageEndTimeDesc}
              icon="moon"
            />
            <View style={styles.optionsWrap}>
              {[
                { label: translations.questionnaire.phoneUsageEndTimeBefore22, value: 'before_22h' },
                { label: translations.questionnaire.phoneUsageEndTimeUntil23, value: 'until_23h' },
                { label: translations.questionnaire.phoneUsageEndTimeUntil00, value: 'until_00h' },
                { label: translations.questionnaire.phoneUsageEndTimeAfter00, value: 'after_00h' },
              ].map((option) => renderOption(option, phoneUsageEndTime, setPhoneUsageEndTime))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.phoneInBedTitle}
              subtitle={translations.questionnaire.phoneInBedDesc}
              icon="chat"
            />
            <View style={styles.optionsWrap}>
              {[
                { label: translations.questionnaire.phoneInBedNever, value: 'never' },
                { label: translations.questionnaire.phoneInBedSometimes, value: 'sometimes' },
                { label: translations.questionnaire.phoneInBedAlways, value: 'always' },
              ].map((option) => renderOption(option, phoneInBed, setPhoneInBed))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.sleepConsistencyTitle}
              subtitle={translations.questionnaire.sleepConsistencyDesc}
              icon="chart"
            />
            <View style={styles.optionsWrap}>
              {[
                { label: translations.questionnaire.sleepConsistencyRegular, value: 'regular' },
                {
                  label: translations.questionnaire.sleepConsistencySlightVariation,
                  value: 'slight_variation',
                },
                { label: translations.questionnaire.sleepConsistencyHighVariation, value: 'high_variation' },
              ].map((option) => renderOption(option, sleepConsistency, setSleepConsistency))}
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.wakeRestfulnessTitle}
              subtitle={translations.questionnaire.wakeRestfulnessDesc}
              icon="sun"
            />
            <View style={styles.optionsWrap}>
              {[
                { label: translations.questionnaire.wakeRestfulnessAlways, value: 'always' },
                { label: translations.questionnaire.wakeRestfulnessSometimes, value: 'sometimes' },
                { label: translations.questionnaire.wakeRestfulnessNever, value: 'never' },
              ].map((option) => renderOption(option, wakeRestfulness, setWakeRestfulness))}
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.fallAsleepDurationTitle}
              subtitle={translations.questionnaire.fallAsleepDurationDesc}
              icon="hourglass"
            />
            <View style={styles.optionsWrap}>
              {[
                { label: translations.questionnaire.fallAsleepDurationLess15, value: 'less_15min' },
                { label: translations.questionnaire.fallAsleepDuration15_30, value: '15_30min' },
                { label: translations.questionnaire.fallAsleepDuration30_60, value: '30_60min' },
                { label: translations.questionnaire.fallAsleepDurationMore60, value: 'more_60min' },
              ].map((option) => renderOption(option, fallAsleepDuration, setFallAsleepDuration))}
            </View>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.locationTitle}
              subtitle={translations.questionnaire.locationDesc}
              icon="location"
            />

            <Input
              label={translations.questionnaire.homeZipCode}
              value={homeZipCode}
              onChangeText={handleZipCodeChange}
              placeholder={translations.questionnaire.homeZipCodePlaceholder}
              keyboardType="numeric"
              icon="location"
            />

            <Button
              title={isGettingCurrentLocation ? translations.questionnaire.gettingLocation : translations.questionnaire.getMyLocation}
              onPress={handleGetCurrentLocation}
              variant="secondary"
              icon="location"
              disabled={isGettingCurrentLocation}
              loading={isGettingCurrentLocation}
            />

            {isLoadingCoordinates ? <ActivityIndicator color={theme.colors.accent} size="small" /> : null}

            {homeAddress && homeLatitude !== undefined && homeLongitude !== undefined ? (
              <InlineFeedback
                tone="success"
                message={`${homeStreet || ''} ${homeCity || ''} ${homeState || ''}`.trim() || 'Endereço confirmado'}
              />
            ) : null}
          </View>
        );
      case 7:
        return (
          <View style={styles.stepContent}>
            <Header
              title={translations.questionnaire.personalInfoTitle}
              subtitle={translations.questionnaire.personalInfoDesc}
              icon="profile"
            />

            <Input
              label={translations.questionnaire.age}
              value={age}
              onChangeText={setAge}
              placeholder="Ex.: 25"
              keyboardType="numeric"
              icon="profile"
            />

            <View style={styles.optionsWrap}>
              {[
                { label: translations.questionnaire.male, value: 'male' },
                { label: translations.questionnaire.female, value: 'female' },
                { label: translations.questionnaire.other, value: 'other' },
                { label: translations.questionnaire.preferNotToSay, value: 'prefer_not_to_say' },
              ].map((option) => renderOption(option, gender, setGender))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <AppScreen scroll>
      <Header
        title={translations.questionnaire.title}
        subtitle={translations.questionnaire.subtitle}
        icon="list"
      />

      <View style={[styles.progressTrack, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressValue}%`,
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.pill,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
        Etapa {currentStep + 1} de {TOTAL_STEPS}
      </Text>

      <GlassCard variant="elevated" contentStyle={styles.stepCard}>
        {renderCurrentStep()}
      </GlassCard>

      {isSubmitting ? (
        <GlassCard variant="subtle">
          <ActivityIndicator color={theme.colors.accent} size="small" />
          <Text style={[styles.submittingText, { color: theme.colors.textMuted }]}>
            {translations.questionnaire.submitting}
          </Text>
        </GlassCard>
      ) : (
        <View style={styles.navigationWrap}>
          <View style={styles.navRow}>
            {currentStep > 0 ? (
              <Button title={translations.questionnaire.previousButton} onPress={handlePrevious} variant="ghost" style={styles.navButton} />
            ) : null}
            <Button
              title={currentStep < TOTAL_STEPS - 1 ? translations.questionnaire.nextButton : translations.questionnaire.submitButton}
              onPress={currentStep < TOTAL_STEPS - 1 ? handleNext : handleSubmit}
              icon={currentStep < TOTAL_STEPS - 1 ? 'arrowRight' : 'check'}
              iconPosition="right"
              style={styles.navButton}
            />
          </View>

          <InlineFeedback
            tone="info"
            message="Seus dados são usados para personalizar recomendações e melhorar a qualidade das análises."
          />
        </View>
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  stepCard: {
    gap: 14,
  },
  stepContent: {
    gap: 12,
  },
  timeButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  timeTextWrap: {
    gap: 2,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionsWrap: {
    gap: 10,
  },
  option: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submittingText: {
    fontSize: 14,
    marginTop: 8,
  },
  navigationWrap: {
    gap: 10,
    paddingBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
  },
});
