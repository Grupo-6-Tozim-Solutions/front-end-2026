import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DateTriggerInput, SchedulableTriggerInputTypes } from 'expo-notifications';
import { lightColors, typography } from '../styles/theme';
import { PrimaryButton } from '../components/PrimaryButton';

interface AlarmScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Alarm'>;
}

const IDEAL_SLEEP = 8;
const MAX_COMPENSATION = 2;

export const AlarmScreen: React.FC<AlarmScreenProps> = ({ navigation }) =>{
  const mockedHorasSemana = [7.5, 8.0, 6.5, 7.0, 7.25];
  const mockHoraDormir = '23:00';
  const [resultado, setResultado] = useState<number | null>(null);
  const [horaAcordar, setHoraAcordar] = useState<string | null>(null);

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

  // Calcula a hora em que o usuário deve acordar
  // Adiciona as horas de sono à hora em que vai dormir
  function calcularHorarioAcordar(horaDormir: Date, horasSono: number) {
    const acordar = new Date(horaDormir);
    acordar.setHours(acordar.getHours() + horasSono);
    return acordar;
  }

  // Agenda uma notificação (alarme) para a hora especificada
  // Solicita permissões de notificação se necessário
  // Cria um alarme que será disparado na data/hora definida
  async function agendarAlarme(data: Date, horasFinal: number) {
    try {
      // Solicitar permissões se necessário
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissões de notificação são necessárias para agendar alarmes');
        return;
      }

      const trigger: DateTriggerInput = {
        type: SchedulableTriggerInputTypes.DATE,
        date: data,
};

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Hora de acordar!',
          body: `Você dormiu ${horasFinal.toFixed(1)}h`,
          sound: 'default',
        },
        trigger,
      });
    } catch (error) {
      console.error('Erro ao agendar alarme:', error);
      Alert.alert('Erro', 'Não foi possível agendar o alarme');
    }
  }

  // Manipulador do botão "Agendar despertador"
  // Usa horário de dormir mockado e agenda o alarme com base no cálculo automático
  async function handleAgendar() {
    if (!resultado) {
      Alert.alert('Erro', 'Não foi possível calcular o tempo de sono');
      return;
    }

    const [hora, minuto] = mockHoraDormir.split(':').map(Number);

    if (isNaN(hora) || isNaN(minuto)) {
      Alert.alert('Erro', 'Formato de horário de dormir inválido');
      return;
    }

    const dormir = new Date();
    dormir.setHours(hora);
    dormir.setMinutes(minuto);
    dormir.setSeconds(0);

    const acordar = calcularHorarioAcordar(dormir, resultado);

    await agendarAlarme(acordar, resultado);

    setHoraAcordar(acordar.toLocaleTimeString());
  }

  return (
    <View style={styles.container}>
      <Text style={styles.time}>11:30</Text>

      <Text style={styles.label}>7h 40min de sono recomendado</Text>

      <Text style={styles.description}>
        O app calcula seu despertar com base no seu histórico de sono, horário médio de dormir e necessidade de recuperação.
      </Text>

      <Text>Confira se você não tem compromissos nesse horário.</Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
        <Text style={styles.cardTitle}>Dorme em média</Text>
          <Text style={styles.cardValue}>23:45</Text>
        </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Déficit</Text>
          <Text style={styles.cardValue}>1h 20min</Text>
        </View>
      </View>

      <PrimaryButton title="Ativar despertador" onPress={handleAgendar} />
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
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: lightColors.primaryDark,
  },
  label: {
    fontSize: typography.subtitle,
  },
  description: {
    fontSize: 18,
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
