import axios from 'axios';
import { createSeed } from '../domain/seed.js';
import { saveToDatabase, removeFromDatabase } from '../domain/database.js';
export const apiMode = import.meta.env.VITE_DATA_MODE === 'api';
const key = 't4-react-lab-v1';
export const api = axios.create({ baseURL: import.meta.env.VITE_REST_API_SECURITY_EDUCATION || '/api/v1/security', timeout: 10000 });
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('t4-api-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401) { sessionStorage.removeItem('t4-api-token'); window.dispatchEvent(new Event('t4-session-expired')); }
  return Promise.reject(new Error(error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'La API tardó demasiado. Intenta de nuevo.' : 'No fue posible conectar con la API. Comprueba que esté encendida.')));
});
function readDB() {
  const raw = localStorage.getItem(key);
  if (!raw) { const seed = createSeed(); localStorage.setItem(key, JSON.stringify(seed)); return seed; }
  try { const db = JSON.parse(raw); if (!Object.keys(createSeed()).every(k => Array.isArray(db[k]))) throw Error(); return db; }
  catch { throw new Error('No se pudieron leer los datos guardados. Exporta o revisa el almacenamiento del navegador.'); }
}
function writeDB(db) {
  try { localStorage.setItem(key, JSON.stringify(db)); window.dispatchEvent(new Event('t4-data-changed')); }
  catch { throw new Error('No hay espacio para guardar. El cambio no se conservó.'); }
}
const endpoint = entity => entity === 'institutes' ? 'institutos' : entity;
export const repository = {
  async list(entity) { return apiMode ? (await api.get(`/${endpoint(entity)}`)).data : structuredClone(readDB()[entity]); },
  async save(entity, input) {
    if (apiMode) return (await api[input.id ? 'put' : 'post'](`/${endpoint(entity)}${input.id ? `/${input.id}` : ''}`, input)).data;
    const db = readDB(); const record = saveToDatabase(db, entity, input); writeDB(db); return record;
  },
  async remove(entity, id) {
    if (apiMode) { await api.delete(`/${endpoint(entity)}/${id}`); return; }
    const db = readDB(); removeFromDatabase(db, entity, id); writeDB(db);
  }
};
