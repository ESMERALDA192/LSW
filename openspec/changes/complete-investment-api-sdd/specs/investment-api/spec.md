## ADDED Requirements

### Requirement: rutas CRUD de la API de inversiones

El servicio SHALL exponer operaciones HTTP CRUD para los recursos principales `positions`, `systems`, `scenarios`, `valuations`, `simulations` y `rebalance-proposals` en `/api/v1/{resource}`; y para `legs`, `rules`, `events` y `adjustments` en una ruta que identifique al recurso padre.

#### Scenario: operar un recurso principal

- **WHEN** el cliente envía una operación de lista, alta, lectura, actualización o borrado a la ruta del recurso
- **THEN** el servicio SHALL delegar al servicio CRUD compartido y devolver el resultado bajo la clave `data`

#### Scenario: limitar operaciones de recursos hijos

- **WHEN** el cliente opera un hijo mediante `/api/v1/{parent}/{parentId}/{child}`
- **THEN** el servicio SHALL limitar la operación al padre identificado en la ruta
- **AND** SHALL rechazar solicitudes a recursos hijos que no incluyan la ruta padre

### Requirement: inicialización segura de persistencia

El servicio SHALL inicializar el adaptador de persistencia desde variables de entorno antes de aceptar solicitudes.

#### Scenario: base no configurada

- **WHEN** `DATABASE` no es `mongodb` ni `supabase`, o faltan credenciales requeridas
- **THEN** el proceso SHALL finalizar el arranque con un error de configuración sin escuchar en el puerto HTTP
