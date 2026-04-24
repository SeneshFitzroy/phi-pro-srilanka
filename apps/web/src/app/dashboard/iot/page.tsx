'use client';

// ============================================================================
// IoT Cold Chain Monitor — Temperature & Humidity Telemetry Dashboard
// Simulates MQTT sensor data from vaccine cold-storage & food premises
// Alert thresholds: WHO cold chain (2–8°C vaccines), food safety (<5°C cold, >60°C hot)
// ============================================================================

import { useState, useEffect } from 'react';
import { Thermometer, Droplets, AlertTriangle, CheckCircle2, Wifi } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';

interface SensorReading {
  timestamp: string;
  temp: number;
  humidity: number;
  battery: number;
}

interface Sensor {
  id: string;
  name: string;
  location: string;
  type: 'vaccine_cold_chain' | 'food_cold_storage' | 'food_hot_holding' | 'ambient';
  minTemp: number;
  maxTemp: number;
  readings: SensorReading[];
  alertActive: boolean;
  lastAlert?: string;
}

function generateReading(sensor: Sensor): SensorReading {
  const baseTemp = (sensor.minTemp + sensor.maxTemp) / 2;
  const noise = (Math.random() - 0.5) * 3;
  const drift = sensor.alertActive ? (Math.random() > 0.3 ? 4 : -2) : 0;
  const temp = parseFloat((baseTemp + noise + drift).toFixed(1));
  const humidity = parseFloat((55 + (Math.random() - 0.5) * 20).toFixed(1));
  return {
    timestamp: new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temp,
    humidity,
    battery: parseFloat((85 + Math.random() * 15).toFixed(0)),
  };
}

const INITIAL_SENSORS: Omit<Sensor, 'readings' | 'alertActive'>[] = [
  { id: 'MOH-VC-01', name: 'Vaccine Cold Room', location: 'MOH Office — Colombo 3', type: 'vaccine_cold_chain', minTemp: 2, maxTemp: 8, lastAlert: undefined },
  { id: 'REST-CF-07', name: 'Walk-in Fridge', location: 'Lal\'s Restaurant — Pettah', type: 'food_cold_storage', minTemp: 1, maxTemp: 5, lastAlert: undefined },
  { id: 'REST-HH-07', name: 'Hot Holding Unit', location: 'Lal\'s Restaurant — Pettah', type: 'food_hot_holding', minTemp: 60, maxTemp: 75, lastAlert: undefined },
  { id: 'HOT-CF-03', name: 'Refrigerator Unit 3', location: 'Galadari Hotel — Kitchen', type: 'food_cold_storage', minTemp: 1, maxTemp: 5, lastAlert: undefined },
  { id: 'MOH-VC-02', name: 'Vaccine Fridge', location: 'PHI Office — Gampaha', type: 'vaccine_cold_chain', minTemp: 2, maxTemp: 8, lastAlert: undefined },
  { id: 'SCHOOL-AMB', name: 'Canteen Ambient', location: 'Richmond College — Galle', type: 'ambient', minTemp: 18, maxTemp: 32, lastAlert: undefined },
];

function initSensors(): Sensor[] {
  return INITIAL_SENSORS.map((s) => {
    const readings: SensorReading[] = [];
    for (let i = 29; i >= 0; i--) {
      readings.push({
        timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
        temp: parseFloat(((s.minTemp + s.maxTemp) / 2 + (Math.random() - 0.5) * 2).toFixed(1)),
        humidity: parseFloat((55 + (Math.random() - 0.5) * 15).toFixed(1)),
        battery: parseFloat((85 + Math.random() * 15).toFixed(0)),
      });
    }
    return { ...s, readings, alertActive: false };
  });
}

function TempBadge({ temp, min, max }: { temp: number; min: number; max: number }) {
  const ok = temp >= min && temp <= max;
  const critical = temp < min - 3 || temp > max + 5;
  return (
    <div className={cn(
      'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold',
      critical ? 'bg-[#cc0000] text-white' : ok ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    )}>
      <Thermometer className="h-3.5 w-3.5" />
      {temp}°C
      {!ok && <AlertTriangle className="h-3 w-3" />}
    </div>
  );
}

