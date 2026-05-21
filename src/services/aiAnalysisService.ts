/**
 * AI Analysis Service
 * Encapsula chamadas de IA para analises e geracao de conteudo
 */

import { sendChatAudio, sendChatMessage } from './chatService';

const SHOW_LOG_PREFIX = process.env.EXPO_PUBLIC_SHOW_LOG_PREFIX !== 'false';

const logPrefix = (service: string): string => {
  return SHOW_LOG_PREFIX ? `[${service}] ` : '';
};

export interface SleepCoachUserProfile {
  age?: string;
  gender?: string;
  bedTime?: string;
  wakeTime?: string;
  stressLevel?: string;
  sleepQuality?: string;
  phoneUsageEndTime?: string;
  phoneInBed?: string;
  sleepConsistency?: string;
  wakeRestfulness?: string;
  fallAsleepDuration?: string;
}

export interface SleepCoachRecentMetrics {
  averageQuality: number;
  currentStreak: number;
  trend: 'improving' | 'declining' | 'stable';
  totalLogs?: number;
}

const formatCoachFieldValue = (value?: string | number): string => {
  if (value === undefined || value === null || value === '') {
    return 'Nao informado';
  }

  return String(value);
};

const buildSleepCoachContextPrompt = (
  userMessage: string,
  userProfile: SleepCoachUserProfile,
  recentMetrics: SleepCoachRecentMetrics,
): string => {
  return `Voce e um coach de sono. Use o contexto local do usuario para responder em portugues do Brasil, de forma pratica, acolhedora e objetiva.

PERFIL LOCAL DO USUARIO:
- Idade: ${formatCoachFieldValue(userProfile.age)}
- Genero: ${formatCoachFieldValue(userProfile.gender)}
- Horario habitual de dormir: ${formatCoachFieldValue(userProfile.bedTime)}
- Horario habitual de acordar: ${formatCoachFieldValue(userProfile.wakeTime)}
- Nivel de estresse informado: ${formatCoachFieldValue(userProfile.stressLevel)}
- Qualidade de sono informada: ${formatCoachFieldValue(userProfile.sleepQuality)}
- Uso do celular antes de dormir: ${formatCoachFieldValue(userProfile.phoneUsageEndTime)}
- Uso do celular na cama: ${formatCoachFieldValue(userProfile.phoneInBed)}
- Consistencia do sono: ${formatCoachFieldValue(userProfile.sleepConsistency)}
- Sensacao ao acordar: ${formatCoachFieldValue(userProfile.wakeRestfulness)}
- Tempo para adormecer: ${formatCoachFieldValue(userProfile.fallAsleepDuration)}

METRICAS RECENTES:
- Qualidade media: ${recentMetrics.averageQuality.toFixed(1)}/10
- Sequencia atual: ${recentMetrics.currentStreak} dia(s)
- Tendencia recente: ${recentMetrics.trend}
- Total de registros locais: ${formatCoachFieldValue(recentMetrics.totalLogs)}

MENSAGEM DO USUARIO:
${userMessage}

Ao responder:
- considere primeiro o perfil e as metricas acima
- entregue orientacoes praticas, personalizadas e realistas
- nao invente informacoes ausentes
- se faltar contexto, deixe isso claro de forma breve`;
};

/**
 * Gera um resumo semanal de sono com IA baseado nos dados da semana
 * @param weeklyScore - Pontuacao da semana (0-100)
 * @param weeklyHours - Media de horas de sono
 * @param changeVsPrevWeek - Mudanca de pontos vs semana anterior
 * @param daysLogged - Quantidade de dias com sono registrado
 * @returns Resumo personalizado gerado pela IA
 */
export const generateWeeklyAISummary = async (
  weeklyScore: number,
  weeklyHours: number,
  changeVsPrevWeek: number,
  daysLogged: number,
): Promise<string> => {
  try {
    console.log(logPrefix('AIAnalysisService') + 'Generating weekly summary...');
    console.log(logPrefix('AIAnalysisService') + 'Input values:', {
      weeklyScore,
      weeklyHours,
      changeVsPrevWeek,
      daysLogged,
    });

    const prompt = `Voce e um assistente especializado em qualidade de sono. Analise os dados da semana do usuario abaixo e forneca um resumo sucinto e motivador com exatamente 3 linhas numeradas, focadas em observacao e proximos passos.

DADOS DA SEMANA:
- Pontuacao: ${weeklyScore}/100
- Media de horas de sono: ${weeklyHours.toFixed(1)} horas
- Mudanca vs semana anterior: ${changeVsPrevWeek > 0 ? '+' : ''}${changeVsPrevWeek} pts
- Dias com sono registrado: ${daysLogged} de 7

Forneca EXATAMENTE 3 linhas numeradas (1., 2., 3.):
1. Observacao clara sobre a media de horas, dizendo se esta abaixo, acima ou perto do ideal.
2. Proximo passo pratico sobre consistencia de sono para os proximos dias.
3. Foco recomendado, especifico e acionavel, para a proxima semana.

Seja conciso, com no maximo 15 palavras por linha, sem introducao e sem conclusao.`;

    console.log(logPrefix('AIAnalysisService') + 'Sending prompt to AI...');
    console.log(logPrefix('AIAnalysisService') + 'Prompt snippet:', prompt.substring(0, 150) + '...');

    const response = await sendChatMessage(prompt);
    const summary = response.ai_response;

    console.log(logPrefix('AIAnalysisService') + 'Weekly summary generated successfully');
    console.log(logPrefix('AIAnalysisService') + 'Response length:', summary.length);

    return summary;
  } catch (error) {
    console.error(logPrefix('AIAnalysisService') + 'Error generating weekly summary:', error);
    throw new Error('Nao foi possivel gerar analise com IA. Tente novamente.');
  }
};

