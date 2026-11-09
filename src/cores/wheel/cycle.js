const { randomUUID } = require('crypto');
const { WheelInputError, CONTRACT_SIZE_DEFAULT } = require('./index');

function record(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new WheelInputError(`${name} debe ser un objeto`);
  }
}

function number(value, name, { min = 0, integer = false } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || (integer && !Number.isSafeInteger(value))) {
    throw new WheelInputError(`${name} debe ser un ${integer ? 'entero seguro' : 'número'} mayor o igual que ${min}`, [name]);
  }
  return value;
}

function money(value) {
  if (!Number.isFinite(value)) throw new WheelInputError('El cálculo excede el rango numérico permitido');
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function date(value, name) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new WheelInputError(`${name} debe ser una fecha ISO válida`, [name]);
  }
  return new Date(value).toISOString();
}

function append(state, event) {
  return [...(state.events || []), { id: randomUUID(), ...event }];
}

function stageFor(shares, multiplier) {
  if (shares >= multiplier) return 'covered_call';
  if (shares > 0) return 'hold_for_covered_call';
  return 'cash_secured_put';
}

function assertVersion(state, expectedVersion) {
  number(expectedVersion, 'expectedVersion', { min: 0, integer: true });
  if (state.version !== expectedVersion) {
    const error = new Error('El ciclo cambió desde la última lectura; vuelve a consultar su estado');
    error.status = 409;
    error.code = 'WHEEL_VERSION_CONFLICT';
    error.details = [`Versión actual: ${state.version}`];
    throw error;
  }
}

function startCycle({ symbol, initialCash, multiplier = CONTRACT_SIZE_DEFAULT, expectedVersion, now = new Date().toISOString() }) {
  record(arguments[0], 'El cuerpo');
  const normalizedSymbol = typeof symbol === 'string' ? symbol.trim().toUpperCase() : '';
  if (!normalizedSymbol || normalizedSymbol.length > 20) throw new WheelInputError('symbol es obligatorio y debe tener hasta 20 caracteres', ['symbol']);
  const cash = money(number(initialCash, 'initialCash'));
  const contractMultiplier = number(multiplier, 'multiplier', { min: 1, integer: true });
  number(expectedVersion, 'expectedVersion', { min: 0, integer: true });
  return {
    version: expectedVersion + 1,
    state: {
      version: expectedVersion + 1,
      status: 'active',
      symbol: normalizedSymbol,
      multiplier: contractMultiplier,
      phase: 'cash_secured_put',
      initialCash: cash,
      cash,
      shares: 0,
      averageCost: 0,
      activeLeg: null,
      markPrice: null,
      realizedOptionPnl: 0,
      realizedStockPnl: 0,
      unrealizedStockPnl: 0,
      unrealizedOptionPnl: 0,
      totalRealizedPnl: 0,
      totalPnl: 0,
      events: [{ id: randomUUID(), type: 'cycle_started', occurredAt: date(now, 'now'), cash }]
    }
  };
}

