import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const services = [
  { name: 'F0', port: 8000, entry: 'apps/api-f0/src/server.js' },
  { name: 'F5', port: 8001, entry: 'apps/api-f5/src/server.js' },
  { name: 'React', port: 5173, entry: 'scripts/web.js' },
];
const children = [];
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  // FIC: Stop only our direct children. / Detener solo los procesos hijos propios.
  await Promise.all(children.map(({ child, exited }) => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    if (child.connected) child.send('shutdown', () => {});
    const timer = setTimeout(() => child.kill(), 4000);
    return exited.finally(() => clearTimeout(timer));
  }));
  if (process.connected) process.disconnect();
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());
process.on('disconnect', () => void stop());
process.on('message', message => { if (message === 'shutdown') void stop(); });

function available(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', () => reject(new Error('Puerto ' + port + ' ocupado o no disponible. Cierra su proceso desde la terminal correspondiente.')));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

try {
  // FIC: Check before starting; do not terminate port owners. / Comprobar antes; no matar dueños de puertos.
  for (const service of services) await available(service.port);
  for (const service of services) {
    if (stopping) break;
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [service.entry], { cwd: root, stdio: ['ignore', 'inherit', 'inherit', 'ipc'], windowsHide: true });
      const exited = new Promise(done => {
        child.once('exit', done);
        child.once('error', done);
      });
      children.push({ child, exited });
      const timer = setTimeout(() => reject(new Error(service.name + ': tiempo de arranque agotado.')), 15000);
      child.once('message', message => {
        if (message?.type === 'ready') { clearTimeout(timer); resolve(); }
      });
      child.once('error', () => { clearTimeout(timer); reject(new Error(service.name + ': no se pudo iniciar.')); });
      child.once('exit', (code, signal) => {
        clearTimeout(timer);
        if (!stopping) {
          reject(new Error(service.name + ': terminó durante el arranque.'));
          console.error(service.name + ' terminó inesperadamente.');
          void stop(code || 1);
        }
      });
    });
  }
  if (!stopping) console.log('Servicios listos. React: http://localhost:5173 · Ctrl+C para detener todo.');
} catch (error) {
  console.error(error.message);
  await stop(1);
}