/**
 * Gera recomendacoes personalizadas de sono com IA
 * @param userProfile - Perfil do usuario com habitos
 * @param recentMetrics - Metricas recentes de sono
 * @returns Recomendacoes personalizadas
 */
export const generateSleepRecommendations = async (
  userProfile: SleepCoachUserProfile,
  recentMetrics: SleepCoachRecentMetrics,
): Promise<string> => {
  try {
    console.log(logPrefix('AIAnalysisService') + 'Generating personalized recommendations...');

    const prompt = `Voce e um coach de sono. Baseado no perfil e metricas do usuario, forneca 3 recomendacoes praticas e personalizadas:

PERFIL DO USUARIO:
- Idade: ${formatCoachFieldValue(userProfile.age)}
- Genero: ${formatCoachFieldValue(userProfile.gender)}
- Nivel de estresse: ${formatCoachFieldValue(userProfile.stressLevel)}
- Horario de dormir: ${formatCoachFieldValue(userProfile.bedTime)}
- Horario de acordar: ${formatCoachFieldValue(userProfile.wakeTime)}
- Consistencia do sono: ${formatCoachFieldValue(userProfile.sleepConsistency)}
- Uso do celular antes de dormir: ${formatCoachFieldValue(userProfile.phoneUsageEndTime)}
- Uso do celular na cama: ${formatCoachFieldValue(userProfile.phoneInBed)}
- Tempo para adormecer: ${formatCoachFieldValue(userProfile.fallAsleepDuration)}

METRICAS RECENTES:
- Qualidade media: ${recentMetrics.averageQuality.toFixed(1)}/10
- Sequencia de dias bons: ${recentMetrics.currentStreak} dias
- Tendencia: ${recentMetrics.trend}

Forneca exatamente 3 recomendacoes praticas e especificas, numeradas (1., 2., 3.), cada uma com maximo 20 palavras.`;

    const response = await sendChatMessage(prompt);

    console.log(logPrefix('AIAnalysisService') + 'Recommendations generated successfully');

    return response.ai_response;
  } catch (error) {
    console.error(logPrefix('AIAnalysisService') + 'Error generating recommendations:', error);
    throw new Error('Nao foi possivel gerar recomendacoes. Tente novamente.');
  }
};

export const generateSleepCoachReply = async (
  userMessage: string,
  userProfile: SleepCoachUserProfile,
  recentMetrics: SleepCoachRecentMetrics,
): Promise<string> => {
  try {
    console.log(logPrefix('AIAnalysisService') + 'Generating sleep coach reply...');

    const prompt = buildSleepCoachContextPrompt(userMessage, userProfile, recentMetrics);
    const response = await sendChatMessage(prompt);

    console.log(logPrefix('AIAnalysisService') + 'Sleep coach reply generated successfully');

    return response.ai_response;
  } catch (error) {
    console.error(logPrefix('AIAnalysisService') + 'Error generating sleep coach reply:', error);
    throw new Error('Nao foi possivel processar a mensagem do coach. Tente novamente.');
  }
};

export const generateSleepCoachAudioReply = async (
  audioBase64: string,
  audioFilename: string,
  userProfile: SleepCoachUserProfile,
  recentMetrics: SleepCoachRecentMetrics,
): Promise<string> => {
  try {
    console.log(logPrefix('AIAnalysisService') + 'Generating sleep coach audio reply...');

    const prompt = buildSleepCoachContextPrompt(
      'O usuario enviou uma mensagem de audio. Considere a transcricao gerada automaticamente ao responder.',
      userProfile,
      recentMetrics,
    );
    const response = await sendChatAudio(audioBase64, audioFilename, prompt);

    console.log(logPrefix('AIAnalysisService') + 'Sleep coach audio reply generated successfully');

    return response.ai_response;
  } catch (error) {
    console.error(logPrefix('AIAnalysisService') + 'Error generating sleep coach audio reply:', error);
    throw new Error('Nao foi possivel processar o audio do coach. Tente novamente.');
  }
};

export const aiAnalysisService = {
  generateWeeklyAISummary,
  generateSleepRecommendations,
  generateSleepCoachReply,
  generateSleepCoachAudioReply,
};

export default aiAnalysisService;
