require('dotenv').config();
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const { createModels } = require('./models');
const { createInvestmentServices } = require('./api/services/investment.service');
const { createApiRouter } = require('./api/routes/index.routes');
const { createWheelRouter } = require('./cores/wheel/routes');
const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;

async function start() {
  const database = process.env.DATABASE;
  let models;

  if (database === 'mongodb') {
    if (!process.env.MONGODB_URI) throw new Error('Falta configurar MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    models = createModels({ database, mongooseConnection: mongoose.connection });
  } else if (database === 'supabase') {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    models = createModels({ database, supabaseClient: supabase });
  } else {
    throw new Error('DATABASE debe ser mongodb o supabase');
  }

const services = createInvestmentServices(models);

  const checkDBHealth = async () => {
    try {
      if (database === 'mongodb') {
        return mongoose.connection.readyState === 1 ? 'OK' : 'DISCONNECTED';
      } else if (database === 'supabase') {
        const { error } = await supabase.from('positions').select('id').limit(1);
        return error ? 'ERROR' : 'OK';
      }
    } catch (e) {
      return 'ERROR';
    }
  };

  const app = createApp(createApiRouter(services), createWheelRouter(models), checkDBHealth);

  const server = app.listen(PORT, () => {
    console.log(`[MICROSERVICIO F0-F5] Servidor iniciado en el puerto ${PORT}`);
    console.log(`[RUTA BASE] http://localhost:${PORT}/api/v1`);
  });

  async function shutdown() {
    await new Promise(resolve => server.close(resolve));
    if (database === 'mongodb') await mongoose.disconnect();
  }
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}

if (require.main === module) {
  start().catch(error => {
    console.error('[ERROR_INICIO]', error.message);
    process.exitCode = 1;
  });
}

module.exports = { start };
