import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../styles/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../contexts/ThemeContext';

interface AlarmScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Alarm'>;
}

const IDEAL_SLEEP = 8;
const MAX_COMPENSATION = 2;

export const AlarmScreen: React.FC<AlarmScreenProps> = ({ navigation }) =>{
  const mockedHorasSemana = [7.5, 8.0, 6.5, 7.0, 7.25];
  const mockHoraDormir = '23:00';
  const [resultado, setResultado] = useState<number | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const horasFinal = calcularSonoFimDeSemana(mockedHorasSemana);
    setResultado(horasFinal);
  }, []);

  // Calcula quantas horas de sono são necessárias no fim de semana
  // Leva em conta o déficit de sono da semana (máximo 2 horas de compensação)
  function calcularSonoFimDeSemana(horas: number[]) {
    const media = horas.reduce((a, b) => a + b, 0) / horas.length;
    const deficit = IDEAL_SLEEP - media;
    const compensacao = Math.min(Math.max(deficit, 0), MAX_COMPENSATION);
    return IDEAL_SLEEP + compensacao;
  }

  // Manipulador do botão de ativar/desativar despertador (mockado)
  function handleToggleAlarm() {
    setIsAlarmActive(!isAlarmActive);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>

      <Text style={[styles.time, { color: colors.primaryDark } ]}>08:40</Text>

      <Text style={[styles.label, { color: colors.textSecondary } ]}>9h 40min de sono recomendado</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        O app calcula seu despertar com base no seu histórico de sono, horário médio de dormir e necessidade de recuperação.
      </Text>

      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }] }>
          <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Dorme em média</Text>
          <Text style={[styles.cardValue, { color: colors.primaryDark }]}>23:00</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }] }>
          <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Déficit</Text>
          <Text style={[styles.cardValue, { color: colors.primaryDark }]}>1h 20min</Text>
        </View>
      </View>

      <Text style={[styles.important, { backgroundColor: colors.error, color: colors.white }]}><b>IMPORTANTE:</b> Confira se você não tem compromissos nesse horário!</Text>

      <PrimaryButton title={isAlarmActive ? 'Desativar despertador' : 'Ativar despertador'} onPress={handleToggleAlarm} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-evenly',
  },
  title: {
    fontSize: typography.subtitle,
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  card: {
    flex: 1, // ocupa metade da largura
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardValue: {
    marginTop: 8,
    fontSize: 25,
    fontWeight: '600',
  },
  time: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: typography.subtitle,
  },
  description: {
    fontSize: 18,
  },
  important: {
    fontSize: 17,
    backgroundColor: '#ec5353',
    color: '#2B0000',
    padding: 5,
    borderRadius: 10
  },
  alarmTime: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  mockValue: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: '600',
  },
});
