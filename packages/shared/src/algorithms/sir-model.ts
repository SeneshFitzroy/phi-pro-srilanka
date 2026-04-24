// ============================================================================
// SIR Epidemic Model — Runge-Kutta 4th Order Numerical Integration
// Compartmental model: Susceptible → Infected → Recovered
// Used for: Dengue, Typhoid, Leptospirosis outbreak prediction in PHI zones
// Reference: Kermack & McKendrick (1927); WHO Epidemiology Field Manual
// ============================================================================

export interface SIRParams {
  population: number;       // N — total population in MOH area
  beta: number;             // β — transmission rate (contacts × prob of infection per day)
  gamma: number;            // γ — recovery rate (1 / infectious period in days)
  initialInfected: number;  // I₀ — seed cases
  days: number;             // simulation horizon (days)
  dt?: number;              // time step (default 0.1 day for accuracy)
}

export interface SIRDataPoint {
  day: number;
  S: number;   // Susceptible
  I: number;   // Infected (active)
  R: number;   // Recovered / Removed
  newCases: number;   // daily incidence (ΔI per day)
  Rt: number;         // effective reproduction number at time t
}

export interface SIRResult {
  series: SIRDataPoint[];
  peakDay: number;
  peakInfected: number;
  totalAttackRate: number;  // % of population ultimately infected
  herdImmunityThreshold: number;  // 1 - 1/R₀
  R0: number;               // basic reproduction number β/γ
  daysToExtinction: number; // when I < 1 person
  diseaseParameters: DiseasePreset;
}

// Sri Lanka–calibrated disease parameters (MOH/WRDO data 2019-2024)
export interface DiseasePreset {
  name: string;
  beta: number;
  gamma: number;
  infectiousPeriod: number;
  R0: number;
}

export const DISEASE_PRESETS: Record<string, DiseasePreset> = {
  dengue: {
    name: 'Dengue Fever',
    beta: 0.40,     // Aedes aegypti vector-borne; high in Western Province
    gamma: 0.143,   // ~7-day infectious period
    infectiousPeriod: 7,
    R0: 2.8,
  },
  typhoid: {
    name: 'Typhoid',
    beta: 0.20,     // foodborne/waterborne; lower contact rate
    gamma: 0.071,   // ~14-day period
    infectiousPeriod: 14,
    R0: 2.8,
  },
  leptospirosis: {
    name: 'Leptospirosis',
    beta: 0.15,     // zoonotic; lower person-to-person
    gamma: 0.100,   // ~10-day period
    infectiousPeriod: 10,
    R0: 1.5,
  },
  cholera: {
    name: 'Cholera',
    beta: 0.50,
    gamma: 0.200,   // ~5-day period
    infectiousPeriod: 5,
    R0: 2.5,
  },
  covid19: {
    name: 'COVID-19 (Delta)',
    beta: 0.70,
    gamma: 0.143,   // ~7-day infectious
    infectiousPeriod: 7,
    R0: 4.9,
  },
};

// ---------------------------------------------------------------------------
// Runge-Kutta 4th Order Integration (RK4)
// Far more accurate than Euler method for epidemiological simulations
// ---------------------------------------------------------------------------

interface SIRState { S: number; I: number; R: number }

function sirDerivatives(
  state: SIRState,
  beta: number,
  gamma: number,
  N: number,
): SIRState {
  const { S, I } = state;
  const dS = -beta * S * I / N;
  const dI = beta * S * I / N - gamma * I;
  const dR = gamma * I;
  return { S: dS, I: dI, R: dR };
}

