// ============================================================================
// Rainfall-driven dengue risk model.
//
// Aedes (dengue vector) breeding follows rainfall with a ~1–3 week lag — rain
// fills containers, then larvae mature. So we score each district from:
//   - rain over the last 14 days  (the breeding driver — weighted highest)
//   - number of rainy days in that window (persistent wetness)
//   - rain forecast for the next 7 days (sustains/escalates the risk)
// Data: Open-Meteo daily `precipitation_sum` (free, no API key, CORS-enabled).
// This is a screening heat-map, not a prediction of cases — it points PHIs to
// where source-reduction effort is most needed. Ref: Withanage et al. (2021),
// rainfall–dengue association in Sri Lanka.
// ============================================================================

export interface DistrictPoint { district: string; province: string; lat: number; lng: number }

/** District centroids (approx.) — covers all 25 administrative districts. */
export const SL_DISTRICTS: DistrictPoint[] = [
  { district: 'Colombo', province: 'Western', lat: 6.93, lng: 79.86 },
  { district: 'Gampaha', province: 'Western', lat: 7.09, lng: 79.99 },
  { district: 'Kalutara', province: 'Western', lat: 6.59, lng: 79.96 },
  { district: 'Kandy', province: 'Central', lat: 7.29, lng: 80.64 },
  { district: 'Matale', province: 'Central', lat: 7.47, lng: 80.62 },
  { district: 'Nuwara Eliya', province: 'Central', lat: 6.97, lng: 80.77 },
  { district: 'Galle', province: 'Southern', lat: 6.05, lng: 80.22 },
  { district: 'Matara', province: 'Southern', lat: 5.95, lng: 80.55 },
  { district: 'Hambantota', province: 'Southern', lat: 6.12, lng: 81.12 },
  { district: 'Jaffna', province: 'Northern', lat: 9.66, lng: 80.02 },
  { district: 'Kilinochchi', province: 'Northern', lat: 9.40, lng: 80.40 },
  { district: 'Mannar', province: 'Northern', lat: 8.98, lng: 79.91 },
  { district: 'Vavuniya', province: 'Northern', lat: 8.75, lng: 80.50 },
  { district: 'Mullaitivu', province: 'Northern', lat: 9.27, lng: 80.81 },
  { district: 'Trincomalee', province: 'Eastern', lat: 8.59, lng: 81.21 },
  { district: 'Batticaloa', province: 'Eastern', lat: 7.71, lng: 81.69 },
  { district: 'Ampara', province: 'Eastern', lat: 7.29, lng: 81.67 },
  { district: 'Kurunegala', province: 'North Western', lat: 7.49, lng: 80.36 },
  { district: 'Puttalam', province: 'North Western', lat: 8.03, lng: 79.83 },
  { district: 'Anuradhapura', province: 'North Central', lat: 8.31, lng: 80.40 },
  { district: 'Polonnaruwa', province: 'North Central', lat: 7.94, lng: 81.00 },
  { district: 'Badulla', province: 'Uva', lat: 6.99, lng: 81.06 },
  { district: 'Monaragala', province: 'Uva', lat: 6.87, lng: 81.35 },
  { district: 'Ratnapura', province: 'Sabaragamuwa', lat: 6.68, lng: 80.40 },
  { district: 'Kegalle', province: 'Sabaragamuwa', lat: 7.25, lng: 80.35 },
];

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface DistrictRisk extends DistrictPoint {
  rain14mm: number;       // total rainfall, last 14 days
  rainyDays14: number;    // days with > 2.5 mm in that window
  forecast7mm: number;    // total rainfall, next 7 days (forecast)
  score: number;          // 0–100
  level: RiskLevel;
  rationale: string;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#22c55e',
  Moderate: '#eab308',
  High: '#f97316',
  'Very High': '#dc2626',
};
export const riskColor = (l: RiskLevel) => RISK_COLORS[l];

function levelFromScore(s: number): RiskLevel {
  return s >= 75 ? 'Very High' : s >= 50 ? 'High' : s >= 25 ? 'Moderate' : 'Low';
}

/** Combine the rainfall signals into a 0–100 dengue-breeding-pressure score. */
export function scoreDistrict(rain14mm: number, rainyDays14: number, forecast7mm: number): { score: number; level: RiskLevel; rationale: string } {
  // Saturating contributions — heavy rain doesn't keep adding linearly.
  const lagged = Math.min(60, (rain14mm / 200) * 60);          // last-14-day rain (dominant)
  const persistence = Math.min(20, (rainyDays14 / 10) * 20);   // how many days it actually rained
  const upcoming = Math.min(20, (forecast7mm / 80) * 20);      // forecast keeps it going
  const score = Math.round(lagged + persistence + upcoming);
  const level = levelFromScore(score);
  const rationale =
    `${rain14mm.toFixed(0)} mm over the last 14 days across ${rainyDays14} rainy day${rainyDays14 === 1 ? '' : 's'}` +
    `, plus ${forecast7mm.toFixed(0)} mm forecast in the next 7 — ` +
    (level === 'Very High' ? 'sustained wetness; expect a sharp rise in Aedes breeding sites within ~2 weeks.'
      : level === 'High' ? 'wet conditions favour breeding; prioritise source-reduction now.'
      : level === 'Moderate' ? 'some breeding pressure; maintain routine larval surveys.'
      : 'low breeding pressure from rainfall at present.');
  return { score, level, rationale };
}

interface OpenMeteoDaily { time: string[]; precipitation_sum: (number | null)[] }
interface OpenMeteoResult { latitude: number; longitude: number; daily: OpenMeteoDaily }

/**
 * Fetch Open-Meteo (one request for all districts) and compute risk for each.
 * Throws on network failure — callers should handle offline.
 */
export async function fetchDistrictRisks(districts: DistrictPoint[] = SL_DISTRICTS): Promise<DistrictRisk[]> {
  const lat = districts.map((d) => d.lat).join(',');
  const lng = districts.map((d) => d.lng).join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=precipitation_sum&past_days=14&forecast_days=7&timezone=Asia%2FColombo`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();
  const results: OpenMeteoResult[] = Array.isArray(json) ? json : [json];

  return districts.map((d, i) => {
    const r = results[i];
    const sums = (r?.daily?.precipitation_sum ?? []).map((v) => v ?? 0);
    // Open-Meteo returns past_days first, then today + forecast_days.
    const past = sums.slice(0, 14);
    const future = sums.slice(14, 14 + 7);
    const rain14mm = past.reduce((s, v) => s + v, 0);
    const rainyDays14 = past.filter((v) => v > 2.5).length;
    const forecast7mm = future.reduce((s, v) => s + v, 0);
    const { score, level, rationale } = scoreDistrict(rain14mm, rainyDays14, forecast7mm);
    return { ...d, rain14mm, rainyDays14, forecast7mm, score, level, rationale };
  });
}
