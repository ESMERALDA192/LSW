-- Migración 001: Creación aditiva de tabla scenarios para F0 y protección con RLS.
-- FIC: Additive migration for F0 scenarios with RLS protection.

create table if not exists public.scenarios (
  id uuid primary key,
  name text not null check (char_length(name) between 1 and 80),
  parameters jsonb not null,
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security (RLS)
alter table public.scenarios enable row level security;

-- Política de acceso para backend privilegiado y demo
create policy "Acceso completo para backend y demo"
  on public.scenarios
  for all
  using (true)
  with check (true);

