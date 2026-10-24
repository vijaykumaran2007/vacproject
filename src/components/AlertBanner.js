import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function AlertBanner({
  gasLeakDetected = false,
  smokeDetected = false,
  status = 'Good',
  air = 0,
  prediction = '',
  onDismiss,
}) {
  const flashAnim = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const isCriticalHazard = gasLeakDetected || smokeDetected;
  const isPoorAir = (status || '').toLowerCase() === 'poor' || Number(air) >= 301;

  // Flashing animation loop for critical hazards (Gas leak or Smoke)
  useEffect(() => {
    if (isCriticalHazard) {
      const animation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(flashAnim, {
              toValue: 0.3,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(flashAnim, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseScale, {
              toValue: 1.02,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(pulseScale, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      flashAnim.setValue(1);
      pulseScale.setValue(1);
    }
  }, [isCriticalHazard]);

  // If no hazard and air is not poor, don't show banner
  if (!isCriticalHazard && !isPoorAir) return null;

  // Determine warning text based on prompt requirements:
  // Gas Leak: "⚠️ WARNING: Gas Leak Detected - Ventilate Immediately!"
  // Smoke: "🔥 WARNING: Smoke Detected - Possible Fire!"
  let warningTitle = '';
  let warningSubtext = '';
  let iconName = 'alert-circle';
  let iconColor = '#FFFFFF';

  if (gasLeakDetected && smokeDetected) {
    warningTitle = '⚠️ WARNING: Gas Leak & Smoke Detected!';
    warningSubtext = 'Critical hazard! Shut off gas, avoid flames, and evacuate immediately.';
    iconName = 'warning';
  } else if (gasLeakDetected) {
    warningTitle = '⚠️ WARNING: Gas Leak Detected - Ventilate Immediately!';
    warningSubtext = 'High combustible gas detected. Turn off gas valves and open all windows.';
    iconName = 'warning';
  } else if (smokeDetected) {
    warningTitle = '🔥 WARNING: Smoke Detected - Possible Fire!';
    warningSubtext = 'Elevated smoke particulates and temperature detected. Check for fire source.';
    iconName = 'flame';
  } else {
    // General poor air advisory
    warningTitle = 'Air Quality Advisory: Poor';
    warningSubtext = `Current reading: ${air} PPM. High pollution levels detected; ventilate the area.`;
    iconName = 'leaf';
    iconColor = '#FCA5A5';
  }

  // Critical hazard gets red flashing container
  if (isCriticalHazard) {
    return (
      <View style={styles.outerContainer}>
        <Animated.View
          style={[
            styles.criticalCard,
            {
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          {/* Flashing Red Glow Background Layer */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.flashBackground,
              { opacity: flashAnim },
            ]}
          />

          <View style={styles.criticalContent}>
            {/* Blinking Hazard Icon */}
            <Animated.View
              style={[
                styles.criticalIconBox,
                { opacity: flashAnim },
              ]}
            >
              <Ionicons name={iconName} size={22} color="#FFFFFF" />
            </Animated.View>

            {/* Warning Text Details */}
            <View style={styles.textContainer}>
              <View style={styles.emergencyTagRow}>
                <View style={styles.blinkingDot} />
                <Text style={styles.emergencyTagText}>CRITICAL HAZARD DETECTED</Text>
              </View>
              <Text style={styles.criticalHeadline} numberOfLines={2}>
                {warningTitle}
              </Text>
              {warningSubtext ? (
                <Text style={styles.criticalSubtext}>
                  {warningSubtext}
                </Text>
              ) : null}
            </View>

            {/* Dismiss / Close button */}
            {onDismiss && (
              <TouchableOpacity
                onPress={onDismiss}
                style={styles.dismissBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#FECACA" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    );
  }

  // Standard non-critical Poor Air Banner
  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.normalCard}
        activeOpacity={0.9}
        onPress={onDismiss}
      >
        <View style={styles.normalIconBox}>
          <Ionicons name="leaf" size={20} color="#04210F" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.headerMeta}>AirSense · Alert</Text>
          <Text style={styles.normalHeadline}>{warningTitle}</Text>
          <Text style={styles.normalSubtext}>{warningSubtext}</Text>
        </View>

        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.dismissBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color="#9AA8B6" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  // Red Flashing Critical Banner
  criticalCard: {
    backgroundColor: '#300D10',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  flashBackground: {
    backgroundColor: '#7F1D1D',
  },
  criticalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  criticalIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  blinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F87171',
  },
  emergencyTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCA5A5',
    letterSpacing: 0.6,
  },
  criticalHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  criticalSubtext: {
    fontSize: 12,
    color: '#FECACA',
    marginTop: 3,
    lineHeight: 16,
  },
  // Normal Advisory Banner
  normalCard: {
    backgroundColor: '#1E242C',
    borderWidth: 1,
    borderColor: '#2C3642',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  normalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  headerMeta: {
    fontSize: 11,
    color: '#9AA8B6',
    fontWeight: '500',
  },
  normalHeadline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8EEF4',
    marginTop: 1,
  },
  normalSubtext: {
    fontSize: 12,
    color: '#C3CEDA',
    marginTop: 2,
    lineHeight: 16,
  },
  dismissBtn: {
    padding: 6,
    borderRadius: 12,
  },
});
