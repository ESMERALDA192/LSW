import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

// FIC: HTTP Contract Tests for API F0 including Scenarios, History and Storage Status.
// FIC: Pruebas de contrato HTTP para API F0 incluyendo Escenarios, Historial y Diagnóstico de Almacenamiento.

describe('API F0 - Rutas cuantitativas y contratos HTTP', () => {
  const validInputs = {
    spot: 100,
    strike: 100,
    time_years: 1,
    rate: 0.05,
    volatility: 0.2
  };

  // Mock repos para pruebas determinísticas offline
  const memoryScenarios = new Map();
  const mockScenariosRepo = {
    saveScenario: vi.fn(async (scenario) => {
      const existing = memoryScenarios.get(scenario.id);
      if (existing) {
        if (existing.name === scenario.name && JSON.stringify(existing.parameters) === JSON.stringify(scenario.parameters)) {
          return { status: 'existing', scenario: existing };
        }
        const err = new Error('Conflicto de ID');
        err.code = 'ID_CONFLICT';
        throw err;
      }
      const created = { ...scenario, created_at: '2026-11-09T18:00:00.000Z' };
      memoryScenarios.set(scenario.id, created);
      return { status: 'created', scenario: created };
    }),
    listScenarios: vi.fn(async () => ({ items: Array.from(memoryScenarios.values()) })),
    checkStatus: vi.fn(async () => 'ready')
  };

  const memoryHistory = new Map();
  const mockHistoryRepo = {
    saveHistory: vi.fn(async (record) => {
      const existing = memoryHistory.get(record.id);
      if (existing) {
        if (existing.operation === record.operation && JSON.stringify(existing.inputs) === JSON.stringify(record.inputs)) {
          return { status: 'existing', item: existing };
        }
        const err = new Error('Conflicto de ID en historial');
        err.code = 'ID_CONFLICT';
        throw err;
      }
      const created = {
        id: record.id,
        operation: record.operation,
        inputs: record.inputs,
        result: record.result,
        calculation_version: '1',
        created_at: '2026-11-09T18:00:00.000Z'
      };
      memoryHistory.set(record.id, created);
      return { status: 'created', item: created };
    }),
    listHistory: vi.fn(async () => ({ items: Array.from(memoryHistory.values()) })),
    checkStatus: vi.fn(async () => 'ready')
  };

  const testApp = createApp({
    scenariosRepo: mockScenariosRepo,
    historyRepo: mockHistoryRepo
  });

  it('GET /health responde estado OK sin exponer configuración', async () => {
    const res = await request(testApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ service: 'f0', status: 'ok' });
  });

  it('GET /storage/status informa estado de los dos almacenamientos', async () => {
    const res = await request(testApp).get('/storage/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      supabase: { status: 'ready' },
      mongodb: { status: 'ready' }
    });
  });

  it('POST /f0/black-scholes/call calcula precio teórico de Call', async () => {
    const res = await request(testApp)
      .post('/f0/black-scholes/call')
      .send(validInputs);

    expect(res.status).toBe(200);
    expect(res.body.option_type).toBe('call');
    expect(res.body.model).toBe('black_scholes_merton');
    expect(Math.abs(res.body.theoretical_price - 10.4505835722)).toBeLessThan(0.00001);
  });

  it('POST /f0/black-scholes/put calcula precio teórico de Put', async () => {
    const res = await request(testApp)
      .post('/f0/black-scholes/put')
      .send(validInputs);

    expect(res.status).toBe(200);
    expect(res.body.option_type).toBe('put');
    expect(res.body.model).toBe('black_scholes_merton');
    expect(Math.abs(res.body.theoretical_price - 5.5735260223)).toBeLessThan(0.00001);
  });

  it('POST /f0/greeks devuelve sensibilidades completas y unidades', async () => {
    const res = await request(testApp)
      .post('/f0/greeks')
      .send(validInputs);

    expect(res.status).toBe(200);
    expect(res.body.model).toBe('black_scholes_merton');
    expect(res.body.units).toEqual({
      delta: 'per_underlying_unit',
      gamma: 'delta_per_underlying_unit',
      theta: 'per_calendar_day_365',
      vega: 'per_volatility_percentage_point'
    });
  });

  it('POST /scenarios guarda un escenario nuevo (201) y permite reintento idempotente (200)', async () => {
    const payload = {
      id: 'c1111111-1111-4111-8111-111111111111',
      name: 'Escenario 1',
      parameters: validInputs
    };

    const res1 = await request(testApp).post('/scenarios').send(payload);
    expect(res1.status).toBe(201);
    expect(res1.body.id).toBe(payload.id);
    expect(res1.body.name).toBe('Escenario 1');
    expect(res1.body.created_at).toBe('2026-11-09T18:00:00.000Z');

    // Reintento idempotente idéntico
    const res2 = await request(testApp).post('/scenarios').send(payload);
    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(payload.id);

    // Mismo ID pero diferente nombre -> 409 ID_CONFLICT
    const resConflict = await request(testApp).post('/scenarios').send({
      ...payload,
      name: 'Nombre Cambiado'
    });
    expect(resConflict.status).toBe(409);
    expect(resConflict.body.error.code).toBe('ID_CONFLICT');
  });

  it('GET /scenarios devuelve lista de escenarios guardados', async () => {
    const res = await request(testApp).get('/scenarios');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /history recalcula en el backend y persiste el histórico sin aceptar result del cliente', async () => {
    // 1. Intento de enviar result manipulado -> 422 VALIDATION_ERROR
    const manipulated = {
      id: 'd2222222-2222-4222-8222-222222222222',
      operation: 'call',
      inputs: validInputs,
      result: { theoretical_price: 999999 } // Manipulación
    };
    const resManipulated = await request(testApp).post('/history').send(manipulated);
    expect(resManipulated.status).toBe(422);
    expect(resManipulated.body.error.code).toBe('VALIDATION_ERROR');

    // 2. Solicitud legítima -> el backend recalcula
    const legitimate = {
      id: 'd2222222-2222-4222-8222-222222222222',
      operation: 'call',
      inputs: validInputs
    };
    const resCreated = await request(testApp).post('/history').send(legitimate);
    expect(resCreated.status).toBe(201);
    expect(resCreated.body.id).toBe(legitimate.id);
    expect(resCreated.body.operation).toBe('call');
    expect(resCreated.body.calculation_version).toBe('1');
    expect(Math.abs(resCreated.body.result.theoretical_price - 10.4505835722)).toBeLessThan(0.00001);

    // 3. Reintento idempotente -> 200
    const resRetry = await request(testApp).post('/history').send(legitimate);
    expect(resRetry.status).toBe(200);
  });

  it('GET /history devuelve la lista de cálculos guardados', async () => {
    const res = await request(testApp).get('/history');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
  });
});