function openLeg(state, input, expectedVersion, now = new Date().toISOString()) {
  assertVersion(state, expectedVersion);
  record(input, 'El cuerpo');
  if (state.status !== 'active') throw new WheelInputError('El ciclo no está activo', ['status']);
  if (state.activeLeg) throw new WheelInputError('Ya hay una opción abierta en este ciclo', ['activeLeg']);
  const optionType = input.optionType;
  if (!['put', 'call'].includes(optionType)) throw new WheelInputError('optionType debe ser put o call', ['optionType']);
  const expectedType = state.phase === 'cash_secured_put' ? 'put' : state.phase === 'covered_call' ? 'call' : null;
  if (optionType !== expectedType) throw new WheelInputError(`La etapa actual requiere ${expectedType || 'acumular acciones suficientes para una call cubierta'}`, ['optionType', 'phase']);

  const strike = number(input.strike, 'strike', { min: Number.MIN_VALUE });
  const premiumPerShare = number(input.premiumPerShare, 'premiumPerShare');
  const contracts = number(input.contracts, 'contracts', { min: 1, integer: true });
  const multiplier = input.multiplier === undefined ? state.multiplier : number(input.multiplier, 'multiplier', { min: 1, integer: true });
  if (multiplier !== state.multiplier) throw new WheelInputError('El multiplicador debe permanecer fijo durante el ciclo', ['multiplier']);
  const feePerContract = number(input.feePerContract, 'feePerContract');
  const sharesPerLeg = contracts * multiplier;
  if (!Number.isSafeInteger(sharesPerLeg)) throw new WheelInputError('La cantidad total de acciones excede el rango permitido', ['contracts', 'multiplier']);
  if (optionType === 'put' && state.cash < strike * sharesPerLeg) {
    throw new WheelInputError('El efectivo no cubre la posible asignación de puts cash-secured', ['cash', 'strike', 'contracts', 'multiplier']);
  }
  if (optionType === 'call' && state.shares < sharesPerLeg) {
    throw new WheelInputError('No hay suficientes acciones para cubrir los contratos call', ['shares', 'contracts', 'multiplier']);
  }
  const expiration = date(input.expiration, 'expiration');
  const occurredAt = date(now, 'now');
  if (Date.parse(expiration) <= Date.parse(occurredAt)) throw new WheelInputError('expiration debe ser posterior a la apertura', ['expiration']);

  const premiumGross = money(premiumPerShare * sharesPerLeg);
  const openingFees = money(feePerContract * contracts);
  const cashDelta = money(premiumGross - openingFees);
  if (state.cash + cashDelta < 0) throw new WheelInputError('No hay efectivo suficiente para cubrir las comisiones de apertura', ['cash', 'feePerContract']);
  if (optionType === 'put' && state.cash + cashDelta < strike * sharesPerLeg) {
    throw new WheelInputError('La apertura y sus comisiones dejarían la put sin cobertura completa', ['cash', 'feePerContract']);
  }
  const activeLeg = {
    id: randomUUID(), optionType, strike, premiumPerShare, premiumGross,
    contracts, multiplier, sharesPerLeg, openingFees, expiration,
    openedAt: occurredAt, markPricePerShare: premiumPerShare
  };
  const nextState = {
    ...state,
    version: expectedVersion + 1,
    cash: money(state.cash + cashDelta),
    activeLeg,
    unrealizedOptionPnl: money(-openingFees),
    totalPnl: money(state.realizedOptionPnl + state.realizedStockPnl + state.unrealizedStockPnl - openingFees),
    events: append(state, { type: 'leg_opened', occurredAt, leg: activeLeg, cashDelta })
  };
  return { version: nextState.version, state: nextState };
}

function settleLeg(state, input, expectedVersion, now = new Date().toISOString()) {
  assertVersion(state, expectedVersion);
  record(input, 'El cuerpo');
  if (!state.activeLeg) throw new WheelInputError('No hay una opción abierta para liquidar', ['activeLeg']);
  const assignedContracts = number(input.assignedContracts, 'assignedContracts', { min: 0, integer: true });
  if (assignedContracts > state.activeLeg.contracts) {
    throw new WheelInputError('assignedContracts no puede superar los contratos abiertos', ['assignedContracts']);
  }
  const underlying = number(input.underlyingPrice, 'underlyingPrice', { min: Number.MIN_VALUE });
  const settlementFees = money(number(input.settlementFees === undefined ? 0 : input.settlementFees, 'settlementFees'));
  const occurredAt = date(now, 'now');
  const leg = state.activeLeg;
  const assigned = assignedContracts > 0;
  const assignedShares = assignedContracts * leg.multiplier;
  const intrinsic = leg.optionType === 'put' ? underlying < leg.strike : underlying > leg.strike;
  let cashDelta = -settlementFees;
  let sharesDelta = 0;
  let averageCost = state.averageCost;
  let realizedStockPnl = state.realizedStockPnl;
  let markPrice = underlying;
  if (assigned && leg.optionType === 'put') {
    cashDelta -= leg.strike * assignedShares;
    sharesDelta = assignedShares;
    averageCost = state.shares === 0
      ? leg.strike
      : money((state.averageCost * state.shares + leg.strike * sharesDelta) / (state.shares + sharesDelta));
  } else if (assigned && leg.optionType === 'call') {
    cashDelta += leg.strike * assignedShares;
    sharesDelta = -assignedShares;
    realizedStockPnl = money(realizedStockPnl + (leg.strike - state.averageCost) * assignedShares);
    if (state.shares + sharesDelta === 0) averageCost = 0;
  }
  cashDelta = money(cashDelta);
  const cash = money(state.cash + cashDelta);
  const shares = state.shares + sharesDelta;
  if (cash < 0 || shares < 0) throw new WheelInputError('La liquidación produciría efectivo o acciones negativos');
  const realizedOptionPnl = money(state.realizedOptionPnl + leg.premiumGross - leg.openingFees - settlementFees);
  const unrealizedStockPnl = shares > 0 ? money((markPrice - averageCost) * shares) : 0;
  const nextState = {
    ...state,
    version: expectedVersion + 1,
    cash,
    shares,
    averageCost,
    markPrice,
    activeLeg: null,
    unrealizedOptionPnl: 0,
    phase: stageFor(shares, state.multiplier),
    realizedOptionPnl,
    realizedStockPnl,
    unrealizedStockPnl,
    totalRealizedPnl: money(realizedOptionPnl + realizedStockPnl),
    totalPnl: money(realizedOptionPnl + realizedStockPnl + unrealizedStockPnl),
    events: append(state, {
      type: 'leg_settled', occurredAt, legId: leg.id,
      settlement: assignedContracts === 0 ? 'not_assigned' : assignedContracts === leg.contracts ? 'assigned' : 'partially_assigned',
      assignedContracts, underlyingPrice: underlying, inTheMoney: intrinsic, settlementFees,
      assignmentWarning: intrinsic && assignedContracts === 0 ? 'La opción estaba in-the-money, pero no fue asignada según el dato confirmado.' : undefined,
      cashDelta, sharesDelta
    })
  };
  return { version: nextState.version, state: nextState };
}