function rk4Step(
  state: SIRState,
  beta: number,
  gamma: number,
  N: number,
  dt: number,
): SIRState {
  const k1 = sirDerivatives(state, beta, gamma, N);

  const s2: SIRState = { S: state.S + 0.5 * dt * k1.S, I: state.I + 0.5 * dt * k1.I, R: state.R + 0.5 * dt * k1.R };
  const k2 = sirDerivatives(s2, beta, gamma, N);

  const s3: SIRState = { S: state.S + 0.5 * dt * k2.S, I: state.I + 0.5 * dt * k2.I, R: state.R + 0.5 * dt * k2.R };
  const k3 = sirDerivatives(s3, beta, gamma, N);

  const s4: SIRState = { S: state.S + dt * k3.S, I: state.I + dt * k3.I, R: state.R + dt * k3.R };
  const k4 = sirDerivatives(s4, beta, gamma, N);

  return {
    S: state.S + (dt / 6) * (k1.S + 2 * k2.S + 2 * k3.S + k4.S),
    I: state.I + (dt / 6) * (k1.I + 2 * k2.I + 2 * k3.I + k4.I),
    R: state.R + (dt / 6) * (k1.R + 2 * k2.R + 2 * k3.R + k4.R),
  };
}

// ---------------------------------------------------------------------------
// Main simulation entry point
// ---------------------------------------------------------------------------

export function runSIRModel(params: SIRParams): SIRResult {
  const { population: N, beta, gamma, initialInfected, days } = params;
  const dt = params.dt ?? 0.1;

  const R0 = beta / gamma;
  const herdImmunityThreshold = 1 - 1 / R0;

  let state: SIRState = {
    S: N - initialInfected,
    I: initialInfected,
    R: 0,
  };

  const series: SIRDataPoint[] = [];
  let prevI = initialInfected;
  let peakDay = 0;
  let peakInfected = 0;
  let daysToExtinction = days;

  const stepsPerDay = Math.round(1 / dt);
  const totalSteps = days * stepsPerDay;

  for (let step = 0; step <= totalSteps; step++) {
    if (step % stepsPerDay === 0) {
      const day = step / stepsPerDay;
      const newCases = Math.max(0, state.I - prevI + gamma * state.I);
      const Rt = R0 * (state.S / N);

      series.push({
        day,
        S: Math.round(state.S),
        I: Math.round(state.I),
        R: Math.round(state.R),
        newCases: Math.round(newCases),
        Rt: parseFloat(Rt.toFixed(3)),
      });

      if (state.I > peakInfected) {
        peakInfected = state.I;
        peakDay = day;
      }

      if (state.I < 1 && daysToExtinction === days && day > 0) {
        daysToExtinction = day;
      }

      prevI = state.I;
    }

    state = rk4Step(state, beta, gamma, N, dt);
    // Clamp to avoid floating-point drift
    state.S = Math.max(0, state.S);
    state.I = Math.max(0, state.I);
    state.R = Math.max(0, state.R);
  }

  const totalAttackRate = (state.R / N) * 100;

  return {
    series,
    peakDay: Math.round(peakDay),
    peakInfected: Math.round(peakInfected),
    totalAttackRate: parseFloat(totalAttackRate.toFixed(2)),
    herdImmunityThreshold: parseFloat((herdImmunityThreshold * 100).toFixed(1)),
    R0: parseFloat(R0.toFixed(2)),
    daysToExtinction,
    diseaseParameters: {
      name: 'Custom',
      beta,
      gamma,
      infectiousPeriod: Math.round(1 / gamma),
      R0: parseFloat(R0.toFixed(2)),
    },
  };
}

// Convenience wrapper with disease preset
export function runSIRForDisease(
  disease: keyof typeof DISEASE_PRESETS,
  population: number,
  initialInfected: number,
  days = 180,
): SIRResult {
  const preset = DISEASE_PRESETS[disease];
  const result = runSIRModel({ population, beta: preset.beta, gamma: preset.gamma, initialInfected, days });
  result.diseaseParameters = preset;
  return result;
}

// Alert threshold: days until infected exceeds threshold
export function daysUntilThreshold(result: SIRResult, threshold: number): number {
  const point = result.series.find((p) => p.I >= threshold);
  return point ? point.day : -1;
}
