import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function PredictionCards({ risks }) {
  if (!risks) return null;

  const { gasLeak, smoke, respiratory, airborne } = risks;

  const renderCard = (card) => {
    return (
      <View
        key={card.id}
        style={[
          styles.card,
          {
            backgroundColor: card.bgColor || THEME.colors.cardBg,
            borderColor: card.borderColor || THEME.colors.cardBorder,
          },
        ]}
      >
        {/* Top Header of Card */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: card.badgeBg || '#1F2A36' },
            ]}
          >
            <Ionicons name={card.icon} size={18} color={card.color} />
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: card.badgeBg || '#1F2A36',
                borderColor: card.borderColor || '#334155',
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: card.color }]} />
            <Text style={[styles.statusPillText, { color: card.color }]}>
              {card.value}
            </Text>
          </View>
        </View>

        {/* Card Title */}
        <Text style={styles.cardTitle} numberOfLines={1}>
          {card.title}
        </Text>

        {/* Main Value Display */}
        <Text style={[styles.cardValue, { color: card.color }]}>
          {card.value}
        </Text>

        {/* Condition / Logic Formula Label */}
        <View style={styles.logicFooter}>
          <Text style={styles.logicText} numberOfLines={1}>
            {card.ruleText}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Prediction Risks</Text>
          <Text style={styles.sectionSubtitle}>Multi-sensor AI risk assessment</Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>REALTIME</Text>
        </View>
      </View>

      {/* 2x2 Grid of Risk Cards */}
      <View style={styles.gridContainer}>
        {/* Row 1: Gas Leak & Smoke / Fire */}
        <View style={styles.row}>
          {renderCard(gasLeak)}
          {renderCard(smoke)}
        </View>

        {/* Row 2: Respiratory & Airborne Disease */}
        <View style={styles.row}>
          {renderCard(respiratory)}
          {renderCard(airborne)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8EEF4',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9AA8B6',
    fontWeight: '500',
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10281F',
    borderWidth: 1,
    borderColor: '#1C4A38',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6EE7B7',
    letterSpacing: 0.5,
  },
  gridContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 130,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 12,
    color: '#9AA8B6',
    fontWeight: '600',
    marginTop: 10,
  },
  cardValue: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  logicFooter: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  logicText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
});
