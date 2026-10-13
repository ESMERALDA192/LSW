exports.getAllScenarios = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, symbol } = req.query;
    res.status(200).json({ data: [], meta: { page: Number(page), limit: Number(limit), total: 0 } });
  } catch (error) { next(error); }
};

exports.getScenarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, name: "Escenario Volatilidad Media", spot: 110, volatility: 0.20 } });
  } catch (error) { next(error); }
};

exports.createScenario = async (req, res, next) => {
  try {
    const newScn = { id: `scn-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    res.status(201).location(`/api/v1/scenarios/${newScn.id}`).json({ data: newScn });
  } catch (error) { next(error); }
};

exports.createScenariosBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: `scn-${Date.now()}-${index}`, status: 201, data: item }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateScenario = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, ...req.body, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateScenariosBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: item }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteScenario = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteScenariosBulk = async (req, res, next) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};