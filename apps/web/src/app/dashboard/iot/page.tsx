'use client';

// ============================================================================
// IoT Cold Chain Monitor — Real MQTT over WebSocket (HiveMQ public broker)
// Sensors: vaccine cold-chain (WHO 2–8°C), food cold/hot-holding, ambient
// PHI-PRO publishes and subscribes to phi-pro/sensors/{id}/temp
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { Thermometer, Droplets, AlertTriangle, CheckCircle2, Wifi, WifiOff, Radio, Loader2 } from 'lucide-react';
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

type ConnStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'fallback';

const BROKER_URL = 'wss://broker.hivemq.com/mqtt';
const TOPIC_PREFIX = 'phi-pro/sensors';

const INITIAL_SENSORS: Omit<Sensor, 'readings' | 'alertActive'>[] = [
  { id: 'MOH-VC-01', name: 'Vaccine Cold Room',    location: 'MOH Office — Colombo 3',         type: 'vaccine_cold_chain',  minTemp: 2,  maxTemp: 8  },
  { id: 'REST-CF-07', name: 'Walk-in Fridge',       location: "Lal's Restaurant — Pettah",       type: 'food_cold_storage',   minTemp: 1,  maxTemp: 5  },
  { id: 'REST-HH-07', name: 'Hot Holding Unit',     location: "Lal's Restaurant — Pettah",       type: 'food_hot_holding',    minTemp: 60, maxTemp: 75 },
  { id: 'HOT-CF-03', name: 'Refrigerator Unit 3',  location: 'Galadari Hotel — Kitchen',         type: 'food_cold_storage',   minTemp: 1,  maxTemp: 5  },
  { id: 'MOH-VC-02', name: 'Vaccine Fridge',        location: 'PHI Office — Gampaha',             type: 'vaccine_cold_chain',  minTemp: 2,  maxTemp: 8  },
  { id: 'SCHOOL-AMB', name: 'Canteen Ambient',      location: 'Richmond College — Galle',         type: 'ambient',             minTemp: 18, maxTemp: 32 },
];

function makeSeedReadings(s: typeof INITIAL_SENSORS[0]): SensorReading[] {
  return Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 60_000).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
    temp: parseFloat(((s.minTemp + s.maxTemp) / 2 + (Math.random() - 0.5) * 2).toFixed(1)),
    humidity: parseFloat((55 + (Math.random() - 0.5) * 15).toFixed(1)),
    battery: parseFloat((85 + Math.random() * 15).toFixed(0)),
  }));
}

function initSensors(): Sensor[] {
  return INITIAL_SENSORS.map(s => ({ ...s, readings: makeSeedReadings(s), alertActive: false }));
}

function simulateReading(sensor: Sensor): SensorReading {
  const base = (sensor.minTemp + sensor.maxTemp) / 2;
  const drift = sensor.alertActive ? (Math.random() > 0.4 ? 5 : -3) : 0;
  return {
    timestamp: new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temp: parseFloat((base + (Math.random() - 0.5) * 3 + drift).toFixed(1)),
    humidity: parseFloat((55 + (Math.random() - 0.5) * 20).toFixed(1)),
    battery: parseFloat((85 + Math.random() * 15).toFixed(0)),
  };
}

function TempBadge({ temp, min, max }: { temp: number; min: number; max: number }) {
  const ok = temp >= min && temp <= max;
  const critical = temp < min - 3 || temp > max + 5;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold',
      critical ? 'bg-red-600 text-white'
      : ok     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
               : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    )}>
      <Thermometer className="h-3.5 w-3.5" />
      {temp}°C
      {!ok && <AlertTriangle className="h-3 w-3" />}
    </span>
  );
}

