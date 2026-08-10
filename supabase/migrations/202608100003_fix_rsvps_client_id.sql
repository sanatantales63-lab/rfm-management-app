-- Migration: Fix RSVP table to support direct client_id linking
-- Run this in Supabase SQL editor if needed

-- 1. Add delete policy for RSVPs (allow anon to delete their own)
-- (Already works via anon key in this app)

-- 2. Ensure rsvps table allows text client_id (not foreign key to rsvp_links)
-- The app uses a simplified rsvps table with direct client_id text column.

-- If your rsvps table was created via the old schema with rsvp_link_id,
-- you can recreate it with this simpler schema:

-- DROP TABLE IF EXISTS public.rsvps;
-- CREATE TABLE public.rsvps (
--   id bigint generated always as identity primary key,
--   client_id text not null,
--   guest_name text not null,
--   phone text not null,
--   attending boolean not null default true,
--   events text[] not null default '{}',
--   food_preference text not null default 'veg',
--   members_coming integer not null default 1,
--   special_notes text,
--   created_at timestamptz not null default now()
-- );
-- alter table public.rsvps enable row level security;
-- create policy "public can insert rsvps" on public.rsvps for insert with check (true);
-- create policy "public can read rsvps" on public.rsvps for select using (true);
-- create policy "public can delete rsvps" on public.rsvps for delete using (true);
-- create policy "public can update rsvps" on public.rsvps for update using (true);

-- 3. Fix any existing RSVPs with old-format client_id to use registration.id
-- UPDATE public.rsvps 
-- SET client_id = '<registration_id>'
-- WHERE client_id NOT SIMILAR TO '[0-9]+';
