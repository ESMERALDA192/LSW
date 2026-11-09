// FIC: API F0 - Quantitative calculations and persistent records.
// FIC: API F0 - Cálculos cuantitativos y persistencia de registros.

import express from 'express';
import {
  validateF0Inputs,
  calculateBlackScholes,
  calculateGreeks,
  validateWheelInputs,
  calculateWheelCostBasis,
  validatePmccInputs,
  calculatePmccSavings
} from '@diana/domain';
import {
  createSupabaseScenariosRepository,
  createMongoHistoryRepository
} from '@diana/persistence';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createApp(options = {}) {
  const app = express();
  app.disable('x-powered-by');

  // Repositorios inyectables o derivados del entorno
  const scenariosRepo = options.scenariosRepo || createSupabaseScenariosRepository({
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  });

  const historyRepo = options.historyRepo || createMongoHistoryRepository({
    uri: process.env.MONGODB_URI || process.env.MONGO_URI,
    dbName: process.env.MONGODB_DB_NAME || 'diana_demo'
  });

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
    res.status(200).json({ service: 'f0', status: 'ok' });
  });

  // Endpoint de diagnóstico de almacenamiento (sin exponer credenciales)
  app.get('/storage/status', async (_req, res) => {
    try {
      const [supabaseStatus, mongoStatus] = await Promise.all([
        scenariosRepo.checkStatus(),
        historyRepo.checkStatus()
      ]);
      return res.status(200).json({
        supabase: { status: supabaseStatus },
        mongodb: { status: mongoStatus }
      });
    } catch {
      return res.status(200).json({
        supabase: { status: 'unavailable' },
        mongodb: { status: 'unavailable' }
      });
    }
  });

  // Endpoint raíz informativo
  app.get('/', (_req, res) => {
    res.json({ service: 'f0', status: 'ready', message: 'API F0 Núcleo Cuantitativo en ejecución.' });
  });

  // POST /f0/black-scholes/call
  app.post('/f0/black-scholes/call', (req, res, next) => {
    try {
      const validation = validateF0Inputs(req.body);
      if (!validation.isValid) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Los parámetros proporcionados no cumplen las reglas de validación.',
            details: validation.errors
          }
        });
      }

      const result = calculateBlackScholes(req.body);
      return res.status(200).json({
        option_type: 'call',
        theoretical_price: result.call_price,
        model: result.model
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /f0/black-scholes/put
  app.post('/f0/black-scholes/put', (req, res, next) => {
    try {
      const validation = validateF0Inputs(req.body);
      if (!validation.isValid) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Los parámetros proporcionados no cumplen las reglas de validación.',
            details: validation.errors
          }
        });
      }

      const result = calculateBlackScholes(req.body);
      return res.status(200).json({
        option_type: 'put',
        theoretical_price: result.put_price,
        model: result.model
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /f0/greeks
  app.post('/f0/greeks', (req, res, next) => {
    try {
      const validation = validateF0Inputs(req.body);
      if (!validation.isValid) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Los parámetros proporcionados no cumplen las reglas de validación.',
            details: validation.errors
          }
        });
      }

      if (req.body.time_years === 0) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El cálculo de sensibilidades (griegas) exige un tiempo hasta el vencimiento estrictamente positivo (time_years > 0).',
            details: [
              {
                field: 'time_years',
                message: 'El tiempo hasta el vencimiento debe ser estrictamente mayor que cero (> 0).'
              }
            ]
          }
        });
      }

      const result = calculateGreeks(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // POST /scenarios
  app.post('/scenarios', async (req, res, next) => {
    try {
      const body = req.body;
      const errors = [];

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El cuerpo debe ser un objeto JSON válido.',
            details: [{ field: 'body', message: 'Cuerpo no válido.' }]
          }
        });
      }

      const allowedKeys = new Set(['id', 'name', 'parameters']);
      for (const k of Object.keys(body)) {
        if (!allowedKeys.has(k)) {
          errors.push({ field: k, message: `Campo desconocido: "${k}".` });
        }
      }

      if (!body.id || typeof body.id !== 'string' || !UUID_REGEX.test(body.id)) {
        errors.push({ field: 'id', message: 'El id debe ser un UUID válido.' });
      }

      if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1 || body.name.trim().length > 80) {
        errors.push({ field: 'name', message: 'El nombre debe tener entre 1 y 80 caracteres después de quitar espacios.' });
      }

      const paramValidation = validateF0Inputs(body.parameters);
      if (!paramValidation.isValid) {
        for (const e of paramValidation.errors) {
          errors.push({ field: `parameters.${e.field}`, message: e.message });
        }
      }

      if (errors.length > 0) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La solicitud de escenario contiene errores de validación.',
            details: errors
          }
        });
      }

      const saveResult = await scenariosRepo.saveScenario({
        id: body.id,
        name: body.name.trim(),
        parameters: body.parameters
      });

      const statusCode = saveResult.status === 'created' ? 201 : 200;
      return res.status(statusCode).json(saveResult.scenario);
    } catch (error) {
      next(error);
    }
  });

  // GET /scenarios
  app.get('/scenarios', async (_req, res, next) => {
    try {
      const result = await scenariosRepo.listScenarios();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // POST /history
  app.post('/history', async (req, res, next) => {
    try {
      const body = req.body;
      const errors = [];

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El cuerpo debe ser un objeto JSON válido.',
            details: [{ field: 'body', message: 'Cuerpo no válido.' }]
          }
        });
      }

      // Prohibir explícitamente enviar "result" manipulado o campos desconocidos
      if ('result' in body) {
        errors.push({
          field: 'result',
          message: 'No se permite incluir resultados calculados por el cliente (result).'
        });
      }

      const allowedKeys = new Set(['id', 'operation', 'inputs']);
      for (const k of Object.keys(body)) {
        if (!allowedKeys.has(k) && k !== 'result') {
          errors.push({ field: k, message: `Campo desconocido: "${k}".` });
        }
      }

      if (!body.id || typeof body.id !== 'string' || !UUID_REGEX.test(body.id)) {
        errors.push({ field: 'id', message: 'El id debe ser un UUID válido.' });
      }

      const validOps = ['call', 'put', 'greeks', 'wheel', 'pmcc'];
      if (!body.operation || !validOps.includes(body.operation)) {
        errors.push({ field: 'operation', message: `Operación no válida. Debe ser una de: ${validOps.join(', ')}.` });
      }

      let calculatedResult = null;
      if (body.operation && validOps.includes(body.operation)) {
        if (body.operation === 'call' || body.operation === 'put') {
          const val = validateF0Inputs(body.inputs);
          if (!val.isValid) {
            for (const e of val.errors) errors.push({ field: `inputs.${e.field}`, message: e.message });
          } else {
            const bs = calculateBlackScholes(body.inputs);
            calculatedResult = {
              option_type: body.operation,
              theoretical_price: body.operation === 'call' ? bs.call_price : bs.put_price,
              model: bs.model
            };
          }
        } else if (body.operation === 'greeks') {
          const val = validateF0Inputs(body.inputs);
          if (!val.isValid) {
            for (const e of val.errors) errors.push({ field: `inputs.${e.field}`, message: e.message });
          } else if (body.inputs?.time_years === 0) {
            errors.push({ field: 'inputs.time_years', message: 'El cálculo de griegas exige tiempo positivo.' });
          } else {
            calculatedResult = calculateGreeks(body.inputs);
          }
        } else if (body.operation === 'wheel') {
          const val = validateWheelInputs(body.inputs);
          if (!val.isValid) {
            for (const e of val.errors) errors.push({ field: `inputs.${e.field}`, message: e.message });
          } else {
            calculatedResult = calculateWheelCostBasis(body.inputs);
          }
        } else if (body.operation === 'pmcc') {
          const val = validatePmccInputs(body.inputs);
          if (!val.isValid) {
            for (const e of val.errors) errors.push({ field: `inputs.${e.field}`, message: e.message });
          } else {
            calculatedResult = calculatePmccSavings(body.inputs);
          }
        }
      }

      if (errors.length > 0) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La solicitud de histórico contiene errores de validación.',
            details: errors
          }
        });
      }

      const saveResult = await historyRepo.saveHistory({
        id: body.id,
        operation: body.operation,
        inputs: body.inputs,
        result: calculatedResult
      });

      const statusCode = saveResult.status === 'created' ? 201 : 200;
      return res.status(statusCode).json(saveResult.item);
    } catch (error) {
      next(error);
    }
  });

  // GET /history
  app.get('/history', async (_req, res, next) => {
    try {
      const result = await historyRepo.listHistory();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // Middleware centralizado de errores seguros (sin stack traces)
  app.use((err, _req, res, _next) => {
    if (err.code === 'ID_CONFLICT') {
      return res.status(409).json({
        error: {
          code: 'ID_CONFLICT',
          message: err.message,
          details: []
        }
      });
    }

    if (err.code === 'STORAGE_UNAVAILABLE') {
      return res.status(503).json({
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: err.message || 'El servicio de persistencia no se encuentra disponible.',
          details: []
        }
      });
    }

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
        message: 'Ocurrió un error inesperado al procesar la solicitud.',
        details: []
      }
    });
  });

  return app;
}

export const app = createApp();
