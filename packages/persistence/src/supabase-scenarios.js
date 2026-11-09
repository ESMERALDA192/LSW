// FIC: Supabase persistence adapter for quantitative F0 scenarios.
// FIC: Adaptador de persistencia en Supabase para escenarios cuantitativos F0.

import { createClient } from '@supabase/supabase-js';

function areF0ParametersEqual(p1, p2) {
  if (!p1 || !p2) return false;
  const fields = ['spot', 'strike', 'time_years', 'rate', 'volatility'];
  return fields.every(f => p1[f] === p2[f]);
}

/**
 * Crea una instancia del repositorio de escenarios de Supabase.
 * @param {{ url?: string | null, key?: string | null, client?: any }} options
 */
export function createSupabaseScenariosRepository(options = {}) {
  let client = options.client || null;
  const url = options.url || null;
  const key = options.key || null;

  if (!client && url && key) {
    client = createClient(url, key, {
      auth: { persistSession: false }
    });
  }

  function ensureClient() {
    if (!client) {
      const err = new Error('El servicio de Supabase no se encuentra configurado.');
      err.code = 'STORAGE_UNAVAILABLE';
      throw err;
    }
    return client;
  }

  return {
    /**
     * Guarda un escenario cuantitativo F0 garantizando idempotencia por UUID.
     * @param {{ id: string, name: string, parameters: Record<string, number> }} scenario
     * @returns {Promise<{ status: 'created' | 'existing', scenario: any }>}
     */
    async saveScenario(scenario) {
      const cli = ensureClient();
      const trimmedName = scenario.name.trim();

      try {
        // 1. Verificar si ya existe un registro con ese ID
        const { data: existing, error: findError } = await cli
          .from('scenarios')
          .select('id, name, parameters, created_at')
          .eq('id', scenario.id)
          .limit(1)
          .maybeSingle();

        if (findError) {
          const err = new Error('Error al consultar el escenario existente en Supabase.');
          err.code = 'STORAGE_UNAVAILABLE';
          throw err;
        }

        if (existing) {
          // Reintento idempotente: verificar si el contenido es idéntico
          const sameName = existing.name === trimmedName;
          const sameParams = areF0ParametersEqual(existing.parameters, scenario.parameters);

          if (sameName && sameParams) {
            return {
              status: 'existing',
              scenario: existing
            };
          }

          const conflictErr = new Error(`El escenario con id ${scenario.id} ya existe pero con parámetros o nombre diferente.`);
          conflictErr.code = 'ID_CONFLICT';
          throw conflictErr;
        }

        // 2. Insertar nuevo escenario
        const { data: inserted, error: insertError } = await cli
          .from('scenarios')
          .insert({
            id: scenario.id,
            name: trimmedName,
            parameters: scenario.parameters
          })
          .select('id, name, parameters, created_at')
          .single();

        if (insertError) {
          const err = new Error('Error al insertar el nuevo escenario en Supabase.');
          err.code = 'STORAGE_UNAVAILABLE';
          throw err;
        }

        return {
          status: 'created',
          scenario: inserted
        };
      } catch (err) {
        if (err.code === 'ID_CONFLICT') {
          throw err;
        }
        const storageErr = new Error('El servicio de almacenamiento Supabase no se encuentra disponible.');
        storageErr.code = 'STORAGE_UNAVAILABLE';
        throw storageErr;
      }
    },

    /**
     * Lista los últimos escenarios guardados ordenados por created_at desc e id desc.
     * @param {{ limit?: number }} [options]
     * @returns {Promise<{ items: any[] }>}
     */
    async listScenarios({ limit = 50 } = {}) {
      const cli = ensureClient();
      try {
        const { data, error } = await cli
          .from('scenarios')
          .select('id, name, parameters, created_at')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(limit);

        if (error) {
          const err = new Error('Error al recuperar escenarios de Supabase.');
          err.code = 'STORAGE_UNAVAILABLE';
          throw err;
        }

        return { items: data || [] };
      } catch (err) {
        const storageErr = new Error('El servicio de almacenamiento Supabase no se encuentra disponible.');
        storageErr.code = 'STORAGE_UNAVAILABLE';
        throw storageErr;
      }
    },

    /**
     * Diagnostica el estado de conectividad con Supabase.
     * @returns {Promise<'ready' | 'not_configured' | 'unavailable'>}
     */
    async checkStatus() {
      if (!client && (!url || !key)) {
        return 'not_configured';
      }
      try {
        const cli = ensureClient();
        const { error } = await cli.from('scenarios').select('id').limit(1);
        if (error) return 'unavailable';
        return 'ready';
      } catch {
        return 'unavailable';
      }
    }
  };
}