export default function IoTPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selected, setSelected] = useState<string>('MOH-VC-01');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setSensors(initSensors());
  }, []);

  // Simulate live sensor telemetry every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) => prev.map((sensor) => {
        const newReading = generateReading(sensor);
        const outOfRange = newReading.temp < sensor.minTemp || newReading.temp > sensor.maxTemp;
        return {
          ...sensor,
          readings: [...sensor.readings.slice(-59), newReading],
          alertActive: outOfRange,
          lastAlert: outOfRange ? new Date().toLocaleTimeString('en-LK') : sensor.lastAlert,
        };
      }));
      setTick((t) => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectedSensor = sensors.find((s) => s.id === selected);
  const alertCount = sensors.filter((s) => s.alertActive).length;
  const latest = selectedSensor?.readings[selectedSensor.readings.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow">
              <Thermometer className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">IoT Cold Chain Monitor</h1>
              <p className="text-xs text-slate-500">Live telemetry · WHO 2–8°C cold chain · HACCP food safety</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#cc0000] px-3 py-1 text-xs font-bold text-white">
              <AlertTriangle className="h-3.5 w-3.5" />
              {alertCount} Alert{alertCount > 1 ? 's' : ''}
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Wifi className="h-3.5 w-3.5" />
            Live · {tick}
          </div>
        </div>
      </div>

      {/* Sensor grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sensors.map((sensor) => {
          const last = sensor.readings[sensor.readings.length - 1];
          const isSelected = sensor.id === selected;
          return (
            <button
              key={sensor.id}
              onClick={() => setSelected(sensor.id)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all shadow-sm',
                isSelected
                  ? 'border-[#0066cc] bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                  : sensor.alertActive
                  ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{sensor.name}</p>
                  <p className="text-[11px] text-slate-400">{sensor.location}</p>
                  <p className="mt-0.5 text-[10px] font-mono text-slate-400">{sensor.id}</p>
                </div>
                {sensor.alertActive
                  ? <AlertTriangle className="h-5 w-5 text-[#cc0000]" />
                  : <CheckCircle2 className="h-5 w-5 text-green-500" />
                }
              </div>
              <div className="mt-3 flex items-center justify-between">
                {last && <TempBadge temp={last.temp} min={sensor.minTemp} max={sensor.maxTemp} />}
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Droplets className="h-3 w-3" />
                  {last?.humidity}%
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                Range: {sensor.minTemp}°C – {sensor.maxTemp}°C
                {sensor.alertActive && sensor.lastAlert && ` · Alert at ${sensor.lastAlert}`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Detail chart */}
      {selectedSensor && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{selectedSensor.name}</h2>
              <p className="text-[11px] text-slate-400">{selectedSensor.location} · Live temperature log</p>
            </div>
            {latest && (
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{latest.temp}°C</p>
                <p className="text-[11px] text-slate-400">Updated {latest.timestamp}</p>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={selectedSensor.readings} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} interval={9} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip />
              <ReferenceLine y={selectedSensor.minTemp} stroke="#0066cc" strokeDasharray="4 4" label={{ value: `Min ${selectedSensor.minTemp}°C`, fontSize: 10, fill: '#0066cc' }} />
              <ReferenceLine y={selectedSensor.maxTemp} stroke="#cc0000" strokeDasharray="4 4" label={{ value: `Max ${selectedSensor.maxTemp}°C`, fontSize: 10, fill: '#cc0000' }} />
              <Line type="monotone" dataKey="temp" stroke={selectedSensor.alertActive ? '#cc0000' : '#0066cc'} dot={false} strokeWidth={2} name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Alert log */}
      {sensors.some((s) => s.lastAlert) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
          <h3 className="mb-2 text-sm font-bold text-amber-900 dark:text-amber-300">Active Alerts</h3>
          <div className="space-y-2">
            {sensors.filter((s) => s.alertActive).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#cc0000]" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</span>
                  <span className="text-[11px] text-slate-500">{s.location}</span>
                </div>
                <span className="text-xs font-mono text-amber-700 dark:text-amber-400">
                  {s.readings[s.readings.length - 1]?.temp}°C (range: {s.minTemp}–{s.maxTemp}°C)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400">
        Simulated MQTT telemetry · Production: connect BLE/LoRa sensors via MQTT broker → Firestore pipeline
      </p>
    </div>
  );
}
