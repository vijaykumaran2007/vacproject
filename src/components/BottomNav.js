import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { THEME } from '../constants/theme';

export default function BottomNav({ activeTab = 'dashboard', onChangeTab }) {
  const isDashboard = activeTab === 'dashboard';
  const isSettings = activeTab === 'settings';

  return (
    <View style={styles.container}>
      {/* Dashboard Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onChangeTab('dashboard')}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="3"
            width="7"
            height="9"
            rx="2"
            stroke={isDashboard ? THEME.colors.good : THEME.colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Rect
            x="14"
            y="3"
            width="7"
            height="5"
            rx="2"
            stroke={isDashboard ? THEME.colors.good : THEME.colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Rect
            x="14"
            y="12"
            width="7"
            height="9"
            rx="2"
            stroke={isDashboard ? THEME.colors.good : THEME.colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Rect
            x="3"
            y="16"
            width="7"
            height="5"
            rx="2"
            stroke={isDashboard ? THEME.colors.good : THEME.colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
        <Text style={[styles.tabLabel, isDashboard ? styles.tabLabelActive : styles.tabLabelInactive]}>
          Dashboard
        </Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onChangeTab('settings')}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="12"
            r="3"
            stroke={isSettings ? THEME.colors.good : THEME.colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Path
            d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"
            stroke={isSettings ? THEME.colors.good : THEME.colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
        <Text style={[styles.tabLabel, isSettings ? styles.tabLabelActive : styles.tabLabelInactive]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 84 : 70,
    backgroundColor: THEME.colors.bgNav,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: THEME.colors.good,
  },
  tabLabelInactive: {
    color: THEME.colors.textMuted,
  },
});
