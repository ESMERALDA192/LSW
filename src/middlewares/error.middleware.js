module.exports = (err, req, res, next) => {
  console.error('[ERROR_INTERNO]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Error interno del servidor',
      details: err.details || []
    }
  });
};