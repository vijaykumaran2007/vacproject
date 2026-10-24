/**
 * Risk Calculation Engine
 * Implements real-time environmental risk prediction logic from telemetry data.
 *
 * Rules:
 * 1. Gas Leak Risk: air_value > 500 AND humidity < 60 -> "Detected" (Red) / "Not Detected" (Green)
 * 2. Smoke / Fire Risk: air_value > 450 AND temp > 35 -> "High" (Orange) / "Low" (Green)
 * 3. Respiratory Health Risk: air_value > 350 AND humidity > 70 (High) -> "High / Moderate / Low" (air quality + humidity)
 * 4. Airborne Disease Risk: humidity > 75 AND temp > 30 AND air_value > 300 (High) -> "High / Moderate / Low" (humidity + temp + air quality)
 */

export function calculateRiskPredictions(telemetry = {}) {
  const air = Number(telemetry.air ?? 0);
  const temp = Number(telemetry.temp ?? 25);
  const humidity = Number(telemetry.humidity ?? 50);

  // 1. Gas Leak: air_value > 500 AND humidity < 60
  const isGasLeak = air > 500 && humidity < 60;
  const gasLeak = {
    id: 'gas_leak',
    title: 'Gas Leak Risk',
    value: isGasLeak ? 'Detected' : 'Not Detected',
    isDetected: isGasLeak,
    status: isGasLeak ? 'danger' : 'safe',
    // Exact requested colors: red when detected, green when not detected
    color: isGasLeak ? '#EF4444' : '#10B981',
    bgColor: isGasLeak ? '#2A1416' : '#10281F',
    borderColor: isGasLeak ? '#6B2327' : '#1C4A38',
    badgeBg: isGasLeak ? '#3A1518' : '#163B2D',
    icon: isGasLeak ? 'warning' : 'shield-checkmark',
    ruleText: 'Air > 500 & Hum < 60%',
    metricSummary: `Air: ${air} · Hum: ${humidity}%`,
  };

  // 2. Smoke / Fire Risk: air_value > 450 AND temp > 35
  const isSmoke = air > 450 && temp > 35;
  const smoke = {
    id: 'smoke_fire',
    title: 'Smoke / Fire Risk',
    value: isSmoke ? 'High' : 'Low',
    isHigh: isSmoke,
    status: isSmoke ? 'high' : 'low',
    // Exact requested colors: orange when high, green when low
    color: isSmoke ? '#F97316' : '#10B981',
    bgColor: isSmoke ? '#2B1A12' : '#10281F',
    borderColor: isSmoke ? '#7C2D12' : '#1C4A38',
    badgeBg: isSmoke ? '#431E12' : '#163B2D',
    icon: isSmoke ? 'flame' : 'shield-checkmark',
    ruleText: 'Air > 450 & Temp > 35°C',
    metricSummary: `Air: ${air} · Temp: ${temp}°C`,
  };

  // 3. Respiratory Health Risk: air_value > 350 AND humidity > 70
  let respLevel = 'Low';
  let respColor = '#10B981'; // Green
  let respBg = '#10281F';
  let respBorder = '#1C4A38';
  let respBadgeBg = '#163B2D';

  if (air > 350 && humidity > 70) {
    respLevel = 'High';
    respColor = '#EF4444'; // Red
    respBg = '#2A1416';
    respBorder = '#6B2327';
    respBadgeBg = '#3A1518';
  } else if ((air > 250 && humidity > 55) || air > 300 || (air > 180 && humidity > 70)) {
    respLevel = 'Moderate';
    respColor = '#FBBF24'; // Amber / Yellow
    respBg = '#251E14';
    respBorder = '#5C4A12';
    respBadgeBg = '#3B2E15';
  }

  const respiratory = {
    id: 'respiratory',
    title: 'Respiratory Health Risk',
    value: respLevel,
    level: respLevel.toLowerCase(),
    color: respColor,
    bgColor: respBg,
    borderColor: respBorder,
    badgeBg: respBadgeBg,
    icon: 'pulse',
    ruleText: 'Air > 350 & Hum > 70%',
    metricSummary: `Air: ${air} · Hum: ${humidity}%`,
  };

  // 4. Airborne Disease Risk: humidity > 75 AND temp > 30 AND air_value > 300
  let airLevel = 'Low';
  let airColor = '#10B981'; // Green
  let airBg = '#10281F';
  let airBorder = '#1C4A38';
  let airBadgeBg = '#163B2D';

  if (humidity > 75 && temp > 30 && air > 300) {
    airLevel = 'High';
    airColor = '#EF4444'; // Red
    airBg = '#2A1416';
    airBorder = '#6B2327';
    airBadgeBg = '#3A1518';
  } else if (
    (humidity > 65 && temp > 28 && air > 200) ||
    (humidity > 70 && temp > 28) ||
    (air > 250 && humidity > 65)
  ) {
    airLevel = 'Moderate';
    airColor = '#FBBF24'; // Amber / Yellow
    airBg = '#251E14';
    airBorder = '#5C4A12';
    airBadgeBg = '#3B2E15';
  }

  const airborne = {
    id: 'airborne',
    title: 'Airborne Disease Risk',
    value: airLevel,
    level: airLevel.toLowerCase(),
    color: airColor,
    bgColor: airBg,
    borderColor: airBorder,
    badgeBg: airBadgeBg,
    icon: 'water',
    ruleText: 'Hum > 75% & Temp > 30°C & Air > 300',
    metricSummary: `Hum: ${humidity}% · Temp: ${temp}°C`,
  };

  return {
    gasLeak,
    smoke,
    respiratory,
    airborne,
    hasGasLeak: isGasLeak,
    hasSmoke: isSmoke,
    hasHazard: isGasLeak || isSmoke,
  };
}

