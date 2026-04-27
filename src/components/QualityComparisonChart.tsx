import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { SleepLog } from '../types/user';
import { useTheme } from '../contexts/ThemeContext';

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

  const chartData = useMemo(() => {
    const data: Array<{ dayName: string; quality: number | null }> = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = sleepLogs.find((entry) => entry.date === dateStr);
      data.push({
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        quality: log ? parseInt(log.quality || '0', 10) : null,
      });
    }

    return data;
  }, [sleepLogs]);

  const userPoints = useMemo(
    () =>
      chartData.map((entry, index) => {
        const x = PADDING + (index / (chartData.length - 1)) * INNER_WIDTH;
        const y = CHART_HEIGHT - PADDING - ((entry.quality ?? 0) / 10) * INNER_HEIGHT;
        return { x, y };
      }),
    [chartData],
  );

  const globalPoints = useMemo(
    () =>
      chartData.map((_, index) => {
        const x = PADDING + (index / (chartData.length - 1)) * INNER_WIDTH;
        const y = CHART_HEIGHT - PADDING - (globalAverage / 10) * INNER_HEIGHT;
        return { x, y };
      }),
    [chartData, globalAverage],
  );

  const userAverage = useMemo(() => {
    const valid = chartData.filter((item) => item.quality !== null);
    if (!valid.length) return 0;
    const total = valid.reduce((sum, item) => sum + (item.quality ?? 0), 0);
    return total / valid.length;
  }, [chartData]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: resolvedText }]}>Qualidade dos últimos 7 dias</Text>
      <View style={[styles.chartFrame, { backgroundColor: resolvedBackground, borderColor: theme.colors.border, borderRadius: theme.radius.lg }]}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {[0, 2, 4, 6, 8, 10].map((line) => {
            const y = CHART_HEIGHT - PADDING - (line / 10) * INNER_HEIGHT;
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

          <Polyline
            points={userPoints.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke={resolvedUserColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

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
        <Text style={[styles.metric, { color: resolvedText }]}>Sua média: {userAverage.toFixed(1)}/10</Text>
        <Text style={[styles.metric, { color: theme.colors.textMuted }]}>Global: {globalAverage.toFixed(1)}/10</Text>
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
