import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { translations } from '../languages/pt';
import { CoachMessage } from '../types/coach';
import { audioService } from '../services/audioService';
import { permissionsService } from '../services/permissions';
import { processChat, sendChatMessage, sendChatAudio } from '../services/chatService';

interface SleepCoachScreenProps {
    navigation?: any;
}

const { height } = Dimensions.get('window');

export const SleepCoachScreen: React.FC<SleepCoachScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const appContext = useAppContext();
    const [messages, setMessages] = useState<CoachMessage[]>([
        {
            id: '1',
            role: 'coach',
            content: 'Olá! 👋 Sou seu assistente de sono. Estou aqui para ajudar você a melhorar a qualidade do seu sono com dicas personalizadas. Como posso te ajudar hoje?',
            timestamp: Date.now(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
    const scrollViewRef = useRef<ScrollView>(null);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const playbackUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    useEffect(() => {
        // Atualizar duração da gravação a cada 100ms
        if (isRecording) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 100);
            }, 100);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }

        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [isRecording]);

    useEffect(() => {
        // Atualizar progresso de playback a cada 100ms
        playbackUpdateRef.current = setInterval(() => {
            if (playingAudioId) {
                const state = audioService.getPlaybackState(playingAudioId);
                if (state) {
                    setAudioProgress((prev) => ({
                        ...prev,
                        [playingAudioId]: state.currentTime,
                    }));

                    // Para reprodução se chegou ao fim
                    if (state.currentTime >= state.duration && !state.isPlaying) {
                        setPlayingAudioId(null);
                    }
                }
            }
        }, 100);

        return () => {
            if (playbackUpdateRef.current) {
                clearInterval(playbackUpdateRef.current);
            }
        };
    }, [playingAudioId]);

    useEffect(() => {
        // Cleanup ao desmontar
        return () => {
            // Chamar clearPlaybackState de forma assíncrona
            audioService.clearPlaybackState().catch((error) => {
                console.error('[SleepCoach] Error clearing playback state:', error);
            });
        };
    }, []);

    const handleStartRecording = async () => {
        try {
            // Verificar permissão de microfone
            const microphoneStatus = await permissionsService.checkMicrophonePermissionStatus();
            
            if (microphoneStatus === 'denied') {
                Alert.alert(
                    'Permissão de Microfone Negada',
                    'Para gravar áudio, é necessário permitir o acesso ao microfone. Por favor, ative a permissão nas configurações do aplicativo.',
                    [
                        {
                            text: 'OK',
                            onPress: () => { },
                        },
                    ]
                );
                return;
            }

            // Se desconhecido, solicitar permissão
            if (microphoneStatus === 'unknown') {
                const permStatus = await permissionsService.requestMicrophonePermission();
                if (permStatus === 'denied') {
                    Alert.alert(
                        'Permissão de Microfone Negada',
                        'Sem a permissão de microfone, não é possível gravar áudio.'
                    );
                    return;
                }
            }

            const success = await audioService.startRecording();
            if (success) {
                setIsRecording(true);
                setRecordingDuration(0);
                console.log('[SleepCoach] Recording started');
            } else {
                Alert.alert('Erro', 'Não foi possível iniciar a gravação de áudio.');
            }
        } catch (error) {
            console.error('[SleepCoach] Error starting recording:', error);
            Alert.alert('Erro', 'Erro ao iniciar gravação.');
        }
    };

    const handleStopRecording = async () => {
        try {
            setIsRecording(false);
            const recording = await audioService.stopRecording();

            if (recording) {
                // Validar áudio
                if (!audioService.isValidAudio(recording)) {
                    await audioService.deleteAudio(recording.uri);
                    Alert.alert('Áudio muito curto', 'Grave pelo menos 1 segundo de áudio.');
                    return;
                }

                // Enviar áudio como mensagem
                await handleSendAudio(recording);
            }
        } catch (error) {
            console.error('[SleepCoach] Error stopping recording:', error);
            Alert.alert('Erro', 'Erro ao finalizar gravação.');
        }
    };

    const handleCancelRecording = async () => {
        try {
            await audioService.cancelRecording();
            setIsRecording(false);
            setRecordingDuration(0);
        } catch (error) {
            console.error('[SleepCoach] Error canceling recording:', error);
        }
    };

    const handlePlayAudio = async (audioId: string, uri: string, duration: number) => {
        try {
            // Se o mesmo áudio está tocando, pausa
            if (playingAudioId === audioId) {
                await audioService.pauseAudio(audioId);
                setPlayingAudioId(null);
                return;
            }

            // Se outro áudio está tocando, para ele
            if (playingAudioId) {
                await audioService.stopAudio(playingAudioId);
            }

            // Inicia playback do novo áudio
            const success = await audioService.playAudio(audioId, uri, duration);
            if (success) {
                setPlayingAudioId(audioId);
                setAudioProgress((prev) => ({ ...prev, [audioId]: 0 }));
            }
        } catch (error) {
            console.error('[SleepCoach] Error playing audio:', error);
            Alert.alert('Erro', 'Erro ao reproduzir áudio.');
        }
    };

    const handleStopPlayback = async (audioId: string) => {
        try {
            await audioService.stopAudio(audioId);
            setPlayingAudioId(null);
            setAudioProgress((prev) => ({ ...prev, [audioId]: 0 }));
        } catch (error) {
            console.error('[SleepCoach] Error stopping playback:', error);
        }
    };

    const handleSendAudio = async (recording: any) => {
        try {
            console.log('[SleepCoach] Audio recording data:', {
                id: recording.id,
                uri: recording.uri,
                duration: recording.duration,
            });

            // Criar mensagem do usuário com áudio
            const userMessage: CoachMessage = {
                id: `msg_${Date.now()}`,
                role: 'user',
                content: `[Áudio: ${audioService.formatDuration(recording.duration)}]`,
                timestamp: Date.now(),
                audio: {
                    id: recording.id,
                    uri: recording.uri,
                    duration: recording.duration,
                },
                type: 'audio',
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            try {
                console.log('[SleepCoach] Reading audio file:', recording.uri);
                
                // Ler arquivo de áudio e converter para base64
                const audioBase64 = await FileSystemLegacy.readAsStringAsync(recording.uri, {
                    encoding: 'base64',
                });

                console.log('[SleepCoach] Audio file read successfully, size:', audioBase64.length);
                console.log('[SleepCoach] Sending audio via base64...');

                // Enviar áudio para API usando endpoint com base64
                const response = await sendChatAudio(audioBase64, 'audio.m4a');
                console.log('[SleepCoach] Audio response received:', response);

                // Criar mensagem do coach com resposta real
                const coachMessage: CoachMessage = {
                    id: `msg_${Date.now()}_coach`,
                    role: 'coach',
                    content: response.ai_response,
                    timestamp: Date.now(),
                    type: 'text',
                };

                setMessages((prev) => [...prev, coachMessage]);
            } catch (error: any) {
                console.error('[SleepCoach] Error sending audio:', error);

                // Mostrar erro amigável
                const errorMessage = error.message || 'Erro ao processar áudio. Tente novamente.';
                Alert.alert('Erro ao enviar áudio', errorMessage);

                // Remover mensagem de carregamento
                setMessages((prev) => prev.slice(0, -1));
            } finally {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('[SleepCoach] Error preparing audio:', error);
            Alert.alert('Erro', 'Erro ao preparar áudio para envio.');
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage: CoachMessage = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: inputValue,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Enviar mensagem para API
            const response = await sendChatMessage(inputValue);

            // Criar mensagem do coach com resposta real
            const coachMessage: CoachMessage = {
                id: `msg_${Date.now()}_coach`,
                role: 'coach',
                content: response.ai_response,
                timestamp: Date.now(),
            };

            setMessages(prev => [...prev, coachMessage]);
        } catch (error: any) {
            console.error('[SleepCoach] Error sending message:', error);

            // Mostrar erro amigável
            const errorMessage = error.message || 'Erro ao enviar mensagem. Tente novamente.';
            Alert.alert('Erro ao enviar mensagem', errorMessage);

            // Remover mensagem do usuário em caso de erro
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: '1',
                role: 'coach',
                content: 'Olá! 👋 Sou seu assistente de sono. Estou aqui para ajudar você a melhorar a qualidade do seu sono com dicas personalizadas. Como posso te ajudar hoje?',
                timestamp: Date.now(),
            },
        ]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
            keyboardVerticalOffset={100}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Coach do Sono</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Assistente de IA para melhorar seu sono</Text>
                </View>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map(message => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageBubble,
                            message.role === 'coach'
                                ? {
                                    alignSelf: 'flex-start',
                                    backgroundColor: colors.surface,
                                    borderTopLeftRadius: 4,
                                }
                                : {
                                    alignSelf: 'flex-end',
                                    backgroundColor: colors.primary,
                                    borderTopRightRadius: 4,
                                },
                        ]}
                    >
                        {message.type === 'audio' && message.audio ? (
                            <View style={styles.audioMessageContainer}>
                                <TouchableOpacity
                                    onPress={() => handlePlayAudio(message.audio!.id, message.audio!.uri, message.audio!.duration)}
                                    style={styles.audioPlayButton}
                                >
                                    <Text style={styles.audioPlayButtonText}>
                                        {playingAudioId === message.audio.id ? '⏸️' : '▶️'}
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.audioDetails}>
                                    <View style={styles.audioProgressContainer}>
                                        <View
                                            style={[
                                                styles.audioProgressBar,
                                                {
                                                    width: `${((audioProgress[message.audio.id] || 0) / message.audio.duration) * 100}%`,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.audioTimeContainer}>
                                        <Text style={[styles.audioTime, { color: 'white' }]}>
                                            {audioService.formatDuration(audioProgress[message.audio.id] || 0)}
                                        </Text>
                                        <Text style={[styles.audioTime, { color: 'rgba(255,255,255,0.6)' }]}>
                                            {audioService.formatDuration(message.audio.duration)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <Text
                                style={[
                                    styles.messageText,
                                    {
                                        color: message.role === 'coach' ? colors.text : 'white',
                                    },
                                ]}
                            >
                                {message.content}
                            </Text>
                        )}
                        <Text
                            style={[
                                styles.timestamp,
                                {
                                    color: message.role === 'coach' ? colors.textSecondary : 'rgba(255,255,255,0.7)',
                                },
                            ]}
                        >
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>
                ))}

                {isLoading && (
                    <View style={[styles.messageBubble, { alignSelf: 'flex-start', backgroundColor: colors.surface }]}>
                        <Text style={[styles.loadingDots, { color: colors.text }]}>● ● ●</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceElevated, borderTopColor: colors.border }]}>
                {isRecording ? (
                    // Recording Mode
                    <View style={[styles.recordingBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                        <View style={styles.recordingContent}>
                            <View style={styles.recordingIndicator}>
                                <View style={[styles.recordingDot, { backgroundColor: colors.primary }]} />
                                <Text style={[styles.recordingText, { color: colors.text }]}>
                                    Gravando {audioService.formatDuration(recordingDuration)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.recordingButtons}>
                            <TouchableOpacity
                                onPress={handleCancelRecording}
                                style={[styles.recordingButton, { backgroundColor: colors.border }]}
                            >
                                <Text style={styles.recordingButtonText}>✕</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleStopRecording}
                                style={[styles.recordingButton, { backgroundColor: colors.primary }]}
                            >
                                <Text style={styles.recordingButtonText}>✓</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Normal Input Mode
                    <>
                        <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.textInput, { color: colors.text }]}
                                placeholder="Escreva sua pergunta..."
                                placeholderTextColor={colors.textSecondary}
                                value={inputValue}
                                onChangeText={setInputValue}
                                multiline
                                maxLength={500}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={handleStartRecording}
                                disabled={isLoading}
                                style={[
                                    styles.audioButton,
                                    {
                                        backgroundColor: !isLoading ? colors.primary : colors.border,
                                    },
                                ]}
                            >
                                <Text style={styles.audioButtonText}>🎙️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                style={[
                                    styles.sendButton,
                                    {
                                        backgroundColor: inputValue.trim() && !isLoading ? colors.primary : colors.border,
                                    },
                                ]}
                            >
                                <Text style={styles.sendButtonText}>→</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Clear Chat Button */}
                        <TouchableOpacity
                            onPress={handleClearChat}
                            style={[styles.clearButton, { borderColor: colors.border }]}
                        >
                            <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                                Limpar Conversa
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: typography.subtitle,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.small,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    messagesContent: {
        paddingVertical: spacing.lg,
        gap: spacing.md,
    },
    messageBubble: {
        maxWidth: '85%',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        gap: spacing.xs,
    },
    messageText: {
        fontSize: typography.body,
        lineHeight: typography.body + 6,
    },
    timestamp: {
        fontSize: typography.small,
    },
    loadingDots: {
        fontSize: typography.subtitle,
        letterSpacing: 4,
    },
    inputContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        gap: spacing.md,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    textInput: {
        flex: 1,
        maxHeight: 100,
        fontSize: typography.body,
        paddingVertical: spacing.sm,
    },
    audioButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    audioButtonText: {
        fontSize: 16,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    sendButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    clearButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: typography.caption,
        fontWeight: '600',
    },
    audioMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        width: '100%',
    },
    audioPlayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    audioPlayButtonText: {
        fontSize: 20,
    },
    audioDetails: {
        flex: 1,
        gap: spacing.sm,
    },
    audioProgressContainer: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    audioProgressBar: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
    },
    audioTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    audioTime: {
        fontSize: typography.caption,
    },
    audioIcon: {
        fontSize: 24,
    },
    audioInfo: {
        gap: spacing.xs,
    },
    audioLabel: {
        fontSize: typography.small,
        fontWeight: '600',
    },
    audioDuration: {
        fontSize: typography.caption,
    },
    recordingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    recordingContent: {
        flex: 1,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    recordingText: {
        fontSize: typography.body,
        fontWeight: '600',
    },
    recordingButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    recordingButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
});
