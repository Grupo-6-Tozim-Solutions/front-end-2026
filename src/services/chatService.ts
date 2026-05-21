import api from './client';
import { ChatRequest, ChatResponse } from '../types/chat';

const SHOW_LOG_PREFIX = process.env.EXPO_PUBLIC_SHOW_LOG_PREFIX !== 'false';

const logPrefix = (service: string): string => {
    return SHOW_LOG_PREFIX ? `[${service}] ` : '';
};

/**
 * Chat Service - Integração com API de Chat da IA
 * Suporta mensagens de texto e áudio
 */

/**
 * Envia uma mensagem de texto para o chat da IA
 * @param message - Mensagem de texto do usuário
 * @returns Resposta da IA com user_input processado e ai_response
 */
export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
    try {
        console.log(logPrefix('ChatService') + 'Sending text message...');

        const request: ChatRequest = {
            message,
        };

        const response = await api.post<ChatResponse>('/chat/message', request);

        console.log(logPrefix('ChatService') + 'Message response received:', response.data);

        return response.data;
    } catch (error: any) {
        console.error(logPrefix('ChatService') + 'Error sending message:', error);
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Erro ao enviar mensagem para o chat'
        );
    }
};

/**
 * Envia um áudio em base64 para o chat da IA (com transcrição automática)
 * @param audioBase64 - Áudio codificado em base64
 * @param audioFilename - Nome do arquivo de áudio
 * @returns Resposta da IA com transcrição do áudio e ai_response
 */
export const sendChatAudio = async (
    audioBase64: string,
    audioFilename: string = 'audio.m4a',
    message?: string
): Promise<ChatResponse> => {
    try {
        console.log(logPrefix('ChatService') + 'Sending audio message...');
        console.log(logPrefix('ChatService') + 'Audio file: ' + audioFilename);
        console.log(logPrefix('ChatService') + 'Audio size (base64): ' + audioBase64.length + ' bytes');

        const request: ChatRequest = {
            audio_base64: audioBase64,
            audio_filename: audioFilename,
            message,
        };

        console.log(logPrefix('ChatService') + 'Making request to /chat/message...');

        const response = await api.post<ChatResponse>('/chat/message', request);

        console.log(logPrefix('ChatService') + 'Audio response received:', response.data);

        return response.data;
    } catch (error: any) {
        console.error(logPrefix('ChatService') + 'Error sending audio:', error);
        console.error(logPrefix('ChatService') + 'Error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
        });
        
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Erro ao enviar áudio para o chat'
        );
    }
};

/**
 * Envia um áudio como arquivo multipart/form-data
 * Alternativa ao sendChatAudio quando você tem o arquivo em URI
 * @param audioUri - URI do arquivo de áudio no dispositivo
 * @param message - Mensagem de texto adicional (opcional)
 * @returns Resposta da IA com transcrição e ai_response
 */
export const sendChatAudioFile = async (
    audioUri: string,
    message?: string
): Promise<ChatResponse> => {
    try {
        console.log(logPrefix('ChatService') + 'Sending audio file via multipart...');
        console.log(logPrefix('ChatService') + 'Audio URI:', audioUri);

        const formData = new FormData();

        // Adicionar arquivo de áudio - Expo/React Native requer esta estrutura específica
        const file = {
            uri: audioUri,
            type: 'audio/m4a',
            name: 'audio.m4a',
        };

        formData.append('audio', file as any);

        // Adicionar mensagem se fornecida
        if (message) {
            formData.append('message', message);
        }

        console.log(logPrefix('ChatService') + 'FormData prepared, sending request...');

        const response = await api.post<ChatResponse>(
            '/chat/message-multipart',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        console.log(logPrefix('ChatService') + 'Audio file response received:', response.data);

        return response.data;
    } catch (error: any) {
        console.error(logPrefix('ChatService') + 'Error sending audio file:', error);
        console.error(logPrefix('ChatService') + 'Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw new Error(
            error.response?.data?.detail ||
            error.message ||
            'Erro ao enviar arquivo de áudio para o chat'
        );
    }
};

/**
 * Processa chat (texto ou áudio, com fallback)
 * Tenta enviar como texto se disponível, caso contrário envia áudio em base64
 * @param message - Mensagem de texto (opcional)
 * @param audioBase64 - Áudio em base64 (opcional)
 * @param audioFilename - Nome do arquivo de áudio (opcional)
 * @returns Resposta da IA processada
 */
export const processChat = async (
    message?: string,
    audioBase64?: string,
    audioFilename?: string
): Promise<ChatResponse> => {
    try {
        // Se temos mensagem de texto, enviar como texto
        if (message && message.trim()) {
            return await sendChatMessage(message);
        }

        // Caso contrário, enviar áudio se disponível
        if (audioBase64 && audioFilename) {
            return await sendChatAudio(audioBase64, audioFilename);
        }

        // Se nenhum foi fornecido, lançar erro
        throw new Error('Nenhuma mensagem de texto ou áudio foi fornecido');
    } catch (error) {
        console.error(logPrefix('ChatService') + 'Error processing chat:', error);
        throw error;
    }
};

export const chatService = {
    sendChatMessage,
    sendChatAudio,
    sendChatAudioFile,
    processChat,
};

export default chatService;
