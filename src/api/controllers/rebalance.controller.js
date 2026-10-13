// PROPUESTAS DE REBALANCEO Y ADJUSTMENTS
exports.getAllProposals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, positionId, status } = req.query;
    res.status(200).json({ data: [], meta: { page: Number(page), limit: Number(limit), total: 0 } });
  } catch (error) { next(error); }
};

exports.getProposalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, status: "draft", currentDelta: 65, projectedDelta: 0, estimatedCost: 1500 } });
  } catch (error) { next(error); }
};

exports.createProposal = async (req, res, next) => {
  try {
    const newProp = {
      id: `reb-${Date.now()}`,
      status: "draft",
      currentDelta: 65,
      projectedDelta: 0,
      estimatedCost: 1500,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    res.status(201).location(`/api/v1/rebalance-proposals/${newProp.id}`).json({ data: newProp });
  } catch (error) { next(error); }
};

exports.createProposalsBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: `reb-${Date.now()}-${index}`, status: 201, data: { status: "draft", ...item } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateProposalMetadata = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, notes } = req.body;
    res.status(200).json({ data: { id, label, notes, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateProposalsMetadataBulk = async (req, res, next) => {
  try {
    const items = req.body;
    const results = items.map((item, index) => ({ index, id: item.id, status: 200, data: { id: item.id, label: item.label, notes: item.notes } }));
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ data: { id, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteProposalsBulk = async (req, res, next) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};

// SUBDOCUMENTO: ADJUSTMENTS
exports.getAdjustments = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    res.status(200).json({ data: [], meta: { proposalId, total: 0 } });
  } catch (error) { next(error); }
};

exports.getAdjustmentById = async (req, res, next) => {
  try {
    const { proposalId, id } = req.params;
    res.status(200).json({ data: { id, proposalId, instrument: "stock", side: "sell", quantity: 15, deltaChange: -15 } });
  } catch (error) { next(error); }
};

exports.createAdjustment = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const deltaChange = req.body.side === 'buy' ? req.body.quantity : -req.body.quantity;
    const newAdj = { id: `adj-${Date.now()}`, proposalId, instrument: "stock", deltaChange, ...req.body, createdAt: new Date().toISOString() };
    res.status(201).location(`/api/v1/rebalance-proposals/${proposalId}/adjustments/${newAdj.id}`).json({ data: newAdj });
  } catch (error) { next(error); }
};

exports.createAdjustmentsBulk = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => {
      const deltaChange = item.side === 'buy' ? item.quantity : -item.quantity;
      return { index, id: `adj-${Date.now()}-${index}`, status: 201, data: { proposalId, instrument: "stock", deltaChange, ...item } };
    });
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.updateAdjustment = async (req, res, next) => {
  try {
    const { proposalId, id } = req.params;
    const deltaChange = req.body.side === 'buy' ? req.body.quantity : -req.body.quantity;
    res.status(200).json({ data: { id, proposalId, deltaChange, ...req.body, updatedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.updateAdjustmentsBulk = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const items = req.body;
    const results = items.map((item, index) => {
      const deltaChange = item.side === 'buy' ? item.quantity : -item.quantity;
      return { index, id: item.id, status: 200, data: { proposalId, deltaChange, ...item } };
    });
    res.status(200).json({ results, summary: { requested: items.length, succeeded: items.length, failed: 0 } });
  } catch (error) { next(error); }
};

exports.deleteAdjustment = async (req, res, next) => {
  try {
    const { proposalId, id } = req.params;
    res.status(200).json({ data: { id, proposalId, deleted: true } });
  } catch (error) { next(error); }
};

exports.deleteAdjustmentsBulk = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const results = ids.map((id, index) => ({ index, id, status: 200, data: { id, proposalId, deleted: true } }));
    res.status(200).json({ results, summary: { requested: ids.length, succeeded: ids.length, failed: 0 } });
  } catch (error) { next(error); }
};