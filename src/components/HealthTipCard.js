import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function HealthTipCard({ tipInfo }) {
  if (!tipInfo) return null;

  const { tip, details, icon = 'leaf', color = '#34D399', badge = 'Health Advisory' } = tipInfo;

  return (
    <View style={styles.cardContainer}>
      <View
        style={[
          styles.card,
          {
            borderColor: color === '#EF4444' ? '#6B2327' : color === '#F97316' ? '#7C2D12' : color === '#FBBF24' ? '#5C4A12' : '#1C4A38',
            backgroundColor: color === '#EF4444' ? '#1E1214' : color === '#F97316' ? '#211511' : color === '#FBBF24' ? '#1D1A14' : '#101B17',
          },
        ]}
      >
        {/* Top Header Row with Badge & Icon */}
        <View style={styles.topRow}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: color === '#EF4444' ? '#3B1519' : color === '#F97316' ? '#3D1C13' : color === '#FBBF24' ? '#3A2E14' : '#163B2D',
                },
              ]}
            >
              <Ionicons name={icon} size={20} color={color} />
            </View>
            <View>
              <Text style={styles.cardHeaderTitle}>Health Tip</Text>
              <Text style={styles.cardHeaderSubtitle}>Based on current risks</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: color === '#EF4444' ? '#3A1518' : color === '#F97316' ? '#3D1C13' : color === '#FBBF24' ? '#352912' : '#143828',
                borderColor: color === '#EF4444' ? '#7F1D1D' : color === '#F97316' ? '#7C2D12' : color === '#FBBF24' ? '#5C4A12' : '#1C4A38',
              },
            ]}
          >
            <Text style={[styles.badgeText, { color }]}>{badge}</Text>
          </View>
        </View>

        {/* Main Recommendation Callout */}
        <View style={styles.calloutBox}>
          <Text style={[styles.mainTipText, { color: color === '#EF4444' ? '#FCA5A5' : color === '#F97316' ? '#FDBA74' : color === '#FBBF24' ? '#FDE047' : '#86EFAC' }]}>
            “{tip}”
          </Text>
          {details ? <Text style={styles.detailsText}>{details}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8EEF4',
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: '#9AA8B6',
    fontWeight: '500',
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  calloutBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 14,
    padding: 12,
  },
  mainTipText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  detailsText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginTop: 5,
  },
});
