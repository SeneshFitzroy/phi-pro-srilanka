// ============================================================================
// Lightweight forecasting helpers — ordinary least-squares linear regression.
// Used by the management analytics dashboard for trend lines, n-step forecasts
// and compliance-drift detection. Pure functions, no dependencies; the model is
// intentionally simple and explainable (slope = change per period, R² = fit).
// ============================================================================

export interface RegressionModel {
  slope: number;
  intercept: number;
  /** Coefficient of determination (0..1) — how well the line fits the points. */
  r2: number;
  /** Predict y for a given x. */
  predict: (x: number) => number;
  n: number;
}

/** Fit y = slope·x + intercept by least squares over [{x,y}, …]. */
export function linearRegression(points: Array<{ x: number; y: number }>): RegressionModel {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0, predict: () => 0, n: 0 };
  if (n === 1) { const y = points[0].y; return { slope: 0, intercept: y, r2: 1, predict: () => y, n: 1 }; }

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let sxx = 0, sxy = 0, syy = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;
  const r2 = syy === 0 ? 1 : Math.max(0, Math.min(1, (sxy * sxy) / (sxx * syy)));
  return { slope, intercept, r2, predict: (x: number) => slope * x + intercept, n };
}

/** Forecast the next `steps` periods after a series of y-values (x = 0..n-1). */
export function forecastSeries(series: number[], steps: number): Array<{ x: number; yhat: number }> {
  const model = linearRegression(series.map((y, x) => ({ x, y })));
  const out: Array<{ x: number; yhat: number }> = [];
  for (let i = 0; i < steps; i++) {
    const x = series.length + i;
    out.push({ x, yhat: Math.max(0, Math.round(model.predict(x))) });
  }
  return out;
}

export type Drift = 'improving' | 'stable' | 'declining';

/** Classify a short series as improving / stable / declining from its OLS slope. */
export function classifyDrift(series: number[], stableBand = 0.75): { drift: Drift; slope: number; r2: number } {
  const model = linearRegression(series.map((y, x) => ({ x, y })));
  const drift: Drift = model.slope > stableBand ? 'improving' : model.slope < -stableBand ? 'declining' : 'stable';
  return { drift, slope: model.slope, r2: model.r2 };
}
