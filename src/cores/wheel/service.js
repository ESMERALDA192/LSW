const { startCycle, openLeg, settleLeg, closeLeg, markCycle, completeCycle } = require('./cycle');

function notFound(message) {
  return Object.assign(new Error(message), { status: 404, code: 'RESOURCE_NOT_FOUND' });
}

function conflict(message) {
  return Object.assign(new Error(message), { status: 409, code: 'WHEEL_VERSION_CONFLICT' });
}

async function readSystem(model, id) {
  if (model.resource) return model.findById(id);
  const query = model.findOne({ id });
  return query && typeof query.exec === 'function' ? query.exec() : query;
}

async function updateWheelState(model, systemId, expectedVersion, state) {
  if (model.resource) {
    const { data, error } = await model.table()
      .update({ wheelState: state, wheelVersion: state.version })
      .eq('id', systemId)
      .eq('wheelVersion', expectedVersion)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw conflict('El ciclo cambió mientras se guardaba; vuelve a consultar su estado');
    return data;
  }
  const query = model.findOneAndUpdate(
    { id: systemId, wheelVersion: expectedVersion },
    { $set: { wheelState: state, wheelVersion: state.version } },
    { new: true, runValidators: true }
  );
  const updated = query && typeof query.exec === 'function' ? await query.exec() : await query;
  if (!updated) throw conflict('El ciclo cambió mientras se guardaba; vuelve a consultar su estado');
  return updated;
}

function createWheelService(models) {
  if (!models || !models.systems) throw new Error('Se requiere el modelo de sistemas para el core Wheel');
  const systems = models.systems;

  async function getWheelSystem(systemId) {
    const system = await readSystem(systems, systemId);
    if (!system) throw notFound('No se encontró el sistema');
    if (system.type !== 'wheel') {
      throw Object.assign(new Error('El ciclo Wheel solo está disponible para sistemas de tipo wheel'), {
        status: 400, code: 'STRATEGY_TYPE_MISMATCH'
      });
    }
    return system;
  }

  async function transition(systemId, expectedVersion, update) {
    const system = await getWheelSystem(systemId);
    if (!system.wheelState) throw notFound('El ciclo Wheel todavía no ha iniciado');
    const result = update(system.wheelState);
    const updated = await updateWheelState(systems, system.id || system._id, expectedVersion, result.state);
    return updated.wheelState;
  }

  return {
    async get(systemId) {
      const system = await getWheelSystem(systemId);
      if (!system.wheelState) throw notFound('El ciclo Wheel todavía no ha iniciado');
      return system.wheelState;
    },

    async start(systemId, input) {
      const system = await getWheelSystem(systemId);
      const expectedVersion = input && input.expectedVersion;
      if (system.wheelState) throw conflict('El ciclo Wheel ya fue iniciado para este sistema');
      const result = startCycle({
        symbol: input && input.symbol,
        initialCash: system.initialCash,
        multiplier: input && input.multiplier,
        expectedVersion
      });
      const updated = await updateWheelState(systems, system.id || system._id, expectedVersion, result.state);
      return updated.wheelState;
    },

    openLeg(systemId, input) {
      return transition(systemId, input && input.expectedVersion, state =>
        openLeg(state, input, input && input.expectedVersion));
    },

    settleLeg(systemId, legId, input) {
      return transition(systemId, input && input.expectedVersion, state => {
        if (!state.activeLeg || state.activeLeg.id !== legId) throw notFound('No se encontró la opción activa indicada');
        return settleLeg(state, input, input && input.expectedVersion);
      });
    },

    closeLeg(systemId, legId, input) {
      return transition(systemId, input && input.expectedVersion, state => {
        if (!state.activeLeg || state.activeLeg.id !== legId) throw notFound('No se encontró la opción activa indicada');
        return closeLeg(state, input, input && input.expectedVersion);
      });
    },

    mark(systemId, input) {
      return transition(systemId, input && input.expectedVersion, state =>
        markCycle(state, input, input && input.expectedVersion));
    },

    complete(systemId, input) {
      return transition(systemId, input && input.expectedVersion, state =>
        completeCycle(state, input && input.expectedVersion));
    }
  };
}

module.exports = { createWheelService };
