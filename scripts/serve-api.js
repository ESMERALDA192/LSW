import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

export function serveApi(app, name, port) {
  // FIC: Backend-only secrets; never log values. / Secretos solo del backend; nunca registrar valores.
  try { loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); }
  catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(name + ': no se pudo cargar .env.');
      process.exitCode = 1;
      return;
    }
  }
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(name + ' disponible en http://127.0.0.1:' + port);
    process.send?.({ type: 'ready' });
  });
  server.on('error', error => {
    console.error(name + ': ' + (error.code === 'EADDRINUSE' ? 'puerto ' + port + ' ocupado.' : 'no se pudo iniciar el servidor.'));
    process.exitCode = 1;
    if (process.connected) process.disconnect();
  });
  let stopping = false;
  function stop() {
    if (stopping) return;
    stopping = true;
    server.close(() => { if (process.connected) process.disconnect(); });
    server.closeAllConnections();
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  process.on('disconnect', stop);
  process.on('message', message => { if (message === 'shutdown') stop(); });
}
