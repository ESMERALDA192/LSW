import { catalogs, childEntities, cleanRecord, validateRecord } from './catalogs.js';
export function saveToDatabase(db, entity, input, id = crypto.randomUUID()) {
  if (!catalogs[entity]) throw new Error('Catálogo desconocido.');
  const editing = input.id;
  if (editing && !db[entity].some(r => r.id === editing)) throw new Error('El registro ya no existe.');
  const record = { ...cleanRecord(entity, input), id: editing || id };
  const parent = entity === 'businesses' ? 'institutes' : childEntities.includes(entity) ? 'businesses' : null;
  if (parent) {
    if (!db[parent].some(r => r.id === input.parentId)) throw new Error('Selecciona un registro padre válido.');
    record.parentId = input.parentId;
  }
  const errors = validateRecord(entity, record, db[entity]);
  if (Object.keys(errors).length) throw new Error(Object.values(errors).join(' '));
  db[entity] = editing ? db[entity].map(r => r.id === editing ? record : r) : [...db[entity], record];
  return record;
}
export function removeFromDatabase(db, entity, id) {
  if (!db[entity]?.some(r => r.id === id)) throw new Error('El registro ya no existe.');
  if (entity === 'institutes') for (const b of [...db.businesses].filter(b => b.parentId === id)) removeFromDatabase(db, 'businesses', b.id);
  if (entity === 'businesses') for (const child of childEntities) db[child] = db[child].filter(r => r.parentId !== id);
  db[entity] = db[entity].filter(r => r.id !== id);
}
