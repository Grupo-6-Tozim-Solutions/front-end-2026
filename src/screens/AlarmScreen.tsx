import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';

interface AlarmScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
}

const IDEAL_SLEEP = 8;
const MAX_COMPENSATION = 2;

export const AlarmScreen: React.FC<AlarmScreenProps> = ({ navigation }) =>{
  const [horasSemana, setHorasSemana] = useState<string[]>(['', '', '', '', '']);
  const [horaDormir, setHoraDormir] = useState('');
  const [resultado, setResultado] = useState<number | null>(null);

  function calcularSonoFimDeSemana(horas: number[]) {
    const media = horas.reduce((a, b) => a + b, 0) / horas.length;
    const deficit = IDEAL_SLEEP - media;
    const compensacao = Math.min(Math.max(deficit, 0), MAX_COMPENSATION);
    return IDEAL_SLEEP + compensacao;
  }

  function calcularHorarioAcordar(horaDormir: Date, horasSono: number) {
    const acordar = new Date(horaDormir);
    acordar.setHours(acordar.getHours() + horasSono);
    return acordar;
  }

  function agendarAlarme(data: Date, horasFinal: number) {
    PushNotification.localNotificationSchedule({
      message: `⏰ Hora de acordar! Você dormiu ${horasFinal.toFixed(1)}h`,
      date: data,
      allowWhileIdle: true,
    });
  }

  function handleCalcular() {
    const horas = horasSemana.map(h => parseFloat(h));

    if (horas.some(isNaN)) {
      Alert.alert('Erro', 'Preencha todas as horas corretamente');
      return;
    }

    const horasFinal = calcularSonoFimDeSemana(horas);
    setResultado(horasFinal);
  }

  function handleAgendar() {
    if (!resultado || !horaDormir) {
      Alert.alert('Erro', 'Calcule e informe o horário de dormir');
      return;
    }

    const [hora, minuto] = horaDormir.split(':').map(Number);

    if (isNaN(hora) || isNaN(minuto)) {
      Alert.alert('Erro', 'Formato inválido. Use HH:mm');
      return;
    }

    const dormir = new Date();
    dormir.setHours(hora);
    dormir.setMinutes(minuto);
    dormir.setSeconds(0);

    const acordar = calcularHorarioAcordar(dormir, resultado);

    agendarAlarme(acordar, resultado);

    Alert.alert('Sucesso', `Despertador definido para ${acordar.toLocaleTimeString()}`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperação de Sono</Text>

      <Text style={styles.label}>Horas dormidas na semana:</Text>

      {horasSemana.map((valor, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`Dia ${index + 1}`}
          keyboardType="numeric"
          value={valor}
          onChangeText={(text) => {
            const nova = [...horasSemana];
            nova[index] = text;
            setHorasSemana(nova);
          }}
        />
      ))}

      <Button title="Calcular sono ideal" onPress={handleCalcular} />

      {resultado && (
        <Text style={styles.result}>
          Você deve dormir {resultado.toFixed(1)} horas
        </Text>
      )}

      <Text style={styles.label}>Horário de dormir (HH:mm):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 23:00"
        value={horaDormir}
        onChangeText={setHoraDormir}
      />

      <Button title="Agendar despertador" onPress={handleAgendar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
  result: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
