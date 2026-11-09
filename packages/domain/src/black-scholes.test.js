import { describe, it, expect } from 'vitest';
import fixtures from '../fixtures/black-scholes.json' with { type: 'json' };
import { validateF0Inputs } from './validation.js';
import { calculateBlackScholes } from './black-scholes.js';

// FIC: Tests for Task 2.1 - Black-Scholes valuation & pure input validation.
// FIC: Pruebas para la Tarea 2.1 - Valoración Black-Scholes y validación pura de entradas.

describe('Validación común de parámetros F0', () => {
  const validInputs = {
    spot: 100,
    strike: 100,
    time_years: 1,
    rate: 0.05,
    volatility: 0.2
  };

  it('acepta parámetros válidos canónicos', () => {
    const result = validateF0Inputs(validInputs);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rechaza spot menor o igual a cero', () => {
    const rZero = validateF0Inputs({ ...validInputs, spot: 0 });
    expect(rZero.isValid).toBe(false);
    expect(rZero.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'spot' })])
    );

    const rNeg = validateF0Inputs({ ...validInputs, spot: -10 });
    expect(rNeg.isValid).toBe(false);
  });

  it('rechaza strike menor o igual a cero', () => {
    const rZero = validateF0Inputs({ ...validInputs, strike: 0 });
    expect(rZero.isValid).toBe(false);
    expect(rZero.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'strike' })])
    );
  });

  it('rechaza time_years negativo pero acepta time_years=0', () => {
    const rZero = validateF0Inputs({ ...validInputs, time_years: 0 });
    expect(rZero.isValid).toBe(true);

    const rNeg = validateF0Inputs({ ...validInputs, time_years: -0.1 });
    expect(rNeg.isValid).toBe(false);
    expect(rNeg.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'time_years' })])
    );
  });

  it('rechaza volatility menor o igual a cero', () => {
    const rZero = validateF0Inputs({ ...validInputs, volatility: 0 });
    expect(rZero.isValid).toBe(false);
    expect(rZero.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'volatility' })])
    );
  });

  it('admite tasas de interés negativas finitas', () => {
    const rNegRate = validateF0Inputs({ ...validInputs, rate: -0.01 });
    expect(rNegRate.isValid).toBe(true);
  });

  it('rechaza tipos no numéricos y cadenas numéricas (sin coerción)', () => {
    const rStr = validateF0Inputs({ ...validInputs, spot: '100' });
    expect(rStr.isValid).toBe(false);
    expect(rStr.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'spot' })])
    );

    const rBool = validateF0Inputs({ ...validInputs, strike: true });
    expect(rBool.isValid).toBe(false);
  });

  it('rechaza campos desconocidos no permitidos', () => {
    const rUnknown = validateF0Inputs({ ...validInputs, extra_field: 123 });
    expect(rUnknown.isValid).toBe(false);
    expect(rUnknown.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'extra_field' })])
    );
  });

  it('rechaza campos obligatorios faltantes', () => {
    const missing = { spot: 100, strike: 100 };
    const rMissing = validateF0Inputs(missing);
    expect(rMissing.isValid).toBe(false);
    expect(rMissing.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Valoración Black-Scholes-Merton europea sin dividendos', () => {
  const { absolute: absTol, relative: relTol } = fixtures.tolerance;

  function assertNear(actual, expected, message) {
    const diff = Math.abs(actual - expected);
    const maxAllowed = Math.max(absTol, Math.abs(expected) * relTol);
    expect(
      diff,
      `${message}: esperado ${expected}, obtenido ${actual}, diferencia ${diff} supera ${maxAllowed}`
    ).toBeLessThanOrEqual(maxAllowed);
  }

  for (const tc of fixtures.cases) {
    it(`evalúa caso fixture: ${tc.name} (${tc.description})`, () => {
      const res = calculateBlackScholes(tc.inputs);
      expect(res.model).toBe('black_scholes_merton');
      assertNear(res.call_price, tc.expected.call_price, `Call ${tc.name}`);
      assertNear(res.put_price, tc.expected.put_price, `Put ${tc.name}`);
    });
  }

  it('cumple la paridad Put-Call (C - P = S - K * exp(-r * T))', () => {
    const inputs = { spot: 120, strike: 100, time_years: 0.5, rate: 0.03, volatility: 0.25 };
    const res = calculateBlackScholes(inputs);
    const parityRhs = inputs.spot - inputs.strike * Math.exp(-inputs.rate * inputs.time_years);
    const parityLhs = res.call_price - res.put_price;
    assertNear(parityLhs, parityRhs, 'Paridad Put-Call');
  });
});

