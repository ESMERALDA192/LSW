// POSICIONES Y PIERNAS (SUBDOCUMENTO)
exports.getAllPositions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, symbol, status, systemId } = req.query;
    res.status(200).json({ data: [], meta: { page: Number(page), limit: Number(limit), total: 0 } });
  } catch (error) { next(error); }
};

exports.getPositionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, symbol: "DEMO", currency: "USD", status: "draft" } });
  } catch (error) { next(error); }
};

exports.createPosition = async (req, res, next) => {
  try {
    const { systemId, name, symbol, currency = "USD", status = "draft" } = req.body;
    if (!name || !symbol || !systemId) {
      return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "systemId, name y symbol son obligatorios" } });
    }
    const newPos = { id: `pos-${Date.now()}`, systemId, name, symbol, currency, status, createdAt: new Date().toISOString() };
    res.status(201).location(`/api/v1/positions/${newPos.id}`).json({ data: newPos });
  } catch (error) { next(error); }
};

exports.createPositionsBulk = async (req, res, next) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ error: { code: "INVALID_BATCH", message: "El lote debe contener entre 1 y 50 elementos" } });
    }
    const results = items.map((item, index) => ({ index, id: `pos-${Date.now()}-${index}`, status: 201, data: item }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updatePosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, ...req.body, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updatePositionsBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: item }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deletePosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, deleted: true } });
  } catch (error) { next(error); }
};

exports.deletePositionsBulk = async (req, res, next) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};

// SUBDOCUMENTO: LEGS
exports.getLegs = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    res.status(200).json({ data: [], meta: { positionId, page: 1, limit: 20, total: 0 } });
  } catch (error) { next(error); }
};

exports.getLegById = async (req, res, next) => {
  try {
    const { positionId, id } = req.params;
    res.status(200).json({ data: { id, positionId, instrument: "call", side: "long", quantity: 1 } });
  } catch (error) { next(error); }
};

exports.createLeg = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    const newLeg = { id: `leg-${Date.now()}`, positionId, ...req.body, createdAt: new Date().toISOString() };
    res.status(201).location(`/api/v1/positions/${positionId}/legs/${newLeg.id}`).json({ data: newLeg });
  } catch (error) { next(error); }
};

exports.createLegsBulk = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: `leg-${Date.now()}-${index}`, status: 201, data: { positionId, ...item } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateLeg = async (req, res, next) => {
  try {
    const { positionId, id } = req.params;
    res.status(200).json({ data: { id, positionId, ...req.body, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateLegsBulk = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: { positionId, ...item } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteLeg = async (req, res, next) => {
  try {
    const { positionId, id } = req.params;
    res.status(200).json({ data: { id, positionId, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteLegsBulk = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, positionId, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};