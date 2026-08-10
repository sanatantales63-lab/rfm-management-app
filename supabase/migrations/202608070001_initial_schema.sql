-- RFM Wedding Photography CRM MVP
create extension if not exists "pgcrypto";

create type public.user_role as enum ('photographer', 'client');
create type public.client_status as enum ('planning', 'confirmed', 'completed');
create type public.rsvp_food as enum ('veg', 'non_veg');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text,
  created_at timestamptz not null default now()
);
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid unique references public.profiles(id) on delete set null,
  client_name text not null,
  bride_name text not null,
  groom_name text not null,
  email text not null,
  phone text not null,
  wedding_date date not null,
  package_name text not null,
  price numeric(12,2) not null check (price >= 0),
  location text not null,
  notes text,
  status public.client_status not null default 'planning',
  portal_code text not null unique default upper(encode(gen_random_bytes(16), 'hex')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.client_timeline_items (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  title text not null, event_date timestamptz, item_type text not null default 'event', completed boolean not null default false, sort_order integer not null default 0
);
create table public.questionnaires (
  id uuid primary key default gen_random_uuid(), client_id uuid not null unique references public.clients(id) on delete cascade,
  haldi_date timestamptz, mehendi_date timestamptz, wedding_date timestamptz, reception_date timestamptz,
  drone_required boolean not null default false, cinematic_required boolean not null default false,
  bride_entry_song text, family_contacts jsonb not null default '[]'::jsonb, map_url text, special_requests text, updated_at timestamptz not null default now()
);
create table public.invitations (
  id uuid primary key default gen_random_uuid(), client_id uuid not null unique references public.clients(id) on delete cascade,
  slug text not null unique default lower(substr(encode(gen_random_bytes(8), 'hex'), 1, 12)), theme text not null default 'Royal Amber', primary_color text not null default '#b57943',
  bride_photo_url text, groom_photo_url text, music_url text, venue text, schedule jsonb not null default '[]'::jsonb, dress_code text, family_details jsonb not null default '{}'::jsonb, is_published boolean not null default false, created_at timestamptz not null default now()
);
create table public.rsvp_links (
  id uuid primary key default gen_random_uuid(), client_id uuid not null unique references public.clients(id) on delete cascade,
  slug text not null unique default lower(substr(encode(gen_random_bytes(8), 'hex'), 1, 12)), is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.rsvps (
  id uuid primary key default gen_random_uuid(), rsvp_link_id uuid not null references public.rsvp_links(id) on delete cascade,
  guest_name text not null, phone text not null, attending boolean not null, events text[] not null default '{}', food_preference public.rsvp_food, members_coming integer not null default 0 check (members_coming >= 0), special_notes text, created_at timestamptz not null default now(), unique(rsvp_link_id, phone)
);

create index clients_photographer_date_idx on public.clients(photographer_id, wedding_date);
create index rsvps_link_idx on public.rsvps(rsvp_link_id);
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_timeline_items enable row level security;
alter table public.questionnaires enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvp_links enable row level security;
alter table public.rsvps enable row level security;

create function public.is_photographer() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'photographer') $$;
create policy "profiles own record" on public.profiles for select using (id = auth.uid() or public.is_photographer());
create policy "photographers manage own clients" on public.clients for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "clients view their own record" on public.clients for select using (user_id = auth.uid());
create policy "staff manage timeline" on public.client_timeline_items for all using (exists(select 1 from public.clients c where c.id=client_id and c.photographer_id=auth.uid()));
create policy "client sees timeline" on public.client_timeline_items for select using (exists(select 1 from public.clients c where c.id=client_id and c.user_id=auth.uid()));
create policy "staff manages questionnaire" on public.questionnaires for all using (exists(select 1 from public.clients c where c.id=client_id and c.photographer_id=auth.uid()));
create policy "client manages own questionnaire" on public.questionnaires for all using (exists(select 1 from public.clients c where c.id=client_id and c.user_id=auth.uid()));
create policy "staff manages invitations" on public.invitations for all using (exists(select 1 from public.clients c where c.id=client_id and c.photographer_id=auth.uid()));
create policy "published invitation visible to public" on public.invitations for select using (is_published);
create policy "staff manages rsvp links" on public.rsvp_links for all using (exists(select 1 from public.clients c where c.id=client_id and c.photographer_id=auth.uid()));
create policy "public can see active rsvp link" on public.rsvp_links for select using (is_active);
create policy "staff views wedding rsvps" on public.rsvps for select using (exists(select 1 from public.rsvp_links l join public.clients c on c.id=l.client_id where l.id=rsvp_link_id and c.photographer_id=auth.uid()));
create policy "public submits rsvp" on public.rsvps for insert with check (exists(select 1 from public.rsvp_links l where l.id=rsvp_link_id and l.is_active));

create function public.create_client_with_portal(client_payload jsonb) returns public.clients language plpgsql security invoker as $$ declare new_client public.clients; begin insert into public.clients(photographer_id,client_name,bride_name,groom_name,email,phone,wedding_date,package_name,price,location,notes) values(auth.uid(),client_payload->>'clientName',client_payload->>'brideName',client_payload->>'groomName',client_payload->>'email',client_payload->>'phone',(client_payload->>'weddingDate')::date,client_payload->>'packageName',(client_payload->>'price')::numeric,client_payload->>'location',client_payload->>'notes') returning * into new_client; insert into public.questionnaires(client_id) values(new_client.id); insert into public.rsvp_links(client_id) values(new_client.id); return new_client; end; $$;
