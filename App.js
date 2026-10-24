import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';

import { THEME, getStatusConfig } from './src/constants/theme';
import GaugeMeter from './src/components/GaugeMeter';
import HistoryChart from './src/components/HistoryChart';
import AlertBanner from './src/components/AlertBanner';
import PredictionCards from './src/components/PredictionCards';
import HealthTipCard from './src/components/HealthTipCard';
import BottomNav from './src/components/BottomNav';

import SettingsScreen from './src/screens/SettingsScreen';
import EspCodeModal from './src/screens/EspCodeModal';

import { classifyAirCondition } from './src/utils/mlClassifier';
import { calculateRiskPredictions, getHealthTip } from './src/utils/riskCalculator';
import {
  registerForPushNotificationsAsync,
  checkAndTriggerAirQualityAlert,
} from './src/utils/notifications';
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
  DEFAULT_SETTINGS,
} from './src/utils/storage';
import { fetchEsp32Data, generateSimulatedData } from './src/utils/espService';

export default function App() {
  // Navigation tab: 'dashboard' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // App & settings state
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  // Live telemetry data
  const [telemetry, setTelemetry] = useState({
    air: 105,
    temp: 24.5,
    humidity: 50,
    status: 'Good',
    timestamp: Date.now(),
  });

  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [latency, setLatency] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & alerts
  const [showEspCode, setShowEspCode] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Interval reference
  const pollIntervalRef = useRef(null);

  // ML classification, status, risk calculations and health tip
  const mlResult = classifyAirCondition(telemetry);
  const risks = calculateRiskPredictions(telemetry);
  const healthTip = getHealthTip(risks, telemetry);
  const statusCfg = getStatusConfig(telemetry.status || telemetry.air);
  const isPoor = statusCfg.label === 'Poor' || mlResult.label !== 'Clean Air' || risks.hasHazard;

  // 1. Initial Load: load settings & history, register notifications
  useEffect(() => {
    async function init() {
      await registerForPushNotificationsAsync();
      const storedSettings = await loadSettings();
      const storedHistory = await loadHistory();

      setSettings(storedSettings);
      if (storedHistory && storedHistory.length > 0) {
        setHistory(storedHistory);
        const latest = storedHistory[storedHistory.length - 1];
        setTelemetry((prev) => ({
          ...prev,
          air: latest.air ?? prev.air,
          temp: latest.temp ?? prev.temp,
          humidity: latest.humidity ?? prev.humidity,
        }));
      }
      setIsReady(true);
    }
    init();
  }, []);

  // 2. Poll function (real ESP32 HTTP fetch or Simulator)
  const pollData = useCallback(async () => {
    if (settings.isSimulation) {
      const simData = generateSimulatedData();
      updateTelemetryAndHistory(simData, true, 20);
      return;
    }

    setIsConnecting(true);
    const result = await fetchEsp32Data({
      ip: settings.ip,
      port: settings.port || '80',
      path: settings.path || '/',
      timeoutMs: 2600,
    });
    setIsConnecting(false);

    if (result.success) {
      setIsConnected(true);
      setLatency(result.latency);
      updateTelemetryAndHistory(result.data, true, result.latency);
    } else {
      setIsConnected(false);
      setLatency(null);
    }
  }, [settings]);

  // 3. Process new data and update state
  const updateTelemetryAndHistory = (newData, connected, lat) => {
    setTelemetry(newData);
    setIsConnected(connected);
    if (lat) setLatency(lat);

    const ml = classifyAirCondition(newData);
    const calculatedRisks = calculateRiskPredictions(newData);

    // Trigger local push notification + haptics if Air Quality is POOR or Gas/Smoke detected
    checkAndTriggerAirQualityAlert({
      air: newData.air,
      temp: newData.temp,
      humidity: newData.humidity,
      status: newData.status,
      prediction: ml.label,
      hasGasLeak: calculatedRisks.hasGasLeak,
      hasSmoke: calculatedRisks.hasSmoke,
    });

    // Reset dismissal when new data arrives
    setBannerDismissed(false);

    setHistory((prev) => {
      const next = [
        ...prev,
        {
          air: newData.air,
          temp: newData.temp,
          humidity: newData.humidity,
          timestamp: newData.timestamp || Date.now(),
        },
      ].slice(-10);
      saveHistory(next);
      return next;
    });
  };

  // 4. Polling Timer
  useEffect(() => {
    if (!isReady) return;

    pollData();

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(() => {
      pollData();
    }, settings.pollingInterval || 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isReady, settings.pollingInterval, settings.ip, settings.port, settings.path, settings.isSimulation, pollData]);

  // Pull to refresh
  const onPullRefresh = async () => {
    setRefreshing(true);
    await pollData();
    setRefreshing(false);
  };

  // Save settings
  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // Quick scenario test trigger from Settings
  const handleSelectScenario = (scenario) => {
    let mock;
    if (scenario === 'gas') {
      mock = {
        air: 560,
        temp: 26,
        humidity: 45,
        status: 'Poor',
        prediction: 'Gas Leak',
        timestamp: Date.now(),
      };
    } else if (scenario === 'smoke') {
      mock = {
        air: 510,
        temp: 37,
        humidity: 64,
        status: 'Poor',
        prediction: 'Smoke',
        timestamp: Date.now(),
      };
    } else if (scenario === 'respiratory') {
      mock = {
        air: 380,
        temp: 32,
        humidity: 80,
        status: 'Poor',
        prediction: 'Clean Air',
        timestamp: Date.now(),
      };
    } else {
      mock = {
        air: 85,
        temp: 24,
        humidity: 48,
        status: 'Good',
        prediction: 'Clean Air',
        timestamp: Date.now(),
      };
    }
    updateTelemetryAndHistory(mock, true, 15);
    setActiveTab('dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.bgDark} />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {activeTab === 'dashboard' ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onPullRefresh}
                tintColor={THEME.colors.good}
                colors={[THEME.colors.good]}
              />
            }
          >
            {/* Top Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerSubtitle}>Living room</Text>
                <Text style={styles.headerTitle}>AirSense</Text>
              </View>

              {/* Connected Status Pill */}
              <TouchableOpacity
                style={[
                  styles.connectedBadge,
                  settings.isSimulation
                    ? styles.connectedBadgeSimulated
                    : isConnected
                    ? styles.connectedBadgeGood
                    : styles.connectedBadgeOffline,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveTab('settings')}
              >
                <View
                  style={[
                    styles.connectedDot,
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
                    styles.connectedText,
                    {
                      color: settings.isSimulation
                        ? '#C4B5FD'
                        : isConnected
                        ? THEME.colors.goodText
                        : THEME.colors.poorText,
                    },
                  ]}
                >
                  {settings.isSimulation ? 'Demo Mode' : isConnected ? 'Connected' : 'Offline'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Alert Banner at top of screen: Red flashing banner on gas leak or smoke */}
            {!bannerDismissed && (
              <AlertBanner
                gasLeakDetected={risks.hasGasLeak}
                smokeDetected={risks.hasSmoke}
                status={telemetry.status}
                air={telemetry.air}
                prediction={mlResult.label}
                onDismiss={() => setBannerDismissed(true)}
              />
            )}

            {/* Main Dashboard Elements */}
            {/* Air Quality Gauge Card */}
            <View
              style={[
                styles.gaugeCard,
                isPoor ? styles.gaugeCardPoor : styles.gaugeCardNormal,
              ]}
            >
              <GaugeMeter
                air={telemetry.air}
                status={telemetry.status}
                maxAir={1000}
              />
            </View>

            {/* Temperature & Humidity Two-Column Row */}
            <View style={styles.metricsRow}>
              {/* Temperature Card */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Temperature</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[styles.metricValue, { color: THEME.colors.tempColor }]}>
                    {telemetry.temp}
                  </Text>
                  <Text style={styles.metricUnit}>°C</Text>
                </View>
              </View>

              {/* Humidity Card */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Humidity</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[styles.metricValue, { color: THEME.colors.humidityColor }]}>
                    {telemetry.humidity}
                  </Text>
                  <Text style={styles.metricUnit}>%</Text>
                </View>
              </View>
            </View>

            {/* 1. Prediction Cards Section (below the main dashboard) */}
            <PredictionCards risks={risks} />

            {/* Last 10 Readings Line Chart (Graph) */}
            <HistoryChart
              history={history}
              status={telemetry.status}
              air={telemetry.air}
            />

            {/* 4. Health Tip Card at bottom */}
            <HealthTipCard tipInfo={healthTip} />
          </ScrollView>
        ) : (
          /* Settings Screen Tab */
          <SettingsScreen
            settings={settings}
            isConnected={isConnected}
            onSaveSettings={handleSaveSettings}
            onOpenEspCode={() => setShowEspCode(true)}
            onSelectScenario={handleSelectScenario}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* ESP32 Arduino Sketch Code Helper */}
      <EspCodeModal visible={showEspCode} onClose={() => setShowEspCode(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9AA8B6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#E8EEF4',
    marginTop: 2,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  connectedBadgeGood: {
    backgroundColor: '#10281F',
    borderColor: '#1C4A38',
  },
  connectedBadgeOffline: {
    backgroundColor: '#2A1416',
    borderColor: '#6B2327',
  },
  connectedBadgeSimulated: {
    backgroundColor: '#1E1B2E',
    borderColor: '#3B2D54',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gaugeCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  gaugeCardNormal: {
    backgroundColor: THEME.colors.cardBg,
    borderColor: THEME.colors.cardBorder,
  },
  gaugeCardPoor: {
    backgroundColor: THEME.colors.poorBg,
    borderColor: THEME.colors.poorBorder,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 20,
    padding: 16,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9AA8B6',
    fontWeight: '500',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    gap: 4,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 16,
    color: '#9AA8B6',
    fontWeight: '500',
  },
});
