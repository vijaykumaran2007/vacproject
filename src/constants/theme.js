export const THEME = {
  colors: {
    // Canvas & backgrounds
    bgDark: '#0B0F14',
    bgNav: '#0F151C',
    cardBg: '#131A22',
    cardBorder: '#1F2A36',
    gaugeTrack: '#223040',

    // Text hierarchy
    textPrimary: '#E8EEF4',
    textMuted: '#9AA8B6',
    textSub: '#C3CEDA',

    // Good (Green)
    good: '#34D399',
    goodText: '#6EE7B7',
    goodBg: '#10281F',
    goodBorder: '#1C4A38',
    goodIconBg: '#163B2D',

    // Moderate (Yellow/Amber)
    moderate: '#FBBF24',
    moderateBg: '#131A22',
    moderateBorder: '#1F2A36',
    moderateBadgeBg: '#2B2410',
    moderateBadgeBorder: '#5C4A12',

    // Poor (Red/Crimson)
    poor: '#F87171',
    poorText: '#FCA5A5',
    poorBg: '#2A1416',
    poorBorder: '#6B2327',
    poorGaugeTrack: '#3A2326',
    poorBadgeBg: '#3A1518',
    poorBadgeBorder: '#8A2F34',
    poorIconBg: '#451A1D',
    poorMuted: '#C3A5A8',

    // Metrics
    tempColor: '#FDBA74',
    humidityColor: '#7DD3FC',

    // Connectivity
    connectedDot: '#34D399',
    disconnectedDot: '#F87171',
    simulatedDot: '#A78BFA',
  },
  thresholds: {
    goodMax: 150,
    moderateMax: 300,
    poorMin: 301,
  },
  defaultEsp32: {
    ip: '192.168.1.42',
    port: '80',
    path: '/',
    pollingInterval: 3000,
  },
};

export const getStatusConfig = (statusOrAir) => {
  let status = 'Good';
  if (typeof statusOrAir === 'string') {
    status = statusOrAir;
  } else if (typeof statusOrAir === 'number') {
    if (statusOrAir <= THEME.thresholds.goodMax) status = 'Good';
    else if (statusOrAir <= THEME.thresholds.moderateMax) status = 'Moderate';
    else status = 'Poor';
  }

  const s = (status || '').toLowerCase();
  if (s.includes('good') || s.includes('clean')) {
    return {
      label: 'Good',
      color: THEME.colors.good,
      textColor: THEME.colors.goodText,
      cardBg: THEME.colors.cardBg,
      cardBorder: THEME.colors.cardBorder,
      gaugeTrack: THEME.colors.gaugeTrack,
      badgeBg: '#10281F',
      badgeBorder: '#1C4A38',
      iconBg: THEME.colors.goodIconBg,
    };
  }
  if (s.includes('mod') || s.includes('fair')) {
    return {
      label: 'Moderate',
      color: THEME.colors.moderate,
      textColor: THEME.colors.moderate,
      cardBg: THEME.colors.cardBg,
      cardBorder: THEME.colors.cardBorder,
      gaugeTrack: THEME.colors.gaugeTrack,
      badgeBg: THEME.colors.moderateBadgeBg,
      badgeBorder: THEME.colors.moderateBadgeBorder,
      iconBg: '#2B2410',
    };
  }
  return {
    label: 'Poor',
    color: THEME.colors.poor,
    textColor: THEME.colors.poorText,
    cardBg: THEME.colors.poorBg,
    cardBorder: THEME.colors.poorBorder,
    gaugeTrack: THEME.colors.poorGaugeTrack,
    badgeBg: THEME.colors.poorBadgeBg,
    badgeBorder: THEME.colors.poorBadgeBorder,
    iconBg: THEME.colors.poorIconBg,
  };
};
