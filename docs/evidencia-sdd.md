# Evidencia de desarrollo SDD y optimización

## Estructura observada al inicio

Al iniciar este trabajo, el repositorio contenía contratos compartidos (`src/models/definitions.js`), adaptadores MongoDB/Supabase, servicios CRUD (`src/api/services/investment.service.js`), middleware de errores y un endpoint de salud. El router de `/api/v1` estaba vacío, y `src/index.js` iniciaba Express sin construir los modelos ni los servicios. Por tanto, la lógica de dominio y persistencia existía, pero no había un flujo HTTP funcional para las colecciones.

El historial visible contiene commits llamados `inicializacion ... (Inciso B)`, `Inciso C` e `inciso E`. Esos nombres identifican etapas del proyecto, pero no demuestran quién escribió cada línea ni si se usó IA. Esta evidencia evita atribuir retrospectivamente autoría no verificable.

## Comparación de estructura

| Aspecto | Base existente antes del cambio | Estructura optimizada con este cambio |
| --- | --- | --- |
| Contrato | Definiciones compartidas para diez recursos | Se conserva como única fuente de nombres y relaciones |
| Servicios | CRUD y validación ya implementados | Las rutas delegan validación y persistencia a los servicios existentes |
| HTTP | Router vacío | Rutas CRUD versionadas y rutas de hijos dentro de su padre |
| Arranque | Express iniciaba sin adaptador conectado | El servidor conecta el adaptador configurado antes de escuchar |
| Decisiones de diseño | README de modelos indicaba partes pendientes | OpenSpec registra contrato, contexto, reglas y cambio implementado |

## Clasificación de APIs por método de trabajo

La clasificación siguiente se basa en el código revisado y el historial visible. “IA confirmada” solo se usa para el trabajo de esta sesión. Un commit identifica quién guardó un cambio y cuándo, pero por sí mismo no demuestra si la persona usó IA.

| APIs o componente | Recursos incluidos | Evidencia disponible | Clasificación sustentable |
| --- | --- | --- | --- |
| Rutas HTTP CRUD agregadas en esta sesión | `positions`, `legs`, `systems`, `rules`, `events`, `scenarios`, `valuations`, `simulations`, `rebalance-proposals`, `adjustments` | Se añadieron en `src/api/routes/index.routes.js` siguiendo la propuesta OpenSpec; código generado con asistencia de IA en esta sesión | **Implementadas con asistencia de IA** |
| Arranque y conexión de persistencia agregados en esta sesión | Afecta a todas las APIs CRUD | Se añadieron en `src/index.js` y `src/app.js`; código generado con asistencia de IA en esta sesión | **Implementación asistida por IA; diseño guiado por requisitos** |
| Servicios CRUD y validaciones existentes | Los mismos diez recursos | Commit `e539847` (`inciso E`, GarayDios), que agregó `investment.service.js` y sus pruebas | **Método no registrado**; el commit no confirma IA ni desarrollo manual |
| Contratos y adaptadores de persistencia existentes | Los mismos diez recursos; hijos embebidos en MongoDB o tablas en Supabase | Commit `b112056` (`Inciso C`, jmdelreal), que agregó definiciones y modelos | **Método no registrado**; el commit no confirma IA ni desarrollo manual |
| Base Express y endpoint `/health` | Infraestructura común | Commit `cd6a0c7` (`Inciso B`, Esmeralda Gonzalez) | **Método no registrado**; el commit no confirma IA ni desarrollo manual |

### Qué se optimizó y cómo debe reportarse

La mejora verificable de esta sesión es integrar la capa HTTP que faltaba con los servicios existentes: construir el mapeo de rutas desde el contrato común, limitar recursos hijos a su padre, seleccionar la base desde el entorno servidor y conectar la persistencia antes de escuchar solicitudes. Es una **optimización diseñada y generada con asistencia de IA**, no se debe etiquetar como “hecha manualmente” hasta que un integrante del equipo realice y registre una revisión o modificación manual concreta.

Con la evidencia disponible, el reporte puede identificar las rutas nuevas como asistidas por IA y describir la optimización arquitectónica, pero **no puede afirmar cuáles APIs históricas fueron hechas con IA ni cuáles fueron optimizadas manualmente**. Para completar esa clasificación académica, el equipo debe anotar por cada commit o módulo quién lo desarrolló, si utilizó IA y qué cambio manual verificable hizo (por ejemplo, PR revisado, commit de refactor o registro de revisión). No inferimos el método a partir del estilo del código ni del nombre del autor.

## Artefactos OpenSpec

- Configuración y reglas: `openspec/config.yaml`.
- Contrato vigente: `openspec/specs/investment-api/spec.md`.
- Propuesta y lista de implementación: `openspec/changes/complete-investment-api/`.
- Rutas y guía para ejecutar la API: `docs/api.md`.
