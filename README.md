# RFM Wedding Photography CRM

Premium, focused MVP for managing wedding clients, client planning portals, RSVP links, and digital invitations.

## Local development

1. Copy `.env.example` to `.env.local` and add the Supabase project URL and anonymous key.
2. Run the SQL migration in `supabase/migrations/202608070001_initial_schema.sql` in the Supabase SQL editor (or with the Supabase CLI).
3. Install dependencies with `npm install`, then start with `npm run dev`.

## Deployment

The app does not use Vercel APIs and uses browser-safe Supabase access. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Cloudflare Pages environment variables. Build with `npm run build`.

## MVP boundary

The feature boundaries are intentionally contained in `features/`, while the Supabase data model includes well-scoped relational entities. Future delivery, payment, and automation modules can be added without changing the current client, invitation, or RSVP domains.
