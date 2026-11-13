import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/domain/seed.js';
import { saveToDatabase, removeFromDatabase } from '../src/domain/database.js';
import { validateRecord } from '../src/domain/catalogs.js';
test('CRUD conserva identidades, valida duplicados y elimina el registro', () => {
  const db = createSeed();
  const r = saveToDatabase(db, 'users', { name: 'Prueba', email: 'test@example.com', role: 'Alumno' }, 'test-user');
  assert.equal(db.users.length, 8);
  saveToDatabase(db, 'users', { ...r, name: 'Nombre actualizado' });
  assert.equal(db.users.find(x => x.id === r.id).name, 'Nombre actualizado');
  assert.throws(() => saveToDatabase(db, 'users', { ...r, id: undefined, email: 'TEST@example.com' }), /Ya existe/);
  removeFromDatabase(db, 'users', r.id); assert.equal(db.users.length, 7);
});
test('borrar un instituto elimina negocios y datos asociados, conserva otras instituciones', () => {
  const db = createSeed(); saveToDatabase(db, 'businesses', { parentId: 'i2', name: 'Otro', type: 'Campus', city: 'Chihuahua' }, 'other');
  saveToDatabase(db, 'info', { parentId: 'b1', name: 'Horario', value: '8 a 4' }, 'info1');
  removeFromDatabase(db, 'institutes', 'i1');
  assert.deepEqual(db.businesses.map(r => r.id), ['other']); assert.equal(db.info.length, 0); assert.equal(db.phones.length, 0); assert.equal(db.institutes.length, 2);
});
test('rechaza hijos huérfanos, precios negativos, URL insegura y rangos invertidos', () => {
  assert.throws(() => saveToDatabase(createSeed(), 'businesses', { parentId: 'missing', name: 'X', type: 'Campus', city: 'Y' }), /padre/);
  assert.ok(validateRecord('products', { name: 'X', code: 'X', price: -5, stock: 0 }).price);
  assert.ok(validateRecord('websites', { name: 'X', url: 'javascript:alert(1)' }).url);
  assert.ok(validateRecord('periods', { name: 'X', start: '2026-12-01', end: '2026-01-01' }).end);
});
