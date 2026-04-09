import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Text as SvgText, Line } from 'react-native-svg';
import { SleepLog } from '../types/user';
import { typography, spacing } from '../styles/theme';

interface QualityComparisonChartProps {
  sleepLogs: SleepLog[];
  globalAverage: number;
  userColor: string;
  globalColor: string;
  backgroundColor: string;
  textColor: string;
}

export const QualityComparisonChart: React.FC<QualityComparisonChartProps> = ({
  sleepLogs,
  globalAverage,
  userColor,
  globalColor,
  backgroundColor,
  textColor,
}) => {
  const CHART_WIDTH = 320;
  const CHART_HEIGHT = 140;
  const PADDING = 20;
  const INNER_WIDTH = CHART_WIDTH - PADDING * 2;
  const INNER_HEIGHT = CHART_HEIGHT - PADDING * 2;
  const MAX_QUALITY = 10;

  // Get last 7 days of data
  const chartData = useMemo(() => {
    const data: Array<{ date: string; dayName: string; quality: number | null }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const log = sleepLogs.find(l => l.date === dateStr);
      data.push({
        date: dateStr,
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        quality: log ? parseInt(log.quality || '0', 10) : null,
      });
    }
    
    return data;
  }, [sleepLogs]);

  // Generate polyline points for user data
  const userPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    
    chartData.forEach((entry, index) => {
      const x = PADDING + (index / (chartData.length - 1)) * INNER_WIDTH;
      const quality = entry.quality || 0;
      const y = CHART_HEIGHT - PADDING - (quality / MAX_QUALITY) * INNER_HEIGHT;
      points.push({ x, y });
    });
    
    return points;
  }, [chartData]);

  // Generate polyline points for global average (horizontal line)
  const globalPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    
    chartData.forEach((_, index) => {
      const x = PADDING + (index / (chartData.length - 1)) * INNER_WIDTH;
      const y = CHART_HEIGHT - PADDING - (globalAverage / MAX_QUALITY) * INNER_HEIGHT;
      points.push({ x, y });
    });
    
    return points;
  }, [chartData, globalAverage]);

  const userPointsStr = userPoints.map(p => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' ');
  const globalPointsStr = globalPoints.map(p => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' ');

  // Calculate user average
  const userAverage = useMemo(() => {
    const validLogs = chartData.filter(d => d.quality !== null);
    if (validLogs.length === 0) return 0;
    const sum = validLogs.reduce((acc, d) => acc + (d.quality || 0), 0);
    return sum / validLogs.length;
  }, [chartData]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Sua Qualidade vs Média Global
        </Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: userColor }]} />
            <Text style={[styles.legendText, { color: textColor }]}>Você</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: globalColor }]} />
            <Text style={[styles.legendText, { color: textColor }]}>Global</Text>
          </View>
        </View>
      </View>

      <View style={[styles.chartContainer, { backgroundColor }]}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Grid lines */}
          {[2, 4, 6, 8, 10].map(line => (
            <Line
              key={`grid-${line}`}
              x1={PADDING}
              y1={CHART_HEIGHT - PADDING - (line / MAX_QUALITY) * INNER_HEIGHT}
              x2={CHART_WIDTH - PADDING}
              y2={CHART_HEIGHT - PADDING - (line / MAX_QUALITY) * INNER_HEIGHT}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* User quality line (solid) */}
          <Polyline
            points={userPointsStr}
            fill="none"
            stroke={userColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Global average line (dashed) */}
          <Polyline
            points={globalPointsStr}
            fill="none"
            stroke={globalColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5,5"
          />

          {/* Data points - User */}
          {userPoints.map((point, i) => (
            <Circle
              key={`user-point-${i}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={userColor}
              stroke="white"
              strokeWidth="1"
            />
          ))}

          {/* Data points - Global */}
          {globalPoints.map((point, i) => (
            <Circle
              key={`global-point-${i}`}
              cx={point.x}
              cy={point.y}
              r="2.5"
              fill={globalColor}
              stroke="white"
              strokeWidth="0.5"
            />
          ))}

          {/* X-axis labels (dias) */}
          {chartData.map((entry, index) => (
            <SvgText
              key={`label-${index}`}
              x={PADDING + (index / (chartData.length - 1)) * INNER_WIDTH}
              y={CHART_HEIGHT - 3}
              fontSize="10"
              fill={textColor}
              textAnchor="middle"
              opacity="0.7"
            >
              {entry.dayName}
            </SvgText>
          ))}

          {/* Y-axis labels (values 0-10) */}
          {[0, 2, 4, 6, 8, 10].map(value => (
            <SvgText
              key={`y-label-${value}`}
              x={PADDING - 10}
              y={CHART_HEIGHT - PADDING - (value / MAX_QUALITY) * INNER_HEIGHT + 3}
              fontSize="9"
              fill={textColor}
              textAnchor="end"
              opacity="0.6"
            >
              {value}
            </SvgText>
          ))}
        </Svg>
      </View>

      {/* Stats footer */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: userColor }]}>
            {userAverage.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Sua Média</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: globalColor }]}>
            {globalAverage.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Global</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.small,
  },
  chartContainer: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption,
  },
});
