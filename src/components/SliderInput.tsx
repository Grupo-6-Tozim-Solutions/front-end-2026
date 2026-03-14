import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing } from '../styles/theme';

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
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.value, { color: colors.primary }]}>
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
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
            />
            {(minLabel || maxLabel) && (
                <View style={styles.legends}>
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                        {minLabel || min}
                    </Text>
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                        {maxLabel || max}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: typography.caption,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    value: {
        fontSize: typography.caption,
        fontWeight: '700',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    legends: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -spacing.xs,
    },
    legendText: {
        fontSize: typography.small,
    },
});
