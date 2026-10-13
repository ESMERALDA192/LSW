const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const apiRouter = require('./api/routes/index.routes');
const errorHandler = require('./middlewares/error.middleware');

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

app.use('/api/v1', apiRouter);
app.use(errorHandler);

module.exports = app;