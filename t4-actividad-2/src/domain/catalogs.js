// Esquemas compartidos por formularios, repositorio local y API Express.
const field = (key, label, type = 'text', extra = {}) => ({ key, label, type, required: true, ...extra });
export const catalogs = {
  users: { title: 'Usuarios', singular: 'usuario', note: '4.9–4.13', fields: [field('name', 'Nombre completo'), field('email', 'Correo electrónico', 'email'), field('role', 'Rol', 'select', { options: ['Alumno', 'Docente', 'Administrador'] })] },
  institutes: { title: 'Institutos', singular: 'instituto', note: '6.5–6.6', fields: [field('name', 'Nombre del instituto'), field('code', 'Clave'), field('city', 'Ciudad'), field('status', 'Estado', 'select', { options: ['Activo', 'Inactivo'] })] },
  businesses: { title: 'Negocios', singular: 'negocio', fields: [field('name', 'Nombre del negocio'), field('type', 'Tipo', 'select', { options: ['Campus', 'Sucursal', 'CEDI'] }), field('city', 'Ciudad')] },
  info: { title: 'Info adicional', singular: 'dato adicional', fields: [field('name', 'Concepto'), field('value', 'Descripción')] },
  files: { title: 'Archivos', singular: 'referencia de archivo', fields: [field('name', 'Nombre del archivo'), field('url', 'Enlace al archivo', 'url')] },
  phones: { title: 'Teléfonos', singular: 'teléfono', fields: [field('name', 'Contacto'), field('phone', 'Número', 'tel')] },
  websites: { title: 'Direcciones web', singular: 'dirección web', fields: [field('name', 'Descripción'), field('url', 'URL', 'url')] },
  addresses: { title: 'Domicilios', singular: 'domicilio', fields: [field('name', 'Tipo de domicilio'), field('street', 'Calle y número'), field('city', 'Ciudad'), field('zip', 'Código postal')] },
  labels: { title: 'Etiquetas', singular: 'etiqueta', fields: [field('name', 'Nombre'), field('description', 'Descripción')] },
  periods: { title: 'Periodos', singular: 'periodo', fields: [field('name', 'Nombre'), field('start', 'Fecha inicial', 'date'), field('end', 'Fecha final', 'date')] },
  courses: { title: 'Carreras', singular: 'carrera', fields: [field('name', 'Nombre'), field('code', 'Clave'), field('duration', 'Semestres', 'number', { min: 1 })] },
  groups: { title: 'Grupos', singular: 'grupo', fields: [field('name', 'Nombre'), field('teacher', 'Docente'), field('room', 'Aula')] },
  products: { title: 'Productos', singular: 'producto', fields: [field('name', 'Nombre'), field('code', 'SKU'), field('price', 'Precio (MXN)', 'number', { min: 0 }), field('stock', 'Existencias', 'number', { min: 0 })] },
  prices: { title: 'Precios', singular: 'precio', fields: [field('name', 'Producto / tarifa'), field('price', 'Precio (MXN)', 'number', { min: 0 })] },
  orders: { title: 'Pedidos', singular: 'pedido', fields: [field('name', 'Folio'), field('customer', 'Cliente'), field('total', 'Total (MXN)', 'number', { min: 0 })] },
  payments: { title: 'Pagos', singular: 'pago', fields: [field('name', 'Referencia'), field('amount', 'Importe (MXN)', 'number', { min: 0 }), field('method', 'Método', 'select', { options: ['Transferencia', 'Efectivo', 'Tarjeta'] })] },
  shippings: { title: 'Envíos', singular: 'envío', fields: [field('name', 'Guía'), field('carrier', 'Transportista'), field('destination', 'Destino')] },
  inventories: { title: 'Inventarios', singular: 'registro de inventario', fields: [field('name', 'Producto'), field('warehouse', 'Almacén'), field('quantity', 'Cantidad', 'number', { min: 0 })] }
};
export const childEntities = ['info', 'files', 'phones', 'websites', 'addresses'];
export function emptyRecord(entity) {
  return Object.fromEntries(catalogs[entity].fields.map(f => [f.key, f.options?.[0] ?? '']));
}
export function validateRecord(entity, record, rows = []) {
  const schema = catalogs[entity];
  if (!schema) return { form: 'Catálogo no válido.' };
  const errors = {};
  for (const f of schema.fields) {
    const value = String(record[f.key] ?? '').trim();
    if (f.required && !value) errors[f.key] = 'Este campo es obligatorio.';
    else if (value.length > 240) errors[f.key] = 'Máximo 240 caracteres.';
    else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[f.key] = 'Escribe un correo válido.';
    else if (f.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < (f.min ?? 0))) errors[f.key] = `Ingresa un número mayor o igual a ${f.min ?? 0}.`;
    else if (f.options && !f.options.includes(value)) errors[f.key] = 'Selecciona una opción válida.';
    else if (f.type === 'url') { try { if (!['http:', 'https:'].includes(new URL(value).protocol)) throw Error(); } catch { errors[f.key] = 'Usa una URL con https:// o http://.'; } }
    else if (f.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) errors[f.key] = 'Escribe una fecha válida.';
  }
  if (entity === 'periods' && record.start > record.end) errors.end = 'La fecha final debe ser posterior a la inicial.';
  const unique = entity === 'users' ? 'email' : ['institutes', 'products', 'courses'].includes(entity) ? 'code' : null;
  if (unique && rows.some(r => r.id !== record.id && String(r[unique]).toLowerCase() === String(record[unique]).trim().toLowerCase())) errors[unique] = 'Ya existe un registro con este valor.';
  return errors;
}
export function cleanRecord(entity, input) {
  return Object.fromEntries(catalogs[entity].fields.map(f => [f.key, f.type === 'number' ? Number(input[f.key]) : String(input[f.key] ?? '').trim()]));
}
