import React from 'react';
import { KeyboardTypeOptions, ViewStyle } from 'react-native';
import { Input } from './ui';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  style?: ViewStyle;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  style,
}) => {
  return (
    <Input
      label={label}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType={keyboardType}
      containerStyle={style}
    />
  );
};
