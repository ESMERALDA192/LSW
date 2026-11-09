import { describe, it, expect } from 'vitest';
import { calculateGreeks, GREEKS_UNITS } from './greeks.js';
import { calculateBlackScholes } from './black-scholes.js';

// FIC: Tests for Task 2.2 - Greeks calculation & finite differences validation.
// FIC: Pruebas para la Tarea 2.2 - Cálculo de griegas y validación por diferencias finitas.

describe('Cálculo de Griegas Black-Scholes-Merton', () => {
  const baseInputs = {
    spot: 100,
    strike: 100,
    time_years: 1,
    rate: 0.05,
    volatility: 0.2
  };

  it('rechaza time_years igual a cero con VALIDATION_ERROR', () => {
    expect(() => calculateGreeks({ ...baseInputs, time_years: 0 })).toThrowError(/positivo/i);
  });

  it('devuelve la estructura completa con call, put, model y units normalizados', () => {
    const res = calculateGreeks(baseInputs);
    expect(res.model).toBe('black_scholes_merton');
    expect(res.units).toEqual({
      delta: 'per_underlying_unit',
      gamma: 'delta_per_underlying_unit',
      theta: 'per_calendar_day_365',
      vega: 'per_volatility_percentage_point'
    });
    expect(res.call).toHaveProperty('delta');
    expect(res.call).toHaveProperty('gamma');
    expect(res.call).toHaveProperty('theta');
    expect(res.call).toHaveProperty('vega');
    expect(res.put).toHaveProperty('delta');
    expect(res.put).toHaveProperty('gamma');
    expect(res.put).toHaveProperty('theta');
    expect(res.put).toHaveProperty('vega');
  });

  it('cumple las propiedades financieras de límites de las griegas', () => {
    const res = calculateGreeks(baseInputs);
    // Delta Call en [0, 1]
    expect(res.call.delta).toBeGreaterThanOrEqual(0);
    expect(res.call.delta).toBeLessThanOrEqual(1);
    // Delta Put en [-1, 0]
    expect(res.put.delta).toBeGreaterThanOrEqual(-1);
    expect(res.put.delta).toBeLessThanOrEqual(0);
    // Relación Delta Call - Delta Put = 1
    expect(Math.abs(res.call.delta - res.put.delta - 1)).toBeLessThan(1e-10);
    // Gamma y Vega idénticos y no negativos
    expect(res.call.gamma).toBeGreaterThanOrEqual(0);
    expect(res.call.gamma).toBe(res.put.gamma);
    expect(res.call.vega).toBeGreaterThanOrEqual(0);
    expect(res.call.vega).toBe(res.put.vega);
  });

  it('coincide con aproximaciones por diferencias finitas (Delta, Gamma, Vega, Theta)', () => {
    const res = calculateGreeks(baseInputs);
    const epsS = 0.001;
    const epsVol = 0.0001;
    const epsT = 0.0001; // en años

    // Delta numérico Call: (C(S+h) - C(S-h)) / (2h)
    const cUp = calculateBlackScholes({ ...baseInputs, spot: baseInputs.spot + epsS }).call_price;
    const cDown = calculateBlackScholes({ ...baseInputs, spot: baseInputs.spot - epsS }).call_price;
    const numDeltaCall = (cUp - cDown) / (2 * epsS);
    expect(Math.abs(res.call.delta - numDeltaCall)).toBeLessThan(1e-5);

    // Delta numérico Put: (P(S+h) - P(S-h)) / (2h)
    const pUp = calculateBlackScholes({ ...baseInputs, spot: baseInputs.spot + epsS }).put_price;
    const pDown = calculateBlackScholes({ ...baseInputs, spot: baseInputs.spot - epsS }).put_price;
    const numDeltaPut = (pUp - pDown) / (2 * epsS);
    expect(Math.abs(res.put.delta - numDeltaPut)).toBeLessThan(1e-5);

    // Gamma numérico: (C(S+h) - 2C(S) + C(S-h)) / h^2
    const cMid = calculateBlackScholes(baseInputs).call_price;
    const numGamma = (cUp - 2 * cMid + cDown) / (epsS * epsS);
    expect(Math.abs(res.call.gamma - numGamma)).toBeLessThan(1e-4);

    // Vega numérico (por 1 punto de volatilidad, es decir, dVol = 0.01):
    // dC / dVol * 0.01 = ((C(vol+h) - C(vol-h)) / (2h)) * 0.01
    const cVolUp = calculateBlackScholes({ ...baseInputs, volatility: baseInputs.volatility + epsVol }).call_price;
    const cVolDown = calculateBlackScholes({ ...baseInputs, volatility: baseInputs.volatility - epsVol }).call_price;
    const numVega = ((cVolUp - cVolDown) / (2 * epsVol)) * 0.01;
    expect(Math.abs(res.call.vega - numVega)).toBeLessThan(1e-5);

    // Theta numérico (derivada respecto al paso del tiempo por día calendario = -dC/dt / 365):
    // Al avanzar el tiempo calendario, time_years disminuye en dt.
    const cTimePast = calculateBlackScholes({ ...baseInputs, time_years: baseInputs.time_years - epsT }).call_price;
    const numThetaCall = (cTimePast - cMid) / (epsT * 365);
    expect(Math.abs(res.call.theta - numThetaCall)).toBeLessThan(1e-4);
  });
});

