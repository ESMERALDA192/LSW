require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[MICROSERVICIO F0-F5] Servidor iniciado en el puerto ${PORT}`);
  console.log(`[RUTA BASE] http://localhost:${PORT}/api/v1`);
});