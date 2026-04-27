import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

interface InsightsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'InsightsScreen'>;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();

  // Mocked data
  const sleepComparison = -15; // Example: -15% worse than average
  const phoneUsageAfterMidnight = 5; // Example: 5 times
  const phoneImpact = 'Grave'; // Example: Grave impact

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
      </View>

      <View style={styles.insightBox}>
        <Text style={[styles.insightText, { color: colors.text }]}>Seu tempo de sono está {sleepComparison}% pior que a média.</Text>
      </View>

      <View style={styles.insightBox}>
        <Text style={[styles.insightText, { color: colors.text }]}>Você usou o celular {phoneUsageAfterMidnight} vezes após as 00:00.</Text>
        <Text style={[styles.insightText, { color: colors.text }]}>Impacto no sono: {phoneImpact}.</Text>
      </View>

      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  insightBox: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  insightText: {
    fontSize: 16,
  },
});