function closeLeg(state, input, expectedVersion, now = new Date().toISOString()) {
  assertVersion(state, expectedVersion);
  record(input, 'El cuerpo');
  if (!state.activeLeg) throw new WheelInputError('No hay una opción abierta para cerrar', ['activeLeg']);
  const buybackPricePerShare = number(input.buybackPricePerShare, 'buybackPricePerShare');
  const closingFeePerContract = number(input.closingFeePerContract, 'closingFeePerContract');
  const leg = state.activeLeg;
  const buybackGross = money(buybackPricePerShare * leg.sharesPerLeg);
  const closingFees = money(closingFeePerContract * leg.contracts);
  const cashDelta = money(-buybackGross - closingFees);
  const cash = money(state.cash + cashDelta);
  if (cash < 0) throw new WheelInputError('No hay efectivo suficiente para cerrar la opción', ['cash', 'buybackPricePerShare']);
  const realizedOptionPnl = money(state.realizedOptionPnl + leg.premiumGross - buybackGross - leg.openingFees - closingFees);
  const occurredAt = date(now, 'now');
  const nextState = {
    ...state,
    version: expectedVersion + 1,
    cash,
    activeLeg: null,
    unrealizedOptionPnl: 0,
    phase: stageFor(state.shares, state.multiplier),
    realizedOptionPnl,
    totalRealizedPnl: money(realizedOptionPnl + state.realizedStockPnl),
    totalPnl: money(realizedOptionPnl + state.realizedStockPnl + state.unrealizedStockPnl),
    events: append(state, {
      type: 'leg_closed', occurredAt, legId: leg.id, buybackPricePerShare,
      buybackGross, closingFees, cashDelta
    })
  };
  return { version: nextState.version, state: nextState };
}

function markCycle(state, input, expectedVersion, now = new Date().toISOString()) {
  assertVersion(state, expectedVersion);
  record(input, 'El cuerpo');
  const markPrice = number(input.markPrice, 'markPrice', { min: Number.MIN_VALUE });
  const unrealizedStockPnl = state.shares > 0 ? money((markPrice - state.averageCost) * state.shares) : 0;
  let unrealizedOptionPnl = 0;
  let activeLeg = state.activeLeg;
  if (activeLeg) {
    const optionMarkPricePerShare = number(input.optionMarkPricePerShare, 'optionMarkPricePerShare');
    activeLeg = { ...activeLeg, markPricePerShare: optionMarkPricePerShare };
    unrealizedOptionPnl = money(activeLeg.premiumGross - optionMarkPricePerShare * activeLeg.sharesPerLeg - activeLeg.openingFees);
  }
  const occurredAt = date(now, 'now');
  const nextState = {
    ...state,
    version: expectedVersion + 1,
    markPrice,
    activeLeg,
    unrealizedStockPnl,
    unrealizedOptionPnl,
    totalPnl: money(state.totalRealizedPnl + unrealizedStockPnl + unrealizedOptionPnl),
    events: append(state, { type: 'market_marked', occurredAt, markPrice, optionMarkPricePerShare: activeLeg && activeLeg.markPricePerShare, unrealizedStockPnl, unrealizedOptionPnl })
  };
  return { version: nextState.version, state: nextState };
}

function completeCycle(state, expectedVersion, now = new Date().toISOString()) {
  assertVersion(state, expectedVersion);
  if (state.status !== 'active') throw new WheelInputError('El ciclo no está activo', ['status']);
  if (state.activeLeg) throw new WheelInputError('Cierra o liquida la opción activa antes de completar el ciclo', ['activeLeg']);
  const occurredAt = date(now, 'now');
  const nextState = {
    ...state,
    version: expectedVersion + 1,
    status: 'completed',
    events: append(state, { type: 'cycle_completed', occurredAt, cash: state.cash, shares: state.shares })
  };
  return { version: nextState.version, state: nextState };
}

module.exports = { startCycle, openLeg, settleLeg, closeLeg, markCycle, completeCycle, assertVersion };
