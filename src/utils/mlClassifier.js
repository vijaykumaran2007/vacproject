/**
 * ML Sensor Fusion Classifier
 * Classifies ambient environment into: "Clean Air" | "Smoke" | "Gas Leak"
 * based on multi-sensor telemetry (Air Quality PPM, Temperature, Humidity).
 */

export function classifyAirCondition(data = {}) {
  const { air = 0, temp = 25, humidity = 50, status = 'Good' } = data;

  // 1. If ESP32 firmware already sent an ML prediction label, honor it
  if (data.prediction || data.ml_prediction || data.mlLabel) {
    const raw = (data.prediction || data.ml_prediction || data.mlLabel).toString().toLowerCase();
    if (raw.includes('gas') || raw.includes('leak')) {
      return buildResult('Gas Leak', 0.94, 'High gas concentration without flame heat signature.', '#EF4444', 'flame');
    }
    if (raw.includes('smoke') || raw.includes('fire')) {
      return buildResult('Smoke', 0.92, 'Particulate combustion detected with heat signature.', '#F97316', 'bonfire');
    }
    if (raw.includes('clean') || raw.includes('fresh')) {
      return buildResult('Clean Air', 0.98, 'Sensory baseline within safe atmospheric range.', '#10B981', 'leaf');
    }
  }

  // 2. Intelligent Sensor Fusion Heuristic / Decision Forest model
  // Gas sensors (MQ-2/135) detect both combustible gas and smoke particles.
  // Temperature and Humidity distinguish combustion (smoke) vs cold gas release (gas leak).

  const airValue = Number(air);
  const tempValue = Number(temp);
  const humValue = Number(humidity);

  // Baseline thresholds
  const isAirHigh = airValue >= 350;
  const isAirModerate = airValue >= 180 && airValue < 350;
  const isTempElevated = tempValue >= 33; // Smoke usually radiates heat
  const isTempCoolOrNormal = tempValue < 33; // Gas leak is ambient or cold

  if (airValue < 180 && (status === 'Good' || status === 'Clean')) {
    const confidence = Math.min(0.99, Math.max(0.85, 1 - (airValue / 400)));
    return buildResult(
      'Clean Air',
      confidence,
      'Sensor readings indicate clean, well-ventilated atmospheric air.',
      '#10B981',
      'leaf'
    );
  }

  // Elevated Air readings -> either Smoke or Gas Leak
  if (isAirHigh) {
    if (isTempElevated) {
      // High air + high temp -> Combustion / Smoke signature
      const confidence = Math.min(0.98, 0.82 + (airValue / 2000) + (tempValue > 35 ? 0.08 : 0.03));
      return buildResult(
        'Smoke',
        confidence,
        'High particulate/CO signature accompanied by elevated temperature.',
        '#EF4444',
        'bonfire'
      );
    } else {
      // High air + normal/cool temp -> Unignited Gas Leak signature (LPG/Methane/CO)
      const confidence = Math.min(0.97, 0.84 + (airValue / 2200));
      return buildResult(
        'Gas Leak',
        confidence,
        'Combustible gas concentration detected without thermal flame signature.',
        '#EF4444',
        'alert-triangle'
      );
    }
  }

  // Moderate threshold
  if (isAirModerate) {
    if (isTempElevated) {
      return buildResult(
        'Smoke',
        0.78,
        'Trace combustion aerosols and thermal disturbance detected.',
        '#F59E0B',
        'bonfire'
      );
    } else {
      // Could be trace gas or cooking vapor
      return buildResult(
        'Gas Leak',
        0.72,
        'Moderate volatile gas detected. Monitor for increasing concentration.',
        '#F59E0B',
        'alert-triangle'
      );
    }
  }

  return buildResult(
    'Clean Air',
    0.91,
    'Baseline atmospheric gas composition within normal bounds.',
    '#10B981',
    'leaf'
  );
}

function buildResult(label, confidence, reason, color, icon) {
  return {
    label, // "Gas Leak" | "Smoke" | "Clean Air"
    confidence: Math.round(confidence * 100),
    confidenceDecimal: confidence,
    reason,
    color,
    icon,
  };
}
