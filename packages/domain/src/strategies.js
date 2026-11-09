// FIC: Quantitative strategies domain logic (The Wheel and PMCC).
// FIC: Lógica de dominio de estrategias cuantitativas (The Wheel y PMCC).

/**
 * Valida los parámetros para The Wheel (costo base).
 * @param {Record<string, unknown>} inputs
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }> }}
 */
export function validateWheelInputs(inputs) {
  const errors = [];
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'El cuerpo de la solicitud debe ser un objeto JSON válido.' }]
    };
  }

  const allowed = new Set(['strike', 'premium_collected']);
  for (const k of Object.keys(inputs)) {
    if (!allowed.has(k)) {
      errors.push({ field: k, message: `Campo desconocido: "${k}".` });
    }
  }

  for (const field of ['strike', 'premium_collected']) {
    if (!(field in inputs)) {
      errors.push({ field, message: `Campo obligatorio faltante: "${field}".` });
      continue;
    }
    const val = inputs[field];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      errors.push({ field, message: `El campo "${field}" debe ser un número finito válido.` });
      continue;
    }
    if (field === 'strike' && val <= 0) {
      errors.push({ field: 'strike', message: 'El strike debe ser estrictamente positivo (> 0).' });
    }
    if (field === 'premium_collected' && val < 0) {
      errors.push({ field: 'premium_collected', message: 'La prima cobrada (premium_collected) no puede ser negativa (>= 0).' });
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Calcula el costo base por acción para The Wheel.
 * @param {{ strike: number, premium_collected: number }} inputs
 * @returns {{ strategy: 'the_wheel', cost_basis_per_share: number }}
 */
export function calculateWheelCostBasis(inputs) {
  const costBasis = inputs.strike - inputs.premium_collected;
  if (!Number.isFinite(costBasis)) {
    const err = new Error('El resultado numérico excede los límites representables.');
    err.code = 'NUMERIC_RANGE_ERROR';
    throw err;
  }
  return {
    strategy: 'the_wheel',
    cost_basis_per_share: costBasis
  };
}

/**
 * Valida los parámetros para PMCC (Poor Man's Covered Call).
 * @param {Record<string, unknown>} inputs
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }> }}
 */
export function validatePmccInputs(inputs) {
  const errors = [];
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'El cuerpo de la solicitud debe ser un objeto JSON válido.' }]
    };
  }

  const allowed = new Set(['stock_price', 'leaps_premium']);
  for (const k of Object.keys(inputs)) {
    if (!allowed.has(k)) {
      errors.push({ field: k, message: `Campo desconocido: "${k}".` });
    }
  }

  for (const field of ['stock_price', 'leaps_premium']) {
    if (!(field in inputs)) {
      errors.push({ field, message: `Campo obligatorio faltante: "${field}".` });
      continue;
    }
    const val = inputs[field];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      errors.push({ field, message: `El campo "${field}" debe ser un número finito válido.` });
      continue;
    }
    if (val <= 0) {
      errors.push({ field, message: `El campo "${field}" debe ser estrictamente positivo (> 0).` });
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Calcula la comparación de capital y porcentaje de ahorro para PMCC.
 * @param {{ stock_price: number, leaps_premium: number }} inputs
 * @returns {{
 *   strategy: 'pmcc',
 *   contract_size: 100,
 *   stock_capital: number,
 *   leaps_capital: number,
 *   capital_saved: number,
 *   savings_percent: number
 * }}
 */
export function calculatePmccSavings(inputs) {
  const contractSize = 100;
  const stockCapital = contractSize * inputs.stock_price;
  const leapsCapital = contractSize * inputs.leaps_premium;
  const capitalSaved = stockCapital - leapsCapital;
  const savingsPercent = (100 * capitalSaved) / stockCapital;

  const vals = [stockCapital, leapsCapital, capitalSaved, savingsPercent];
  if (vals.some(v => !Number.isFinite(v))) {
    const err = new Error('El resultado numérico excede los límites representables.');
    err.code = 'NUMERIC_RANGE_ERROR';
    throw err;
  }

  return {
    strategy: 'pmcc',
    contract_size: contractSize,
    stock_capital: stockCapital,
    leaps_capital: leapsCapital,
    capital_saved: capitalSaved,
    savings_percent: savingsPercent
  };
}

