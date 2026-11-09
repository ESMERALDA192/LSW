# Add the Wheel strategy core

## Why

The project already identifies `wheel` as a system type, but it has no isolated strategy logic. Separate cores let each investment methodology evolve independently from the shared persistence and CRUD layers.

## What changes

- Add a pure Wheel lifecycle that starts a cycle, opens and settles or closes a leg, marks P&L, and completes the cycle.
- Persist the aggregate state and append-only transition history on the Wheel system, with optimistic version checks.
- Expose cycle operations at dedicated `/api/v1/cores/wheel` routes.
- Document the request, accounting assumptions, limitations, and OpenSpec requirements.

## Design

Keep calculation logic in `src/cores/wheel`, independent from database models. Persist state in `systems.wheelState` and use `wheelVersion` for compare-and-set updates in MongoDB and Supabase. Require the caller's confirmed assignment result because assignment cannot be inferred reliably from price alone. Validate cash-secured puts and covered calls before applying account changes.

## Out of scope

Option pricing, market data, strike selection, order placement, persistent trade history, taxes, dividends, interest, and investment recommendations.
