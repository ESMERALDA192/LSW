import { catalogs } from './catalogs.js';
export function createSeed() {
  return {
    ...Object.fromEntries(Object.keys(catalogs).map(k => [k, []])),
    users: [
      { id: 'u1', name: 'Ana Martínez', email: 'ana@example.com', role: 'Alumno' },
      { id: 'u2', name: 'Diego Hernández', email: 'diego@example.com', role: 'Docente' },
      { id: 'u3', name: 'Sofía Ramírez', email: 'sofia@example.com', role: 'Alumno' },
      { id: 'u4', name: 'Mateo García', email: 'mateo@example.com', role: 'Administrador' },
      { id: 'u5', name: 'Valentina López', email: 'valentina@example.com', role: 'Docente' },
      { id: 'u6', name: 'Emiliano Torres', email: 'emiliano@example.com', role: 'Alumno' },
      { id: 'u7', name: 'Camila Flores', email: 'camila@example.com', role: 'Alumno' }
    ],
    institutes: [
      { id: 'i1', name: 'Instituto del Pacífico', code: 'ITP-001', city: 'Mazatlán', status: 'Activo' },
      { id: 'i2', name: 'Centro Tecnológico del Norte', code: 'CTN-002', city: 'Chihuahua', status: 'Activo' },
      { id: 'i3', name: 'Instituto de Innovación Digital', code: 'IID-003', city: 'Culiacán', status: 'Inactivo' }
    ],
    businesses: [{ id: 'b1', parentId: 'i1', name: 'Campus Centro', type: 'Campus', city: 'Mazatlán' }, { id: 'b2', parentId: 'i1', name: 'Campus Norte', type: 'Campus', city: 'Mazatlán' }],
    phones: [{ id: 'ph1', parentId: 'b1', name: 'Recepción (ejemplo)', phone: '669 000 0000' }],
    products: [{ id: 'p1', name: 'Cuaderno de laboratorio', code: 'LAB-001', price: 89, stock: 24 }, { id: 'p2', name: 'Kit de desarrollo', code: 'DEV-002', price: 450, stock: 12 }],
    courses: [{ id: 'c1', name: 'Ingeniería en Sistemas', code: 'ISC', duration: 9 }],
    groups: [{ id: 'g1', name: 'Programación Web · 7A', teacher: 'Docente de ejemplo', room: 'Laboratorio 2' }],
    labels: [{ id: 'l1', name: 'Comunidad académica', description: 'Clasificación de usuarios del instituto' }],
    periods: [{ id: 'pe1', name: 'Agosto – Diciembre 2026', start: '2026-08-17', end: '2026-12-18' }]
  };
}
