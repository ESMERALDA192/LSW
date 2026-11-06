# Core The Wheel

El core mantiene un ciclo completo dentro de un sistema cuyo `type` es `wheel`. Persiste su estado en `systems.wheelState`, registra transiciones en un historial y protege las escrituras concurrentes con `wheelVersion`. El cálculo de dominio está separado de Express y de los adaptadores MongoDB/Supabase.

## Flujo del ciclo

1. Iniciar el ciclo desde un sistema Wheel: toma `initialCash` y el símbolo.
2. Abrir una put cash-secured o una call cubierta según la fase actual. La prima entra al efectivo y se registra la opción activa.
3. Liquidar la opción con el resultado confirmado o cerrarla antes mediante recompra.
4. Si una put se asigna, descuenta el strike y agrega acciones; si una call se asigna, vende las acciones al strike y calcula el P&L realizado de las acciones.
5. Marcar el precio del subyacente (y de la opción activa si existe) para actualizar P&L no realizado.
6. Repetir el ciclo o completarlo cuando no haya una opción abierta.

Cada escritura requiere `expectedVersion` del estado leído. Si otra petición ya modificó el ciclo, la API responde HTTP 409 y el cliente debe volver a leerlo.

## Ejemplo de uso

Primero crea un sistema mediante `POST /api/v1/systems`:

```json
{
  "name": "Wheel XYZ",
  "type": "wheel",
  "status": "active",
  "initialCash": 12000
}
```

Después inicia el ciclo con `POST /api/v1/cores/wheel/systems/{systemId}/cycle/start` y el cuerpo `{ "symbol": "XYZ", "expectedVersion": 0 }`. Para abrir una put usa `POST /api/v1/cores/wheel/systems/{systemId}/cycle/legs`:

```json
{
  "expectedVersion": 1,
  "optionType": "put",
  "strike": 100,
  "premiumPerShare": 2,
  "contracts": 1,
  "feePerContract": 0.65,
  "expiration": "2027-01-15T21:00:00.000Z"
}
```

La respuesta incluye el `activeLeg.id`. Usa ese ID al liquidarla en `/legs/{legId}/settle`, junto con `expectedVersion`, `assignedContracts` y `underlyingPrice`. Si se asigna un contrato de 100 acciones, el ciclo pasa a `covered_call` y una call cubierta puede abrirse con la siguiente versión.

## Rutas

- `GET /api/v1/cores/wheel`: metadatos.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/start`: iniciar; cuerpo `{ "symbol": "XYZ", "expectedVersion": 0 }`.
- `GET /api/v1/cores/wheel/systems/{systemId}/cycle`: leer estado e historial.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/legs`: abrir opción; requiere `expectedVersion`, `optionType`, `strike`, `premiumPerShare`, `contracts`, `feePerContract` y `expiration`.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/legs/{legId}/settle`: liquidar con `expectedVersion`, `assignedContracts`, `underlyingPrice` y `settlementFees` opcional. `assignedContracts` permite registrar asignación parcial.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/legs/{legId}/close`: cerrar con `expectedVersion`, `buybackPricePerShare` y `closingFeePerContract`.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/mark`: cuerpo con `expectedVersion`, `markPrice` y, cuando haya opción abierta, `optionMarkPricePerShare`.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/complete`: completar un ciclo sin opción abierta.

El multiplicador estándar es 100 acciones y se fija al iniciar el ciclo. Se puede especificar otro para contratos ajustados.

## Contabilidad

El estado separa P&L realizado de opciones, P&L realizado de acciones, P&L no realizado de acciones y opciones, efectivo, acciones y costo promedio. La asignación se recibe como número de contratos confirmados, por lo que también admite asignación parcial; el core no la predice ni la deduce únicamente del precio.

Este core no selecciona strikes, envía órdenes ni consulta mercado. Los precios, primas y comisiones deben provenir del sistema externo que lo invoque. Impuestos, dividendos, intereses, deslizamiento y ajustes corporativos de contratos quedan fuera del cálculo.
