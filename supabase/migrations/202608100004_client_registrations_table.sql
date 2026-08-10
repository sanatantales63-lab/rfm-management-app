-- =========================================================
-- Client Registrations: Separate table for /register/RFM2026 form
-- This table is INDEPENDENT from invitations and RSVP.
-- Cold leads / new clients fill this form and data goes here.
-- =========================================================

create table if not exists public.client_registrations (
  id             bigint       generated always as identity primary key,

  -- Personal details
  bride_name     text         not null default '',
  groom_name     text         not null default '',
  email          text         not null default '',
  phone          text         not null default '',
  whatsapp       text         not null default '',

  -- Wedding details
  wedding_date   date,
  venue          text         not null default '',
  city           text         not null default '',
  dress_code     text         not null default '',
  events         text[]       not null default '{}',
  event_days     text         not null default '',
  guest_count    text         not null default '',

  -- Budget & package
  budget         text         not null default '',
  package_choice text         not null default '',
  add_ons        text[]       not null default '{}',

  -- Other preferences
  referral_source    text     not null default '',
  preferred_contact  text     not null default '',
  message            text     not null default '',

  -- Owner token (e.g. RFM2026)
  owner_token    text         not null default 'RFM2026',

  -- Status for client management
  status         text         not null default 'planning',

  -- Timestamps
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

-- Index for fast lookups
create index if not exists client_reg_owner_idx on public.client_registrations(owner_token);
create index if not exists client_reg_created_idx on public.client_registrations(created_at desc);

-- Updated_at auto-trigger
create or replace function public.set_client_reg_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists client_reg_updated_at on public.client_registrations;
create trigger client_reg_updated_at
  before update on public.client_registrations
  for each row execute procedure public.set_client_reg_updated_at();

-- NO RLS — open access (photographer-only internal tool + public form inserts)
-- If you want public insert + photographer-only read, add RLS policies later.
