# API de inversiones

## Purpose

Exponer los recursos de inversión F0/F5 mediante una API HTTP versionada, respaldada por las definiciones de recursos y los servicios CRUD compartidos.

## Requirements

### Requirement: acceso CRUD a recursos principales

El servicio SHALL exponer operaciones de lista, alta, lectura, actualización y borrado bajo `/api/v1/{resource}` para `positions`, `systems`, `scenarios`, `valuations`, `simulations` y `rebalance-proposals`.

#### Scenario: listar un recurso principal

- **WHEN** un cliente envía `GET /api/v1/{resource}` con `page`, `limit` y filtros opcionales
- **THEN** el servicio SHALL responder HTTP 200 con `{ "data": [...] }`
- **AND** SHALL delegar filtrado y paginación al servicio de inversión correspondiente

#### Scenario: crear un recurso principal

- **WHEN** un cliente envía `POST /api/v1/{resource}` con un cuerpo JSON válido
- **THEN** el servicio SHALL responder HTTP 201 con `{ "data": ... }`

#### Scenario: leer, actualizar o borrar un recurso principal

- **WHEN** un cliente envía `GET`, `PATCH` o `DELETE /api/v1/{resource}/{id}`
- **THEN** el servicio SHALL responder HTTP 200 y devolver el resultado en `data`
- **AND** un recurso inexistente SHALL producir el formato de error HTTP 404 estándar

### Requirement: recursos hijos limitados a su padre

El servicio SHALL exponer `legs`, `rules`, `events` y `adjustments` únicamente mediante las rutas de sus recursos padre.

#### Scenario: operar sobre un recurso hijo

- **WHEN** un cliente usa `/api/v1/{parent}/{parentId}/{child}` y, opcionalmente, el `{id}` del hijo
- **THEN** el servicio SHALL limitar cada operación a ese padre
- **AND** SHALL rechazar el acceso a una colección hija sin ruta padre

### Requirement: errores de validación consistentes

El servicio SHALL devolver errores como `{ "error": { "code": string, "message": string, "details": [] } }` y conservar los códigos HTTP definidos por los servicios.

#### Scenario: cuerpo o consulta inválidos

- **WHEN** una solicitud incluye campos desconocidos, datos obligatorios ausentes, enums o paginación inválidos, o intenta modificar un campo inmutable
- **THEN** el servicio SHALL responder HTTP 400 con el código `VALIDATION_ERROR`

### Requirement: configuración de base de datos del servidor

El servicio SHALL elegir MongoDB o Supabase mediante la configuración del entorno del servidor y SHALL NOT permitir que una solicitud HTTP seleccione la base de datos.

#### Scenario: iniciar con MongoDB configurado

- **WHEN** `DATABASE=mongodb` y `MONGODB_URI` están configurados
- **THEN** el servicio SHALL conectarse antes de aceptar solicitudes

#### Scenario: iniciar con Supabase configurado

- **WHEN** `DATABASE=supabase` y las credenciales del servidor están configuradas
- **THEN** el servicio SHALL crear el cliente del servidor antes de aceptar solicitudes
