/**
 * AI Analysis Service
 * Encapsula chamadas de IA para analises e geracao de conteudo
 */

import { sendChatMessage } from './chatService';

const SHOW_LOG_PREFIX = process.env.EXPO_PUBLIC_SHOW_LOG_PREFIX !== 'false';

const logPrefix = (service: string): string => {
  return SHOW_LOG_PREFIX ? `[${service}] ` : '';
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
  userProfile: {
    sleepGoal?: string;
    stressLevel?: string;
    bedTime?: string;
    wakeTime?: string;
  },
  recentMetrics: {
    averageQuality: number;
    currentStreak: number;
    trend: 'improving' | 'declining' | 'stable';
  },
): Promise<string> => {
  try {
    console.log(logPrefix('AIAnalysisService') + 'Generating personalized recommendations...');

    const prompt = `Voce e um coach de sono. Baseado no perfil e metricas do usuario, forneca 3 recomendacoes praticas e personalizadas:

PERFIL DO USUARIO:
- Meta de sono: ${userProfile.sleepGoal || 'Nao informado'}
- Nivel de estresse: ${userProfile.stressLevel || 'Nao informado'}
- Horario de dormir: ${userProfile.bedTime || 'Nao informado'}
- Horario de acordar: ${userProfile.wakeTime || 'Nao informado'}

METRICAS RECENTES:
- Qualidade media: ${recentMetrics.averageQuality}/10
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

export const aiAnalysisService = {
  generateWeeklyAISummary,
  generateSleepRecommendations,
};

export default aiAnalysisService;
