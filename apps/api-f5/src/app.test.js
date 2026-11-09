import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

// FIC: HTTP Contract Tests for API F5 (The Wheel and PMCC).
// FIC: Pruebas de contrato HTTP para la API F5 (The Wheel y PMCC).

describe('API F5 - Rutas de estrategias cuantitativas', () => {
  it('GET /health responde estado OK sin exponer configuración', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ service: 'f5', status: 'ok' });
  });

  it('POST /f5/the-wheel/cost-basis calcula costo base con el ejemplo del profesor', async () => {
    const res = await request(app)
      .post('/f5/the-wheel/cost-basis')
      .send({ strike: 490, premium_collected: 4.5 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      strategy: 'the_wheel',
      cost_basis_per_share: 485.5
    });
  });

  it('POST /f5/pmcc/capital-savings compara capital con el ejemplo del profesor', async () => {
    const res = await request(app)
      .post('/f5/pmcc/capital-savings')
      .send({ stock_price: 500, leaps_premium: 85 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      strategy: 'pmcc',
      contract_size: 100,
      stock_capital: 50000,
      leaps_capital: 8500,
      capital_saved: 41500,
      savings_percent: 83
    });
  });

  it('rechaza entradas inválidas en The Wheel con HTTP 422 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/f5/the-wheel/cost-basis')
      .send({ strike: -10, premium_collected: 4.5 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'strike' })])
    );
  });

  it('rechaza campos desconocidos en PMCC con HTTP 422 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/f5/pmcc/capital-savings')
      .send({ stock_price: 500, leaps_premium: 85, extra_param: 'test' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'extra_param' })])
    );
  });

  it('rechaza JSON mal formado con HTTP 400 INVALID_JSON', async () => {
    const res = await request(app)
      .post('/f5/the-wheel/cost-basis')
      .set('Content-Type', 'application/json')
      .send('{ strike: 490, bad-json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
    expect(res.body.error.details).toEqual([]);
  });
});

