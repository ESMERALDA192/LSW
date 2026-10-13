const { models: mongoModels, schemas, definitions } = require('./mongo.models');
const { createSupabaseModels, SupabaseModel } = require('./supabase.models');
const { MongoNestedModel } = require('./mongo-nested.model');

// Punto único de acceso a modelos. La selección de base debe venir de la sesión validada,
// nunca de un header libre enviado por el cliente.
function createModels({ database, supabaseClient, mongooseConnection } = {}) {
  if (database === 'supabase') return createSupabaseModels(supabaseClient);
  if (database === 'mongodb') {
    if (mongooseConnection && mongooseConnection.readyState !== 1) throw new Error('MongoDB no está conectado');
    return { ...mongoModels, legs: new MongoNestedModel(mongoModels, 'legs'), rules: new MongoNestedModel(mongoModels, 'rules'), events: new MongoNestedModel(mongoModels, 'events'), adjustments: new MongoNestedModel(mongoModels, 'adjustments') };
  }
  throw new Error('La base debe ser supabase o mongodb');
}
module.exports = { createModels, mongoModels, schemas, definitions, SupabaseModel, createSupabaseModels, MongoNestedModel };
