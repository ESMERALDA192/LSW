# Proposal

## Why

El Equipo 3 necesita mostrar una aplicación funcional en la exposición del 9 de noviembre de 2026. El repositorio solo contiene configuración OpenSpec: falta un recorrido verificable que conecte interfaz, cálculos y persistencia real sin depender de un broker.

## What Changes

- Incorporar una interfaz local React/JavaScript por componentes para introducir escenarios F0, calcular Call/Put/griegas y mostrar resultados y errores en español.
- Dar a la interfaz una apariencia de terminal financiera inspirada en las referencias públicas de Webull y Alpaca: tema oscuro, navegación lateral, paneles de parámetros/resultados y tabla de históricos, manteniendo identidad DIANA y datos reales del cálculo o almacenamiento.
- Exponer las tres operaciones F0 y las dos operaciones F5 de Wheel/PMCC mediante Node.js/Express, con pruebas determinísticas antes del código.
- Guardar escenarios nombrados en Supabase y resultados históricos de F0/F5 en MongoDB Atlas; listar y recuperar ambos tras recargar la página.
- Añadir estados visibles de conexión y fallo, sin presentar datos en memoria como guardados en nube.
- Preparar arranque local, configuración de secretos exclusivamente del backend, colección Postman para las cinco operaciones locales y guion de exposición.
- Mantener una demostración local de un solo operador. No incluir autenticación multiusuario ni publicación pública en este cambio.

## Capabilities

### New Capabilities

- `option-valuation`: valoración europea sin dividendos y griegas con contratos y errores definidos.
- `strategy-capital`: costo base Wheel y comparación de capital PMCC.
- `financial-records`: escenarios en Supabase e históricos en MongoDB Atlas, con confirmación real de escritura y lectura.
- `financial-demo-ui`: recorrido de exposición local con formularios, resultados, persistencia y estados de operación.

### Modified Capabilities

Ninguna. El inventario de especificaciones principales está vacío.

## Impact

Se prevén aplicaciones nuevas en `apps/web`, `apps/api-f0` y `apps/api-f5`, módulos compartidos de dominio/validación/persistencia, pruebas, migración SQL, ejemplos de entorno y documentación. React, Express, herramientas de construcción/pruebas y clientes de las bases requerirán instalación posterior autorizada. Supabase y Atlas serán recursos creados por el usuario; este cambio documental no crea ni modifica recursos en nube.

Se conservará intacto `motor-elegibilidad-empresas`. Esta demo concentra el primer tramo funcional; posteriores cambios podrán ampliar las capacidades sin duplicar las especificaciones.

## Fuentes y decisiones propuestas

El documento `Equipo_3_F0_F5_APIs_Docker_Alpaca.docx`, secciones 4, 5, 7–11, define el alcance académico. La guía del ZIP, capítulo 6, aporta SDD/TDD y evidencia. El usuario confirmó React/JavaScript, Node.js/Express, Supabase y MongoDB en nube y autorizó preparar esta planificación. El contrato detallado, la operación local sin login y el reparto exacto de datos quedan sujetos a revisión de estos artefactos antes de implementar.

## No objetivos

No incluye órdenes, credenciales ni conectividad Alpaca; automatización de estrategias; endpoints de Backspread/Gamma Scalping; predicción de rentabilidad; dividendos; opciones americanas; PWA instalable; autenticación multiusuario; despliegue público; edición/eliminación de registros. Docker y las cinco operaciones Alpaca siguen pendientes del proyecto académico y se abordarán después. Las cinco operaciones locales no sustituyen las diez operaciones HTTP del documento.

## Riesgos de integración por etapa

1. Cálculos: resultados plausibles pero incorrectos. Mitigar con referencias independientes, paridad y límites numéricos explícitos.
2. API/interfaz: coerciones, respuestas antiguas y unidades ambiguas. Validación compartida, estados claros y pruebas HTTP/UI.
3. Nube: credenciales, esquema e IP de acceso pueden retrasar la demo. Preparar diagnóstico sin secretos; conservar cálculos locales y mostrar fallos reales al guardar.
4. Exposición: falta de Internet o cambios de IP. Ensayar en la red prevista; no declarar persistencia verificada con mocks.

## Plan de validación y reversión

Validar este cambio con OpenSpec. Tras aprobación: ciclo rojo/verde/refactor, pruebas de dominio/API/UI offline, construcción de la interfaz y prueba real crear/calcular/guardar/reiniciar/recuperar con ambas bases. Registrar resultados y pendientes en `REPORT-DrFIC.md`.

La reversión detiene los procesos locales y revierte únicamente archivos de implementación del cambio. No elimina automáticamente datos ni recursos de nube; cualquier limpieza remota requiere autorización. No hay migraciones destructivas sobre sistemas existentes.
