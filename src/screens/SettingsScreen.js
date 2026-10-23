import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { fetchEsp32Data } from '../utils/espService';
import { sendTestNotification } from '../utils/notifications';

export default function SettingsScreen({
  settings,
  isConnected,
  onSaveSettings,
  onOpenEspCode,
}) {
  const [ip, setIp] = useState(settings.ip || THEME.defaultEsp32.ip);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);

    const cleanIp = ip.trim();
    const updatedSettings = {
      ...settings,
      ip: cleanIp,
    };
    onSaveSettings(updatedSettings);

    const res = await fetchEsp32Data({
      ip: cleanIp,
      port: settings.port || '80',
      path: settings.path || '/',
      timeoutMs: 3000,
    });

    setTesting(false);
    setTestResult(res);

    if (res.success) {
      Alert.alert('Connected', `Successfully connected to ESP32 at ${cleanIp}`);
    } else {
      Alert.alert('Connection Notice', `Could not reach ${cleanIp}. Check Wi-Fi or toggle Demo Simulator.`);
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      Alert.alert('Notification Sent', 'A test alert was sent to your notification tray.');
    } else {
      Alert.alert('Permissions Required', 'Please enable notifications in system settings.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Connect to your ESP32 over WiFi</Text>
      </View>

      {/* Main IP Config Card */}
      <View style={styles.card}>
        <Text style={styles.label}>ESP32 IP address</Text>
        <TextInput
          style={styles.input}
          value={ip}
          onChangeText={setIp}
          placeholder="192.168.1.42"
          placeholderTextColor="#475569"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.helperText}>
          GET http://{ip.trim() || '192.168.1.42'}/ returns JSON
        </Text>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveAndTest}
          disabled={testing}
          activeOpacity={0.85}
        >
          {testing ? (
            <ActivityIndicator size="small" color="#04210F" />
          ) : (
            <Text style={styles.saveBtnText}>Save and test connection</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Connection Status Pill Card */}
      <View
        style={[
          styles.statusCard,
          settings.isSimulation
            ? styles.statusCardSimulated
            : isConnected
            ? styles.statusCardConnected
            : styles.statusCardDisconnected,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: settings.isSimulation
                ? THEME.colors.simulatedDot
                : isConnected
                ? THEME.colors.connectedDot
                : THEME.colors.disconnectedDot,
            },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            {
              color: settings.isSimulation
                ? '#C4B5FD'
                : isConnected
                ? THEME.colors.goodText
                : THEME.colors.poorText,
            },
          ]}
        >
          {settings.isSimulation
            ? 'Demo Simulator Active'
            : isConnected
            ? 'Connected to ESP32'
            : 'Disconnected from ESP32'}
        </Text>
      </View>

      {/* Preferences List Card */}
      <View style={styles.listCard}>
        {/* Poor Air Alerts Row */}
        <View style={styles.listRow}>
          <Text style={styles.rowLabel}>Poor air alerts</Text>
          <Switch
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
            trackColor={{ false: '#1F2A36', true: THEME.colors.good }}
            thumbColor="#04210F"
          />
        </View>

        {/* Refresh Interval Row */}
        <View style={styles.listRow}>
          <Text style={styles.rowLabel}>Refresh interval</Text>
          <Text style={styles.rowValue}>3 seconds</Text>
        </View>

        {/* Demo Simulator Mode Row */}
        <View style={styles.listRow}>
          <View>
            <Text style={styles.rowLabel}>Demo Simulator</Text>
            <Text style={styles.rowSub}>Test without hardware</Text>
          </View>
          <Switch
            value={settings.isSimulation}
            onValueChange={(val) => onSaveSettings({ ...settings, isSimulation: val })}
            trackColor={{ false: '#1F2A36', true: '#8B5CF6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Test Alert Button */}
        <TouchableOpacity
          style={[styles.listRow, { borderBottomWidth: 0 }]}
          onPress={handleTestNotification}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowLabel, { color: THEME.colors.goodText }]}>
            Send test notification
          </Text>
          <Ionicons name="notifications-outline" size={18} color={THEME.colors.goodText} />
        </TouchableOpacity>
      </View>

      {/* Arduino Code Button */}
      {onOpenEspCode && (
        <TouchableOpacity
          style={styles.codeHelperBtn}
          onPress={onOpenEspCode}
          activeOpacity={0.8}
        >
          <Ionicons name="hardware-chip-outline" size={18} color="#9AA8B6" />
          <Text style={styles.codeHelperText}>View ESP32 Arduino Sketch & Pinout</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#E8EEF4',
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA8B6',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 24,
    padding: 20,
  },
  label: {
    fontSize: 13,
    color: '#9AA8B6',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 52,
    marginTop: 8,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: THEME.colors.good,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#E8EEF4',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#9AA8B6',
    marginTop: 10,
    fontWeight: '400',
  },
  saveBtn: {
    width: '100%',
    height: 52,
    marginTop: 18,
    backgroundColor: THEME.colors.good,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#04210F',
  },
  statusCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  statusCardConnected: {
    backgroundColor: '#10281F',
    borderColor: '#1C4A38',
  },
  statusCardDisconnected: {
    backgroundColor: '#2A1416',
    borderColor: '#6B2327',
  },
  statusCardSimulated: {
    backgroundColor: '#1E1B2E',
    borderColor: '#3B2D54',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E8EEF4',
  },
  rowSub: {
    fontSize: 11,
    color: '#9AA8B6',
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    color: '#9AA8B6',
    fontWeight: '500',
  },
  codeHelperBtn: {
    marginHorizontal: 20,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#131A22',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  codeHelperText: {
    fontSize: 13,
    color: '#9AA8B6',
    fontWeight: '600',
  },
});
