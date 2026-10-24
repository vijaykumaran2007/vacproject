/**
 * ESP32 Wi-Fi HTTP Client & Simulator
 * Handles polling, HTTP GET with timeout, connection status, and simulated telemetry
 */

let simulationStep = 0;

export async function fetchEsp32Data({ ip, port = '80', path = '/data', timeoutMs = 2600 }) {
  // Format clean URL
  let cleanIp = ip.trim();
  if (!cleanIp.startsWith('http://') && !cleanIp.startsWith('https://')) {
    cleanIp = `http://${cleanIp}`;
  }

  // Remove trailing slashes
  cleanIp = cleanIp.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = port && port !== '80' ? `${cleanIp}:${port}${cleanPath}` : `${cleanIp}${cleanPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return {
      success: true,
      latency,
      data: sanitizeEspData(json),
      url: fullUrl,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error.name === 'AbortError' ? 'Connection timed out (2.6s)' : error.message,
      url: fullUrl,
    };
  }
}

/**
 * Ensures data complies with { air, temp, humidity, status }
 */
export function sanitizeEspData(raw = {}) {
  const air = Math.round(Number(raw.air ?? raw.aqi ?? raw.mq ?? 0));
  const temp = Number(Number(raw.temp ?? raw.temperature ?? 25).toFixed(1));
  const humidity = Math.round(Number(raw.humidity ?? raw.hum ?? 50));

  let status = raw.status || raw.condition;
  if (!status) {
    if (air <= 150) status = 'Good';
    else if (air <= 300) status = 'Moderate';
    else status = 'Poor';
  }

  // Capitalize properly
  status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return {
    air,
    temp,
    humidity,
    status,
    prediction: raw.prediction || raw.ml_prediction || null,
    timestamp: Date.now(),
  };
}

/**
 * Realistic Simulator Cycle:
 * Cycles smoothly through:
 * 1. Clean Air Baseline (AQI 75 - 110, Temp 24°C, Hum 48%) -> Safe, Tip: "Air is safe to breathe"
 * 2. Respiratory & Airborne Disease Risk (AQI 380 - 410, Temp 32°C, Hum 80%) -> Tip: "Wear a mask"
 * 3. Gas Leak Hazard (AQI 540 - 580, Temp 26°C, Hum 45%) -> Red Flashing Banner: "⚠️ WARNING: Gas Leak Detected - Ventilate Immediately!"
 * 4. Smoke / Fire Hazard (AQI 480 - 520, Temp 37°C, Hum 65%) -> Red Flashing Banner: "🔥 WARNING: Smoke Detected - Possible Fire!"
 */
export function generateSimulatedData() {
  simulationStep = (simulationStep + 1) % 24;

  let air, temp, humidity, status, prediction;

  if (simulationStep < 6) {
    // Stage 1: Clean Fresh Air
    air = 85 + Math.floor(Math.sin(simulationStep) * 20);
    temp = 24.2 + (simulationStep * 0.1);
    humidity = 48 + Math.floor(Math.cos(simulationStep) * 4);
    status = 'Good';
    prediction = 'Clean Air';
  } else if (simulationStep < 12) {
    // Stage 2: High Respiratory & Airborne Disease Risk (Hum > 75%, Temp > 30°C, Air > 350)
    air = 370 + ((simulationStep - 6) * 8);
    temp = 31.8 + ((simulationStep - 6) * 0.2);
    humidity = 78 + ((simulationStep - 6) * 1);
    status = 'Poor';
    prediction = 'Clean Air';
  } else if (simulationStep < 18) {
    // Stage 3: Gas Leak Incident (Air > 500, Humidity < 60%)
    air = 530 + ((simulationStep - 12) * 12);
    temp = 26.0 - ((simulationStep - 12) * 0.2);
    humidity = 45 - ((simulationStep - 12) * 1);
    status = 'Poor';
    prediction = 'Gas Leak';
  } else {
    // Stage 4: Smoke / Fire Incident (Air > 450, Temp > 35°C, Hum >= 60%)
    air = 475 + ((simulationStep - 18) * 8);
    temp = 36.5 + ((simulationStep - 18) * 0.3);
    humidity = 64 + Math.floor(Math.sin(simulationStep) * 3);
    status = 'Poor';
    prediction = 'Smoke';
  }

  return {
    air: Math.max(20, Math.round(air)),
    temp: Number(temp.toFixed(1)),
    humidity: Math.round(humidity),
    status,
    prediction,
    timestamp: Date.now(),
  };
}
