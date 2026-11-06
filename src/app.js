const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { Router } = require('express');
const errorHandler = require('./middlewares/error.middleware');

function createApp(apiRouter = Router(), coresRouter = Router()) {
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
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
