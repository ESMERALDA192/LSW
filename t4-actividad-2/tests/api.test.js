import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { createSeed } from '../src/domain/seed.js';
test('API: autenticación, CRUD, validación y cierre de sesión', async () => {
  let db = createSeed(); const app = createApp({ read: () => structuredClone(db), write: next => { db = next; } });
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1/security`;
  let token;
  const request = (path, method = 'GET', body) => fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  try {
    assert.equal((await request('/users')).status, 401);
    assert.equal((await request('/login', 'POST', { email: 'bad', password: 'bad' })).status, 400);
    const login = await request('/login', 'POST', { email: 'demo@reactlab.test', password: 'React123!' }); assert.equal(login.status, 200); token = (await login.json()).token;
    const created = await request('/institutos', 'POST', { name: 'Instituto de prueba', code: 'TEST', city: 'Mazatlán', status: 'Activo' }); assert.equal(created.status, 201); const record = await created.json();
    assert.equal((await (await request(`/institutos/${record.id}`)).json()).code, 'TEST');
    assert.equal((await request(`/institutos/${record.id}`, 'PUT', { ...record, name: 'Editado' })).status, 200);
    assert.equal(db.institutes.find(r => r.id === record.id).name, 'Editado');
    assert.equal((await request('/users', 'POST', { name: 'X', email: 'no-es-email', role: 'Alumno' })).status, 400);
    assert.equal((await request(`/institutos/${record.id}`, 'DELETE')).status, 204);
    assert.equal((await request(`/institutos/${record.id}`)).status, 404);
    assert.equal((await request('/logout', 'POST')).status, 204); assert.equal((await request('/users')).status, 401);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
