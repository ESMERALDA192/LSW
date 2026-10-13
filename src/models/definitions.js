// Contratos de datos del proyecto F0/F5. Se comparten entre Supabase y MongoDB.
const definitions = {
  positions: {
    table: 'positions', collection: 'positions', parent: null,
    fields: ['systemId','name','symbol','currency','status'],
    required: ['systemId','name','symbol','currency','status'],
    enums: { currency: ['USD'], status: ['draft','open','closed'] },
    children: ['legs']
  },
  legs: {
    table: 'position_legs', collection: 'legs', parent: { resource: 'positions', field: 'positionId', array: 'legs' },
    fields: ['instrument','side','quantity','entryPrice','multiplier','strike','expiry'],
    required: ['instrument','side','quantity','entryPrice','multiplier'],
    enums: { instrument: ['stock','call','put'], side: ['long','short'] }, children: []
  },
  systems: {
    table: 'systems', collection: 'systems', parent: null,
    fields: ['name','type','description','status','initialCash'],
    required: ['name','type','status','initialCash'],
    enums: { type: ['wheel','pmcc','ratio_backspread','gamma_scalping'], status: ['draft','active','archived'] },
    children: ['rules','events']
  },
  rules: {
    table: 'system_rules', collection: 'rules', parent: { resource: 'systems', field: 'systemId', array: 'rules' },
    fields: ['name','enabled','priority','condition','action','parameters'],
    required: ['name','enabled','priority','condition','action','parameters'],
    enums: { action: ['sell_put','sell_call','roll','rebalance_delta'] }, children: []
  },
  scenarios: {
    table: 'scenarios', collection: 'scenarios', parent: null,
    fields: ['name','symbol','asOf','spot','volatility','rate','dividendYield','costs'],
    required: ['name','symbol','asOf','spot','volatility','rate','dividendYield','costs'], enums: {}, children: []
  },
  events: {
    table: 'system_events', collection: 'events', parent: { resource: 'systems', field: 'systemId', array: 'events' },
    fields: ['positionId','type','occurredAt','quantity','price','fees','notes','side','multiplier'],
    required: ['positionId','type','occurredAt','quantity','price','fees'],
    enums: { type: ['put_assignment','call_assignment','premium','hedge'] }, children: []
  },
  valuations: {
    table: 'valuations', collection: 'valuations', parent: null,
    fields: ['positionId','scenarioId','model','label','notes','inputSnapshot','result','engineVersion'],
    required: ['positionId','scenarioId','model','label'],
    enums: { model: ['expiry_payoff','black_scholes'] }, children: [], immutable: ['positionId','scenarioId','model','inputSnapshot','result','engineVersion']
  },
  simulations: {
    table: 'simulations', collection: 'simulations', parent: null,
    fields: ['systemId','positionIds','scenarioIds','eventIds','mode','model','label','notes','inputSnapshot','results','engineVersion'],
    required: ['systemId','positionIds','scenarioIds','eventIds','mode','model','label'],
    enums: { mode: ['scenario_grid','event_replay'], model: ['expiry_payoff','black_scholes'] }, children: [],
    immutable: ['systemId','positionIds','scenarioIds','eventIds','mode','model','inputSnapshot','results','engineVersion']
  },
  rebalanceProposals: {
    table: 'rebalance_proposals', collection: 'rebalanceProposals', parent: null,
    fields: ['positionId','scenarioId','targetDelta','tolerance','label','notes','status','currentDelta','projectedDelta','estimatedCost','warnings','inputSnapshot','engineVersion'],
    required: ['positionId','scenarioId','targetDelta','tolerance','label'], enums: {}, children: ['adjustments'],
    immutable: ['positionId','scenarioId','targetDelta','tolerance','currentDelta','projectedDelta','estimatedCost','warnings','inputSnapshot','engineVersion']
  },
  adjustments: {
    table: 'proposal_adjustments', collection: 'adjustments', parent: { resource: 'rebalanceProposals', field: 'proposalId', array: 'adjustments' },
    fields: ['side','quantity','referencePrice','fees','reason','instrument','symbol','deltaChange'],
    required: ['side','quantity','referencePrice','fees','reason'], enums: { side: ['buy','sell'] }, children: []
  }
};
module.exports = definitions;
