const test = require('node:test');
const assert = require('node:assert/strict');

const definitions = require('../src/models/definitions');
const { createInvestmentServices } = require('../src/api/services/investment.service');

function createModels() {
  const calls = [];
  const models = {};

  for (const resource of Object.keys(definitions)) {
    models[resource] = {
      resource,
      async findAll(options) {
        calls.push([resource, 'list', options]);
        return [];
      },
      async findById(id, parentId) {
        calls.push([resource, 'get', id, parentId]);
        return id === 'missing' ? null : { id };
      },
      async create(values) {
        calls.push([resource, 'create', values]);
        return values;
      },
      async replace(id, values, parentId) {
        calls.push([resource, 'update', id, values, parentId]);
        return id === 'missing' ? null : { id, ...values };
      },
      async remove(id, parentId) {
        calls.push([resource, 'remove', id, parentId]);
        return id === 'missing' ? null : { id };
      }
    };
  }

  return { models, calls };
}

test('expone servicios CRUD para todas las colecciones y subdocumentos', () => {
  const { models } = createModels();
  const services = createInvestmentServices(models);

  assert.deepEqual(Object.keys(services), Object.keys(definitions));
  for (const service of Object.values(services)) {
    for (const operation of ['list', 'getById', 'create', 'update', 'remove']) {
      assert.equal(typeof service[operation], 'function');
    }
  }
});

test('delimita las operaciones de subdocumentos a su padre', async () => {
  const { models, calls } = createModels();
  const services = createInvestmentServices(models);

  await services.legs.list({ parentId: 'position-1' });
  await services.legs.getById('leg-1', { parentId: 'position-1' });
  await services.legs.create({
    instrument: 'stock',
    side: 'long',
    quantity: 100,
    entryPrice: 50,
    multiplier: 1
  }, { parentId: 'position-1' });
  await services.legs.update('leg-1', { quantity: 200 }, { parentId: 'position-1' });
  await services.legs.remove('leg-1', { parentId: 'position-1' });

  assert.deepEqual(calls.find(call => call[0] === 'legs' && call[1] === 'list'), [
    'legs', 'list', { page: 1, limit: 20, filters: {}, parentId: 'position-1' }
  ]);
  assert.deepEqual(calls.find(call => call[0] === 'legs' && call[1] === 'get'), ['legs', 'get', 'leg-1', 'position-1']);
  assert.equal(calls.find(call => call[0] === 'legs' && call[1] === 'create')[2].positionId, 'position-1');
  assert.deepEqual(calls.find(call => call[0] === 'legs' && call[1] === 'update'), [
    'legs', 'update', 'leg-1', { quantity: 200 }, 'position-1'
  ]);
  assert.deepEqual(calls.find(call => call[0] === 'legs' && call[1] === 'remove'), [
    'legs', 'remove', 'leg-1', 'position-1'
  ]);
});

test('rechaza cuerpos inválidos y cambios a campos inmutables', async () => {
  const { models } = createModels();
  const services = createInvestmentServices(models);

  await assert.rejects(
    services.positions.create({ name: 'Position' }),
    error => error.status === 400 && error.code === 'VALIDATION_ERROR'
  );
  await assert.rejects(
    services.valuations.update('valuation-1', { result: {} }),
    error => error.status === 400 && error.details.includes('result')
  );
});

test('reporta recurso inexistente en lugar de devolver una respuesta vacía', async () => {
  const { models } = createModels();
  const services = createInvestmentServices(models);

  await assert.rejects(
    services.positions.getById('missing'),
    error => error.status === 404 && error.code === 'RESOURCE_NOT_FOUND'
  );
});

test('adapta las operaciones a modelos MongoDB y subdocumentos embebidos', async () => {
  const calls = [];
  const models = {};
  for (const resource of Object.keys(definitions)) {
    models[resource] = {
      async findOne({ id }) {
        return { id };
      },
      find() {
        return {
          sort() { return this; },
          skip() { return this; },
          limit() { return this; },
          async exec() { return []; }
        };
      },
      async create(values) { return values; },
      async findOneAndUpdate({ id }, values) { return { id, ...values }; },
      async findOneAndDelete({ id }) { return { id }; }
    };
  }
  models.legs = {
    config: { model: 'positions', array: 'legs', parentField: 'positionId' },
    async findAll(parentId) { calls.push(['list', parentId]); return []; },
    async findById(parentId, id) { calls.push(['get', parentId, id]); return { id }; },
    async create(parentId, values) { calls.push(['create', parentId, values]); return values; },
    async replace(parentId, id, values) { calls.push(['update', parentId, id, values]); return { id, ...values }; },
    async remove(parentId, id) { calls.push(['remove', parentId, id]); return { id }; }
  };

  const services = createInvestmentServices(models);
  await services.positions.list();
  await services.positions.update('position-1', { status: 'open' });
  await services.legs.list({ parentId: 'position-1' });
  await services.legs.create({
    instrument: 'stock',
    side: 'long',
    quantity: 100,
    entryPrice: 50,
    multiplier: 1
  }, { parentId: 'position-1' });

  assert.deepEqual(calls, [
    ['list', 'position-1'],
    ['create', 'position-1', {
      instrument: 'stock',
      side: 'long',
      quantity: 100,
      entryPrice: 50,
      multiplier: 1
    }]
  ]);
});
