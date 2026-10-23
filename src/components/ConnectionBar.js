import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function ConnectionBar({
  isConnected,
  isConnecting,
  isSimulating,
  latency,
  ip,
  onOpenSettings,
  onOpenEspCode,
  onRefresh,
  isPaused,
  onTogglePause,
}) {
  let badgeColor = THEME.colors.disconnected;
  let statusText = 'Disconnected';
  let statusIcon = 'cloud-offline';

  if (isSimulating) {
    badgeColor = THEME.colors.simulated;
    statusText = 'Demo Simulator';
    statusIcon = 'sparkles';
  } else if (isConnected) {
    badgeColor = THEME.colors.connected;
    statusText = latency ? `Connected (${latency}ms)` : 'Connected';
    statusIcon = 'radio';
  } else if (isConnecting) {
    badgeColor = THEME.colors.connecting;
    statusText = 'Connecting...';
    statusIcon = 'sync';
  }

  return (
    <View style={styles.container}>
      {/* Status Pill */}
      <TouchableOpacity
        style={[styles.statusPill, { borderColor: `${badgeColor}50`, backgroundColor: `${badgeColor}15` }]}
        onPress={onOpenSettings}
        activeOpacity={0.8}
      >
        <View style={[styles.dot, { backgroundColor: badgeColor }]} />
        <Ionicons name={statusIcon} size={13} color={badgeColor} />
        <Text style={[styles.statusText, { color: badgeColor }]}>{statusText}</Text>
        {!isSimulating && (
          <Text style={styles.ipSnippet} numberOfLines={1}>• {ip}</Text>
        )}
      </TouchableOpacity>

      {/* Action Controls */}
      <View style={styles.actionsRow}>
        {/* Pause / Resume Polling */}
        <TouchableOpacity
          style={[styles.actionBtn, isPaused && styles.actionBtnActive]}
          onPress={onTogglePause}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={16}
            color={isPaused ? THEME.colors.moderate : '#94A3B8'}
          />
        </TouchableOpacity>

        {/* Manual Refresh Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onRefresh}
          disabled={isConnecting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isConnecting ? (
            <ActivityIndicator size="small" color={THEME.colors.cyan} />
          ) : (
            <Ionicons name="refresh" size={17} color="#94A3B8" />
          )}
        </TouchableOpacity>

        {/* ESP32 Arduino Code Helper */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenEspCode}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="hardware-chip-outline" size={17} color={THEME.colors.cyan} />
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenSettings}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="settings-sharp" size={17} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: '60%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ipSnippet: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    borderColor: THEME.colors.moderate,
    backgroundColor: `${THEME.colors.moderate}20`,
  },
});
