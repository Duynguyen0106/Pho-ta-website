# Pho Ta Restaurant Website

Modern website and booking system for [Pho Ta](https://www.photarestaurants.com/) — Vietnamese restaurants in Kentish Town and Finchley Road, London.

## Features

- **Public website** — Home, menu, locations, elegant Vietnamese branding
- **Online booking** — Party size + seating preference (side, centre, near window, quiet)
- **Confirmations** — Email and SMS on booking (via Resend + Twilio)
- **Reminders** — Automated email + SMS 2 hours before reservation
- **Admin dashboard** — Manage bookings, phone/walk-in entries, customer info

## Quick start (local)

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login (dev password: `phota-admin-dev`)
- Health check: http://localhost:3000/api/health

Validate your environment:

```bash
npm run check-setup
```

---

## Production setup (step by step)

### Step 1 — Supabase database

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste and run `supabase/schema.sql`
3. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

### Step 2 — Email (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify domain `photarestaurants.com` (or use Resend test domain for staging)
3. Create API key → `RESEND_API_KEY`
4. Set `EMAIL_FROM="Pho Ta <bookings@photarestaurants.com>"`

### Step 3 — SMS (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Buy a UK phone number
3. Copy Account SID, Auth Token, and phone number to:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### Step 4 — Deploy to Vercel

1. Push this repo to GitHub
2. Import project at [vercel.com](https://vercel.com) → connect your repo
3. Add all variables from `.env.example` in **Settings → Environment Variables**
4. Generate a cron secret: `openssl rand -hex 32` → `CRON_SECRET`
5. Set a strong `ADMIN_PASSWORD` for staff login
6. Deploy — cron reminders run automatically via `vercel.json`

### Step 5 — Connect domain

1. In Vercel → **Settings → Domains** → add `photarestaurants.com` and `www.photarestaurants.com`
2. Update DNS at your registrar (Vercel shows the required records)
3. Set `NEXT_PUBLIC_SITE_URL=https://www.photarestaurants.com`

### Step 6 — Replace photos

Swap files in `public/images/` with your own restaurant photos (same filenames). See `public/images/README.txt`.

### Step 7 — Train staff

Share the admin URL and password with managers only:

- **URL:** `https://www.photarestaurants.com/admin`
- Use **Staff guide** panel in the dashboard for daily workflow
- **Add phone booking** for reservations taken by phone

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL for links |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Database access (server only) |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | Sender address |
| `TWILIO_*` | SMS confirmations and reminders |
| `ADMIN_PASSWORD` | Staff dashboard login |
| `CRON_SECRET` | Secures `/api/cron/reminders` |

Without Supabase credentials, bookings are stored locally in `.data/` for development only.

## Project structure

```
public/images/       # Restaurant photos (replace with your own)
src/app/(site)/      # Public pages
src/app/admin/       # Staff dashboard
src/app/api/         # Booking, availability, notifications
supabase/schema.sql  # PostgreSQL schema
scripts/check-setup  # Environment validation
```
