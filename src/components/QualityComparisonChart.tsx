import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { SleepLog } from '../types/user';
import { useTheme } from '../contexts/ThemeContext';
import { calculateAverageHours, hasRecordedSleep, parseHoursSlept } from '../utils/sleepMetrics';

interface QualityComparisonChartProps {
  sleepLogs: SleepLog[];
  globalAverage: number;
  userColor?: string;
  globalColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const PADDING = 24;
const INNER_WIDTH = CHART_WIDTH - PADDING * 2;
const INNER_HEIGHT = CHART_HEIGHT - PADDING * 2;

export const QualityComparisonChart: React.FC<QualityComparisonChartProps> = ({
  sleepLogs,
  globalAverage,
  userColor,
  globalColor,
  backgroundColor,
  textColor,
}) => {
  const { theme } = useTheme();

  const resolvedUserColor = userColor ?? theme.colors.accent;
  const resolvedGlobalColor = globalColor ?? theme.colors.textSubtle;
  const resolvedBackground = backgroundColor ?? theme.colors.surface;
  const resolvedText = textColor ?? theme.colors.text;

  const recentSleepLogs = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    return sleepLogs.filter((log) => new Date(log.date) >= cutoffDate);
  }, [sleepLogs]);

  const chartData = useMemo(() => {
    const data: Array<{ dayName: string; hours: number | null }> = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = sleepLogs.find((entry) => entry.date === dateStr && hasRecordedSleep(entry));

      data.push({
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        hours: log ? parseHoursSlept(log.hoursSlept) : null,
      });
    }

    return data;
  }, [sleepLogs]);

  const chartMaxHours = useMemo(() => {
    const maxUserHours = chartData.reduce((currentMax, entry) => Math.max(currentMax, entry.hours ?? 0), 0);
    return Math.max(8, Math.ceil(globalAverage), Math.ceil(maxUserHours));
  }, [chartData, globalAverage]);

  const userPoints = useMemo(
    () =>
      chartData.flatMap((entry, index) => {
        if (entry.hours === null) return [];

        const x = PADDING + (index / (chartData.length - 1)) * INNER_WIDTH;
        const y = CHART_HEIGHT - PADDING - (entry.hours / chartMaxHours) * INNER_HEIGHT;
        return { x, y };
      }),
    [chartData, chartMaxHours],
  );

  const globalPoints = useMemo(
    () =>
      chartData.map((_, index) => {
        const x = PADDING + (index / (chartData.length - 1)) * INNER_WIDTH;
        const y = CHART_HEIGHT - PADDING - (globalAverage / chartMaxHours) * INNER_HEIGHT;
        return { x, y };
      }),
    [chartData, globalAverage, chartMaxHours],
  );

  const userAverage = useMemo(() => calculateAverageHours(recentSleepLogs), [recentSleepLogs]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: resolvedText }]}>Horas de sono dos ultimos 7 dias</Text>
      <View
        style={[
          styles.chartFrame,
          {
            backgroundColor: resolvedBackground,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {[0, 2, 4, 6, 8].filter((line) => line <= chartMaxHours).map((line) => {
            const y = CHART_HEIGHT - PADDING - (line / chartMaxHours) * INNER_HEIGHT;
            return (
              <Line
                key={`grid-${line}`}
                x1={PADDING}
                y1={y}
                x2={CHART_WIDTH - PADDING}
                y2={y}
                stroke={theme.colors.border}
                strokeWidth={1}
                strokeDasharray="3 4"
              />
            );
          })}

          <Polyline
            points={globalPoints.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke={resolvedGlobalColor}
            strokeWidth={2}
            strokeDasharray="6 4"
          />

          {userPoints.length > 1 ? (
            <Polyline
              points={userPoints.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={resolvedUserColor}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ) : null}

          {userPoints.map((point, index) => (
            <Circle key={`user-${index}`} cx={point.x} cy={point.y} r={3} fill={resolvedUserColor} />
          ))}

          {chartData.map((entry, index) => (
            <SvgText
              key={`x-${entry.dayName}-${index}`}
              x={PADDING + (index / (chartData.length - 1)) * INNER_WIDTH}
              y={CHART_HEIGHT - 4}
              fontSize="10"
              fill={resolvedText}
              opacity="0.8"
              textAnchor="middle"
            >
              {entry.dayName}
            </SvgText>
          ))}
        </Svg>
      </View>
      <View style={styles.foot}>
        <Text style={[styles.metric, { color: resolvedText }]}>Sua media: {userAverage.toFixed(1)}h</Text>
        <Text style={[styles.metric, { color: theme.colors.textMuted }]}>Global: {globalAverage.toFixed(1)}h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartFrame: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    fontSize: 13,
    fontWeight: '600',
  },
});
