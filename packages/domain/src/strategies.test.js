import { describe, it, expect } from 'vitest';
import {
  calculateWheelCostBasis,
  calculatePmccSavings,
  validateWheelInputs,
  validatePmccInputs
} from './strategies.js';

// FIC: Tests for Task 2.4 - The Wheel and PMCC domain logic.
// FIC: Pruebas para la Tarea 2.4 - Lógica de dominio de The Wheel y PMCC.

describe('Estrategia The Wheel - Costo base por acción', () => {
  it('calcula el ejemplo del profesor (strike=490, premium=4.5 -> 485.5)', () => {
    const res = calculateWheelCostBasis({ strike: 490, premium_collected: 4.5 });
    expect(res).toEqual({
      strategy: 'the_wheel',
      cost_basis_per_share: 485.5
    });
  });

  it('permite primas mayores que el strike resultando en costo base teórico negativo', () => {
    const res = calculateWheelCostBasis({ strike: 10, premium_collected: 12 });
    expect(res).toEqual({
      strategy: 'the_wheel',
      cost_basis_per_share: -2
    });
  });

  it('valida entradas de The Wheel rechazando valores inválidos o desconocidos', () => {
    expect(validateWheelInputs({ strike: 490, premium_collected: 4.5 }).isValid).toBe(true);

    // Strike <= 0
    const rZeroStrike = validateWheelInputs({ strike: 0, premium_collected: 4.5 });
    expect(rZeroStrike.isValid).toBe(false);

    // Premium < 0
    const rNegPrem = validateWheelInputs({ strike: 490, premium_collected: -1 });
    expect(rNegPrem.isValid).toBe(false);

    // Tipos no numéricos
    const rStr = validateWheelInputs({ strike: '490', premium_collected: 4.5 });
    expect(rStr.isValid).toBe(false);

    // Campos desconocidos
    const rExtra = validateWheelInputs({ strike: 490, premium_collected: 4.5, extra: 1 });
    expect(rExtra.isValid).toBe(false);
  });
});

describe('Estrategia PMCC - Comparación de capital y ahorro', () => {
  it('calcula el ejemplo del profesor (stock=500, leaps=85 -> ahorro 41500, 83%)', () => {
    const res = calculatePmccSavings({ stock_price: 500, leaps_premium: 85 });
    expect(res).toEqual({
      strategy: 'pmcc',
      contract_size: 100,
      stock_capital: 50000,
      leaps_capital: 8500,
      capital_saved: 41500,
      savings_percent: 83
    });
  });

  it('maneja prima mayor al precio de acción reflejando ahorro negativo sin ocultarlo', () => {
    const res = calculatePmccSavings({ stock_price: 100, leaps_premium: 120 });
    expect(res.capital_saved).toBe(-2000);
    expect(res.savings_percent).toBe(-20);
  });

  it('valida entradas de PMCC rechazando valores menores o iguales a cero', () => {
    expect(validatePmccInputs({ stock_price: 500, leaps_premium: 85 }).isValid).toBe(true);

    const rZeroStock = validatePmccInputs({ stock_price: 0, leaps_premium: 85 });
    expect(rZeroStock.isValid).toBe(false);

    const rZeroLeaps = validatePmccInputs({ stock_price: 500, leaps_premium: 0 });
    expect(rZeroLeaps.isValid).toBe(false);

    const rExtra = validatePmccInputs({ stock_price: 500, leaps_premium: 85, unknown: true });
    expect(rExtra.isValid).toBe(false);
  });
});

