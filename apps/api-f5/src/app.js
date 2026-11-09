import express from 'express';
export const app = express();
app.disable('x-powered-by');
app.get('/', (_req, res) => res.json({ service: 'f5', status: 'scaffold', message: 'Preparación local. Estrategias pendientes.' }));
