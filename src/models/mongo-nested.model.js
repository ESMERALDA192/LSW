// Modelo/repositorio para CRUD individual y por lote de subdocumentos MongoDB.
const { randomUUID } = require('crypto');
const parentConfig = {
  legs: { model: 'positions', array: 'legs', parentField: 'positionId' },
  rules: { model: 'systems', array: 'rules', parentField: 'systemId' },
  events: { model: 'systems', array: 'events', parentField: 'systemId' },
  adjustments: { model: 'rebalanceProposals', array: 'adjustments', parentField: 'proposalId' }
};
class MongoNestedModel {
  constructor(models, resource) {
    this.models = models;
    this.resource = resource;
    this.config = parentConfig[resource];
    if (!this.config) throw new Error(`Subdocumento no definido: ${resource}`);
  }
  async parent(parentId) { return this.models[this.config.model].findOne({ id: parentId }); }
  async findAll(parentId) {
    const p = await this.parent(parentId); if (!p) return null;
    return p[this.config.array] || [];
  }
  async findById(parentId, childId) {
    const items = await this.findAll(parentId); if (!items) return null;
    return items.find(x => x.id === childId) || null;
  }
  async create(parentId, values) {
    const p = await this.parent(parentId); if (!p) return null;
    p[this.config.array].push({ ...values, id: values.id || randomUUID() }); await p.save();
    return p[this.config.array].find(x => x.id === (values.id || p[this.config.array][p[this.config.array].length - 1].id));
  }
  async createMany(parentId, values) {
    if (!Array.isArray(values) || values.length < 1 || values.length > 50) throw new Error('El lote debe contener de 1 a 50 objetos');
    const p = await this.parent(parentId); if (!p) return null;
    const inserted = values.map(v => ({ ...v, id: v.id || randomUUID() })); p[this.config.array].push(...inserted); await p.save(); return inserted;
  }
  async replace(parentId, childId, values) {
    const p = await this.parent(parentId); if (!p) return null;
    const item = p[this.config.array].find(x => x.id === childId); if (!item) return null;
    const immutable = ['id', this.config.parentField, 'createdAt'];
    for (const [key, value] of Object.entries(values || {})) if (!immutable.includes(key)) item.set ? item.set(key, value) : item[key] = value;
    await p.save(); return p[this.config.array].find(x => x.id === childId);
  }
  async remove(parentId, childId) {
    const p = await this.parent(parentId); if (!p) return null;
    const before = p[this.config.array].length; p[this.config.array] = p[this.config.array].filter(x => x.id !== childId);
    if (p[this.config.array].length === before) return null;
    await p.save(); return { id: childId, deleted: true };
  }
  async removeMany(parentId, ids) {
    if (!Array.isArray(ids) || !ids.length || ids.length > 50 || new Set(ids).size !== ids.length) throw new Error('Indique de 1 a 50 IDs únicos');
    const p = await this.parent(parentId); if (!p) return null;
    const wanted = new Set(ids); const removed = p[this.config.array].filter(x => wanted.has(x.id)).map(x => ({ id: x.id, deleted: true }));
    p[this.config.array] = p[this.config.array].filter(x => !wanted.has(x.id)); await p.save(); return removed;
  }
}
module.exports = { MongoNestedModel, parentConfig };
