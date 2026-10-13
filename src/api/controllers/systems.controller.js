// SISTEMAS, RULES Y EVENTS
exports.getAllSystems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    res.status(200).json({ data: [], meta: { page: Number(page), limit: Number(limit), total: 0 } });
  } catch (error) { next(error); }
};

exports.getSystemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, name: "Sistema Wheel Pro", type: "wheel", status: "draft" } });
  } catch (error) { next(error); }
};

exports.createSystem = async (req, res, next) => {
  try {
    const newSys = { id: `sys-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    res.status(201).location(`/api/v1/systems/${newSys.id}`).json({ data: newSys });
  } catch (error) { next(error); }
};

exports.createSystemsBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: `sys-${Date.now()}-${index}`, status: 201, data: item }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateSystem = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, ...req.body, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateSystemsBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: item }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteSystem = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteSystemsBulk = async (req, res, next) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};

// SUBDOCUMENTO: RULES
exports.getRules = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    res.status(200).json({ data: [], meta: { systemId, total: 0 } });
  } catch (error) { next(error); }
};

exports.getRuleById = async (req, res, next) => {
  try {
    const { systemId, id } = req.params;
    res.status(200).json({ data: { id, systemId, name: "Venta de Put", enabled: true } });
  } catch (error) { next(error); }
};

exports.createRule = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const newRule = { id: `rul-${Date.now()}`, systemId, ...req.body, createdAt: new Date().toISOString() };
    res.status(201).location(`/api/v1/systems/${systemId}/rules/${newRule.id}`).json({ data: newRule });
  } catch (error) { next(error); }
};

exports.createRulesBulk = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: `rul-${Date.now()}-${index}`, status: 201, data: { systemId, ...item } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateRule = async (req, res, next) => {
  try {
    const { systemId, id } = req.params;
    res.status(200).json({ data: { id, systemId, ...req.body, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateRulesBulk = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: { systemId, ...item } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteRule = async (req, res, next) => {
  try {
    const { systemId, id } = req.params;
    res.status(200).json({ data: { id, systemId, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteRulesBulk = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, systemId, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};

// SUBDOCUMENTO: EVENTS
exports.getEvents = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    res.status(200).json({ data: [], meta: { systemId, total: 0 } });
  } catch (error) { next(error); }
};

exports.getEventById = async (req, res, next) => {
  try {
    const { systemId, id } = req.params;
    res.status(200).json({ data: { id, systemId, type: "premium", cashFlow: 150 } });
  } catch (error) { next(error); }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const cashFlow = (req.body.price * req.body.quantity) - (req.body.fees || 0);
    const newEvent = { id: `evt-${Date.now()}`, systemId, cashFlow, ...req.body, createdAt: new Date().toISOString() };
    res.status(201).location(`/api/v1/systems/${systemId}/events/${newEvent.id}`).json({ data: newEvent });
  } catch (error) { next(error); }
};

exports.createEventsBulk = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => ({
      index,
      id: `evt-${Date.now()}-${index}`,
      status: 201,
      data: { systemId, cashFlow: (item.price * item.quantity) - (item.fees || 0), ...item }
    }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { systemId, id } = req.params;
    res.status(200).json({ data: { id, systemId, ...req.body, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateEventsBulk = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: { systemId, ...item } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { systemId, id } = req.params;
    res.status(200).json({ data: { id, systemId, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteEventsBulk = async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, systemId, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};