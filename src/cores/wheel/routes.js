const { Router } = require('express');
const { createWheelService } = require('./service');

function createWheelRouter(models) {
  const service = createWheelService(models);
  const router = Router();

  function respond(operation, status = 200) {
    return async (req, res, next) => {
      try {
        const data = await operation(req);
        res.status(status).json({ data });
      } catch (error) {
        next(error);
      }
    };
  }

  router.get('/wheel', (_req, res) => {
    res.json({ data: {
      id: 'wheel',
      name: 'The Wheel',
      stages: ['cash_secured_put', 'covered_call'],
      operations: ['start', 'open_leg', 'settle_leg', 'close_leg', 'mark', 'complete']
    } });
  });

  router.post('/wheel/systems/:systemId/cycle/start', respond(
    req => service.start(req.params.systemId, req.body), 201
  ));
  router.get('/wheel/systems/:systemId/cycle', respond(
    req => service.get(req.params.systemId)
  ));
  router.post('/wheel/systems/:systemId/cycle/legs', respond(
    req => service.openLeg(req.params.systemId, req.body), 201
  ));
  router.post('/wheel/systems/:systemId/cycle/legs/:legId/settle', respond(
    req => service.settleLeg(req.params.systemId, req.params.legId, req.body)
  ));
  router.post('/wheel/systems/:systemId/cycle/legs/:legId/close', respond(
    req => service.closeLeg(req.params.systemId, req.params.legId, req.body)
  ));
  router.post('/wheel/systems/:systemId/cycle/mark', respond(
    req => service.mark(req.params.systemId, req.body)
  ));
  router.post('/wheel/systems/:systemId/cycle/complete', respond(
    req => service.complete(req.params.systemId, req.body)
  ));

  return router;
}

module.exports = { createWheelRouter };
