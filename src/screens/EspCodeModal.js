import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const ESP32_SKETCH_CODE = `/*
  ======================================================
  AeroSense ESP32 Air Quality HTTP Server
  Sensors: MQ-135 / MQ-2 (Gas/Smoke) + DHT11/DHT22 (Temp & Hum)
  Outputs JSON: { "air": 420, "temp": 32, "humidity": 65, "status": "Moderate" }
  ======================================================
*/

#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

// --- Wi-Fi Credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- Hardware Pins ---
#define MQ_PIN 34          // Analog pin for MQ-2 or MQ-135
#define DHT_PIN 4          // Digital pin for DHT11 / DHT22
#define DHT_TYPE DHT11     // or DHT22

DHT dht(DHT_PIN, DHT_TYPE);
WebServer server(80);

void handleData() {
  // Read sensor values
  int airVal = analogRead(MQ_PIN);
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Fallbacks if sensor read fails
  if (isnan(temp)) temp = 30.0;
  if (isnan(hum)) hum = 60.0;

  // Determine status
  String status = "Good";
  if (airVal > 300) {
    status = "Poor";
  } else if (airVal > 150) {
    status = "Moderate";
  }

  // Construct JSON response
  String json = "{";
  json += "\\"air\\":" + String(airVal) + ",";
  json += "\\"temp\\":" + String(temp, 1) + ",";
  json += "\\"humidity\\":" + String((int)hum) + ",";
  json += "\\"status\\":\\"" + status + "\\"";
  json += "}";

  // Enable CORS so mobile app can fetch without origin restrictions
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(MQ_PIN, INPUT);

  Serial.println("\\nConnecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\nWiFi Connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Register routes
  server.on("/", handleData);
  server.on("/data", handleData);

  server.begin();
  Serial.println("HTTP Web Server Started!");
}

void loop() {
  server.handleClient();
}
`;

export default function EspCodeModal({ visible, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleShareOrCopy = async () => {
    try {
      await Share.share({
        title: 'ESP32 Air Quality Sketch',
        message: ESP32_SKETCH_CODE,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      Alert.alert('Notice', 'You can select and copy the code below directly.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="hardware-chip" size={22} color={THEME.colors.cyan} />
              <View>
                <Text style={styles.title}>ESP32 Arduino Sketch</Text>
                <Text style={styles.subtitle}>Copy & flash into Arduino IDE</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Quick Hardware Pinout Guide */}
          <View style={styles.pinoutCard}>
            <Text style={styles.pinoutTitle}>WIRING & PINOUT GUIDE</Text>
            <View style={styles.pinRow}>
              <Text style={styles.pinLabel}>• MQ-2 / MQ-135 Gas Sensor:</Text>
              <Text style={styles.pinVal}>AOUT ➔ GPIO 34 (Analog)</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinLabel}>• DHT11 / DHT22 Sensor:</Text>
              <Text style={styles.pinVal}>DATA ➔ GPIO 4</Text>
            </View>
            <View style={styles.pinRow}>
              <Text style={styles.pinLabel}>• Power:</Text>
              <Text style={styles.pinVal}>VCC ➔ 3.3V / 5V | GND ➔ GND</Text>
            </View>
          </View>

          {/* Code Viewer */}
          <ScrollView style={styles.codeScroll} showsVerticalScrollIndicator>
            <Text style={styles.codeText} selectable>
              {ESP32_SKETCH_CODE}
            </Text>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleShareOrCopy}>
              <Ionicons name={copied ? 'checkmark' : 'share-outline'} size={18} color="#0A0E17" />
              <Text style={styles.copyBtnText}>
                {copied ? 'Sketch Shared / Copied!' : 'Share / Copy Arduino Sketch'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.bgDark,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    maxHeight: '92%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
  },
  pinoutCard: {
    backgroundColor: '#0F1623',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
  },
  pinoutTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: THEME.colors.cyan,
    marginBottom: 6,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  pinLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  pinVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  codeScroll: {
    backgroundColor: '#06090F',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    maxHeight: 340,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#38BDF8',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.cyan,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A0E17',
  },
});
