# Design

## Context

Ver proposal.md, sección Why. No existe implementación, package.json, pruebas ni esquema de base de datos reutilizable. Hay un cambio anterior solo con metadatos; no se modifica.

Inspección registrada el 8 de noviembre de 2026, 21:07:13 America/Mazatlan (UTC-07:00):
- Node.js v26.10.0, npm 11.19.1, Git 2.55.0.windows.5 y OpenSpec 1.16.1 disponibles.
- Postman encontrado en PATH y en su directorio de aplicación; no se ha probado una petición.
- Docker no encontrado en PATH ni Docker Desktop en su ubicación habitual; esto no demuestra ausencia en cualquier otra ubicación.
- Recursos Supabase/Atlas pendientes de creación por el usuario. No se han solicitado ni probado credenciales.
- Fecha objetivo inferida de “mañana”: 9 de noviembre de 2026. No se garantiza el proyecto completo para esa fecha.

## Goals / Non-Goals

**Goals:** dominio matemático puro, contratos HTTP comprobables, persistencia real con responsabilidades separadas y una interfaz sencilla para un operador local. Preparar un camino de arranque sin Docker.

**Non-Goals:** no abrir servidores a Internet o red local; no implementar login, trading, Docker ni infraestructura remota en este cambio. La revisión de estos documentos no autoriza por sí misma instalaciones o escrituras en nube.

## Decisions

### D1. Dos APIs y una interfaz, con dominio compartido

Usar JavaScript con módulos ES y npm workspaces. F0 escucha en 127.0.0.1:8000 y F5 en 127.0.0.1:8001. React utiliza Vite en localhost:5173 y un proxy de desarrollo para /f0, /f5, /scenarios, /history y /storage; F5 se dirige a 8001 y el resto a 8000. Cada API expone /health directamente en su puerto. Un lanzador raíz inicia y detiene los tres procesos, informa conflictos de puertos y no mata procesos ajenos.

Alternativa descartada: un único servidor con todo el dominio. Sería algo más corto, pero separar las APIs respeta la arquitectura prevista sin duplicar matemáticas. La persistencia se aloja en F0 para evitar un tercer servicio; el histórico F5 se recalcula con el módulo compartido, sin llamada HTTP entre APIs.

El usuario pidió una apariencia similar a Webull o Alpaca. Crear una terminal financiera con navegación F0, F5 e Historial, etiquetas en español y CSS propio sin biblioteca visual adicional. Las referencias públicas orientan la composición; la identidad será DIANA Inversions. React no implica implementar una PWA.

#### Dirección visual para la tarea 4.1

- Tema oscuro por defecto: fondo #0B1018, paneles #141D2B, bordes #334155, texto principal #F1F5F9 y secundario #B6C2D2. Acento azul #60A5FA; verde y rojo solo para estados y signos, acompañados de texto.
- Navegación lateral compacta con marca DIANA y entradas F0, F5 e Historial. En pantallas estrechas, convertirla en navegación superior sin ocultar funciones.
- Barra superior con título del módulo, etiqueta “Demo académica” y estados separados de Supabase/MongoDB. No equiparar proceso disponible con base conectada.
- En escritorio, formulario de parámetros a la izquierda y panel de resultados a la derecha; escenarios guardados e históricos en secciones inferiores. En móvil, apilar en orden de uso.
- Resultados destacados con unidades junto al valor: precio por unidad, Delta/Gamma/Theta/Vega o comparación de capital PMCC. Usar cifras tabulares y alineación numérica a la derecha en tablas.
- Paneles sobrios, separadores finos, espaciado consistente y tipografía de sistema. Priorizar legibilidad para proyectar frente a reproducir toda la densidad de una plataforma bursátil.
- Acciones reales: Calcular, Guardar escenario, Guardar histórico, Cargar y Reintentar. Sin controles decorativos que aparenten órdenes, cotizaciones en vivo o saldo de una cuenta.
- No agregar feeds, gráficas de mercado inventadas, logotipos ajenos ni nuevas dependencias. Las métricas visibles provienen de las APIs y registros existentes. No se amplían los contratos financieros.
- Verificar visualmente a 1366×768 y 390×844, foco de teclado visible y contraste mínimo 4.5:1 en texto normal. Tablas extensas pueden desplazarse dentro de su contenedor; la página no debe desbordarse horizontalmente.

