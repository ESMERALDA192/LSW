# Complete and specify the investment API

## Why

The repository already has shared resource definitions, database models, and CRUD services, but `/api/v1` has no routes and the process starts without initializing either persistence adapter. The architecture therefore cannot serve the documented resources.

## What changes

- Add versioned CRUD routes for all top-level investment resources and parent-scoped routes for child resources.
- Initialize MongoDB or Supabase from server environment variables before listening.
- Define OpenSpec as the project's spec-driven workflow and describe the observable API contract.
- Record the baseline and implementation evidence so authorship claims are not inferred from code style alone.

## Design decision

Keep the existing shared definitions and service layer as the domain contract, and generate the HTTP resource mapping from those definitions. Keep database credentials and adapter selection in server configuration. Do not expose a client-controlled database switch.

## Out of scope

Authentication/authorization, database schema migrations, investment calculations, and deployment provisioning.

## Evidence approach

The repository history has commits labeled by project incisos, but does not identify whether a person or AI authored each change. Document the initial structure and this OpenSpec-guided implementation separately; do not claim verified AI authorship for historical code without external evidence.
