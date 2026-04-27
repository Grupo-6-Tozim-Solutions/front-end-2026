import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface AppScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  style?: ViewStyle;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  scroll = false,
  contentStyle,
  style,
}) => {
  const { theme } = useTheme();

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }, style]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          style={styles.scroll}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