const STATUS_CFG: Record<ConnStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  idle:       { label: 'Not connected',  icon: <WifiOff className="h-3.5 w-3.5" />,             cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800' },
  connecting: { label: 'Connecting…',    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  connected:  { label: 'MQTT Live',      icon: <Wifi className="h-3.5 w-3.5" />,                 cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  error:      { label: 'Broker error',   icon: <WifiOff className="h-3.5 w-3.5" />,              cls: 'bg-red-100 text-red-700 dark:bg-red-900/30' },
  fallback:   { label: 'Simulated',      icon: <Radio className="h-3.5 w-3.5" />,                cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

export default function IoTPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selected, setSelected] = useState('MOH-VC-01');
  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [msgCount, setMsgCount] = useState(0);
  const [msgLog, setMsgLog] = useState<string[]>([]);
  const clientRef = useRef<ReturnType<typeof import('mqtt')['connect']> | null>(null);

  const applyReading = (sensorId: string, reading: SensorReading) => {
    setSensors(prev => prev.map(s => {
      if (s.id !== sensorId) return s;
      const outOfRange = reading.temp < s.minTemp || reading.temp > s.maxTemp;
      return {
        ...s,
        readings: [...s.readings.slice(-59), reading],
        alertActive: outOfRange,
        lastAlert: outOfRange ? reading.timestamp : s.lastAlert,
      };
    }));
  };

  useEffect(() => {
    const initial = initSensors();
    setSensors(initial);

    let pubTimer: ReturnType<typeof setInterval>;
    let simTimer: ReturnType<typeof setInterval>;
    let cancelled = false;

    const startFallback = () => {
      if (cancelled) return;
      setConnStatus('fallback');
      simTimer = setInterval(() => {
        setSensors(prev => prev.map(s => {
          const r = simulateReading(s);
          const outOfRange = r.temp < s.minTemp || r.temp > s.maxTemp;
          return { ...s, readings: [...s.readings.slice(-59), r], alertActive: outOfRange, lastAlert: outOfRange ? r.timestamp : s.lastAlert };
        }));
        setMsgCount(c => c + 1);
      }, 4000);
    };

    const connectMQTT = async () => {
      if (cancelled) return;
      setConnStatus('connecting');
      try {
        const mqtt = (await import('mqtt')).default ?? (await import('mqtt'));
        const clientId = `phi-pro-${Math.random().toString(16).slice(2, 10)}`;
        const client = mqtt.connect(BROKER_URL, {
          clientId,
          clean: true,
          connectTimeout: 8000,
          reconnectPeriod: 0,
        });
        clientRef.current = client as ReturnType<typeof import('mqtt')['connect']>;

        client.on('connect', () => {
          if (cancelled) { client.end(); return; }
          setConnStatus('connected');
          client.subscribe(`${TOPIC_PREFIX}/+/temp`);

          pubTimer = setInterval(() => {
            if (!client.connected) return;
            INITIAL_SENSORS.forEach(s => {
              const base = (s.minTemp + s.maxTemp) / 2;
              const payload = JSON.stringify({
                temp:     parseFloat((base + (Math.random() - 0.5) * 4).toFixed(1)),
                humidity: parseFloat((55 + (Math.random() - 0.5) * 20).toFixed(1)),
                battery:  parseFloat((85 + Math.random() * 15).toFixed(0)),
              });
              client.publish(`${TOPIC_PREFIX}/${s.id}/temp`, payload, { qos: 0 });
            });
          }, 4000);
        });

        client.on('message', (topic: string, payload: Buffer) => {
          const parts = topic.split('/');
          const sensorId = parts[2];
          try {
            const data = JSON.parse(payload.toString()) as { temp: number; humidity: number; battery: number };
            const reading: SensorReading = {
              timestamp: new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              temp: data.temp, humidity: data.humidity, battery: data.battery,
            };
            applyReading(sensorId, reading);
            setMsgCount(c => c + 1);
            setMsgLog(log => [`[${reading.timestamp}] ${sensorId}: ${data.temp}°C`, ...log.slice(0, 9)]);
          } catch { /* malformed */ }
        });

        client.on('error', () => {
          if (cancelled) return;
          client.end(true);
          startFallback();
        });

        client.on('close', () => {
          if (!cancelled && connStatus !== 'connected') startFallback();
        });

        setTimeout(() => {
          if (!cancelled && connStatus === 'connecting') {
            client.end(true);
            startFallback();
          }
        }, 10_000);

      } catch {
        startFallback();
      }
    };

    connectMQTT();

    return () => {
      cancelled = true;
      clearInterval(pubTimer);
      clearInterval(simTimer);
      clientRef.current?.end(true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSensor = sensors.find(s => s.id === selected);
  const alertCount    = sensors.filter(s => s.alertActive).length;
  const latest        = selectedSensor?.readings.at(-1);
  const statusCfg     = STATUS_CFG[connStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow">
            <Thermometer className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">IoT Cold Chain Monitor</h1>
            <p className="text-xs text-slate-500">MQTT over WebSocket · WHO 2–8°C cold chain · HACCP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
              <AlertTriangle className="h-3.5 w-3.5" />{alertCount} Alert{alertCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', statusCfg.cls)}>
            {statusCfg.icon}{statusCfg.label}
            {msgCount > 0 && <span className="ml-1 opacity-70">· {msgCount} msgs</span>}
          </span>
        </div>
      </div>

      {/* Broker info */}
      <div className="flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs text-cyan-800 dark:border-cyan-800/40 dark:bg-cyan-950/20 dark:text-cyan-300">
        <Radio className="h-3.5 w-3.5 shrink-0" />
        <span>MQTT broker: <strong>{BROKER_URL}</strong> · Topic: <code className="font-mono">{TOPIC_PREFIX}/&lt;sensorId&gt;/temp</code></span>
        {connStatus === 'fallback' && <span className="ml-auto shrink-0 font-semibold text-amber-600">Broker unreachable — using local simulation</span>}
      </div>

      {/* Sensor grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sensors.map(sensor => {
          const last = sensor.readings.at(-1);
          const isSelected = sensor.id === selected;
          return (
            <button
              key={sensor.id}
              onClick={() => setSelected(sensor.id)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all shadow-sm',
                isSelected      ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                : sensor.alertActive ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                                 : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{sensor.name}</p>
                  <p className="text-[11px] text-slate-400">{sensor.location}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-400">{sensor.id}</p>
                </div>
                {sensor.alertActive
                  ? <AlertTriangle className="h-5 w-5 text-red-500" />
                  : <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </div>
              <div className="mt-3 flex items-center justify-between">
                {last && <TempBadge temp={last.temp} min={sensor.minTemp} max={sensor.maxTemp} />}
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Droplets className="h-3 w-3" />{last?.humidity}%
                </span>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                Range: {sensor.minTemp}°C – {sensor.maxTemp}°C
                {sensor.alertActive && sensor.lastAlert && ` · Alert ${sensor.lastAlert}`}
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
              <ReferenceLine y={selectedSensor.minTemp} stroke="#0066cc" strokeDasharray="4 4"
                label={{ value: `Min ${selectedSensor.minTemp}°C`, fontSize: 10, fill: '#0066cc' }} />
              <ReferenceLine y={selectedSensor.maxTemp} stroke="#cc0000" strokeDasharray="4 4"
                label={{ value: `Max ${selectedSensor.maxTemp}°C`, fontSize: 10, fill: '#cc0000' }} />
              <Line type="monotone" dataKey="temp" stroke={selectedSensor.alertActive ? '#cc0000' : '#0066cc'}
                dot={false} strokeWidth={2} name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Active alerts */}
      {sensors.some(s => s.alertActive) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
          <h3 className="mb-2 text-sm font-bold text-amber-900 dark:text-amber-300">Active Alerts</h3>
          <div className="space-y-2">
            {sensors.filter(s => s.alertActive).map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</span>
                  <span className="text-[11px] text-slate-500">{s.location}</span>
                </div>
                <span className="font-mono text-xs text-amber-700 dark:text-amber-400">
                  {s.readings.at(-1)?.temp}°C (range {s.minTemp}–{s.maxTemp}°C)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MQTT message log */}
      {msgLog.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">MQTT Message Log</h3>
          <div className="space-y-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            {msgLog.map((m, i) => <p key={i}>{m}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}
