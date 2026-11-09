## Purpose

Definir el core aislado de la estrategia Wheel y su API para registrar el efecto de una pierna de opción liquidada.

## Requirements

### Requirement: ciclo de opciones cash-secured put y covered call

El core SHALL calcular el crédito neto, efecto de asignación, efectivo y acciones resultantes para una put cash-secured o una call cubierta.

#### Scenario: put asignada

- **WHEN** se evalúa una put asignada con efectivo que cubre strike por contratos por multiplicador
- **THEN** el core SHALL descontar el precio de asignación y sumar las acciones correspondientes
- **AND** reportar la etapa `sell_covered_call` para acciones suficientes

#### Scenario: call asignada

- **WHEN** se evalúa una call asignada y existen acciones suficientes para cubrirla
- **THEN** el core SHALL abonar el valor de asignación y restar las acciones entregadas
- **AND** reportar la etapa del ciclo según las acciones restantes

#### Scenario: opción no asignada

- **WHEN** una pierna confirmada no fue asignada
- **THEN** el core SHALL registrar el crédito neto de prima y comisiones sin cambiar las acciones por ejercicio

#### Scenario: asignación parcial

- **WHEN** el cliente confirma que solo se asignó parte de los contratos abiertos
- **THEN** el core SHALL aplicar el flujo de acciones y efectivo únicamente a los contratos asignados
- **AND** SHALL cerrar el resto de la opción según el resultado reportado

### Requirement: no inferir asignación ni recomendar una operación

El core SHALL requerir el resultado de liquidación confirmado como entrada y SHALL NOT predecir asignación, seleccionar strikes ni presentar la salida como recomendación financiera.

#### Scenario: resultado de liquidación desconocido

- **WHEN** `assignedContracts` falta, no es entero o supera los contratos abiertos
- **THEN** el core SHALL responder con un error de validación HTTP 400

### Requirement: ciclo completo persistido y versionado

El core SHALL persistir el estado del ciclo Wheel asociado a un sistema de tipo `wheel`, incluyendo efectivo, acciones, costo promedio, opción activa, P&L e historial de eventos.

#### Scenario: iniciar y avanzar un ciclo

- **WHEN** un cliente inicia el ciclo y registra apertura, liquidación o cierre de una opción
- **THEN** el core SHALL validar la etapa, cobertura y estado actual antes de aplicar la transición
- **AND** SHALL persistir la transición con una versión incrementada

#### Scenario: escrituras concurrentes

- **WHEN** el `expectedVersion` enviado no coincide con la versión persistida
- **THEN** la API SHALL responder HTTP 409 sin sobrescribir el estado más reciente

#### Scenario: recalcular valor no realizado

- **WHEN** el cliente envía una marca del subyacente y, si aplica, de la opción abierta
- **THEN** el core SHALL recalcular P&L no realizado y el P&L total
