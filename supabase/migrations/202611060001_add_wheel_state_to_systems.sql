alter table public.systems
  add column if not exists "wheelState" jsonb,
  add column if not exists "wheelVersion" integer not null default 0;
