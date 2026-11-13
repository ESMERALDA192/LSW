# T4 · Actividad 2 — React Lab

Aplicación PWA desarrollada con **Vite + React + JavaScript**, siguiendo la numeración de los archivos proporcionados por el alumno.

## Ejecutar

Requiere Node.js 22.12+ (se verificó con Node 26).

```powershell
cd C:\LSW\ACT\t4-actividad-2
npm install
npm run dev
```

Abre la dirección que muestra Vite. Entra con **demo@reactlab.test / React123!**. El botón “Usar credenciales demo” llena el formulario; después pulsa Entrar.

## Funciones

- Inicio, login con `useReducer`, validación y cierre de sesión.
- Usuarios: crear, consultar detalle, editar, eliminar, buscar y paginar.
- Consulta externa de ReqRes con Axios, `useEffect`, `useRef` y `useUsuarios`.
- Contadores `useState` y `useCounter`.
- Formularios reutilizables mediante `useForm`.
- Rutas anidadas y AppBar con Material UI; menú adaptable a móviles.
- Institutos con Redux Toolkit, store, slice, acciones y thunks.
- Negocios vinculados a institutos y pestañas de información adicional, referencias de archivos, teléfonos, direcciones web y domicilios.
- Catálogos adicionales de Seguridad, Educación y Comercio con CRUD.
- Eliminación en cascada de los negocios y detalles del instituto, previa confirmación.
- Manifest, iconos 192/512 y service worker generado con Workbox. Instalación y aviso de actualización.

## Dos arquitecturas de datos

1. **Demo local (predeterminada y versión alojada):** React → hooks o Redux → repositorio → localStorage. Los datos permanecen en el navegador al recargar. La sesión de demostración se reinicia al recargar; los registros no se borran. No hay sincronización entre dispositivos. Se muestra “Demo local” en la barra.
2. **Cliente–servidor:** React → hooks o Redux → Axios → API REST Express → archivo JSON en disco. Ejecutar la API y cambiar la configuración como se indica abajo. Se muestra “API Express”.

No se agrega otro frontend porque las notas y el enunciado especifican Vite + React. Se demuestran diferentes arquitecturas y se incorpora Express como framework de servidor.

### Activar API Express

```powershell
Copy-Item .env.example .env.local
```

En `.env.local`, cambia `VITE_DATA_MODE=local` por `VITE_DATA_MODE=api`. En una terminal ejecuta `npm run api`; en otra, `npm run dev`. Reinicia Vite después de cambiar variables. Para volver al modo local, cambia ese valor a `local`.

La API escucha solo en `127.0.0.1:3001`; Vite realiza el proxy. Persiste en `server/data/database.json` (ignorado en Git). La escritura se realiza con archivo temporal y renombrado. Credenciales demo iguales a las del frontend. Los tokens caducan en una hora y se invalidan al reiniciar la API. Es una API académica, no un servicio de autenticación para producción; no uses datos reales.

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/v1/security/login` | Devuelve token de sesión |
| POST | `/api/v1/security/logout` | Invalida token |
| GET | `/api/v1/security/institutos` | Listado |
| GET | `/api/v1/security/institutos/:id` | Detalle |
| POST | `/api/v1/security/institutos` | Alta |
| PUT | `/api/v1/security/institutos/:id` | Actualización |
| DELETE | `/api/v1/security/institutos/:id` | Baja |

Los catálogos `users`, `businesses`, `products`, `courses`, etc. admiten las mismas operaciones. Excepto login y `/api/health`, requieren `Authorization: Bearer <token>`. Ejemplo de cuerpo de instituto:

```json
{"name":"Instituto de prueba","code":"TEST-01","city":"Mazatlán","status":"Activo"}
```

## Relación con las notas

| Archivo | Implementación |
|---|---|
| 4.6 Hook - useState | `src/pages/HooksLab.jsx` |
| 4.7 Custom Hook - useCounter | `src/hooks/useCounter.js` |
| 4.8 Componente Hook - useReducer | `src/security/auth/AuthContext.jsx` |
| 4.9 Peticiones HTTP API GET con Axios | `src/hooks/useUsuarios.js`, `src/pages/RemoteUsers.jsx` |
| 4.10 Crear paginación de una tabla | Paginación remota y `CrudTable.jsx` |
| 4.11 Custom Hook para useUsuarios | `src/hooks/useUsuarios.js` |
| 4.12 Formularios | Login y formularios de catálogos controlados |
| 4.13 Utilizando custom Hook en formularios | `src/hooks/useForm.js` |
| 6.1 Crear Proyecto Web con Vite + React + JavaScript | `package.json`, `vite.config.js` |
| 6.2 Crear App principal del Proyecto | `src/AppAllModules.jsx`, `main.jsx`, `share/css/allPages.css` |
| 6.3 Crear Ruteo de Paginas | Rutas anidadas, Outlet, módulos Seguridad/Educación/Comercio |
| 6.4 Agregar la AppBar | `src/components/Layout.jsx` |
| 6.5 Creando la estructura Redux | `src/security/redux/{actions,slices,store}`, `thunks.js` |
| 6.6 Diseñando la Pagina Demo - TabPages | `src/security/institutes/pages/Institutes.jsx` |

Las notas se usan como material de referencia. Se corrigieron imports, nombres de variables y rutas inconsistentes. Se usa HashRouter para que las rutas funcionen también en alojamiento estático. Se implementaron CRUDs completos para satisfacer el enunciado; la nota 6.6 solamente prepara la navegación y deja las tablas para más adelante. Archivos permite administrar **referencias URL**, no carga de binarios.

## Verificación y PWA

```powershell
npm test
npm run build
npm run preview
```

Las pruebas cubren CRUD, validación, duplicados, relaciones, eliminación en cascada y API con autenticación. Para revisar la PWA abre la URL de preview, visita la aplicación, espera al aviso de disponibilidad sin conexión y recarga. La instalación depende del navegador y necesita HTTPS o localhost. El modo local funciona sin red después de la primera carga; ReqRes y la API Express requieren su conexión. No se cachean respuestas autenticadas de la API ni se encolan cambios remotos offline.

## Guion de demostración

1. Abrir Inicio y entrar con las credenciales de prueba.
2. Usuarios → crear, consultar, editar, buscar, cambiar de página y eliminar.
3. Recargar, iniciar sesión y comprobar que los registros permanecen.
4. Consulta de API → siguiente/anterior; observar los estados de carga y error.
5. Hooks de React → sumar, restar y reiniciar; consultar el estado del reducer.
6. Institutos → seleccionar → Negocios → seleccionar → probar las pestañas y sus CRUDs.
7. Educación/Comercio → crear una carrera y un producto.
8. Compilar y abrir preview para instalar la PWA y probar el modo local sin conexión.
9. Activar API Express para demostrar peticiones HTTP persistentes.

## Referencias técnicas verificadas

- [ReqRes](https://reqres.in/docs): los endpoints clásicos permiten GET sin clave con límites; sus escrituras no persisten. Por eso se separa la consulta externa del CRUD propio.
- [Vite PWA](https://vite-pwa-org.netlify.app/guide/): manifest y service worker.
- [Redux Toolkit](https://redux-toolkit.js.org/api/configurestore/): configuración del store.
