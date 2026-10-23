import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function AlertBanner({ status, air, prediction, onDismiss }) {
  const isPoor = (status || '').toLowerCase() === 'poor' || Number(air) >= 301;
  const isHazard = isPoor || prediction === 'Gas Leak' || prediction === 'Smoke';

  if (!isHazard) return null;

  return (
    <View style={styles.bannerContainer}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={onDismiss}
      >
        {/* App Icon Square */}
        <View style={styles.appIconBox}>
          <Ionicons name="leaf" size={22} color="#04210F" />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.headerMeta}>AirSense · now</Text>
          <Text style={styles.headline}>Air quality is Poor</Text>
          <Text style={styles.subtext}>
            Reading {air}. {prediction === 'Gas Leak' ? 'Gas Leak detected! Ventilate or evacuate.' : prediction === 'Smoke' ? 'Smoke detected! Ventilate the room.' : 'Ventilate the room.'}
          </Text>
        </View>

        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color="#9AA8B6" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#1E242C',
    borderWidth: 1,
    borderColor: '#2C3642',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  headerMeta: {
    fontSize: 12,
    color: '#9AA8B6',
    fontWeight: '400',
  },
  headline: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8EEF4',
    marginTop: 1,
  },
  subtext: {
    fontSize: 13,
    color: '#C3CEDA',
    marginTop: 2,
    lineHeight: 17,
  },
  dismissBtn: {
    padding: 4,
  },
});
