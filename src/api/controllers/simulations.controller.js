exports.getAllSimulations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, systemId } = req.query;
    res.status(200).json({ data: [], meta: { page: Number(page), limit: Number(limit), total: 0 } });
  } catch (error) { next(error); }
};

exports.getSimulationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({
      data: { id, label: "Simulación Wheel Replay", results: [{ scenarioId: "scn-1", pnl: 550, delta: 0, cashBalance: 5550 }], engineVersion: "1.0.0" }
    });
  } catch (error) { next(error); }
};

exports.createSimulation = async (req, res, next) => {
  try {
    const newSim = {
      id: `sim-${Date.now()}`,
      ...req.body,
      inputSnapshot: { ...req.body },
      results: [{ scenarioId: req.body.scenarioIds?.[0] || "scn-0", pnl: 550, delta: 0, cashBalance: 5550 }],
      engineVersion: "1.0.0",
      createdAt: new Date().toISOString()
    };
    res.status(201).location(`/api/v1/simulations/${newSim.id}`).json({ data: newSim });
  } catch (error) { next(error); }
};

exports.createSimulationsBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: `sim-${Date.now()}-${index}`, status: 201, data: { ...item, engineVersion: "1.0.0" } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateSimulationMetadata = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, notes } = req.body;
    res.status(200).json({ data: { id, label, notes, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateSimulationsMetadataBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: { id: item.id, label: item.label, notes: item.notes } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteSimulation = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteSimulationsBulk = async (req, res, next) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};