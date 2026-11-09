# Tasks

Estas tareas están pendientes. Empezar solo después de aprobación del usuario de los artefactos y autorización para instalar las dependencias del diseño. Cada tarea con lógica debe registrar prueba roja por comportamiento, prueba verde, refactorización y evidencia en REPORT-DrFIC.md; incluir comentarios críticos FIC bilingües donde corresponda.

## 1. Preparación local

- [x] 1.1 Crear workspaces, aplicaciones, scripts y configuración de pruebas del diseño; instalar únicamente dependencias autorizadas y fijar lockfile. Preparar .gitignore antes de .env.example y documentar arranque en docs/SETUP.md. Verificar versiones instaladas, arranque de procesos y que git check-ignore .env confirma exclusión sin leer secretos.

## 2. Cálculos y contratos

- [ ] 2.1 Crear primero fixtures independientes y pruebas de CDF/precios BSM (casos conocidos, ITM/OTM, tasa negativa, paridad, T=0 y límites numéricos); implementar valoración y validación pura. Verificar pruebas verdes con tolerancias de option-valuation y documentar la procedencia de referencias.
- [ ] 2.2 Escribir pruebas de Delta/Gamma/Theta/Vega, unidades, comparación por diferencias finitas y rechazo de T=0; implementar griegas y documentar convenciones. Verificar los escenarios de ambas opciones sin usar nube.
- [ ] 2.3 Escribir pruebas HTTP de las tres rutas F0, campos obligatorios/desconocidos, tipos estrictos, JSON inválido, errores numéricos y /health; implementar API F0 con errores seguros. Verificar contratos con Supertest y documentar peticiones/respuestas.
- [ ] 2.4 Escribir pruebas de dominio y HTTP de Wheel/PMCC con ejemplos 485.5 y 83%, ahorro negativo y validaciones; implementar API F5. Verificar pruebas verdes y documentación de primas por acción y multiplicador 100.

## 3. Persistencia real con pruebas offline

- [ ] 3.1 Escribir pruebas de escenarios, reintento idempotente, conflictos, configuración ausente y timeout con repositorio simulado; implementar adaptador Supabase, rutas y migración aditiva con RLS. Verificar pruebas offline; entregar instrucciones de variables y SQL para aprobación antes de aplicarlo a nube.
- [ ] 3.2 Escribir pruebas de histórico recalculado, manipulación de resultado, duplicados concurrentes, orden, fallos e independencia de proveedores; implementar adaptador MongoDB, rutas y diagnóstico. Verificar pruebas offline e índices propuestos; documentar usuario de base de datos/IP y no imprimir cadenas de conexión.

## 4. Interfaz y entrega local

- [ ] 4.1 Escribir pruebas de formularios y componentes (carga, éxito, vacío, error, respuesta antigua, guardado/reintento y recuperación); implementar React y proxy local con apariencia de terminal financiera inspirada en Webull/Alpaca según design: tema oscuro, identidad DIANA, navegación lateral, paneles de parámetros/resultados y tabla de históricos. Verificar pruebas UI, teclado/foco, contraste, vistas 1366×768 y 390×844 sin superposición ni desbordamiento de página, estados sin datos ficticios y npm run build; documentar controles/unidades y registrar evidencia visual en REPORT-DrFIC.md.
- [ ] 4.2 Preparar colección Postman de cinco operaciones locales y auxiliares sin secretos, docs/DEMO.md y completar docs/SETUP.md. Verificar cada petición local, scripts documentados, cierre de procesos y diagnóstico sin nube; registrar explícitamente Docker/Alpaca/Backspread/Gamma Scalping pendientes.

## 5. Aceptación integrada

- [ ] 5.1 Tras aprobación explícita de la migración y escrituras de prueba en los recursos de demo, guiar al usuario para llenar .env localmente, preparar tabla/índices y probar el recorrido real crear/calcular/guardar/reiniciar/recuperar en ambas bases desde React. Verificar pruebas completas, build, ejemplos Postman y fallo controlado de nube; registrar evidencia con fecha/hora/zona, actualizar C4 y riesgos en REPORT-DrFIC.md y solicitar revisión humana. Si falta acceso real, mantener esta tarea pendiente.

## Workflow follow-up

- Docker y Alpaca requieren planificación posterior y autorización; no son tareas completadas por esta demo.
- Ampliar análisis F5 para Backspread y Gamma Scalping en un cambio posterior.
- Sincronizar especificaciones y archivar solo después de implementación, validación y autorización de cierre.
