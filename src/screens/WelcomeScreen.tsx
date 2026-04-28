import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/AppNavigator';
import { translations } from '../languages/pt';
import { AppScreen, Button, GlassCard, Header } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <AppScreen>
      <View style={styles.layout}>
        <Header
          title={translations.welcome.appName}
          subtitle="Acompanhamento inteligente para noites mais consistentes"
          icon="spark"
          style={styles.header}
        />

        <GlassCard variant="elevated" contentStyle={styles.heroCard}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/logo-completa.png')}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{translations.welcome.title}</Text>
          <Text style={[styles.heroDescription, { color: theme.colors.textMuted }]}>{translations.welcome.description}</Text>
        </GlassCard>

        <GlassCard variant="subtle" contentStyle={styles.highlightCard}>
          <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>O que você ganha nesta jornada</Text>
          <Text style={[styles.highlightText, { color: theme.colors.textMuted }]}>Painel com visão diária, recomendações baseadas em padrão de sono e acompanhamento em tempo real.</Text>
        </GlassCard>

        <View style={styles.footer}>
          <Button
            title={translations.welcome.startButton}
            onPress={() => navigation.navigate('Permissions')}
            icon="arrowRight"
            iconPosition="right"
          />
        </View>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    gap: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  header: {
    marginBottom: 4,
  },
  heroCard: {
    gap: 14,
    paddingVertical: 20,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    height: 92,
    width: 188,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    textAlign: 'left',
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  highlightCard: {
    gap: 6,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
  },
});
