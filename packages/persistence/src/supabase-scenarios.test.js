import { describe, it, expect, vi } from 'vitest';
import { createSupabaseScenariosRepository } from './supabase-scenarios.js';

// FIC: Offline tests for Task 3.1 - Supabase Scenarios adapter with mock client.
// FIC: Pruebas offline para la Tarea 3.1 - Adaptador de escenarios Supabase con cliente simulado.

describe('Adaptador de escenarios Supabase (pruebas offline)', () => {
  const sampleScenario = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Escenario Base AAPL',
    parameters: {
      spot: 150,
      strike: 150,
      time_years: 0.5,
      rate: 0.04,
      volatility: 0.25
    }
  };

  it('guarda un nuevo escenario y devuelve created_at generado', async () => {
    const memory = new Map();
    const fakeClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn((field, val) => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(async () => {
                const found = memory.get(val);
                return { data: found || null, error: null };
              })
            }))
          }))
        })),
        insert: vi.fn((item) => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => {
              const record = { ...item, created_at: '2026-11-09T18:00:00.000Z' };
              memory.set(item.id, record);
              return { data: record, error: null };
            })
          }))
        }))
      }))
    };

    const repo = createSupabaseScenariosRepository({ client: fakeClient });
    const result = await repo.saveScenario(sampleScenario);

    expect(result.status).toBe('created');
    expect(result.scenario.id).toBe(sampleScenario.id);
    expect(result.scenario.name).toBe(sampleScenario.name);
    expect(result.scenario.created_at).toBe('2026-11-09T18:00:00.000Z');
  });

  it('permite reintento idempotente con el mismo ID y mismos datos (devuelve existing)', async () => {
    const memory = new Map();
    memory.set(sampleScenario.id, {
      ...sampleScenario,
      created_at: '2026-11-09T18:00:00.000Z'
    });

    const fakeClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn((_field, val) => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: memory.get(val) || null,
                error: null
              }))
            }))
          }))
        }))
      }))
    };

    const repo = createSupabaseScenariosRepository({ client: fakeClient });
    const result = await repo.saveScenario(sampleScenario);

    expect(result.status).toBe('existing');
    expect(result.scenario.id).toBe(sampleScenario.id);
  });

  it('lanza ID_CONFLICT si se intenta reusar el ID con diferente contenido', async () => {
    const memory = new Map();
    memory.set(sampleScenario.id, {
      ...sampleScenario,
      name: 'Otro nombre diferente',
      created_at: '2026-11-09T18:00:00.000Z'
    });

    const fakeClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn((_field, val) => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: memory.get(val) || null,
                error: null
              }))
            }))
          }))
        }))
      }))
    };

    const repo = createSupabaseScenariosRepository({ client: fakeClient });
    await expect(repo.saveScenario(sampleScenario)).rejects.toMatchObject({
      code: 'ID_CONFLICT'
    });
  });

  it('informa not_configured si no se configuró URL o clave', async () => {
    const repo = createSupabaseScenariosRepository({ url: null, key: null });
    const status = await repo.checkStatus();
    expect(status).toBe('not_configured');
  });

  it('lanza STORAGE_UNAVAILABLE en caso de fallo o timeout de la base', async () => {
    const failingClient = {
      from: vi.fn(() => {
        throw new Error('Network timeout connecting to Supabase');
      })
    };
    const repo = createSupabaseScenariosRepository({ client: failingClient });
    await expect(repo.saveScenario(sampleScenario)).rejects.toMatchObject({
      code: 'STORAGE_UNAVAILABLE'
    });
  });
});

