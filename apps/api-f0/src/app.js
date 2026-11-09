import express from 'express';
export const app = express();
app.disable('x-powered-by');
app.get('/', (_req, res) => res.json({ service: 'f0', status: 'scaffold', message: 'Preparación local. Cálculos pendientes.' }));
