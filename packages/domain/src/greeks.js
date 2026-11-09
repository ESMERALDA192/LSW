// FIC: Analytical Greeks for European Black-Scholes-Merton options.
// FIC: Griegas analíticas para opciones europeas Black-Scholes-Merton.

import { standardNormalCdf, standardNormalPdf } from './black-scholes.js';

export const GREEKS_UNITS = {
  delta: 'per_underlying_unit',
  gamma: 'delta_per_underlying_unit',
  theta: 'per_calendar_day_365',
  vega: 'per_volatility_percentage_point'
};

/**
 * Calcula las griegas analíticas (Delta, Gamma, Theta y Vega) para Call y Put.
 * Exige time_years > 0.
 * @param {{ spot: number, strike: number, time_years: number, rate: number, volatility: number }} inputs
 * @returns {{
 *   call: { delta: number, gamma: number, theta: number, vega: number },
 *   put: { delta: number, gamma: number, theta: number, vega: number },
 *   model: string,
 *   units: typeof GREEKS_UNITS
 * }}
 */
export function calculateGreeks(inputs) {
  const { spot, strike, time_years, rate, volatility } = inputs;

  if (time_years <= 0) {
    const error = new Error('El cálculo de sensibilidades (griegas) exige un tiempo hasta el vencimiento estrictamente positivo (time_years > 0).');
    error.code = 'VALIDATION_ERROR';
    error.field = 'time_years';
    throw error;
  }

  const sqrtT = Math.sqrt(time_years);
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * volatility * volatility) * time_years) / (volatility * sqrtT);
  const d2 = d1 - volatility * sqrtT;

  const pdfD1 = standardNormalPdf(d1);
  const cdfD1 = standardNormalCdf(d1);
  const cdfD2 = standardNormalCdf(d2);
  const cdfNegD2 = standardNormalCdf(-d2);
  const discount = Math.exp(-rate * time_years);

  // Delta: derivada respecto al precio spot
  const callDelta = cdfD1;
  const putDelta = cdfD1 - 1.0;

  // Gamma: segunda derivada respecto al precio spot (idéntica para Call y Put)
  const gamma = pdfD1 / (spot * volatility * sqrtT);

  // Theta: derivada respecto al paso del tiempo (dividida entre 365 días calendario)
  const callTheta = (
    (-(spot * pdfD1 * volatility) / (2.0 * sqrtT)) -
    (rate * strike * discount * cdfD2)
  ) / 365.0;

  const putTheta = (
    (-(spot * pdfD1 * volatility) / (2.0 * sqrtT)) +
    (rate * strike * discount * cdfNegD2)
  ) / 365.0;

  // Vega: derivada respecto a la volatilidad por punto porcentual (dividida entre 100)
  const vega = (spot * sqrtT * pdfD1) / 100.0;

  const values = [callDelta, putDelta, gamma, callTheta, putTheta, vega];
  if (values.some(v => !Number.isFinite(v))) {
    const rangeError = new Error('Uno o más valores de las sensibilidades exceden el rango numérico representable.');
    rangeError.code = 'NUMERIC_RANGE_ERROR';
    throw rangeError;
  }

  return {
    call: {
      delta: callDelta,
      gamma,
      theta: callTheta,
      vega
    },
    put: {
      delta: putDelta,
      gamma,
      theta: putTheta,
      vega
    },
    model: 'black_scholes_merton',
    units: { ...GREEKS_UNITS }
  };
}

