'use client';

// ============================================================================
// SIR Epidemic Simulation — Runge-Kutta 4th Order Model
// Visualizes outbreak progression for PHI district planning
// Shows: S/I/R curves, peak day, R₀, attack rate, Rt over time
// ============================================================================

import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { runSIRForDisease, DISEASE_PRESETS } from '@phi-pro/shared';
import { Activity, TrendingUp, AlertTriangle, Users, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISEASE_KEYS = Object.keys(DISEASE_PRESETS) as Array<keyof typeof DISEASE_PRESETS>;

export default function SIRModelPage() {
  const [disease, setDisease] = useState<keyof typeof DISEASE_PRESETS>('dengue');
  const [population, setPopulation] = useState(50000);
  const [initialInfected, setInitialInfected] = useState(5);
  const [days, setDays] = useState(180);
  const [showCode, setShowCode] = useState(false);

  const result = useMemo(
    () => runSIRForDisease(disease, population, initialInfected, days),
    [disease, population, initialInfected, days],
  );

  const chartData = useMemo(
    () => result.series.filter((_, i) => i % 2 === 0).map((p) => ({
      day: p.day,
      Susceptible: p.S,
      Infected: p.I,
      Recovered: p.R,
      'Daily Cases': p.newCases,
      'Rt': p.Rt,
    })),
    [result],
  );

  const preset = DISEASE_PRESETS[disease];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-600 shadow">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">SIR Epidemic Model</h1>
              <p className="text-xs text-slate-500">Runge-Kutta 4th Order · Kermack-McKendrick (1927) · PHI District Planning</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCode(!showCode)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <Zap className="h-3.5 w-3.5 text-violet-600" />
          {showCode ? 'Hide' : 'Show'} Algorithm
        </button>
      </div>

      {/* Algorithm transparency panel */}
      {showCode && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-900/10">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-900 dark:text-violet-300">
            <Info className="h-4 w-4" />
            Algorithm Transparency — SIR RK4 Integration
          </h3>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-[11px] leading-relaxed text-slate-300">
{`// Differential equations (SIR compartmental model)
dS/dt = -β × S × I / N     // Susceptibles leaving
dI/dt =  β × S × I / N - γ × I   // Infected: new minus recovered
dR/dt =  γ × I                   // Recovered (immune)

// Runge-Kutta 4th Order (more accurate than Euler method)
k1 = f(state)
k2 = f(state + 0.5·dt·k1)
k3 = f(state + 0.5·dt·k2)
k4 = f(state + dt·k3)
next_state = state + (dt/6)(k1 + 2·k2 + 2·k3 + k4)

// Disease: ${preset?.name}
β (transmission rate) = ${preset?.beta}   // contacts × P(infection) per day
γ (recovery rate)     = ${preset?.gamma}  // = 1 / infectious_period
R₀ = β/γ = ${result.R0}                   // basic reproduction number
Rt = R₀ × S/N                             // effective Rt at time t
Herd immunity threshold = 1 - 1/R₀ = ${result.herdImmunityThreshold}%`}
          </pre>
        </div>
      )}

      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Disease</label>
          <select
            value={disease}
            onChange={(e) => setDisease(e.target.value as keyof typeof DISEASE_PRESETS)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#0066cc] focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            {DISEASE_KEYS.map((k) => (
              <option key={k} value={k}>{DISEASE_PRESETS[k]?.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Population (N) — {population.toLocaleString()}
          </label>
          <input
            type="range" min={1000} max={500000} step={1000}
            value={population}
            onChange={(e) => setPopulation(Number(e.target.value))}
            className="w-full accent-[#0066cc]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Initial Infected (I₀) — {initialInfected}
          </label>
          <input
            type="range" min={1} max={500} step={1}
            value={initialInfected}
            onChange={(e) => setInitialInfected(Number(e.target.value))}
            className="w-full accent-[#cc0000]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Simulation Days — {days}
          </label>
          <input
            type="range" min={30} max={365} step={10}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: 'R₀ (Basic Repro.)', value: result.R0.toFixed(2), icon: TrendingUp, color: result.R0 > 2.5 ? 'text-red-600' : result.R0 > 1 ? 'text-amber-600' : 'text-green-600', bg: result.R0 > 2.5 ? 'bg-red-50 dark:bg-red-900/20' : result.R0 > 1 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Peak Day', value: `Day ${result.peakDay}`, icon: Activity, color: 'text-[#cc0000]', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Peak Infected', value: result.peakInfected.toLocaleString(), icon: Users, color: 'text-[#cc0000]', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Attack Rate', value: `${result.totalAttackRate}%`, icon: AlertTriangle, color: result.totalAttackRate > 50 ? 'text-red-600' : 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Herd Immunity', value: `${result.herdImmunityThreshold}%`, icon: Zap, color: 'text-[#0066cc]', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn('rounded-xl border border-slate-200 p-3 dark:border-slate-700', bg)}>
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', color)} />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <p className={cn('mt-1 text-lg font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* S/I/R chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">
          Compartment Trajectories — {preset?.name} in {population.toLocaleString()} population
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Days', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
            <YAxis tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => v.toLocaleString()} />
            <Legend />
            <ReferenceLine x={result.peakDay} stroke="#cc0000" strokeDasharray="4 4" label={{ value: `Peak D${result.peakDay}`, fontSize: 10, fill: '#cc0000' }} />
            <Line type="monotone" dataKey="Susceptible" stroke="#0066cc" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="Infected" stroke="#cc0000" dot={false} strokeWidth={2.5} />
            <Line type="monotone" dataKey="Recovered" stroke="#16a34a" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rt over time */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Effective Reproduction Number (Rt) Over Time</h2>
        <p className="mb-4 text-[11px] text-slate-400">Rt &gt; 1 = outbreak growing · Rt &lt; 1 = outbreak declining</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
            <Tooltip />
            <ReferenceLine y={1} stroke="#cc0000" strokeDasharray="4 4" label={{ value: 'Rt = 1 (threshold)', fontSize: 10, fill: '#cc0000' }} />
            <Line type="monotone" dataKey="Rt" stroke="#7c3aed" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
          Academic model — calibrated with Sri Lanka MOH/WRDO surveillance data 2019–2024.
          Not a substitute for epidemiological expert assessment. Parameters sourced from published literature.
        </p>
      </div>
    </div>
  );
}
