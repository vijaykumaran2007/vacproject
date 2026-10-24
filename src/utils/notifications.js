import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN_MS = 60000; // 60 seconds cooldown between repetitive alerts
let lastStatusWasPoor = false;

export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('air-quality-alerts', {
        name: 'Air Quality Hazard Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EF4444',
        sound: 'default',
        enableVibrate: true,
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Notifications permission error:', error);
    return false;
  }
}

/**
 * Trigger hazard alert notification if air quality is Poor.
 * Debounced so it doesn't spam the user every 3 seconds.
 */
export async function checkAndTriggerAirQualityAlert({
  air,
  temp,
  humidity,
  status,
  prediction,
  hasGasLeak = false,
  hasSmoke = false,
  force = false,
}) {
  const isCriticalHazard = hasGasLeak || hasSmoke;
  const isPoor = isCriticalHazard || (status || '').toLowerCase() === 'poor' || Number(air) >= 301;
  const now = Date.now();

  // Reset flag if recovered
  if (!isPoor) {
    lastStatusWasPoor = false;
    return;
  }

  // Trigger if it's a new Poor event OR cooldown passed
  const shouldAlert = force || !lastStatusWasPoor || (now - lastNotificationTime > NOTIFICATION_COOLDOWN_MS);

  if (shouldAlert) {
    lastNotificationTime = now;
    lastStatusWasPoor = true;

    // Trigger physical haptic alarm
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (_) {}

    // Send push notification
    try {
      let hazardTitle = '🚨 POOR AIR QUALITY ALERT!';
      if (hasGasLeak && hasSmoke) {
        hazardTitle = '⚠️ WARNING: Gas Leak & Smoke Detected!';
      } else if (hasGasLeak) {
        hazardTitle = '⚠️ WARNING: Gas Leak Detected - Ventilate Immediately!';
      } else if (hasSmoke) {
        hazardTitle = '🔥 WARNING: Smoke Detected - Possible Fire!';
      } else if (prediction === 'Gas Leak') {
        hazardTitle = '⚠️ WARNING: Gas Leak Detected - Ventilate Immediately!';
      } else if (prediction === 'Smoke') {
        hazardTitle = '🔥 WARNING: Smoke Detected - Possible Fire!';
      }

      const body = `Air Quality index is ${air} (Poor). Temp: ${temp}°C, Hum: ${humidity}%. Take immediate safety precautions!`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: hazardTitle,
          body,
          data: { air, temp, humidity, status, prediction, hasGasLeak, hasSmoke },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // immediate
      });
    } catch (err) {
      console.warn('Failed to schedule notification:', err);
    }
  }
}

/**
 * Test notification trigger for Settings screen
 */
export async function sendTestNotification() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Air Quality System Test',
        body: 'Alert system active. Notifications and haptic alarms are functioning properly.',
        sound: true,
      },
      trigger: null,
    });
    return true;
  } catch (e) {
    console.warn('Test notification error:', e);
    return false;
  }
}
