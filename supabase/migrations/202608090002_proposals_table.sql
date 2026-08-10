-- =========================================================
-- RFM Proposals: Personalized Client Webpage Builder
-- Migration: 202608090002_proposals_table.sql
-- NOTE: RLS intentionally disabled — photographer-only app
-- =========================================================

create extension if not exists "pgcrypto";

-- ── proposals table ──────────────────────────────────────
create table if not exists public.proposals (
  id             uuid        primary key default gen_random_uuid(),

  -- Identification
  slug           text        not null unique
                             default lower(encode(gen_random_bytes(6), 'hex')),

  -- Couple info
  bride_name     text        not null default '',
  groom_name     text        not null default '',
  wedding_dates  text[]      not null default '{}',
  tagline        text        not null default '',

  -- Coverage: [{ day, subtitle, crew[] }]
  coverage       jsonb       not null default '[]'::jsonb,

  -- Investment: { total, advance, weddingDay, balance, description }
  investment     jsonb       not null default '{}'::jsonb,

  -- Deliverables: [{ category, icon, items[] }]
  deliverables   jsonb       not null default '[]'::jsonb,

  -- Smart features: [{ title, desc }]
  smart_features jsonb       not null default '[]'::jsonb,

  -- Terms list
  terms          text[]      not null default '{}',

  -- FAQ: [{ q, a }]
  faq            jsonb       not null default '[]'::jsonb,

  -- Contact: { phone, email, instagram }
  contact        jsonb       not null default '{}'::jsonb,

  -- Custom sections: [{ label, icon, content }]
  custom_fields  jsonb       not null default '[]'::jsonb,

  -- Theme key
  theme          text        not null default 'royal-amber',

  -- Published flag
  is_published   boolean     not null default false,

  -- Timestamps
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── indexes ──────────────────────────────────────────────
create index if not exists proposals_slug_idx on public.proposals(slug);
create index if not exists proposals_created_idx on public.proposals(created_at desc);

-- ── updated_at auto-trigger ───────────────────────────────
create or replace function public.set_proposals_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists proposals_updated_at on public.proposals;
create trigger proposals_updated_at
  before update on public.proposals
  for each row execute procedure public.set_proposals_updated_at();

-- ── NO RLS — open access (photographer-only internal tool) ──
-- alter table public.proposals enable row level security;
-- No policies needed — table is fully open for read/write.
