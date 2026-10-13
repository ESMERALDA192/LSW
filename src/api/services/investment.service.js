const definitions = require('../../models/definitions');

class ServiceError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function invalid(message, details = []) {
  return new ServiceError(400, 'VALIDATION_ERROR', message, details);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertObject(value, label) {
  if (!isObject(value)) throw invalid(`${label} debe ser un objeto`);
}

function validatePayload(definition, values, { creating }) {
  assertObject(values, 'El cuerpo');

  const allowed = new Set(definition.fields);
  const unknown = Object.keys(values).filter(key => !allowed.has(key));
  if (unknown.length) throw invalid('El cuerpo contiene campos no permitidos', unknown);

  if (creating) {
    const missing = definition.required.filter(key => values[key] === undefined || values[key] === null);
    if (missing.length) throw invalid('Faltan campos obligatorios', missing);
  } else {
    const immutable = new Set(definition.immutable || []);
    const attempted = Object.keys(values).filter(key => immutable.has(key));
    if (attempted.length) throw invalid('No se pueden modificar campos inmutables', attempted);
    if (!Object.keys(values).length) throw invalid('Debe indicar al menos un campo para actualizar');
  }

  for (const [field, options] of Object.entries(definition.enums || {})) {
    if (values[field] !== undefined && !options.includes(values[field])) {
      throw invalid(`Valor no permitido para ${field}`, [`Valores válidos: ${options.join(', ')}`]);
    }
  }

  return { ...values };
}

function execute(query) {
  return query && typeof query.exec === 'function' ? query.exec() : query;
}

async function findOne(model, id) {
  if (typeof model.findById === 'function' && model.resource) return model.findById(id);
  if (typeof model.findOne === 'function') return execute(model.findOne({ id }));
  if (typeof model.findById === 'function') return model.findById(id);
  throw new Error('El modelo no implementa la lectura por ID');
}

function assertId(id, label = 'El ID') {
  if (typeof id !== 'string' || !id.trim()) throw invalid(`${label} es obligatorio`);
}

function createResourceService(models, resource) {
  const definition = definitions[resource];
  const model = models[resource];
  const nested = Boolean(definition.parent);
  const mongoNested = nested && Boolean(model.config);

  async function parentIdFrom(options = {}) {
    if (!nested) return undefined;
    const parentId = options.parentId;
    assertId(parentId, 'El ID del recurso padre');
    const parentModel = models[definition.parent.resource];
    if (!parentModel || !(await findOne(parentModel, parentId))) {
      throw new ServiceError(404, 'PARENT_NOT_FOUND', 'No se encontró el recurso padre');
    }
    return parentId;
  }

  function validateFilters(filters = {}) {
    assertObject(filters, 'Los filtros');
    const unknown = Object.keys(filters).filter(key => !definition.fields.includes(key));
    if (unknown.length) throw invalid('Se indicaron filtros no permitidos', unknown);
    return filters;
  }

  return {
    async list(options = {}) {
      const parentId = await parentIdFrom(options);
      const page = options.page === undefined ? 1 : Number(options.page);
      const limit = options.limit === undefined ? 20 : Number(options.limit);
      if (!Number.isInteger(page) || page < 1) throw invalid('page debe ser un entero mayor que cero');
      if (!Number.isInteger(limit) || limit < 1) throw invalid('limit debe ser un entero mayor que cero');
      const filters = validateFilters(options.filters || {});

      if (mongoNested) {
        const items = await model.findAll(parentId);
        if (!items) throw new ServiceError(404, 'PARENT_NOT_FOUND', 'No se encontró el recurso padre');
        const filtered = items.filter(item => Object.entries(filters).every(([key, value]) => item[key] === value));
        const start = (page - 1) * limit;
        return filtered.slice(start, start + limit);
      }
      if (typeof model.findAll === 'function') {
        return model.findAll({ page, limit, filters, ...(nested ? { parentId } : {}) });
      }
      return execute(model.find(filters).sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit));
    },

    async getById(id, options = {}) {
      assertId(id);
      const parentId = await parentIdFrom(options);
      let found;
      if (mongoNested) found = await model.findById(parentId, id);
      else if (typeof model.findById === 'function' && model.resource) found = await model.findById(id, parentId);
      else found = await findOne(model, id);
      if (!found) throw new ServiceError(404, 'RESOURCE_NOT_FOUND', 'No se encontró el recurso solicitado');
      return found;
    },

    async create(values, options = {}) {
      const parentId = await parentIdFrom(options);
      const payload = validatePayload(definition, values, { creating: true });
      if (mongoNested) return model.create(parentId, payload);
      if (nested) payload[definition.parent.field] = parentId;
      return model.create(payload);
    },

    async update(id, values, options = {}) {
      assertId(id);
      const parentId = await parentIdFrom(options);
      const payload = validatePayload(definition, values, { creating: false });
      let updated;
      if (mongoNested) updated = await model.replace(parentId, id, payload);
      else if (typeof model.replace === 'function') updated = await model.replace(id, payload, parentId);
      else updated = await execute(model.findOneAndUpdate(
        nested ? { id, [definition.parent.field]: parentId } : { id },
        payload,
        { new: true, runValidators: true }
      ));
      if (!updated) throw new ServiceError(404, 'RESOURCE_NOT_FOUND', 'No se encontró el recurso solicitado');
      return updated;
    },

    async remove(id, options = {}) {
      assertId(id);
      const parentId = await parentIdFrom(options);
      let removed;
      if (mongoNested) removed = await model.remove(parentId, id);
      else if (typeof model.remove === 'function') removed = await model.remove(id, parentId);
      else removed = await execute(model.findOneAndDelete(nested ? { id, [definition.parent.field]: parentId } : { id }));
      if (!removed) throw new ServiceError(404, 'RESOURCE_NOT_FOUND', 'No se encontró el recurso solicitado');
      return removed;
    }
  };
}

function createInvestmentServices(models) {
  if (!models || typeof models !== 'object') throw new Error('Se requieren los modelos de inversión');
  return Object.fromEntries(Object.keys(definitions).map(resource => {
    if (!models[resource]) throw new Error(`No se proporcionó el modelo del recurso: ${resource}`);
    return [resource, createResourceService(models, resource)];
  }));
}

module.exports = { createInvestmentServices, ServiceError };
