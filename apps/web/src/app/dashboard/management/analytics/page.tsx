'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, FileText, AlertTriangle, Activity, Download, LineChart as LineChartIcon, Sparkles, Grid3x3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { AuthGuard } from '@/components/auth-guard';
import { UserRole } from '@phi-pro/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportFoodInspectionToFHIR, downloadFhirBundle } from '@/lib/fhir-export';
import { linearRegression, forecastSeries, classifyDrift, type Drift } from '@/lib/forecast';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  return (
    <AuthGuard allowedRoles={[UserRole.SPHI, UserRole.MOH_ADMIN]}>
      <AnalyticsContent />
    </AuthGuard>
  );
}

function AnalyticsContent() {
  const barData = [
    { month: 'Sep', food: 45, school: 12, epi: 8, occ: 6, admin: 20 },
    { month: 'Oct', food: 52, school: 15, epi: 12, occ: 8, admin: 22 },
    { month: 'Nov', food: 48, school: 18, epi: 15, occ: 7, admin: 25 },
    { month: 'Dec', food: 38, school: 8, epi: 20, occ: 5, admin: 18 },
    { month: 'Jan', food: 55, school: 20, epi: 10, occ: 9, admin: 28 },
    { month: 'Feb', food: 42, school: 16, epi: 14, occ: 7, admin: 24 },
  ];

  const phiPerformance = [
    { name: 'K. Perera', area: 'Colombo North', inspections: 45, reports: 12, compliance: 94, trend: 'up' },
    { name: 'M. Silva', area: 'Kaduwela East', inspections: 38, reports: 10, compliance: 88, trend: 'up' },
    { name: 'R. Fernando', area: 'Dehiwala West', inspections: 42, reports: 11, compliance: 91, trend: 'same' },
    { name: 'A. Bandara', area: 'Homagama', inspections: 35, reports: 9, compliance: 82, trend: 'down' },
    { name: 'S. Jayawardena', area: 'Moratuwa', inspections: 28, reports: 7, compliance: 75, trend: 'down' },
  ];

  const maxInspections = Math.max(...barData.reduce((s, d) => [...s, d.food + d.school + d.epi + d.occ + d.admin], [] as number[]));

  /* ── Predictive analytics (OLS linear regression on monthly totals) ── */
  const FORECAST_MONTHS = ['Mar', 'Apr', 'May'];
  const monthlyTotals = barData.map((d) => d.food + d.school + d.epi + d.occ + d.admin);
  const activityModel = linearRegression(monthlyTotals.map((y, x) => ({ x, y })));
  const forecast = forecastSeries(monthlyTotals, FORECAST_MONTHS.length);
  const trendChartData: Array<{ month: string; actual: number | null; forecast: number | null }> = [
    ...barData.map((d, i) => ({ month: d.month, actual: monthlyTotals[i], forecast: i === barData.length - 1 ? monthlyTotals[i] : null })),
    ...forecast.map((f, i) => ({ month: FORECAST_MONTHS[i], actual: null, forecast: f.yhat })),
  ];
  const trendDirection = activityModel.slope > 0.5 ? 'rising' : activityModel.slope < -0.5 ? 'falling' : 'broadly flat';

  /* ── Per-officer monthly series for compliance-drift + workload heatmap ── */
  const phiMonthly = [
    { name: 'K. Perera', area: 'Colombo North', insp: [6, 7, 8, 7, 9, 8], comp: [88, 89, 90, 91, 93, 94] },
    { name: 'M. Silva', area: 'Kaduwela East', insp: [5, 6, 7, 6, 7, 7], comp: [80, 82, 84, 85, 86, 88] },
    { name: 'R. Fernando', area: 'Dehiwala West', insp: [7, 7, 7, 6, 8, 7], comp: [90, 91, 91, 90, 92, 91] },
    { name: 'A. Bandara', area: 'Homagama', insp: [8, 7, 6, 5, 5, 4], comp: [90, 88, 86, 84, 83, 82] },
    { name: 'S. Jayawardena', area: 'Moratuwa', insp: [6, 5, 5, 4, 4, 3], comp: [85, 82, 80, 78, 76, 75] },
  ];
  const months = barData.map((d) => d.month);
  const driftRows = phiMonthly
    .map((p) => ({ ...p, ...classifyDrift(p.comp), latest: p.comp[p.comp.length - 1] }))
    .sort((a, b) => a.slope - b.slope); // declining first
  const maxCell = Math.max(1, ...phiMonthly.flatMap((p) => p.insp));
  const driftBadge: Record<Drift, string> = {
    declining: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    stable: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    improving: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-purple-500" />Area Analytics</h1>
            <p className="text-sm text-muted-foreground">MOH area performance overview & trends</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
          onClick={() => {
            const bundle = exportFoodInspectionToFHIR({
              id: 'sample-export',
              premisesName: 'Area Report Export',
              totalScore: 0,
              grade: 'B',
              inspectionDate: new Date().toISOString().split('T')[0],
              inspectorId: 'analytics-export',
            });
            downloadFhirBundle(bundle, `phi-pro-fhir-export-${new Date().toISOString().split('T')[0]}.json`);
            toast.success('FHIR R4 bundle exported — ready for DHIS2 import');
          }}
        >
          <Download className="h-4 w-4" />
          Export FHIR (DHIS2)
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Activities (6mo)', value: '782', change: '+12%', icon: Activity, color: 'text-blue-500', up: true },
          { label: 'Avg. Compliance', value: '86%', change: '+3%', icon: FileText, color: 'text-green-500', up: true },
          { label: 'Disease Incidents', value: '79', change: '-8%', icon: AlertTriangle, color: 'text-red-500', up: false },
          { label: 'Active Officers', value: '24', change: '0', icon: Users, color: 'text-purple-500', up: true },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <span className={`text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>{kpi.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stacked Bar Chart (CSS-only) */}
      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Activity Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {barData.map(d => {
              const total = d.food + d.school + d.epi + d.occ + d.admin;
              const h = (total / (maxInspections || 1)) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{total}</span>
                  <div className="w-full flex flex-col rounded-t overflow-hidden" style={{ height: `${h}%` }}>
                    <div className="bg-green-500" style={{ flex: d.food }} />
                    <div className="bg-blue-500" style={{ flex: d.school }} />
                    <div className="bg-red-500" style={{ flex: d.epi }} />
                    <div className="bg-yellow-500" style={{ flex: d.occ }} />
                    <div className="bg-purple-500" style={{ flex: d.admin }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-green-500" />Food</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-500" />School</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-500" />Epidemiology</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-yellow-500" />Occupational</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-purple-500" />Administration</span>
          </div>
        </CardContent>
      </Card>

      {/* PHI Performance Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">PHI Officer Performance</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Officer</th>
                <th className="pb-2 font-medium">Area</th>
                <th className="pb-2 font-medium text-center">Inspections</th>
                <th className="pb-2 font-medium text-center">Reports</th>
                <th className="pb-2 font-medium text-center">Compliance</th>
                <th className="pb-2 font-medium text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {phiPerformance.map((phi) => (
                <tr key={phi.name} className="border-b last:border-0">
                  <td className="py-2 font-medium">{phi.name}</td>
                  <td className="py-2 text-muted-foreground">{phi.area}</td>
                  <td className="py-2 text-center">{phi.inspections}</td>
                  <td className="py-2 text-center">{phi.reports}</td>
                  <td className="py-2 text-center">{phi.compliance}%</td>
                  <td className="py-2 text-center">
                    {phi.trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500 inline" /> : phi.trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500 inline" /> : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── PREDICTIVE: activity trend + 3-month forecast ─────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-violet-500" />Predictive — Activity Trend &amp; 3-Month Forecast</CardTitle>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
            R² {activityModel.r2.toFixed(2)} · slope {activityModel.slope >= 0 ? '+' : ''}{activityModel.slope.toFixed(1)}/mo
          </span>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <ReferenceLine x={months[months.length - 1]} stroke="#a78bfa" strokeDasharray="4 4" label={{ value: 'forecast →', position: 'insideTopRight', fontSize: 10, fill: '#7c3aed' }} />
                <Line type="monotone" dataKey="actual" name="Recorded activities" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" name="Forecast (OLS)" stroke="#7c3aed" strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Linear least-squares fit over the last {monthlyTotals.length} months — the area trend is {trendDirection};
            projected next-month activity ≈ <strong>{forecast[0]?.yhat}</strong> ({FORECAST_MONTHS.join(', ')}: {forecast.map((f) => f.yhat).join(' · ')}).
            A simple, explainable model — confidence falls the further out you project (R² shown above).
          </p>
        </CardContent>
      </Card>

      {/* ── COMPLIANCE DRIFT WATCH ────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><LineChartIcon className="h-4 w-4 text-amber-500" />Compliance Drift Watch</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">Six-month compliance trend per officer (OLS slope). Declining officers are listed first for follow-up.</p>
          <div className="space-y-2">
            {driftRows.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.area}</p>
                </div>
                <div className="h-9 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={r.comp.map((y, x) => ({ x, y }))}>
                      <Line type="monotone" dataKey="y" stroke={r.drift === 'declining' ? '#dc2626' : r.drift === 'improving' ? '#16a34a' : '#94a3b8'} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums">{r.latest}%</div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${driftBadge[r.drift]}`}>
                  {r.drift} ({r.slope >= 0 ? '+' : ''}{r.slope.toFixed(1)}/mo)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── OFFICER WORKLOAD HEATMAP ──────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Grid3x3 className="h-4 w-4 text-blue-500" />Officer Workload Heatmap</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="px-2 pb-2 text-left font-medium">Officer</th>
                {months.map((m) => <th key={m} className="px-1 pb-2 text-center font-medium">{m}</th>)}
                <th className="px-2 pb-2 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {phiMonthly.map((p) => {
                const total = p.insp.reduce((s, v) => s + v, 0);
                return (
                  <tr key={p.name}>
                    <td className="whitespace-nowrap px-2 py-1 font-medium">{p.name}</td>
                    {p.insp.map((v, i) => {
                      const t = v / maxCell;
                      return (
                        <td key={i} className="px-1 py-1 text-center">
                          <div className="mx-auto flex h-7 w-9 items-center justify-center rounded text-[11px] font-semibold"
                               style={{ backgroundColor: `rgba(37, 99, 235, ${0.12 + t * 0.78})`, color: t > 0.55 ? 'white' : '#1e3a8a' }}>
                            {v}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 text-center font-bold">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Fewer</span>
            <div className="flex">
              {[0.12, 0.3, 0.5, 0.7, 0.9].map((a) => <span key={a} className="h-3 w-6" style={{ backgroundColor: `rgba(37,99,235,${a})` }} />)}
            </div>
            <span>More inspections / month</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Predictive models here are intentionally simple (ordinary least-squares) so the figures are explainable to
        oversight — they support, not replace, supervisory judgement. Wire to live Firestore inspection counts to
        forecast real area workload.
      </p>
    </div>
  );
}