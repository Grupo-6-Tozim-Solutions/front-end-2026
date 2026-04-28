import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { audioService } from '../services/audioService';
import { permissionsService } from '../services/permissions';
import { sendChatAudio, sendChatMessage } from '../services/chatService';
import { CoachMessage } from '../types/coach';
import { AppIcon, AppScreen, Button, GlassCard, Header } from '../components/ui';
import { EmptyState, ErrorState, InlineFeedback } from '../components/states';

interface SleepCoachScreenProps {
  navigation?: any;
}

export const SleepCoachScreen: React.FC<SleepCoachScreenProps> = () => {
  const { theme } = useTheme();
  const appContext = useAppContext();

  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'initial-coach-message',
      role: 'coach',
      content: 'Olá. Sou seu coach de sono e posso ajudar com ajustes de rotina baseados nos seus registros.',
      timestamp: Date.now(),
      type: 'text',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});

  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listRef = useRef<FlatList<CoachMessage>>(null);

  const baseContextHint = useMemo(() => {
    const stats = appContext.userQualityStats();
    return `Contexto atual: média ${stats.averageQuality.toFixed(1)}/10, sequência ${stats.currentStreak} dia(s), registros ${appContext.sleepLogs.length}.`;
  }, [appContext]);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((previous) => previous + 100);
      }, 100);
    } else if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    playbackTimerRef.current = setInterval(() => {
      if (!playingAudioId) return;
      const state = audioService.getPlaybackState(playingAudioId);
      if (!state) return;

      setAudioProgress((previous) => ({ ...previous, [playingAudioId]: state.currentTime }));
      if (!state.isPlaying && state.currentTime >= state.duration) {
        setPlayingAudioId(null);
      }
    }, 120);

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [playingAudioId]);

  useEffect(() => {
    return () => {
      audioService.clearPlaybackState().catch((error) => {
        console.error('[SleepCoach] Error clearing playback state:', error);
      });
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const appendMessage = useCallback((message: CoachMessage) => {
    setMessages((previous) => [...previous, message]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: CoachMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      type: 'text',
    };

    appendMessage(userMessage);
    setInputValue('');
    setIsLoading(true);
    setChatError(null);

    try {
      const response = await sendChatMessage(`${trimmed}\n\n${baseContextHint}`);
      appendMessage({
        id: `msg-coach-${Date.now()}`,
        role: 'coach',
        content: response.ai_response,
        timestamp: Date.now(),
        type: 'text',
      });
    } catch (error: any) {
      console.error('[SleepCoach] Error sending message:', error);
      setChatError(error.message || 'Falha ao enviar mensagem.');
    } finally {
      setIsLoading(false);
    }
  }, [appendMessage, baseContextHint, inputValue, isLoading]);

  const handleStartRecording = useCallback(async () => {
    try {
      const microphoneStatus = await permissionsService.checkMicrophonePermissionStatus();
      if (microphoneStatus === 'denied') {
        Alert.alert('Permissão de microfone', 'Ative o microfone nas configurações do app para gravar áudio.');
        return;
      }

      if (microphoneStatus === 'unknown') {
        const requested = await permissionsService.requestMicrophonePermission();
        if (requested !== 'granted') {
          Alert.alert('Permissão de microfone', 'Não foi possível iniciar a gravação sem acesso ao microfone.');
          return;
        }
      }

      const started = await audioService.startRecording();
      if (!started) {
        Alert.alert('Erro', 'Falha ao iniciar gravação.');
        return;
      }

      setRecordingDuration(0);
      setIsRecording(true);
      setChatError(null);
    } catch (error) {
      console.error('[SleepCoach] Error starting recording:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }, []);

  const handleSendAudio = useCallback(
    async (recording: NonNullable<Awaited<ReturnType<typeof audioService.stopRecording>>>) => {
      const userMessage: CoachMessage = {
        id: `msg-audio-${Date.now()}`,
        role: 'user',
        content: `Mensagem de áudio (${audioService.formatDuration(recording.duration)})`,
        timestamp: Date.now(),
        audio: {
          id: recording.id,
          uri: recording.uri,
          duration: recording.duration,
        },
        type: 'audio',
      };

      appendMessage(userMessage);
      setIsLoading(true);
      setChatError(null);

      try {
        const audioBase64 = await FileSystem.readAsStringAsync(recording.uri, { encoding: 'base64' });
        const response = await sendChatAudio(audioBase64, 'audio.m4a');

        appendMessage({
          id: `msg-coach-audio-${Date.now()}`,
          role: 'coach',
          content: response.ai_response,
          timestamp: Date.now(),
          type: 'text',
        });
      } catch (error: any) {
        console.error('[SleepCoach] Error sending audio:', error);
        setChatError(error.message || 'Falha ao enviar áudio.');
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage],
  );

  const handleStopRecording = useCallback(async () => {
    try {
      setIsRecording(false);
      const recording = await audioService.stopRecording();
      if (!recording) return;

      if (!audioService.isValidAudio(recording)) {
        await audioService.deleteAudio(recording.uri);
        Alert.alert('Áudio curto', 'Grave pelo menos 1 segundo para enviar.');
        return;
      }

      await handleSendAudio(recording);
    } catch (error) {
      console.error('[SleepCoach] Error stopping recording:', error);
      Alert.alert('Erro', 'Falha ao finalizar gravação.');
    }
  }, [handleSendAudio]);

  const handleCancelRecording = useCallback(async () => {
    try {
      await audioService.cancelRecording();
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error('[SleepCoach] Error canceling recording:', error);
    }
  }, []);

  const handleToggleAudioPlayback = useCallback(
    async (message: CoachMessage) => {
      if (!message.audio) return;

      try {
        if (playingAudioId === message.audio.id) {
          await audioService.pauseAudio(message.audio.id);
          setPlayingAudioId(null);
          return;
        }

        const success = await audioService.playAudio(message.audio.id, message.audio.uri, message.audio.duration);
        if (success) {
          setPlayingAudioId(message.audio.id);
          setAudioProgress((previous) => ({ ...previous, [message.audio!.id]: 0 }));
        }
      } catch (error) {
        console.error('[SleepCoach] Error playing audio:', error);
      }
    },
    [playingAudioId],
  );

  const renderMessage = useCallback(
    ({ item }: { item: CoachMessage }) => {
      const isCoach = item.role === 'coach';
      const hasAudio = Boolean(item.audio);
      const progressValue = item.audio ? audioProgress[item.audio.id] || 0 : 0;
      const progressWidth: `${number}%` = item.audio && item.audio.duration
        ? `${Math.min((progressValue / item.audio.duration) * 100, 100)}%`
        : '0%';

      return (
        <View
          style={[
            styles.messageBubble,
            {
              alignSelf: isCoach ? 'flex-start' : 'flex-end',
              backgroundColor: isCoach ? theme.colors.surface : theme.colors.accentSoft,
              borderColor: isCoach ? theme.colors.border : theme.colors.accent,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          {hasAudio && item.audio ? (
            <Pressable style={styles.audioRow} onPress={() => handleToggleAudioPlayback(item)}>
              <View style={[styles.audioButton, { borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceStrong }]}>
                <AppIcon
                  name={playingAudioId === item.audio.id ? 'pause' : 'waveform'}
                  color={theme.colors.text}
                  size={18}
                />
              </View>

              <View style={styles.audioDetail}>
                <View style={[styles.progressTrack, { backgroundColor: theme.colors.border, borderRadius: theme.radius.pill }]}>
                  <View style={[styles.progressFill, { width: progressWidth, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accent }]} />
                </View>
                <Text style={[styles.audioTime, { color: theme.colors.textMuted }]}>
                  {audioService.formatDuration(progressValue)} / {audioService.formatDuration(item.audio.duration)}
                </Text>
              </View>
            </Pressable>
          ) : (
            <Text style={[styles.messageText, { color: isCoach ? theme.colors.text : theme.colors.text }]}>{item.content}</Text>
          )}

          <Text style={[styles.timestamp, { color: theme.colors.textSubtle }]}>
            {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      );
    },
    [audioProgress, handleToggleAudioPlayback, playingAudioId, theme.colors, theme.radius],
  );

  const clearConversation = useCallback(() => {
    setMessages([
      {
        id: 'initial-coach-message',
        role: 'coach',
        content: 'Conversa reiniciada. Posso te ajudar a planejar sua próxima noite.',
        timestamp: Date.now(),
      },
    ]);
    setChatError(null);
  }, []);

  const canSend = inputValue.trim().length > 0 && !isLoading;

  return (
    <AppScreen style={styles.screen}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={88}>
        <View style={styles.headerWrap}>
          <Header title="Coach do sono" subtitle="Assistente com contexto dos seus dados recentes" icon="chat" />
        </View>

        {chatError ? (
          <ErrorState description={chatError} onRetry={() => setChatError(null)} retryLabel="Fechar aviso" style={styles.errorState} />
        ) : null}

        {!messages.length ? (
          <EmptyState
            title="Sem mensagens"
            description="Comece perguntando sobre rotina, consistência ou recuperação do sono."
            icon="chat"
          />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContent}
            ItemSeparatorComponent={() => <View style={styles.messageSpacer} />}
            showsVerticalScrollIndicator={false}
            style={styles.messagesList}
          />
        )}

        {isLoading ? <InlineFeedback tone="info" message="Coach processando sua solicitação..." /> : null}

        {isRecording ? (
          <GlassCard variant="default" contentStyle={styles.recordingCard}>
            <View style={styles.recordingLabelRow}>
              <AppIcon name="microphone" color={theme.colors.accent} size={18} />
              <Text style={[styles.recordingText, { color: theme.colors.text }]}>Gravando {audioService.formatDuration(recordingDuration)}</Text>
            </View>
            <View style={styles.recordingActions}>
              <Button title="Cancelar" onPress={handleCancelRecording} variant="ghost" icon="close" />
              <Button title="Enviar áudio" onPress={handleStopRecording} variant="primary" icon="check" iconPosition="right" />
            </View>
          </GlassCard>
        ) : (
          <GlassCard variant="subtle" contentStyle={styles.inputCard}>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface }]}
              placeholder="Descreva como foi sua noite ou peça uma sugestão"
              placeholderTextColor={theme.colors.textSubtle}
              multiline
              maxLength={600}
              editable={!isLoading}
              value={inputValue}
              onChangeText={setInputValue}
            />

            <View style={styles.inputActions}>
              <Button
                title="Gravar áudio"
                onPress={handleStartRecording}
                disabled={isLoading}
                variant="secondary"
                icon="microphone"
              />
              <Button
                title="Enviar"
                onPress={handleSendMessage}
                disabled={!canSend}
                loading={isLoading}
                icon="arrowRight"
                iconPosition="right"
              />
            </View>

            <Pressable onPress={clearConversation} hitSlop={8}>
              <Text style={[styles.clearText, { color: theme.colors.textSubtle }]}>Limpar conversa</Text>
            </Pressable>
          </GlassCard>
        )}
      </KeyboardAvoidingView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  container: {
    flex: 1,
    gap: 10,
  },
  headerWrap: {
    paddingHorizontal: 4,
  },
  errorState: {
    marginHorizontal: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  messageSpacer: {
    height: 8,
  },
  messageBubble: {
    borderWidth: 1,
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
  },
  audioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  audioButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  audioDetail: {
    flex: 1,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  audioTime: {
    fontSize: 11,
  },
  recordingCard: {
    gap: 10,
  },
  recordingLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inputCard: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  clearText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
