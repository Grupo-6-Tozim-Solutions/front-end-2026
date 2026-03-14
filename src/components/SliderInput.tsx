import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, spacing } from '../styles/theme';

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
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>
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
                    <Text style={styles.legendText}>{minLabel || min}</Text>
                    <Text style={styles.legendText}>{maxLabel || max}</Text>
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
        color: colors.text,
        letterSpacing: 0.3,
    },
    value: {
        fontSize: typography.caption,
        fontWeight: '700',
        color: colors.primary,
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
        color: colors.textSecondary,
    },
});
