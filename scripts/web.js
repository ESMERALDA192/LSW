import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../apps/web/', import.meta.url));
const server = await createServer({ root, configFile: fileURLToPath(new URL('../apps/web/vite.config.js', import.meta.url)) });
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await server.close();
  if (process.connected) process.disconnect();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('disconnect', stop);
process.on('message', message => { if (message === 'shutdown') void stop(); });
try {
  await server.listen();
  server.printUrls();
  process.send?.({ type: 'ready' });
} catch {
  console.error('React: no se pudo iniciar el servidor.');
  process.exitCode = 1;
  await stop();
}
