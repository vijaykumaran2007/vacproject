import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { THEME, getStatusConfig } from '../constants/theme';

export default function GaugeMeter({ air = 0, status = 'Good', maxAir = 1000 }) {
  const statusCfg = getStatusConfig(status || air);
  const isPoor = statusCfg.label === 'Poor';

  // Arc calculations
  // Path: M 30 130 A 100 100 0 0 1 230 130
  // Arc length for semicircle with R=100 is PI * 100 ≈ 314.16
  const arcLength = 314.16;
  const progress = Math.min(1, Math.max(0.01, air / maxAir));
  const dashLength = progress * arcLength;

  return (
    <View style={styles.container}>
      <View style={styles.gaugeWrapper}>
        <Svg width={260} height={150} viewBox="0 0 260 150">
          {/* Background Track */}
          <Path
            d="M 30 130 A 100 100 0 0 1 230 130"
            fill="none"
            stroke={statusCfg.gaugeTrack}
            strokeWidth={16}
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <Path
            d="M 30 130 A 100 100 0 0 1 230 130"
            fill="none"
            stroke={statusCfg.color}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={`${dashLength} ${arcLength}`}
          />
        </Svg>

        {/* Center Digital Readout */}
        <View style={styles.centerTextContainer}>
          <Text style={styles.valueText}>{air}</Text>
          <Text style={[styles.subText, isPoor && styles.subTextPoor]}>
            Air quality index
          </Text>
        </View>
      </View>

      {/* Status Pill Badge */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: statusCfg.badgeBg,
            borderColor: statusCfg.badgeBorder,
          },
        ]}
      >
        <Text style={[styles.statusBadgeText, { color: statusCfg.textColor }]}>
          {statusCfg.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  gaugeWrapper: {
    position: 'relative',
    width: 260,
    height: 150,
  },
  centerTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 56,
    color: '#E8EEF4',
    fontVariant: ['tabular-nums'],
  },
  subText: {
    fontSize: 12,
    color: '#9AA8B6',
    marginTop: 4,
    fontWeight: '500',
  },
  subTextPoor: {
    color: '#C3A5A8',
  },
  statusBadge: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
