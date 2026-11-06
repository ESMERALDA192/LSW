# API de inversiones

Base: `http://localhost:3000/api/v1`. Todas las respuestas exitosas usan la forma `{ "data": ... }` y los errores usan `{ "error": { "code", "message", "details" } }`.

## Core The Wheel

- `GET /api/v1/cores/wheel`: describe etapas y operaciones disponibles.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/start`: iniciar un ciclo sobre un sistema cuyo tipo sea `wheel`.
- `GET /api/v1/cores/wheel/systems/{systemId}/cycle`: leer su estado e historial.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/legs`: abrir una put cash-secured o una call cubierta.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/legs/{legId}/settle`: registrar liquidación confirmada, incluyendo asignaciones parciales mediante `assignedContracts`.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/legs/{legId}/close`: cerrar la opción mediante recompra.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/mark`: actualizar precios y P&L no realizado.
- `POST /api/v1/cores/wheel/systems/{systemId}/cycle/complete`: terminar el ciclo cuando no haya opciones abiertas.

Cada escritura requiere `expectedVersion`; si otra solicitud actualizó el ciclo, responde HTTP 409. El core no elige strikes ni pronostica asignaciones.

El contrato del cálculo y un ejemplo están en [src/cores/wheel/README.md](../src/cores/wheel/README.md).

## Recursos principales

| Recurso | Ruta |
| --- | --- |
| Posiciones | `/positions` |
| Sistemas | `/systems` |
| Escenarios | `/scenarios` |
| Valuaciones | `/valuations` |
| Simulaciones | `/simulations` |
| Propuestas de rebalanceo | `/rebalance-proposals` |

Cada recurso principal admite `GET` y `POST` en la colección, y `GET`, `PATCH` y `DELETE` en `/{id}`. La lista acepta `page`, `limit` y filtros por campos definidos para el recurso. `POST` responde HTTP 201; las demás operaciones exitosas responden HTTP 200.

Ejemplo:

```http
GET /api/v1/positions?page=1&limit=20&status=open
```

## Recursos hijos

Los hijos siempre incluyen el padre en la URL:

| Recurso | Ruta |
| --- | --- |
| Piernas de posición | `/positions/{positionId}/legs` |
| Reglas de sistema | `/systems/{systemId}/rules` |
| Eventos de sistema | `/systems/{systemId}/events` |
| Ajustes de propuesta | `/rebalance-proposals/{proposalId}/adjustments` |

Las colecciones hijas admiten `GET` y `POST`; un elemento admite `GET`, `PATCH` y `DELETE` en `/{id}`. El servicio valida que el padre exista y limita la operación a ese padre.

## Arranque

1. Copia `.env.example` a `.env` y configura `DATABASE` junto con sus credenciales. `DATABASE` admite `mongodb` o `supabase`.
2. Instala dependencias con `npm install`.
3. Inicia con `npm start` o `npm run dev`.

Para MongoDB configura `MONGODB_URI`. Para Supabase configura `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`; la clave de servicio solo debe estar en el entorno del servidor.

`GET /health` responde el estado del servicio. La selección del motor de base de datos no se acepta desde parámetros ni headers HTTP.
