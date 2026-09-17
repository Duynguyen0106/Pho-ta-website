<<<<<<< HEAD
# Pho-ta-website
=======
# Pho Ta Restaurant Website

Modern website and booking system for [Pho Ta](https://www.photarestaurants.com/) — Vietnamese restaurants in Kentish Town and Finchley Road, London.

## Features

- **Public website** — Home, menu, locations, elegant Vietnamese branding
- **Online booking** — Party size + seating preference (side, centre, near window, quiet)
- **Confirmations** — Email and SMS on booking (via Resend + Twilio)
- **Reminders** — Automated email + SMS 2 hours before reservation
- **Admin dashboard** — Manage bookings, update status, view customer details

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Admin:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)  
Default password (dev): `phota-admin-dev` — set `ADMIN_PASSWORD` in production.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | Sender address |
| `TWILIO_*` | SMS confirmations and reminders |
| `ADMIN_PASSWORD` | Staff dashboard login |
| `CRON_SECRET` | Secures `/api/cron/reminders` |

Without Supabase credentials, bookings are stored locally in `.data/` for development.

## Database setup

Run `supabase/schema.sql` in your Supabase SQL editor to create tables.

## Deployment

Deploy to Vercel. The included `vercel.json` runs reminder cron every 15 minutes.

Set all environment variables in Vercel project settings.

## Project structure

```
src/
  app/
    (site)/          # Public pages
    admin/           # Staff dashboard
    api/             # Booking, availability, notifications
  components/        # UI components
  lib/               # Business logic, DB, notifications
supabase/schema.sql  # PostgreSQL schema
```
>>>>>>> df020e9 (Build Pho Ta website with booking system and admin dashboard)
