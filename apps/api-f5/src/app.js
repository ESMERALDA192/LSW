// FIC: API F5 - Quantitative complex strategies (The Wheel & PMCC).
// FIC: API F5 - Estrategias cuantitativas complejas (The Wheel y PMCC).

import express from 'express';
import {
  validateWheelInputs,
  calculateWheelCostBasis,
  validatePmccInputs,
  calculatePmccSavings
} from '@diana/domain';

export const app = express();
app.disable('x-powered-by');

// Middleware para JSON con manejo seguro de sintaxis inválida
app.use(express.json());
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'El cuerpo de la solicitud no es un JSON válido.',
        details: []
      }
    });
  }
  next(err);
});

// Endpoint de diagnóstico del proceso
app.get('/health', (_req, res) => {
  res.status(200).json({ service: 'f5', status: 'ok' });
});

// Endpoint raíz informativo
app.get('/', (_req, res) => {
  res.json({ service: 'f5', status: 'ready', message: 'API F5 Estrategias Cuantitativas en ejecución.' });
});

// POST /f5/the-wheel/cost-basis
app.post('/f5/the-wheel/cost-basis', (req, res, next) => {
  try {
    const validation = validateWheelInputs(req.body);
    if (!validation.isValid) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los parámetros proporcionados para The Wheel no cumplen las reglas de validación.',
          details: validation.errors
        }
      });
    }

    const result = calculateWheelCostBasis(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /f5/pmcc/capital-savings
app.post('/f5/pmcc/capital-savings', (req, res, next) => {
  try {
    const validation = validatePmccInputs(req.body);
    if (!validation.isValid) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los parámetros proporcionados para PMCC no cumplen las reglas de validación.',
          details: validation.errors
        }
      });
    }

    const result = calculatePmccSavings(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Middleware centralizado de errores seguros (sin stack traces)
app.use((err, _req, res, _next) => {
  if (err.code === 'NUMERIC_RANGE_ERROR') {
    return res.status(422).json({
      error: {
        code: 'NUMERIC_RANGE_ERROR',
        message: err.message,
        details: []
      }
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado al procesar la estrategia financiera.',
      details: []
    }
  });
});