/**
 * Health Tip calculation
 * Provides simple, clear health recommendations based on current risk states.
 */
export function getHealthTip(risks, telemetry = {}) {
  const { gasLeak, smoke, respiratory, airborne } = risks;

  // 1. Gas Leak emergency tip
  if (gasLeak.isDetected) {
    return {
      tip: 'Open windows immediately',
      details: 'Shut off gas supply valves. Avoid electrical switches or ignition sources.',
      status: 'urgent',
      icon: 'warning',
      color: '#EF4444',
      badge: 'Immediate Action Required',
    };
  }

  // 2. Smoke / Fire hazard tip
  if (smoke.isHigh) {
    return {
      tip: 'Smoke detected - Ventilate immediately',
      details: 'Check for potential fire source. Stay low below smoke and prepare to evacuate.',
      status: 'hazard',
      icon: 'flame',
      color: '#F97316',
      badge: 'Possible Fire Hazard',
    };
  }

  // 3. Airborne Disease Risk High
  if (airborne.value === 'High') {
    return {
      tip: 'Wear a mask indoors',
      details: 'High temperature, humidity, and particulates favor pathogen transmission. Enhance air filtration.',
      status: 'warning',
      icon: 'shield-half',
      color: '#EF4444',
      badge: 'Pathogen Advisory',
    };
  }

  // 4. Respiratory Risk High
  if (respiratory.value === 'High') {
    return {
      tip: 'Wear a mask & stay indoors',
      details: 'Elevated air particulates combined with high moisture stress airways. Turn on air purifier.',
      status: 'warning',
      icon: 'fitness',
      color: '#EF4444',
      badge: 'Respiratory Advisory',
    };
  }

  // 5. Moderate Respiratory or Airborne Risk
  if (respiratory.value === 'Moderate' || airborne.value === 'Moderate') {
    return {
      tip: 'Wear a mask if sensitive',
      details: 'Moderate atmospheric stress. Sensitive individuals should consider wearing a mask.',
      status: 'moderate',
      icon: 'leaf',
      color: '#FBBF24',
      badge: 'Moderate Advisory',
    };
  }

  // 6. Safe baseline
  return {
    tip: 'Air is safe to breathe',
    details: 'All environmental parameters are within safe ranges. Enjoy fresh indoor air.',
    status: 'safe',
    icon: 'checkmark-circle',
    color: '#10B981',
    badge: 'Environment Safe',
  };
}
