import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardTypeOptions,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../styles/theme';

interface FormInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    keyboardType?: KeyboardTypeOptions;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    value,
    onChange,
    placeholder,
    keyboardType = 'default',
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={colors.textLight}
                keyboardType={keyboardType}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.caption,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.md,
        fontSize: typography.body,
        color: colors.text,
    },
});
