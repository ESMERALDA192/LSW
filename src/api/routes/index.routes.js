const { Router } = require('express');
const definitions = require('../../models/definitions');

const apiNames = Object.fromEntries(Object.keys(definitions).map(resource => [
  resource.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`),
  resource
]));

function resolveResource(name) {
  return apiNames[name] || null;
}

function createApiRouter(services) {
  if (!services || typeof services !== 'object') throw new Error('Se requieren los servicios de la API');
  const router = Router();

  function optionsFrom(req, resource, parentId) {
    const { page, limit, ...query } = req.query;
    const filters = Object.fromEntries(Object.entries(query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[value.length - 1] : value
    ]));
    return { page, limit, filters, ...(parentId ? { parentId } : {}) };
  }

  function routeNested(req, res, next) {
    const parentResource = resolveResource(req.params.parentResource);
    const resource = resolveResource(req.params.resource);
    const definition = resource && definitions[resource];
    if (!parentResource || !definition || !definition.parent || definition.parent.resource !== parentResource) {
      return next(Object.assign(new Error('Relación de recursos no encontrada'), {
        status: 404, code: 'RESOURCE_NOT_FOUND'
      }));
    }
    req.resource = resource;
    req.service = services[resource];
    req.parentId = req.params.parentId;
    return next();
  }

  // Las rutas anidadas siempre identifican al padre en la URL:
  // /positions/:positionId/legs y /systems/:systemId/rules.
  router.get('/:parentResource/:parentId/:resource', routeNested, async (req, res, next) => {
    try {
      res.json({ data: await req.service.list(optionsFrom(req, req.resource, req.parentId)) });
    } catch (error) { next(error); }
  });
  router.post('/:parentResource/:parentId/:resource', routeNested, async (req, res, next) => {
    try {
      res.status(201).json({ data: await req.service.create(req.body, { parentId: req.parentId }) });
    } catch (error) { next(error); }
  });
  router.get('/:parentResource/:parentId/:resource/:id', routeNested, async (req, res, next) => {
    try {
      res.json({ data: await req.service.getById(req.params.id, { parentId: req.parentId }) });
    } catch (error) { next(error); }
  });
  router.patch('/:parentResource/:parentId/:resource/:id', routeNested, async (req, res, next) => {
    try {
      res.json({ data: await req.service.update(req.params.id, req.body, { parentId: req.parentId }) });
    } catch (error) { next(error); }
  });
  router.delete('/:parentResource/:parentId/:resource/:id', routeNested, async (req, res, next) => {
    try {
      res.json({ data: await req.service.remove(req.params.id, { parentId: req.parentId }) });
    } catch (error) { next(error); }
  });

  router.get('/:resource', async (req, res, next) => {
    try {
      const resource = resolveResource(req.params.resource);
      if (!resource) throw Object.assign(new Error('Recurso no encontrado'), { status: 404, code: 'RESOURCE_NOT_FOUND' });
      if (definitions[resource].parent) throw Object.assign(new Error('Este recurso requiere la ruta de su recurso padre'), { status: 400, code: 'PARENT_REQUIRED' });
      res.json({ data: await services[resource].list(optionsFrom(req, resource)) });
    } catch (error) { next(error); }
  });
  router.post('/:resource', async (req, res, next) => {
    try {
      const resource = resolveResource(req.params.resource);
      if (!resource) throw Object.assign(new Error('Recurso no encontrado'), { status: 404, code: 'RESOURCE_NOT_FOUND' });
      if (definitions[resource].parent) throw Object.assign(new Error('Este recurso requiere la ruta de su recurso padre'), { status: 400, code: 'PARENT_REQUIRED' });
      res.status(201).json({ data: await services[resource].create(req.body) });
    } catch (error) { next(error); }
  });
  router.get('/:resource/:id', async (req, res, next) => {
    try {
      const resource = resolveResource(req.params.resource);
      if (!resource) throw Object.assign(new Error('Recurso no encontrado'), { status: 404, code: 'RESOURCE_NOT_FOUND' });
      if (definitions[resource].parent) throw Object.assign(new Error('Este recurso requiere la ruta de su recurso padre'), { status: 400, code: 'PARENT_REQUIRED' });
      res.json({ data: await services[resource].getById(req.params.id) });
    } catch (error) { next(error); }
  });
  router.patch('/:resource/:id', async (req, res, next) => {
    try {
      const resource = resolveResource(req.params.resource);
      if (!resource) throw Object.assign(new Error('Recurso no encontrado'), { status: 404, code: 'RESOURCE_NOT_FOUND' });
      if (definitions[resource].parent) throw Object.assign(new Error('Este recurso requiere la ruta de su recurso padre'), { status: 400, code: 'PARENT_REQUIRED' });
      res.json({ data: await services[resource].update(req.params.id, req.body) });
    } catch (error) { next(error); }
  });
  router.delete('/:resource/:id', async (req, res, next) => {
    try {
      const resource = resolveResource(req.params.resource);
      if (!resource) throw Object.assign(new Error('Recurso no encontrado'), { status: 404, code: 'RESOURCE_NOT_FOUND' });
      if (definitions[resource].parent) throw Object.assign(new Error('Este recurso requiere la ruta de su recurso padre'), { status: 400, code: 'PARENT_REQUIRED' });
      res.json({ data: await services[resource].remove(req.params.id) });
    } catch (error) { next(error); }
  });

  return router;
}

module.exports = { createApiRouter, resolveResource };
