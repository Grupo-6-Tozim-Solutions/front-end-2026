import React from 'react';
import { View, StyleSheet } from 'react-native';

export const ThemeToggle: React.FC = () => {
  return <View style={styles.hidden} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
};

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
  },
});
