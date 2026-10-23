import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/theme';

const STORAGE_KEYS = {
  SETTINGS: '@aerosense_settings_v1',
  HISTORY: '@aerosense_history_v1',
};

export const DEFAULT_SETTINGS = {
  ip: THEME.defaultEsp32.ip,
  port: THEME.defaultEsp32.port,
  path: THEME.defaultEsp32.path,
  pollingInterval: 3000, // 3 seconds
  isSimulation: false,    // Set to false by default, or auto-toggle
  soundAlerts: true,
  hapticAlerts: true,
  poorThreshold: 300,
};

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(newSettings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    return true;
  } catch (e) {
    console.warn('Error saving settings:', e);
    return false;
  }
}

export async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error loading history:', e);
  }
  // Default mock seed history of 10 readings
  return [
    { air: 120, temp: 28, humidity: 55, timestamp: Date.now() - 27000 },
    { air: 135, temp: 28, humidity: 56, timestamp: Date.now() - 24000 },
    { air: 160, temp: 29, humidity: 58, timestamp: Date.now() - 21000 },
    { air: 210, temp: 30, humidity: 60, timestamp: Date.now() - 18000 },
    { air: 260, temp: 31, humidity: 62, timestamp: Date.now() - 15000 },
    { air: 310, temp: 31, humidity: 63, timestamp: Date.now() - 12000 },
    { air: 380, temp: 32, humidity: 64, timestamp: Date.now() - 9000 },
    { air: 410, temp: 32, humidity: 65, timestamp: Date.now() - 6000 },
    { air: 420, temp: 32, humidity: 65, timestamp: Date.now() - 3000 },
    { air: 420, temp: 32, humidity: 65, timestamp: Date.now() },
  ];
}

export async function saveHistory(historyList) {
  try {
    const trimmed = historyList.slice(-10);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Error saving history:', e);
  }
}
