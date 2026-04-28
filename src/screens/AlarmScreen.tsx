import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui';

interface AlarmScreenProps {
  navigation?: any;
}

const IDEAL_SLEEP = 8;
const MAX_COMPENSATION = 2;

export const AlarmScreen: React.FC<AlarmScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const mockedHorasSemana = [7.5, 8.0, 6.5, 7.0, 7.25];
  const mockHoraDormir = '23:00';
  const [resultado, setResultado] = useState<number | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.time, { color: theme.colors.accent }]}>08:20</Text>

      <Text style={[styles.label, { color: theme.colors.text }]}>9h 20min de sono recomendado</Text>

      <Text style={[styles.description, { color: theme.colors.textMuted }]}>
        O app calcula seu despertar com base no seu histórico de sono, horário médio de dormir e necessidade de recuperação.
      </Text>

      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.textMuted }]}>Dorme em média</Text>
          <Text style={[styles.cardValue, { color: theme.colors.accent }]}>23:00</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.textMuted }]}>Déficit</Text>
          <Text style={[styles.cardValue, { color: theme.colors.accent }]}>1h 20min</Text>
        </View>
      </View>

      <View style={[styles.important, { backgroundColor: theme.colors.warning }]}>
        <Text style={[styles.importantText, { color: theme.colors.text }]}>
          <Text style={{ fontWeight: 'bold' }}>IMPORTANTE:</Text> Confira se você não tem compromissos nesse horário!
        </Text>
      </View>

      <Button
        title={isAlarmActive ? 'Desativar despertador' : 'Ativar despertador'}
        onPress={handleToggleAlarm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-evenly',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  important: {
    fontSize: 14,
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  importantText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
