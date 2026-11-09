// FIC: Strict input validation for quantitative calculations (F0/F5).
// FIC: Validación estricta de entradas para cálculos cuantitativos (F0/F5).

const F0_REQUIRED_FIELDS = ['spot', 'strike', 'time_years', 'rate', 'volatility'];

/**
 * Valida los parámetros requeridos para cálculos F0 (Black-Scholes y Griegas).
 * @param {Record<string, unknown>} inputs
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }> }}
 */
export function validateF0Inputs(inputs) {
  const errors = [];

  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'El cuerpo de la solicitud debe ser un objeto JSON válido.' }]
    };
  }

  // Comprobar campos desconocidos
  const allowedKeys = new Set(F0_REQUIRED_FIELDS);
  for (const key of Object.keys(inputs)) {
    if (!allowedKeys.has(key)) {
      errors.push({
        field: key,
        message: `Campo desconocido o no permitido: "${key}".`
      });
    }
  }

  // Comprobar campos obligatorios y sus dominios numéricos
  for (const field of F0_REQUIRED_FIELDS) {
    if (!(field in inputs)) {
      errors.push({
        field,
        message: `El campo obligatorio "${field}" no fue proporcionado.`
      });
      continue;
    }

    const value = inputs[field];

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push({
        field,
        message: `El campo "${field}" debe ser un número finito válido.`
      });
      continue;
    }

    // Reglas específicas de dominio financiero
    if (field === 'spot' && value <= 0) {
      errors.push({
        field: 'spot',
        message: 'El precio subyacente (spot) debe ser estrictamente positivo (> 0).'
      });
    }

    if (field === 'strike' && value <= 0) {
      errors.push({
        field: 'strike',
        message: 'El precio de ejercicio (strike) debe ser estrictamente positivo (> 0).'
      });
    }

    if (field === 'time_years' && value < 0) {
      errors.push({
        field: 'time_years',
        message: 'El tiempo hasta el vencimiento en años (time_years) no puede ser negativo (>= 0).'
      });
    }

    if (field === 'volatility' && value <= 0) {
      errors.push({
        field: 'volatility',
        message: 'La volatilidad (volatility) debe ser estrictamente positiva (> 0).'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

