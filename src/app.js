const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); 

const { Router } = require('express');
const errorHandler = require('./middlewares/error.middleware');

function createApp(apiRouter = Router(), coresRouter = Router(), checkDBHealth = async () => 'OK') {
  const app = express();

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP cada 15 min
    message: { error: 'Demasiadas peticiones, por favor intenta más tarde.' }
  });

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Aplicar Rate Limit a todas las rutas de la API
  app.use('/api/', apiLimiter);

  // <- NUEVO: Health Check Avanzado
  app.get('/health', async (req, res) => {
    const dbStatus = await checkDBHealth();
    const isHealthy = dbStatus === 'OK';
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'OK' : 'DEGRADED',
      database_connection: dbStatus,
      submodules: ['F0', 'F5'],
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/v1/cores', coresRouter);
  app.use('/api/v1', apiRouter);
  app.use('/api/v1', (_req, res) => {
    res.status(404).json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'La ruta solicitada no existe',
        details: []
      }
    });
  });
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };