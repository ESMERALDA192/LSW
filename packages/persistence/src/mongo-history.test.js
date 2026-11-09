import { describe, it, expect, vi } from 'vitest';
import { createMongoHistoryRepository } from './mongo-history.js';

// FIC: Offline tests for Task 3.2 - MongoDB History adapter with mock client.
// FIC: Pruebas offline para la Tarea 3.2 - Adaptador de historial MongoDB con cliente simulado.

describe('Adaptador de historial MongoDB (pruebas offline)', () => {
  const sampleHistory = {
    id: 'b1ffcd88-8b1a-4ef8-bb6d-6bb9bd380b22',
    operation: 'call',
    inputs: {
      spot: 100,
      strike: 100,
      time_years: 1,
      rate: 0.05,
      volatility: 0.2
    },
    result: {
      option_type: 'call',
      theoretical_price: 10.4505835722,
      model: 'black_scholes_merton'
    }
  };

  it('persiste un nuevo cálculo histórico con _id mapeado a id y calculation_version=1', async () => {
    const memory = new Map();
    const fakeCollection = {
      findOne: vi.fn(async (query) => memory.get(query._id) || null),
      insertOne: vi.fn(async (doc) => {
        memory.set(doc._id, doc);
        return { acknowledged: true, insertedId: doc._id };
      })
    };
    const fakeDb = {
      collection: vi.fn(() => fakeCollection),
      command: vi.fn(async () => ({ ok: 1 }))
    };
    const fakeClient = {
      db: vi.fn(() => fakeDb),
      connect: vi.fn(async () => {})
    };

    const repo = createMongoHistoryRepository({ client: fakeClient, dbName: 'diana_demo' });
    const res = await repo.saveHistory(sampleHistory);

    expect(res.status).toBe('created');
    expect(res.item.id).toBe(sampleHistory.id);
    expect(res.item.calculation_version).toBe('1');
    expect(res.item.operation).toBe('call');
    expect(res.item.result).toEqual(sampleHistory.result);
    expect(res.item).toHaveProperty('created_at');
  });

  it('permite reintento idempotente con el mismo id y misma operación/entradas', async () => {
    const memory = new Map();
    const existingDoc = {
      _id: sampleHistory.id,
      operation: sampleHistory.operation,
      inputs: sampleHistory.inputs,
      result: sampleHistory.result,
      calculation_version: '1',
      created_at: '2026-11-09T18:00:00.000Z'
    };
    memory.set(sampleHistory.id, existingDoc);

    const fakeCollection = {
      findOne: vi.fn(async (query) => memory.get(query._id) || null)
    };
    const fakeDb = { collection: vi.fn(() => fakeCollection) };
    const fakeClient = { db: vi.fn(() => fakeDb) };

    const repo = createMongoHistoryRepository({ client: fakeClient, dbName: 'diana_demo' });
    const res = await repo.saveHistory(sampleHistory);

    expect(res.status).toBe('existing');
    expect(res.item.id).toBe(sampleHistory.id);
  });

  it('lanza ID_CONFLICT si el ID ya existe con diferente operación o entradas', async () => {
    const memory = new Map();
    const existingDoc = {
      _id: sampleHistory.id,
      operation: 'put', // operación distinta
      inputs: sampleHistory.inputs,
      result: sampleHistory.result,
      calculation_version: '1',
      created_at: '2026-11-09T18:00:00.000Z'
    };
    memory.set(sampleHistory.id, existingDoc);

    const fakeCollection = {
      findOne: vi.fn(async (query) => memory.get(query._id) || null)
    };
    const fakeDb = { collection: vi.fn(() => fakeCollection) };
    const fakeClient = { db: vi.fn(() => fakeDb) };

    const repo = createMongoHistoryRepository({ client: fakeClient, dbName: 'diana_demo' });
    await expect(repo.saveHistory(sampleHistory)).rejects.toMatchObject({
      code: 'ID_CONFLICT'
    });
  });

  it('lista históricos mapeando _id a id ordenados por created_at e id descendente', async () => {
    const docs = [
      { _id: '2', operation: 'put', inputs: {}, result: {}, calculation_version: '1', created_at: '2026-11-09T18:01:00.000Z' },
      { _id: '1', operation: 'call', inputs: {}, result: {}, calculation_version: '1', created_at: '2026-11-09T18:00:00.000Z' }
    ];

    const fakeCollection = {
      find: vi.fn(() => ({
        sort: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(async () => docs)
          }))
        }))
      }))
    };
    const fakeDb = { collection: vi.fn(() => fakeCollection) };
    const fakeClient = { db: vi.fn(() => fakeDb) };

    const repo = createMongoHistoryRepository({ client: fakeClient, dbName: 'diana_demo' });
    const res = await repo.listHistory();

    expect(res.items).toHaveLength(2);
    expect(res.items[0].id).toBe('2');
    expect(res.items[0]).not.toHaveProperty('_id');
  });

  it('informa not_configured si falta la URI de MongoDB', async () => {
    const repo = createMongoHistoryRepository({ uri: null });
    const status = await repo.checkStatus();
    expect(status).toBe('not_configured');
  });

  it('lanza STORAGE_UNAVAILABLE en caso de fallo de red o caída de MongoDB', async () => {
    const failingDb = {
      collection: vi.fn(() => {
        throw new Error('Connection refused to Mongo cluster');
      })
    };
    const repo = createMongoHistoryRepository({ client: { db: () => failingDb } });
    await expect(repo.saveHistory(sampleHistory)).rejects.toMatchObject({
      code: 'STORAGE_UNAVAILABLE'
    });
  });
});

