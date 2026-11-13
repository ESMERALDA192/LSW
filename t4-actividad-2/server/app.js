import express from 'express';
import { randomUUID } from 'node:crypto';
import { catalogs } from '../src/domain/catalogs.js';
import { saveToDatabase, removeFromDatabase } from '../src/domain/database.js';
// API didáctica local. No se expone a interfaces de red públicas.
export function createApp({ read, write }) {
  const app = express(); const sessions = new Map();
  app.use(express.json({ limit: '64kb' }));
  app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
  const router = express.Router();
  router.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    if (String(email).trim().toLowerCase() !== 'demo@reactlab.test' || password !== 'React123!') return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    const token = randomUUID(); const user = { name: 'Estudiante', email: 'demo@reactlab.test' };
    sessions.set(token, { user, expires: Date.now() + 60 * 60 * 1000 }); res.json({ token, user });
  });
  router.use((req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer /, ''); const session = sessions.get(token);
    if (!session || session.expires < Date.now()) { sessions.delete(token); return res.status(401).json({ message: 'Sesión no válida. Inicia sesión de nuevo.' }); }
    req.token = token; next();
  });
  router.post('/logout', (req, res) => { sessions.delete(req.token); res.sendStatus(204); });
  router.param('entity', (req, res, next, entity) => {
    req.entity = entity === 'institutos' ? 'institutes' : entity;
    if (!catalogs[req.entity]) return res.status(404).json({ message: 'Catálogo no encontrado.' }); next();
  });
  router.get('/:entity', (req, res) => res.json(read()[req.entity]));
  router.get('/:entity/:id', (req, res) => { const record = read()[req.entity].find(r => r.id === req.params.id); return record ? res.json(record) : res.status(404).json({ message: 'Registro no encontrado.' }); });
  router.post('/:entity', (req, res) => { const db = read(); const record = saveToDatabase(db, req.entity, { ...req.body, id: undefined }, randomUUID()); write(db); res.status(201).json(record); });
  router.put('/:entity/:id', (req, res) => { const db = read(); if (!db[req.entity].some(r => r.id === req.params.id)) return res.status(404).json({ message: 'Registro no encontrado.' }); const record = saveToDatabase(db, req.entity, { ...req.body, id: req.params.id }); write(db); res.json(record); });
  router.delete('/:entity/:id', (req, res) => { const db = read(); if (!db[req.entity].some(r => r.id === req.params.id)) return res.status(404).json({ message: 'Registro no encontrado.' }); removeFromDatabase(db, req.entity, req.params.id); write(db); res.sendStatus(204); });
  app.use('/api/v1/security', router);
  app.use((error, req, res, next) => res.status(400).json({ message: error.message || 'No se pudo procesar la solicitud.' }));
  return app;
}
