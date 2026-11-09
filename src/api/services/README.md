# Servicios de inversiones

`investment.service.js` expone `createInvestmentServices(models)`, una fábrica de
servicios CRUD sobre los modelos configurados para Supabase o MongoDB.

Cada recurso expone:

- `list({ page, limit, filters, parentId })`
- `getById(id, { parentId })`
- `create(body, { parentId })`
- `update(id, body, { parentId })`
- `remove(id, { parentId })`

Los servicios disponibles son `positions`, `legs`, `systems`, `rules`, `events`,
`scenarios`, `valuations`, `simulations`, `rebalanceProposals` y `adjustments`.
`legs`, `rules`, `events` y `adjustments` requieren `parentId` en todas sus
operaciones. El padre se resuelve desde el contrato del recurso, y el servicio
rechaza las solicitudes si ese padre no existe.

```js
const { createModels } = require('../../models');
const { createInvestmentServices } = require('./investment.service');

const models = createModels({ database: 'mongodb', mongooseConnection });
const services = createInvestmentServices(models);
const positions = await services.positions.list({ page: 1, limit: 20 });
const legs = await services.legs.list({ parentId: positions[0].id });
```

Los servicios validan campos, obligatorios, enums y atributos inmutables antes
de delegar la persistencia. `ServiceError` incluye `status`, `code` y `details`
para que el middleware HTTP existente serialice los errores.
