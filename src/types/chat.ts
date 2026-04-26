/**
 * Chat Types
 * Definitions for AI chat service integration with backend
 */

export interface ChatRequest {
  message?: string; // Texto enviado pelo usuário
  audio_base64?: string; // Áudio em base64 para transcrição
  audio_filename?: string; // Nome do arquivo de áudio
}

export interface ChatResponse {
  user_input: string; // Entrada processada (texto ou transcrição de áudio)
  ai_response: string; // Resposta da IA
  context_used?: Record<string, any>; // Dados do banco usados para gerar resposta
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'coach'; // User message or AI Coach response
  content: string;
  timestamp: number;
  type?: 'text' | 'audio'; // Tipo de mensagem
  suggestions?: string[]; // Optional sleep improvement suggestions
}