Referencias públicas consultadas: [Webull Desktop](https://www.webull.com/trading-platforms/desktop-app/) documenta disposición de widgets y herramientas; [guía del dashboard Alpaca](https://alpaca.markets/learn/start-paper-trading) documenta la navegación de Paper Trading. Se consultaron páginas públicas, no cuentas autenticadas. La paleta y la distribución detalladas aquí son decisiones de diseño de DIANA, no una afirmación de reproducción exacta de las interfaces actuales.

Composición prevista:

```text
+------------+---------------------------------------------+
| DIANA      | F0 / F5 / Historial       Estado de bases   |
|            +-------------------+-------------------------+
| F0         | Parámetros        | Resultados y unidades   |
| F5         |                   |                         |
| Historial  +-------------------+-------------------------+
|            | Escenarios guardados / tabla de históricos |
+------------+---------------------------------------------+
```

### D2. Estructura prevista

Todos los siguientes son archivos futuros, no creados durante planificación:
- package.json, package-lock.json: workspaces, scripts de arranque, pruebas y construcción.
- .gitignore, .env.example: exclusión de secretos y plantilla sin valores reales.
- apps/api-f0/src/app.js y server.js: rutas F0, escenarios, históricos y diagnóstico.
- apps/api-f5/src/app.js y server.js: rutas Wheel/PMCC.
- packages/domain/src/black-scholes.js, greeks.js, strategies.js y validation.js: funciones puras y validación común.
- packages/persistence/src/supabase-scenarios.js y mongo-history.js: adaptadores con interfaces inyectables para pruebas offline.
- apps/web/src/App.jsx, components/CalculationForm.jsx, ResultsPanel.jsx, ScenarioPanel.jsx, HistoryPanel.jsx, ConnectionStatus.jsx y services/api.js.
- apps/web/src/components/AppShell.jsx, Sidebar.jsx y style.css: composición de terminal y estilos adaptables de la tarea 4.1; sin modificar las APIs.
- Pruebas *.test.js/*.test.jsx junto a cada unidad; fixtures numéricos versionados en packages/domain/fixtures/.
- scripts/dev.js y scripts/check-storage.js: arranque y comprobación de conexión sin imprimir secretos.
- database/supabase/001_scenarios.sql: creación aditiva y protección de la tabla.
- docs/SETUP.md, docs/DEMO.md y postman/DIANA-local.postman_collection.json.

Dependencias propuestas para aprobación de implementación: express, react, react-dom, @supabase/supabase-js y mongodb; desarrollo: vite, @vitejs/plugin-react, vitest, @testing-library/react, @testing-library/user-event, jsdom y supertest. Fijar versiones compatibles mediante lockfile tras comprobar requisitos del runtime. No cambiar Node ni instalar herramientas globales sin autorización. No se necesita Python.

### D3. Contratos y cálculo

Los contratos normativos están en las cuatro specs. Para F0, los cinco campos son obligatorios; tasa y volatilidad en fracción, tiempo en años. No hay conversión de cadena a número en la API. La interfaz convierte los campos antes de enviar y evita convertir vacío a cero.

Aplicar la formulación BSM sin dividendos del documento docente; usar una CDF normal con precisión suficiente y validar referencias independientes, no fixtures generados con la misma función bajo prueba. Theta usa la derivada respecto al paso del tiempo dividida entre 365; Vega se divide entre 100. No redondear en dominio/persistencia: el frontend formatea precio y capital a dos decimales y griegas a seis, conservando valores originales.

time_years=0 produce valor intrínseco en precios; griegas exige tiempo positivo. Volatilidad cero se rechaza en esta demo, sin afirmar que el caso carezca de solución matemática. Tasas negativas finitas son válidas. Controlar resultados intermedios y finales no finitos; devolver NUMERIC_RANGE_ERROR. No imponer límites de mercado inventados.

Respuestas:
- Precios: { option_type, theoretical_price, model }.
- Griegas: { call: { delta, gamma, theta, vega }, put: { delta, gamma, theta, vega }, model, units }.
- units: delta=per_underlying_unit, gamma=delta_per_underlying_unit, theta=per_calendar_day_365, vega=per_volatility_percentage_point.
- Wheel: { strategy: "the_wheel", cost_basis_per_share }.
- PMCC: { strategy: "pmcc", contract_size: 100, stock_capital, leaps_capital, capital_saved, savings_percent }.
- Errores: { error: { code, message, details: [{ field, message }] } }; details vacío para errores sin campo.
- Mensajes y rutas erróneas nunca muestran stack traces, URLs de conexión ni respuestas crudas de proveedores.

### D4. Persistencia explícita y desacoplada

Calcular no escribe. El botón Guardar histórico hace POST /history con operation, inputs y un UUID; el backend valida y recalcula para no confiar en resultados del navegador. El histórico no necesita scenario_id: guarda una instantánea completa de entradas. Esto evita un falso compromiso atómico entre dos bases.

Supabase: tabla public.scenarios con id UUID PK, name, parameters JSONB y created_at timestamptz asignado por servidor. parameters solo contiene los cinco campos F0. Activar RLS y no conceder políticas de acceso anónimo o autenticado desde navegador. El backend utiliza su clave secreta; al ser demo local sin login, no se publica el servidor. La migración debe aplicar restricciones coherentes con los campos obligatorios y nombre de 1–80 caracteres.

MongoDB: base diana_demo y colección calculation_history; _id es el UUID recibido. Almacenar operation, inputs, result, created_at y calculation_version="1". Índice de lectura por created_at descendente y _id; _id aporta unicidad. No almacenar secretos ni datos personales.

POST /scenarios y POST /history devuelven el registro directamente; GET devuelve { items: [...] }, máximo 50 ordenados de forma estable. No hay edición ni borrado en esta demo. Mismo UUID y contenido canónico: 200; mismo UUID con contenido diferente: 409. No comparar timestamps aportados por cliente porque se rechazan. Un duplicado concurrente se resuelve leyendo el registro existente y comparando, no insertando otro.

Los adaptadores devuelven errores de proveedor normalizados. Un timeout puede ocultar una escritura ya confirmada en nube: conservar el UUID para reintentar y advertir de resultado incierto.

Alternativa descartada: guardar en ambas bases todos los datos. Duplica estado y aumenta problemas de consistencia sin mejorar el recorrido de la demo.

### D5. Configuración de credenciales

Archivo local previsto: C:/Users/gaelm/Documents/diana-inversions/.env, cargado únicamente por los procesos backend. NO existe todavía ni debe llenarse antes de preparar su exclusión de Git. Durante implementación se creará primero .gitignore y una plantilla .env.example; después se indicará al usuario dónde introducir los valores.

Variables de aplicación propuestas:
- SUPABASE_URL: URL del proyecto.
- SUPABASE_SECRET_KEY: clave secreta para backend; nunca clave dentro del código React.
- MONGODB_URI: cadena de conexión de Atlas con usuario de base de datos.
- MONGODB_DB_NAME: diana_demo.

No usar prefijo VITE_ para secretos ni importar el entorno del backend en el frontend. Validar presencia sin imprimir valores. La comprobación de Git debe mostrar que .env está ignorado, no su contenido. No se necesitan claves Alpaca para esta etapa.

El usuario crea proyecto Supabase, clúster Atlas, usuario de base de datos con permisos de lectura/escritura de diana_demo y acceso desde la IP que utilizará durante la exposición. La tabla SQL y los índices solo se aplicarán después de autorización para preparar/probar esas bases. No cambiar reglas de acceso remotas automáticamente.

Referencias oficiales consultadas para estas decisiones:
- Supabase, claves API y secretos exclusivos del backend: https://supabase.com/docs/guides/getting-started/api-keys.
- MongoDB Atlas, conexión con usuario de base de datos e IP permitida: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/?interface=atlas-ui.

### D6. Fallos, observabilidad y operación local

Las APIs pueden arrancar sin nube: dominio disponible, persistencia 503. No se ofrece fallback en memoria al usuario. Los mocks solo existen en pruebas.

Comprobaciones de acceso de /storage/status: lectura mínima de tabla y colección. Una lectura no certifica permisos de escritura; la aceptación de nube requiere además la prueba explícita de guardado. Estado HTTP 200 con { supabase: { status }, mongodb: { status } } y status por proveedor ready/not_configured/unavailable; no devuelve valores de entorno.

Límite de espera de dependencia: 5 segundos, cancelación cuando el cliente lo permita; límite de petición UI de 12 segundos. No reintentar automáticamente escrituras; reintento manual con UUID estable. El límite temporal debe cubrir también la selección/conexión del servidor MongoDB. Registrar identificador de petición, ruta, duración y estado, sin cuerpo de entrada ni cabeceras sensibles.

Interfaz con estados idle/loading/success/error, identificador de petición o AbortController para descartar respuestas antiguas y botón guardar inhabilitado si cambia la entrada. Históricos se muestran como instantáneas, no como cotizaciones en vivo.

Alternativa descartada: desplegar públicamente la demo sin autenticación. El uso de claves privilegiadas exige mantener el backend en loopback hasta diseñar autorización por usuario.

### D7. Pruebas y entrega

Proponer npm test para dominio/API/UI con Vitest, Supertest y Testing Library, npm run build para frontend y npm run dev para los tres procesos. Estos scripts aún no existen. Usar fixtures fijos y mocks de repositorios para fallos/idempotencia, reloj controlado para orden y UUIDs fijos en pruebas.

Pruebas numéricas: caso S=K=100,T=1,r=0.05,sigma=0.2, casos ITM/OTM, tasas negativas, vencimiento inmediato, paridad y derivadas por diferencias finitas para griegas. Verificar la procedencia de los valores y tolerancias antes de aprobar los fixtures. Casos del profesor: Wheel 485.50; PMCC 50000/8500/41500/83%.

La evidencia real de nube exige crear un escenario y un histórico, consultar, reiniciar el backend y recuperar ambos. Ejecutarla solo en recursos de demo autorizados. Si no hay credenciales/Internet, marcar esa aceptación pendiente y no afirmar que la demo completa funciona.

Postman incluye cinco cálculos locales más peticiones auxiliares de escenario/histórico/diagnóstico, sin secretos. No cuenta auxiliares como sustitutos de operaciones Alpaca.

## Risks / Trade-offs

- Plazo de un día → priorizar dominio, pantalla y recorrido de nube; no instalar Docker para desbloquear lo anterior.
- Node disponible sin dependencias probadas → comprobar compatibilidad y lockfile durante instalación autorizada, sin prometer compatibilidad de antemano.
- IP de la escuela diferente → pedir al usuario revisar acceso Atlas antes de ensayar allí.
- Backend con clave privilegiada y sin login → bind a loopback; no publicación pública.
- MongoDB/Supabase no transaccionales entre sí → guardados separados y estado por operación.
- Cálculos con precisión insuficiente → referencias y pruebas numéricas antes de UI.
- Recursos de nube o red pendientes → mostrar fallo real y registrar que el criterio persistente aún no está satisfecho.

## Migration Plan

1. Obtener aprobación de estas especificaciones y del alcance de implementación.
2. Crear estructura, protección de secretos e instalar dependencias autorizadas; implementar por TDD.
3. Entregar plantilla y guiar al usuario para completar .env localmente.
4. Mostrar la migración y los efectos de las pruebas antes de solicitar autorización de escritura en nube.
5. Aplicar esquema aditivo, comprobar ambas bases y ejecutar recorrido de aceptación.
6. Entregar guion y colección Postman; registrar pendientes académicos y evidencias.
7. Reversión: detener procesos y revertir archivos de este cambio; no borrar nube sin autorización.

## Open Questions

- Nombres/identificadores concretos de los proyectos y disponibilidad de la red de exposición: el usuario los aportará sin compartir secretos.
- Hora exacta de la exposición, útil para organizar el ensayo, sin cambiar los contratos.
