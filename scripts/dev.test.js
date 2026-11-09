import { afterEach, expect, test } from 'vitest';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const children = [];
const servers = [];
afterEach(async () => {
  for (const child of children.splice(0)) {
    if (child.exitCode !== null || child.signalCode !== null) continue;
    if (child.exitCode === null && child.connected) child.send('shutdown');
    await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(5000)]);
    if (child.exitCode === null) child.kill();
  }
  for (const server of servers.splice(0)) await new Promise(resolve => server.close(resolve));
});

function run() {
  const child = spawn(process.execPath, ['scripts/dev.js'], { stdio: ['ignore', 'pipe', 'pipe', 'ipc'], windowsHide: true });
  children.push(child);
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  return { child, output: () => output };
}

async function waitFor(condition, message) {
  for (let i = 0; i < 150; i++) {
    if (await condition()) return;
    await delay(100);
  }
  throw new Error(typeof message === 'function' ? message() : message);
}

test('arranca F0, F5 y React y libera sus puertos al detenerse', async () => {
  const { child, output } = run();
  await waitFor(() => output().includes('Servicios listos'), () => output());
  const f0 = await fetch('http://127.0.0.1:8000/').then(r => r.json());
  const f5 = await fetch('http://127.0.0.1:8001/').then(r => r.json());
  expect(f0.service).toBe('f0');
  expect(f5.service).toBe('f5');
  expect(await fetch('http://localhost:5173/').then(r => r.text())).toContain('DIANA Inversions');
  child.send('shutdown');
  await waitFor(() => child.exitCode !== null, 'El lanzador no terminó');
  expect(child.exitCode).toBe(0);
  for (const port of [8000, 8001, 5173]) {
    const server = net.createServer();
    await new Promise((resolve, reject) => server.once('error', reject).listen(port, '127.0.0.1', resolve));
    servers.push(server);
  }
});

test('rechaza un puerto ocupado sin detener al proceso que lo usa', async () => {
  const occupied = net.createServer(socket => socket.end());
  await new Promise(resolve => occupied.listen(8000, '127.0.0.1', resolve));
  servers.push(occupied);
  const { child, output } = run();
  await waitFor(() => child.exitCode !== null, 'El lanzador no detectó el conflicto');
  expect(child.exitCode).toBe(1);
  expect(output()).toContain('8000');
  expect(occupied.listening).toBe(true);
});
