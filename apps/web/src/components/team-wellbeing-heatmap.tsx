'use client';

// ============================================================================
// TeamWellbeingHeatmap — SPHI/admin view of anonymised daily wellbeing check-ins
// aggregated across the team (no individual identities). Shows a 14-day strain
// heatmap and counts officers reporting high strain. Data here is illustrative
// until real anonymised check-ins accumulate (the individual widget is local-only).
// ============================================================================

import { useMemo } from 'react';
import { HeartPulse, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Band = 'good' | 'watch' | 'high';
const bandColor: Record<Band, string> = { good: 'bg-emerald-400', watch: 'bg-amber-400', high: 'bg-red-500' };

export function TeamWellbeingHeatmap() {
  // 14 days × {submissions, mean strain 0-100} — deterministic illustrative series
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (13 - i));
      const dow = d.getDay();
      const submissions = 6 + ((i * 5) % 7) - (dow === 0 || dow === 6 ? 3 : 0);
      const mean = 28 + ((i * 11) % 38) + (i === 9 ? 24 : i === 4 ? 14 : 0);
      const high = Math.max(0, Math.round((mean - 45) / 12) + (i === 9 ? 2 : 0));
      const band: Band = mean >= 60 ? 'high' : mean >= 40 ? 'watch' : 'good';
      return { date: d.toLocaleDateString('en-LK', { day: '2-digit', month: 'short' }), dow: d.toLocaleDateString('en-LK', { weekday: 'short' }).slice(0, 2), submissions: Math.max(0, submissions), mean, high, band };
    });
  }, []);

  const totalSubs = days.reduce((s, d) => s + d.submissions, 0);
  const highThisWeek = days.slice(-7).reduce((s, d) => s + d.high, 0);
  const weekMean = Math.round(days.slice(-7).reduce((s, d) => s + d.mean, 0) / 7);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base"><HeartPulse className="h-4 w-4 text-rose-500" /> Team Wellbeing (anonymised)</CardTitle>
        <span className="text-[11px] text-muted-foreground">{totalSubs} check-ins · 14 days</span>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          <span>This week mean strain: <strong className={weekMean >= 60 ? 'text-red-600' : weekMean >= 40 ? 'text-amber-600' : 'text-emerald-600'}>{weekMean}/100</strong></span>
          <span className="flex items-center gap-1"><AlertTriangle className={`h-4 w-4 ${highThisWeek ? 'text-red-500' : 'text-slate-300'}`} /><strong className={highThisWeek ? 'text-red-600' : ''}>{highThisWeek}</strong> high-strain reports this week</span>
        </div>
        <div className="flex items-end gap-1.5">
          {days.map((d, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end rounded bg-slate-100 dark:bg-slate-800" title={`${d.date}: ${d.submissions} check-ins · mean ${d.mean}/100 · ${d.high} high`}>
                <div className={`w-full rounded ${bandColor[d.band]}`} style={{ height: `${Math.max(8, d.mean)}%`, opacity: 0.4 + Math.min(1, d.submissions / 10) * 0.6 }} />
              </div>
              <span className="text-[9px] text-muted-foreground">{d.dow}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-400" /> Good</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-400" /> Watch</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500" /> High strain</span>
          <span className="ml-auto">Bar height = mean strain · opacity = participation. Aggregated from anonymised check-ins — no individual is identifiable. (Illustrative until check-ins accumulate.)</span>
        </div>
        <p className="mt-2 text-[11px]">Officers in high strain — share the NIMH helpline <a href="tel:1926" className="font-semibold text-rose-600 hover:underline">1926</a> and review caseloads. Ref: Wanninayake &amp; Razik (2025).</p>
      </CardContent>
    </Card>
  );
}
