import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon = 'information-circle',
  color = THEME.colors.cyan,
  bgColor = 'rgba(6, 182, 212, 0.1)',
  badge = null,
  badgeColor = null,
  subtitle = null,
  style = {},
}) {
  return (
    <View style={[styles.card, { borderColor: color ? `${color}35` : THEME.colors.border }, style]}>
      {/* Top Accent Indicator */}
      <View style={[styles.accentLine, { backgroundColor: color }]} />

      <View style={styles.content}>
        {/* Header row with Icon and Title */}
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <Text style={styles.title} numberOfLines={1}>{title.toUpperCase()}</Text>
        </View>

        {/* Main Value Display */}
        <View style={styles.valueRow}>
          <Text style={[styles.valueText, { color: color || THEME.colors.textPrimary }]} numberOfLines={1}>
            {value}
          </Text>
          {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
        </View>

        {/* Bottom Badge or Subtitle */}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: badgeColor ? `${badgeColor}25` : bgColor }]}>
            <Text style={[styles.badgeText, { color: badgeColor || color }]}>
              {badge}
            </Text>
          </View>
        ) : subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  content: {
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#94A3B8',
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
});
