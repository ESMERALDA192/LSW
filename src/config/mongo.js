const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    // Si ya está conectado, reutiliza la conexión
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Conectado correctamente: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Error de conexión: ${error.message}`);
    throw error;
  }
};

module.exports = { connectMongo, mongoose };