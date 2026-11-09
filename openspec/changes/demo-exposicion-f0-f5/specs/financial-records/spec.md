# Spec Delta

## Purpose

Guardar y recuperar escenarios e históricos reales para demostrar persistencia después de recargar o reiniciar la aplicación, diferenciando fallos de nube de cálculos locales.

## ADDED Requirements

### Requirement: Escenarios F0 persistentes
POST /scenarios SHALL recibir id UUID generado por el cliente, name de 1 a 80 caracteres tras quitar espacios exteriores y parameters con los cinco campos F0 válidos. SHALL guardar en Supabase y devolver HTTP 201 con id, name, parameters y created_at UTC. GET /scenarios SHALL devolver items, los últimos 50 escenarios por fecha descendente e id como desempate.

#### Scenario: Guardar y recuperar
- **GIVEN** Supabase configurado y disponible
- **WHEN** se guarda un escenario, se reinicia el backend y se lista
- **THEN** aparece con el mismo id, nombre y parámetros; no depende de memoria del proceso.

#### Scenario: Reintento de guardado
- **GIVEN** un id previamente guardado
- **WHEN** se repite el mismo contenido
- **THEN** devuelve HTTP 200 con el registro existente sin duplicarlo; si el contenido difiere devuelve 409 ID_CONFLICT.

### Requirement: Históricos verificables
POST /history SHALL recibir id UUID, operation en call/put/greeks/wheel/pmcc e inputs válidos para esa operación. SHALL recalcular en el backend y persistir en MongoDB id, operation, inputs, result, created_at UTC y calculation_version. SHALL devolver 201 solo tras confirmación de escritura; no aceptará resultados calculados por el navegador.

#### Scenario: Histórico después de reiniciar
- **GIVEN** MongoDB disponible y un cálculo válido guardado
- **WHEN** se reinicia el servicio y se consulta GET /history
- **THEN** items incluye ese registro entre los últimos 50, ordenados por fecha descendente e id como desempate, con entradas y resultados reproducibles.

#### Scenario: Reintento sin duplicados
- **GIVEN** un id ya persistido
- **WHEN** se repite la misma operación e inputs
- **THEN** devuelve 200 con el registro original; un contenido distinto para ese id produce 409 ID_CONFLICT.

#### Scenario: Resultado manipulado
- **WHEN** el cliente incluye result o un campo desconocido al guardar histórico
- **THEN** devuelve 422 VALIDATION_ERROR y no persiste el contenido.

### Requirement: Errores de persistencia explícitos
Las operaciones de persistencia SHALL devolver 503 STORAGE_UNAVAILABLE si falta configuración o falla una dependencia, sin usar memoria como sustituto silencioso. Los errores SHALL incluir mensaje seguro en español sin credenciales ni cadenas de conexión. Las operaciones de escenarios e históricos SHALL ser independientes, sin prometer una transacción entre ambas bases.

#### Scenario: Supabase falla
- **GIVEN** Supabase inaccesible y MongoDB disponible
- **WHEN** se guarda un escenario
- **THEN** se informa fallo sin confirmar guardado; calcular y guardar histórico siguen disponibles.

#### Scenario: Escritura de confirmación incierta
- **GIVEN** una escritura agota el tiempo de espera
- **WHEN** se informa el fallo
- **THEN** no se afirma que el registro esté ausente; se permite consultar o repetir con el mismo id sin duplicar.

### Requirement: Diagnóstico y secretos
GET /health SHALL devolver estado del proceso sin exponer configuración. GET /storage/status SHALL informar por proveedor ready, not_configured o unavailable después de comprobar acceso al almacenamiento requerido, sin mostrar secretos. Los secretos SHALL permanecer en el backend; esta demo SHALL limitarse al equipo local de un operador.

#### Scenario: Diagnóstico sin configuración
- **GIVEN** faltan las variables de nube
- **WHEN** se consulta el estado
- **THEN** devuelve not_configured por proveedor y el proceso sigue atendiendo cálculos locales.

#### Scenario: Comprobación real de acceso
- **GIVEN** credenciales presentes pero tabla inaccesible o usuario MongoDB sin permiso
- **WHEN** se consulta el estado de almacenamiento
- **THEN** informa unavailable en el proveedor afectado; presencia de una variable no basta para declarar ready.
