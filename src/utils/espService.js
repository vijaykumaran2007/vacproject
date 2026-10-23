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
 * 1. Clean Air Baseline (AQI 60 - 130, Temp 26°C, Hum 52%)
 * 2. Rising concentration / Moderate (AQI 180 - 280, Temp 28°C)
 * 3. Gas Leak Hazard (AQI 420 - 580, Temp 27°C cool, Hum 60%)
 * 4. Smoke / Combustion Fire Spike (AQI 650, Temp 37°C hot, Hum 42%)
 * 5. Ventilation & Recovery
 */
export function generateSimulatedData() {
  simulationStep = (simulationStep + 1) % 24;

  let air, temp, humidity, status, prediction;

  if (simulationStep < 6) {
    // Stage 1: Clean Fresh Air
    air = 85 + Math.floor(Math.sin(simulationStep) * 25);
    temp = 26.2 + (simulationStep * 0.1);
    humidity = 55 + Math.floor(Math.cos(simulationStep) * 4);
    status = 'Good';
    prediction = 'Clean Air';
  } else if (simulationStep < 12) {
    // Stage 2: Moderate Air / Kitchen cooking fumes
    air = 220 + ((simulationStep - 6) * 18);
    temp = 28.5 + ((simulationStep - 6) * 0.3);
    humidity = 60 + ((simulationStep - 6) * 1);
    status = 'Moderate';
    prediction = 'Clean Air';
  } else if (simulationStep < 18) {
    // Stage 3: Gas Leak alert (High gas, normal/cool temperature)
    air = 420 + ((simulationStep - 12) * 25);
    temp = 27.0 - ((simulationStep - 12) * 0.2); // Gas expansion cooling
    humidity = 64;
    status = 'Poor';
    prediction = 'Gas Leak';
  } else {
    // Stage 4: Smoke / Combustion alert (High gas + high temp)
    air = 510 - ((simulationStep - 18) * 40);
    temp = 34.5 - ((simulationStep - 18) * 0.6);
    humidity = 48 + ((simulationStep - 18) * 2);
    status = air > 300 ? 'Poor' : 'Moderate';
    prediction = 'Smoke';
  }

  return {
    air: Math.max(20, air),
    temp: Number(temp.toFixed(1)),
    humidity,
    status,
    prediction,
    timestamp: Date.now(),
  };
}
