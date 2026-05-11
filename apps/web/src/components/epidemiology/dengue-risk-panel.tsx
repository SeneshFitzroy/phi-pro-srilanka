'use client';

// ============================================================================
// Dengue Risk (Rainfall) panel — district-level breeding-pressure heat-map.
// Pulls live rainfall (Open-Meteo, no API key) for all 25 districts in one
// request, scores each with lib/dengue-risk, and ranks them so PHIs see where
// to push source-reduction effort. Screening tool, not a case forecast.
// ============================================================================

import { Fragment, useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CloudRain, RefreshCw, Loader2, AlertTriangle, ChevronDown, ChevronUp, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchDistrictRisks, riskColor, type DistrictRisk, type RiskLevel } from '@/lib/dengue-risk';

const LEVEL_BADGE: Record<RiskLevel, string> = {
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  'Very High': 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

export function DengueRiskPanel() {
  const [risks, setRisks] = useState<DistrictRisk[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDistrictRisks();
      data.sort((a, b) => b.score - a.score);
      setRisks(data);
      setUpdatedAt(new Date());
    } catch {
      setError(navigator.onLine ? 'Could not reach the rainfall service (Open-Meteo).' : 'Offline — connect to load live rainfall risk.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const highCount = risks?.filter((r) => r.level === 'High' || r.level === 'Very High').length ?? 0;
  const top10 = (risks ?? []).slice(0, 10).map((r) => ({ name: r.district, score: r.score, level: r.level }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudRain className="h-4 w-4 text-sky-500" /> Dengue Risk — Rainfall Heat-map
        </CardTitle>
        <div className="flex items-center gap-2">
          {updatedAt && <span className="hidden text-[11px] text-muted-foreground sm:inline">updated {updatedAt.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}</span>}
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !risks ? (
          <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Fetching live rainfall for 25 districts…</p>
        ) : error ? (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            <span className="flex items-center gap-2">{navigator.onLine ? <AlertTriangle className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          </div>
        ) : risks ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong className={highCount ? 'text-red-600' : 'text-emerald-600'}>{highCount}</strong> district{highCount === 1 ? '' : 's'} at <em>High</em> or <em>Very High</em> breeding pressure from recent &amp; forecast rainfall.
              Aedes breeding lags rainfall by ~1–3 weeks — prioritise source-reduction in the red districts now.
            </p>

            {/* Top-10 bar chart */}
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 24 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={84} />
                  <Tooltip formatter={(v: number) => [`${v}/100`, 'Risk score']} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {top10.map((d, i) => <Cell key={i} fill={riskColor(d.level)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Full ranked list */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">District</th>
                    <th className="py-2 pr-2 font-medium text-right">Rain 14d</th>
                    <th className="py-2 pr-2 font-medium text-right">Rainy days</th>
                    <th className="py-2 pr-2 font-medium text-right">Forecast 7d</th>
                    <th className="py-2 pr-2 font-medium text-right">Score</th>
                    <th className="py-2 font-medium text-right">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map((r) => (
                    <Fragment key={r.district}>
                      <tr className="border-b last:border-0 cursor-pointer hover:bg-muted/40" onClick={() => setExpanded(expanded === r.district ? null : r.district)}>
                        <td className="py-2 pr-2 font-medium">
                          <span className="inline-flex items-center gap-1">{r.district}<span className="text-[10px] text-muted-foreground">· {r.province}</span>{expanded === r.district ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}</span>
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">{r.rain14mm.toFixed(0)} mm</td>
                        <td className="py-2 pr-2 text-right tabular-nums">{r.rainyDays14}</td>
                        <td className="py-2 pr-2 text-right tabular-nums">{r.forecast7mm.toFixed(0)} mm</td>
                        <td className="py-2 pr-2 text-right">
                          <span className="inline-flex items-center gap-2">
                            <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 sm:inline-block dark:bg-slate-700"><span className="block h-full rounded-full" style={{ width: `${r.score}%`, backgroundColor: riskColor(r.level) }} /></span>
                            <span className="tabular-nums font-semibold">{r.score}</span>
                          </span>
                        </td>
                        <td className="py-2 text-right"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${LEVEL_BADGE[r.level]}`}>{r.level}</span></td>
                      </tr>
                      {expanded === r.district && (
                        <tr className="bg-muted/30">
                          <td colSpan={6} className="px-2 py-2 text-xs text-muted-foreground">{r.rationale}</td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              {(['Low', 'Moderate', 'High', 'Very High'] as RiskLevel[]).map((l) => (
                <span key={l} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={{ backgroundColor: riskColor(l) }} />{l}</span>
              ))}
              <span className="ml-auto">Rainfall: Open-Meteo · model: lagged-rainfall screening (see <code>lib/dengue-risk.ts</code>) · ref. Withanage et al. 2021</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
