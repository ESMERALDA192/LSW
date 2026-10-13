// Repositorios de modelos para tablas PostgreSQL expuestas por Supabase.
// Reciben un cliente ya autenticado/configurado; no leen secretos ni crean conexiones aquí.
const definitions = require('./definitions');

class SupabaseModel {
  constructor(client, resource) {
    if (!client) throw new Error('Se requiere un cliente de Supabase');
    this.client = client;
    this.definition = definitions[resource];
    this.resource = resource;
    if (!this.definition) throw new Error(`Recurso no definido: ${resource}`);
  }
  table() { return this.client.from(this.definition.table); }
  async findAll({ page = 1, limit = 20, filters = {}, parentId } = {}) {
    let q = this.table().select('*').range((page - 1) * limit, page * limit - 1).order('createdAt', { ascending: true });
    if (this.definition.parent && parentId) q = q.eq(this.definition.parent.field, parentId);
    for (const [key, value] of Object.entries(filters)) if ([...this.definition.fields, ...(this.definition.parent ? [this.definition.parent.field] : [])].includes(key) && value !== undefined) q = q.eq(key, value);
    const { data, error } = await q; if (error) throw error; return data || [];
  }
  async findById(id, parentId) {
    let q = this.table().select('*').eq('id', id);
    if (this.definition.parent && parentId) q = q.eq(this.definition.parent.field, parentId);
    const { data, error } = await q.maybeSingle(); if (error) throw error; return data;
  }
  async create(values) {
    const payload = this.pick(values);
    const { data, error } = await this.table().insert(payload).select('*').single(); if (error) throw error; return data;
  }
  async createMany(values) {
    if (!Array.isArray(values) || values.length < 1 || values.length > 50) throw new Error('El lote debe contener de 1 a 50 objetos');
    const { data, error } = await this.table().insert(values.map(v => this.pick(v))).select('*'); if (error) throw error; return data || [];
  }
  async replace(id, values, parentId) {
    const payload = this.pick(values, true);
    let q = this.table().update(payload).eq('id', id);
    if (this.definition.parent && parentId) q = q.eq(this.definition.parent.field, parentId);
    const { data, error } = await q.select('*').maybeSingle(); if (error) throw error; return data;
  }
  async remove(id, parentId) {
    let q = this.table().delete().eq('id', id);
    if (this.definition.parent && parentId) q = q.eq(this.definition.parent.field, parentId);
    const { data, error } = await q.select('id').maybeSingle(); if (error) throw error; return data;
  }
  pick(values, includeNulls = false) {
    const allowed = [...this.definition.fields, ...(this.definition.parent ? [this.definition.parent.field] : [])];
    return Object.fromEntries(Object.entries(values || {}).filter(([k, v]) => allowed.includes(k) && (includeNulls || v !== undefined)));
  }
}
function createSupabaseModels(client) {
  return Object.fromEntries(Object.keys(definitions).map(resource => [resource, new SupabaseModel(client, resource)]));
}
module.exports = { SupabaseModel, createSupabaseModels };
