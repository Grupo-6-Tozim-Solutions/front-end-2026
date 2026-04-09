/**
 * Sleep Quality Calculations
 * Pure utility functions for calculating sleep metrics and comparisons
 */

import { SleepLog, SleepQualityMetrics } from '../types/user';

const DEFAULT_GLOBAL_AVERAGE = 7.2;

/**
 * Converts quality string (1-10) to number
 */
const parseQuality = (quality?: string): number => {
  if (!quality) return 0;
  const num = parseInt(quality, 10);
  return isNaN(num) ? 0 : Math.min(10, Math.max(0, num));
};

/**
 * Calculate average quality for a period
 */
export const calculateAverageQuality = (logs: SleepLog[], days: number = 7): number => {
  if (!logs || logs.length === 0) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= cutoffDate;
  });

  if (recentLogs.length === 0) return 0;

  const sum = recentLogs.reduce((acc, log) => acc + parseQuality(log.quality), 0);
  return Math.round((sum / recentLogs.length) * 10) / 10;
};

/**
 * Determine trend direction based on recent logs
 */
export const calculateTrend = (
  logs: SleepLog[],
  days: number = 7
): 'improving' | 'declining' | 'stable' => {
  if (!logs || logs.length < 3) return 'stable';

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentLogs = logs
    .filter(log => new Date(log.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (recentLogs.length < 3) return 'stable';

  // Split into halves
  const midpoint = Math.floor(recentLogs.length / 2);
  const firstHalf = recentLogs.slice(0, midpoint);
  const secondHalf = recentLogs.slice(midpoint);

  const firstAvg =
    firstHalf.reduce((acc, log) => acc + parseQuality(log.quality), 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((acc, log) => acc + parseQuality(log.quality), 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
};

/**
 * Calculate current streak of high quality sleep
 */
export const calculateCurrentStreak = (logs: SleepLog[], threshold: number = 7): number => {
  if (!logs || logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  for (const log of sortedLogs) {
    if (parseQuality(log.quality) >= threshold) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate percentile rank compared to global average
 */
export const calculatePercentile = (
  userQuality: number,
  globalAverage: number = DEFAULT_GLOBAL_AVERAGE
): number => {
  if (globalAverage === 0) return 50;
  const percentile = (userQuality / globalAverage) * 100;
  return Math.min(100, Math.max(0, Math.round(percentile)));
};

/**
 * Classify quality score into category
 */
export const getQualityCategory = (
  score: number
): 'poor' | 'fair' | 'good' | 'excellent' => {
  if (score < 4) return 'poor';
  if (score < 6) return 'fair';
  if (score < 8) return 'good';
  return 'excellent';
};

/**
 * Calculate comprehensive sleep quality metrics
 */
export const calculateSleepQualityMetrics = (
  logs: SleepLog[],
  globalAverage: number = DEFAULT_GLOBAL_AVERAGE,
  periodDays: number = 7
): SleepQualityMetrics => {
  const averageQuality = calculateAverageQuality(logs, periodDays);
  const trend = calculateTrend(logs, periodDays);
  const currentStreak = calculateCurrentStreak(logs);
  const percentile = calculatePercentile(averageQuality, globalAverage);
  const qualityCategory = getQualityCategory(averageQuality);

  // Count logs in period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  const totalLogsInPeriod = logs.filter(log => new Date(log.date) >= cutoffDate).length;

  return {
    averageQuality,
    totalLogsInPeriod,
    trend,
    currentStreak,
    globalAverage,
    percentile,
    qualityCategory,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Format quality metrics for display
 */
export const formatQualityMetrics = (metrics: SleepQualityMetrics) => {
  return {
    ...metrics,
    averageQualityText: `${metrics.averageQuality.toFixed(1)}/10`,
    percentileText: `Top ${metrics.percentile}%`,
    trendText: {
      improving: '📈 Melhorando',
      declining: '📉 Piorando',
      stable: '➡️ Estável',
    }[metrics.trend],
    categoryText: {
      poor: '❌ Ruim',
      fair: '⚠️ Aceitável',
      good: '✅ Bom',
      excellent: '⭐ Excelente',
    }[metrics.qualityCategory],
  };
};
