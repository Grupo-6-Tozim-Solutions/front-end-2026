import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/ThemeContext';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
  unit?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  minLabel,
  maxLabel,
  step = 1,
  unit = '',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.accent }]}>
          {value}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={theme.colors.accent}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.accent}
      />
      {(minLabel || maxLabel) && (
        <View style={styles.legends}>
          <Text style={[styles.legendText, { color: theme.colors.textSubtle }]}>{minLabel || min}</Text>
          <Text style={[styles.legendText, { color: theme.colors.textSubtle }]}>{maxLabel || max}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 36,
  },
  legends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 12,
  },
});
