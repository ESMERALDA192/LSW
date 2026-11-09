## ADDED Requirements

### Requirement: core aislado y ciclo persistido de estrategia Wheel

El servicio SHALL exponer un core separado bajo `src/cores/wheel` que gestione el ciclo persistido de una put cash-secured y una call cubierta.

#### Scenario: gestionar una opción abierta y su resultado

- **WHEN** el cliente abre, liquida (total o parcialmente) o cierra una opción con una versión esperada válida
- **THEN** el core SHALL validar cobertura y etapa, calcular efectivo, acciones, base de costo y P&L
- **AND** SHALL guardar la transición y su evento en el sistema Wheel

#### Scenario: actualización concurrente

- **WHEN** otra solicitud ya incrementó la versión del ciclo
- **THEN** la API SHALL responder HTTP 409 y conservar el estado actualizado

### Requirement: rutas del ciclo persistido

La API SHALL exponer rutas para iniciar, leer, avanzar, marcar y completar un ciclo Wheel asociado a un sistema.

#### Scenario: liquidar una transición inválida

- **WHEN** faltan datos requeridos, el sistema no es de tipo Wheel, la operación no está cubierta o la versión esperada está obsoleta
- **THEN** la API SHALL devolver HTTP 400 con detalles de validación
- **AND** SHALL responder HTTP 409 para una versión obsoleta
