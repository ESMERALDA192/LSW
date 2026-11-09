# Preparación local de DIANA Inversions

## Estado de la tarea 1.1

Están preparados npm workspaces, dos servidores Express independientes, una pantalla
inicial React, el lanzador conjunto y las herramientas de pruebas. Los cálculos F0/F5,
los formularios definitivos y los adaptadores de nube aún no están implementados.
No se ejecuta ninguna operación financiera ni se conecta una base de datos.

## Entorno comprobado

Windows y PowerShell, Node.js 26.10.0, npm 11.19.1. Las dependencias instaladas
admiten Node ^22.22.2, ^24.15.0 o >=26.0.0; la ejecución se comprobó en 26.10.0.
No hace falta Python ni Docker para este arranque local.

Desde la raíz del proyecto:

```powershell
cd C:\Users\gaelm\Documents\diana-inversions
npm run dev
```

| Servicio | Dirección | Estado actual |
|---|---|---|
| React | http://localhost:5173 | Pantalla de preparación |
| API F0 | http://127.0.0.1:8000/ | JSON que identifica el servidor F0 |
| API F5 | http://127.0.0.1:8001/ | JSON que identifica el servidor F5 |

Dejar abierta la terminal. Ctrl+C detiene los procesos iniciados por el lanzador.
Si un puerto está ocupado, se informa y se cancela el arranque; no se termina
ningún proceso ajeno. Cierra la terminal del servicio que ya usaba ese puerto.
Los servidores escuchan únicamente en la computadora local.

Para iniciar por separado, usar una terminal por servicio:

```powershell
npm run dev:f0
npm run dev:f5
npm run dev:web
```

No ejecutar simultáneamente el arranque conjunto y el individual.
Las rutas financieras, /health y las rutas de persistencia se añadirán en sus
tareas posteriores; por ahora devolverán 404.

## Dependencias reproducibles

Las versiones directas están fijadas en los package.json; package-lock.json
fija el árbol completo. node_modules no se sube a Git.

En otra copia del proyecto, después de autorizar la instalación:

```powershell
npm ci
```

Paquetes principales instalados: Express 5.3.0, React/React DOM 19.3.1,
Vite 8.3.6, plugin React 6.2.1, Vitest 5.1.0, jsdom 31.0.0,
Testing Library React 16.3.3, user-event 14.6.8, Supertest 7.3.2,
Supabase JS 2.119.0 y MongoDB 7.8.0.

## Pruebas y construcción

```powershell
npm test
npm run build
```

Detener primero los servicios: las pruebas de arranque necesitan los puertos 8000,
8001 y 5173 libres. Las pruebas actuales comprueban ciclo de vida del lanzador,
conflicto de puerto sin detener el dueño y renderizado React con jsdom.
No son pruebas de exactitud financiera ni de persistencia.

La construcción genera apps/web/dist. Ese directorio no se versiona y su generación
no inicia un servidor ni publica la aplicación.

npm run test:watch permite volver a ejecutar las pruebas mientras se edita.
Si un entorno de ejecución restringido bloquea procesos con EPERM, ejecutar los
comandos desde una terminal local autorizada; no cambiar permisos de Windows ni
instalar paquetes globales como solución.

## Ubicación de las credenciales

La plantilla .env.example está en la raíz y no contiene secretos.
Cuando llegue la configuración de nube, copiarla a .env sin sobrescribir un archivo
existente:

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item -LiteralPath .env.example -Destination .env
}
```

Abrir .env en VS Code e introducir los valores localmente:

| Variable | Valor que se colocará |
|---|---|
| SUPABASE_URL | URL del proyecto de Supabase |
| SUPABASE_SECRET_KEY | Clave secreta del backend |
| MONGODB_URI | Cadena de conexión de Atlas con usuario de base de datos |
| MONGODB_DB_NAME | diana_demo |

No pegarlos en el chat, capturas ni archivos de React. No usar prefijo VITE_.
Las APIs cargan el archivo raíz si existe; la interfaz no lo carga.
Los clientes están instalados pero todavía no se usan, por lo que llenar el archivo
no conecta ni prepara automáticamente ninguna base.

Verificar exclusión sin imprimir valores:

```powershell
git check-ignore -v .env
```

.gitignore excluye .env y sus variantes en cualquier carpeta, conservando únicamente
.env.example como plantilla versionable. No forzar la inclusión con git add -f.
La creación de tablas, índices y registros de prueba requiere la revisión y
autorización acordadas con el usuario.
