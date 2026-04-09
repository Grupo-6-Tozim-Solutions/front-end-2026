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
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { translations } from '../languages/pt';
import { CoachMessage } from '../types/coach';

interface SleepCoachScreenProps {
    navigation?: any;
}

const { height } = Dimensions.get('window');

// Mock AI responses (placeholder for future real AI integration)
const MOCK_COACH_RESPONSES = [
    'Que interessante! Você poderia tentar estabelecer uma rotina de sono consistente? Dormir e acordar no mesmo horário todos os dias ajuda muito.',
    'Entendo. Uma boa dica é evitar telas 30 minutos antes de dormir. A luz azul dos dispositivos pode prejudicar seu descanso.', 
    'Excelente pergunta! Atividades relaxantes como meditação ou leitura antes de dormir podem melhorar significativamente sua qualidade de sono.',
    'Você está no caminho certo! Manter o quarto escuro, fresco e silencioso é fundamental para um bom sono.',
    'Ótimo de saber! Continue registrando seus dados de sono para que possamos acompanhar seu progresso e dar recomendações personalizadas.',
    'Que legal! Exercícios regulares (mas não perto da hora de dormir) ajudam muito a melhorar a qualidade do sono.',
];

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
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const generateMockResponse = (): string => {
        return MOCK_COACH_RESPONSES[Math.floor(Math.random() * MOCK_COACH_RESPONSES.length)];
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

        // Simulate AI response delay
        setTimeout(() => {
            const coachMessage: CoachMessage = {
                id: `msg_${Date.now()}_coach`,
                role: 'coach',
                content: generateMockResponse(),
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, coachMessage]);
            setIsLoading(false);
        }, 1000);
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
});
