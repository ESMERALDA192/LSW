# Ejemplos de uso de modelos

```js
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const { createModels } = require('./models');

// La conexión y autenticación se configuran fuera de los modelos.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const modelsSQL = createModels({ database: 'supabase', supabaseClient: supabase });
const nuevaEscena = await modelsSQL.scenarios.create({
  name: 'Escenario de prueba', symbol: 'SPY', asOf: new Date().toISOString(),
  spot: 500, volatility: 0.2, rate: 0.04, dividendYield: 0,
  costs: { perContract: 0.65, perShare: 0 }
});

// Para MongoDB, primero debe estar conectado mongoose.
await mongoose.connect(process.env.MONGODB_URI);
const modelsNoSQL = createModels({ database: 'mongodb', mongooseConnection: mongoose.connection });
const posicion = await modelsNoSQL.positions.create({
  systemId: 'uuid-del-sistema', name: 'Posición SPY', symbol: 'SPY', currency: 'USD', status: 'draft'
});
const pierna = await modelsNoSQL.legs.create(posicion.id, {
  instrument: 'stock', side: 'long', quantity: 100, entryPrice: 500, multiplier: 1
});
```

No se debe enviar una clave de Supabase desde el cliente web. La clave `SUPABASE_SERVICE_ROLE_KEY` es confidencial y debe permanecer solo en el servidor. El `database` usado por `createModels` debe provenir de la sesión autenticada validada por el backend, no de un header arbitrario.
