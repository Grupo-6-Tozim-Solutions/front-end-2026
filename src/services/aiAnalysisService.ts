/**
 * AI Analysis Service
 * Encapsula chamadas de IA para analises e geracao de conteudo
 */

import { sendChatAudio, sendChatMessage } from './chatService';
import { SleepLog } from '../types/user';

const SHOW_LOG_PREFIX = process.env.EXPO_PUBLIC_SHOW_LOG_PREFIX !== 'false';

const logPrefix = (service: string): string => {
  return SHOW_LOG_PREFIX ? `[${service}] ` : '';
};

const COACH_COMPLETION_MARKER = '[FIM_RESPOSTA]';

export interface SleepCoachUserProfile {
  id?: string;
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
  homeZipCode?: string;
  homeAddress?: string;
  homeLatitude?: number;
  homeLongitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SleepCoachRecentMetrics {
  averageQuality: number;
  currentStreak: number;
  trend: 'improving' | 'declining' | 'stable';
  totalLogs?: number;
  globalQualityAverage?: number;
}

const formatCoachFieldValue = (value?: string | number): string => {
  if (value === undefined || value === null || value === '') {
    return 'Nao informado';
  }

  return String(value);
};

const parseCoachNumber = (value?: string): number | null => {
  if (!value) return null;

  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const average = (values: number[]): number | null => {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const sortSleepLogsByDateDesc = (sleepLogs: SleepLog[]): SleepLog[] => {
  return [...sleepLogs].sort((left, right) => {
    const leftTime = left.timestamp || new Date(left.date).getTime();
    const rightTime = right.timestamp || new Date(right.date).getTime();
    return rightTime - leftTime;
  });
};

const formatSleepLogForPrompt = (log: SleepLog, index: number): string => {
  return `${index + 1}. Data: ${formatCoachFieldValue(log.date)}; horas dormidas: ${formatCoachFieldValue(log.hoursSlept)}; dormiu: ${formatCoachFieldValue(log.bedTimeActual)}; acordou: ${formatCoachFieldValue(log.wakeTimeActual)}; qualidade: ${formatCoachFieldValue(log.quality)}; observacoes adicionais: ${formatCoachFieldValue(log.notes)}; status de sincronizacao: ${formatCoachFieldValue(log.syncStatus)}.`;
};

const buildConsolidatedSleepLogsContext = (sleepLogs: SleepLog[]): string => {
  if (!sleepLogs.length) {
    return 'Nenhum registro de sono salvo ate o momento.';
  }

  const sortedSleepLogs = sortSleepLogsByDateDesc(sleepLogs);
  const hoursValues = sleepLogs
    .map((log) => parseCoachNumber(log.hoursSlept))
    .filter((value): value is number => value !== null);
  const qualityValues = sleepLogs
    .map((log) => parseCoachNumber(log.quality))
    .filter((value): value is number => value !== null);
  const logsWithNotes = sortedSleepLogs.filter((log) => log.notes?.trim());
  const recentDetailedLogs = sortedSleepLogs.slice(0, 8).map(formatSleepLogForPrompt).join('\n');
  const additionalNotes = logsWithNotes.length
    ? logsWithNotes
      .map((log) => `- ${formatCoachFieldValue(log.date)}: ${formatCoachFieldValue(log.notes)}`)
      .join('\n')
    : 'Nenhuma observacao adicional cadastrada.';
  const firstLog = sortedSleepLogs[sortedSleepLogs.length - 1];
  const lastLog = sortedSleepLogs[0];

  return `Resumo consolidado de todos os registros:
- Total de registros considerados: ${sleepLogs.length}
- Periodo dos registros: ${formatCoachFieldValue(firstLog?.date)} ate ${formatCoachFieldValue(lastLog?.date)}
- Media de horas dormidas: ${formatCoachFieldValue(average(hoursValues)?.toFixed(1))}
- Media de qualidade registrada: ${formatCoachFieldValue(average(qualityValues)?.toFixed(1))}
- Registros com observacoes adicionais: ${logsWithNotes.length}

Observacoes adicionais cadastradas:
${additionalNotes}

Registros recentes detalhados:
${recentDetailedLogs}`;
};

const stripCoachCompletionMarker = (value: string): string => {
  return value.replaceAll(COACH_COMPLETION_MARKER, '').trim();
};

const appendContinuation = (current: string, continuation: string): string => {
  const cleanContinuation = stripCoachCompletionMarker(continuation);
  if (!cleanContinuation) return current;

  const normalizedCurrent = current.trim();
  if (!normalizedCurrent) return cleanContinuation;

  return `${normalizedCurrent}\n${cleanContinuation}`;
};

const requestCompleteCoachResponse = async (
  prompt: string,
  userMessage: string,
): Promise<string> => {
  const firstResponse = await sendChatMessage(prompt);
  let completeResponse = firstResponse.ai_response;

  for (let attempt = 0; attempt < 2 && !completeResponse.includes(COACH_COMPLETION_MARKER); attempt += 1) {
    console.warn(logPrefix('AIAnalysisService') + 'Coach response missing completion marker, requesting continuation...');

    const continuationPrompt = `A resposta anterior do coach de sono foi interrompida antes do marcador ${COACH_COMPLETION_MARKER}.
Continue exatamente de onde parou, sem repetir trechos anteriores e sem introducao.

MENSAGEM ORIGINAL DO USUARIO:
${userMessage}

RESPOSTA PARCIAL:
${stripCoachCompletionMarker(completeResponse)}

Finalize obrigatoriamente com ${COACH_COMPLETION_MARKER}.`;

    const continuationResponse = await sendChatMessage(continuationPrompt);
    completeResponse = appendContinuation(completeResponse, continuationResponse.ai_response);
  }

  return stripCoachCompletionMarker(completeResponse);
};

const buildSleepCoachContextPrompt = (
  userMessage: string,
  userProfile: SleepCoachUserProfile,
  recentMetrics: SleepCoachRecentMetrics,
  sleepLogs: SleepLog[] = [],
): string => {
  const sleepLogsContext = buildConsolidatedSleepLogsContext(sleepLogs);

  return `Voce e um coach de sono. Use o contexto local do usuario para responder em portugues do Brasil, de forma pratica, acolhedora e objetiva.

PERFIL LOCAL DO USUARIO:
- ID local: ${formatCoachFieldValue(userProfile.id)}
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
- CEP residencial: ${formatCoachFieldValue(userProfile.homeZipCode)}
- Endereco residencial: ${formatCoachFieldValue(userProfile.homeAddress)}
- Latitude residencial: ${formatCoachFieldValue(userProfile.homeLatitude)}
- Longitude residencial: ${formatCoachFieldValue(userProfile.homeLongitude)}
- Perfil criado em: ${formatCoachFieldValue(userProfile.createdAt)}
- Perfil atualizado em: ${formatCoachFieldValue(userProfile.updatedAt)}

METRICAS RECENTES:
- Qualidade media: ${recentMetrics.averageQuality.toFixed(1)}/10
- Sequencia atual: ${recentMetrics.currentStreak} dia(s)
- Tendencia recente: ${recentMetrics.trend}
- Total de registros locais: ${formatCoachFieldValue(recentMetrics.totalLogs)}
- Media global de referencia: ${formatCoachFieldValue(recentMetrics.globalQualityAverage)}

REGISTROS DE SONO ARMAZENADOS:
${sleepLogsContext}

MENSAGEM DO USUARIO:
${userMessage}

Ao responder:
- considere primeiro o perfil, as metricas e todos os registros armazenados acima
- considere as observacoes adicionais dos registros quando existirem
- entregue orientacoes praticas, personalizadas e realistas
- nao invente informacoes ausentes
- se faltar contexto, deixe isso claro de forma breve
- responda de forma completa, mas concisa
- termine obrigatoriamente com ${COACH_COMPLETION_MARKER}`;
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
  sleepLogs: SleepLog[] = [],
): Promise<string> => {
  try {
    console.log(logPrefix('AIAnalysisService') + 'Generating sleep coach reply...');

    const prompt = buildSleepCoachContextPrompt(userMessage, userProfile, recentMetrics, sleepLogs);
    const response = await requestCompleteCoachResponse(prompt, userMessage);

    console.log(logPrefix('AIAnalysisService') + 'Sleep coach reply generated successfully');

    return response;
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
  sleepLogs: SleepLog[] = [],
): Promise<string> => {
  try {
    console.log(logPrefix('AIAnalysisService') + 'Generating sleep coach audio reply...');

    const prompt = buildSleepCoachContextPrompt(
      'O usuario enviou uma mensagem de audio. Considere a transcricao gerada automaticamente ao responder.',
      userProfile,
      recentMetrics,
      sleepLogs,
    );
    const response = await sendChatAudio(audioBase64, audioFilename, prompt);
    let completeResponse = response.ai_response;

    for (let attempt = 0; attempt < 2 && !completeResponse.includes(COACH_COMPLETION_MARKER); attempt += 1) {
      console.warn(logPrefix('AIAnalysisService') + 'Coach audio response missing completion marker, requesting continuation...');

      const continuationResponse = await sendChatMessage(`A resposta anterior do coach de sono para uma mensagem de audio foi interrompida antes do marcador ${COACH_COMPLETION_MARKER}.
Continue exatamente de onde parou, sem repetir trechos anteriores e sem introducao.

RESPOSTA PARCIAL:
${stripCoachCompletionMarker(completeResponse)}

Finalize obrigatoriamente com ${COACH_COMPLETION_MARKER}.`);

      completeResponse = appendContinuation(completeResponse, continuationResponse.ai_response);
    }

    console.log(logPrefix('AIAnalysisService') + 'Sleep coach audio reply generated successfully');

    return stripCoachCompletionMarker(completeResponse);
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
