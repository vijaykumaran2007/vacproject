import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { THEME, getStatusConfig } from '../constants/theme';

export default function HistoryChart({ history = [], status = 'Moderate', air = 420 }) {
  const statusCfg = getStatusConfig(status || air);

  // Normalize history to 10 points
  const safeHistory = history.length >= 2 ? history.slice(-10) : [
    { air: 100 }, { air: 110 }, { air: 120 }, { air: 140 },
    { air: 180 }, { air: 240 }, { air: 300 }, { air: 350 },
    { air: 390 }, { air: air || 420 },
  ];

  // Map values to chart canvas (viewBox 0 0 340 130)
  // X range: 10 to 330 (320px width across 9 intervals = ~35.5px each)
  // Y range: 15 to 115 (100px height range)
  const minVal = 0;
  const maxVal = 1000;

  const points = safeHistory.map((item, index) => {
    const x = 10 + (index / (safeHistory.length - 1)) * 320;
    const clampedAir = Math.min(maxVal, Math.max(minVal, Number(item.air || 0)));
    // Invert Y: 0 PPM -> Y=115 (bottom), 1000 PPM -> Y=15 (top)
    const y = 115 - (clampedAir / maxVal) * 100;
    return { x: Math.round(x), y: Math.round(y) };
  });

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');
  const lastPoint = points[points.length - 1];

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <Text style={styles.title}>Last 10 readings</Text>
        <Text style={styles.subtitle}>every 3s</Text>
      </View>

      {/* SVG Canvas */}
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={110} viewBox="0 0 340 130">
          {/* Subtle Grid Lines */}
          <Line x1="0" y1="40" x2="340" y2="40" stroke="#223040" strokeWidth="1" />
          <Line x1="0" y1="80" x2="340" y2="80" stroke="#223040" strokeWidth="1" />

          {/* Connected Trend Line */}
          <Polyline
            points={pointsString}
            fill="none"
            stroke={statusCfg.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highlight Indicator on Latest Reading */}
          {lastPoint && (
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={5}
              fill={statusCfg.color}
            />
          )}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E8EEF4',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9AA8B6',
  },
  chartWrapper: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
});
