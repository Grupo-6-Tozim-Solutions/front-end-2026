import api from './client';
import { ChatRequest, ChatResponse } from '../types/chat';

const SHOW_LOG_PREFIX = process.env.EXPO_PUBLIC_SHOW_LOG_PREFIX !== 'false';

const logPrefix = (service: string): string => {
  return SHOW_LOG_PREFIX ? `[${service}] ` : '';
};

const textFromValue = (value: any): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(textFromValue).join('');
  if (typeof value === 'object') {
    return textFromValue(
      value.ai_response ??
      value.response ??
      value.answer ??
      value.content ??
      value.text ??
      value.message?.content ??
      value.delta?.content,
    );
  }

  return String(value);
};

const textFromChoices = (choices: any): string => {
  if (!Array.isArray(choices)) return '';

  return choices
    .map((choice) => textFromValue(choice?.message?.content ?? choice?.delta?.content ?? choice?.text))
    .join('');
};

const textFromServerEvents = (rawText: string): string => {
  if (!rawText.includes('data:')) return rawText;

  const eventText = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s*/, ''))
    .filter((line) => line && line !== '[DONE]')
    .map((line) => {
      try {
        return textFromValue(JSON.parse(line));
      } catch {
        return line;
      }
    })
    .join('');

  return eventText || rawText;
};

const normalizeChatResponse = (data: any, fallbackUserInput = ''): ChatResponse => {
  const rawResponse = typeof data === 'string'
    ? textFromServerEvents(data)
    : [
      data?.ai_response,
      data?.response,
      data?.answer,
      data?.content,
      data?.text,
      data?.message,
      textFromChoices(data?.choices),
    ]
      .map(textFromValue)
      .find((value) => value.trim().length > 0) ?? '';
  const aiResponse = rawResponse.trim();

  if (!aiResponse) {
    throw new Error('Resposta da IA vazia ou em formato inesperado.');
  }

  return {
    ...(typeof data === 'object' && data !== null ? data : {}),
    user_input: textFromValue(data?.user_input ?? data?.userInput ?? fallbackUserInput),
    ai_response: aiResponse,
  };
};

/**
 * Chat Service - integracao com API de Chat da IA.
 * Suporta mensagens de texto e audio.
 */
export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  try {
    console.log(logPrefix('ChatService') + 'Sending text message...');

    const request: ChatRequest = {
      message,
    };

    const response = await api.post<ChatResponse>('/chat/message', request);
    const normalizedResponse = normalizeChatResponse(response.data, message);

    console.log(logPrefix('ChatService') + 'Message response length:', normalizedResponse.ai_response.length);

    return normalizedResponse;
  } catch (error: any) {
    console.error(logPrefix('ChatService') + 'Error sending message:', error);
    throw new Error(
      error.response?.data?.detail ||
      error.message ||
      'Erro ao enviar mensagem para o chat'
    );
  }
};

export const sendChatAudio = async (
  audioBase64: string,
  audioFilename: string = 'audio.m4a',
  message?: string,
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

    const response = await api.post<ChatResponse>('/chat/message', request);
    const normalizedResponse = normalizeChatResponse(response.data, message);

    console.log(logPrefix('ChatService') + 'Audio response length:', normalizedResponse.ai_response.length);

    return normalizedResponse;
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
      'Erro ao enviar audio para o chat'
    );
  }
};

export const sendChatAudioFile = async (
  audioUri: string,
  message?: string,
): Promise<ChatResponse> => {
  try {
    console.log(logPrefix('ChatService') + 'Sending audio file via multipart...');
    console.log(logPrefix('ChatService') + 'Audio URI:', audioUri);

    const formData = new FormData();

    const file = {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    };

    formData.append('audio', file as any);

    if (message) {
      formData.append('message', message);
    }

    const response = await api.post<ChatResponse>(
      '/chat/message-multipart',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    const normalizedResponse = normalizeChatResponse(response.data, message);

    console.log(logPrefix('ChatService') + 'Audio file response length:', normalizedResponse.ai_response.length);

    return normalizedResponse;
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
      'Erro ao enviar arquivo de audio para o chat'
    );
  }
};

export const processChat = async (
  message?: string,
  audioBase64?: string,
  audioFilename?: string,
): Promise<ChatResponse> => {
  try {
    if (message && message.trim()) {
      return await sendChatMessage(message);
    }

    if (audioBase64 && audioFilename) {
      return await sendChatAudio(audioBase64, audioFilename);
    }

    throw new Error('Nenhuma mensagem de texto ou audio foi fornecida');
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
