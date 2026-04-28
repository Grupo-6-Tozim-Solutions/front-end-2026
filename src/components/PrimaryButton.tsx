import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { Button } from './ui';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  style,
  disabled = false,
}) => {
  return (
    <Button
      title={title}
      onPress={onPress}
      variant="primary"
      disabled={disabled}
      style={style}
    />
  );
};
