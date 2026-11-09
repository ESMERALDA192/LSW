// FIC: MongoDB Atlas persistence adapter for calculation history.
// FIC: Adaptador de persistencia en MongoDB Atlas para histórico de cálculos.

import { MongoClient } from 'mongodb';

function areObjectsEqual(o1, o2) {
  if (o1 === o2) return true;
  if (!o1 || !o2 || typeof o1 !== 'object' || typeof o2 !== 'object') return false;
  const k1 = Object.keys(o1);
  const k2 = Object.keys(o2);
  if (k1.length !== k2.length) return false;
  return k1.every(k => o1[k] === o2[k]);
}

function mapDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id,
    ...rest
  };
}

/**
 * Crea una instancia del repositorio de histórico en MongoDB.
 * @param {{ uri?: string | null, dbName?: string, client?: any }} options
 */
export function createMongoHistoryRepository(options = {}) {
  let client = options.client || null;
  const uri = options.uri || null;
  const dbName = options.dbName || 'diana_demo';
  const COLLECTION_NAME = 'calculation_history';

  async function getDb() {
    if (!client) {
      if (!uri) {
        const err = new Error('El servicio de MongoDB no se encuentra configurado.');
        err.code = 'STORAGE_UNAVAILABLE';
        throw err;
      }
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      await client.connect();
    }
    return client.db(dbName);
  }

  return {
    /**
     * Persiste un resultado de cálculo verificado en MongoDB garantizando idempotencia.
     * @param {{ id: string, operation: string, inputs: any, result: any }} record
     * @returns {Promise<{ status: 'created' | 'existing', item: any }>}
     */
    async saveHistory(record) {
      try {
        const db = await getDb();
        const collection = db.collection(COLLECTION_NAME);

        // 1. Verificar si ya existe un registro con ese ID
        const existing = await collection.findOne({ _id: record.id });

        if (existing) {
          const sameOp = existing.operation === record.operation;
          const sameInputs = areObjectsEqual(existing.inputs, record.inputs);

          if (sameOp && sameInputs) {
            return {
              status: 'existing',
              item: mapDoc(existing)
            };
          }

          const conflictErr = new Error(`El registro histórico con id ${record.id} ya existe pero con operación o entradas diferentes.`);
          conflictErr.code = 'ID_CONFLICT';
          throw conflictErr;
        }

        // 2. Insertar nuevo documento histórico
        const doc = {
          _id: record.id,
          operation: record.operation,
          inputs: record.inputs,
          result: record.result,
          calculation_version: '1',
          created_at: new Date().toISOString()
        };

        await collection.insertOne(doc);

        return {
          status: 'created',
          item: mapDoc(doc)
        };
      } catch (err) {
        if (err.code === 'ID_CONFLICT') {
          throw err;
        }
        const storageErr = new Error('El servicio de almacenamiento MongoDB no se encuentra disponible.');
        storageErr.code = 'STORAGE_UNAVAILABLE';
        throw storageErr;
      }
    },

    /**
     * Lista los últimos históricos de cálculos ordenados por created_at desc e id desc.
     * @param {{ limit?: number }} [options]
     * @returns {Promise<{ items: any[] }>}
     */
    async listHistory({ limit = 50 } = {}) {
      try {
        const db = await getDb();
        const collection = db.collection(COLLECTION_NAME);
        const docs = await collection
          .find({})
          .sort({ created_at: -1, _id: -1 })
          .limit(limit)
          .toArray();

        return { items: docs.map(mapDoc) };
      } catch (err) {
        const storageErr = new Error('El servicio de almacenamiento MongoDB no se encuentra disponible.');
        storageErr.code = 'STORAGE_UNAVAILABLE';
        throw storageErr;
      }
    },

    /**
     * Diagnostica el estado de conectividad con MongoDB Atlas.
     * @returns {Promise<'ready' | 'not_configured' | 'unavailable'>}
     */
    async checkStatus() {
      if (!client && !uri) {
        return 'not_configured';
      }
      try {
        const db = await getDb();
        const ping = await db.command({ ping: 1 });
        if (ping && ping.ok === 1) return 'ready';
        return 'unavailable';
      } catch {
        return 'unavailable';
      }
    }
  };
}

