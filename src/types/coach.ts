/**
 * Sleep Coach Types
 * Definitions for AI chatbot messages and interactions
 */

export interface AudioAttachment {
  id: string;
  uri: string;
  duration: number; // em ms
  size?: number; // tamanho em bytes
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach'; // User message or AI Coach response
  content: string;
  timestamp: number;
  suggestions?: string[]; // Optional sleep improvement suggestions
  audio?: AudioAttachment; // Optional audio attachment
  type?: 'text' | 'audio'; // Tipo de mensagem
}

export interface CoachContext {
  messages: CoachMessage[];
  sessionStarted: number; // ISO timestamp
  userProfile?: {
    age?: string;
    sleepGoal?: string;
    recentQuality?: number;
  };
}

export interface CoachResponse {
  message: string;
  suggestions?: string[];
  actionable?: boolean; // If response contains actionable advice
}
