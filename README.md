# Pho Ta Restaurant Website

Modern website and booking system for [Pho Ta](https://www.photarestaurants.com/) — Vietnamese restaurants in Kentish Town and Finchley Road, London.

## Features

- **Public website** — Home, menu, locations, elegant Vietnamese branding
- **Online booking** — Party size + seating preference (side, centre, near window, quiet)
- **Confirmations** — Email and SMS on booking (via Resend + Twilio)
- **Reminders** — Automated email + SMS (daily on Vercel Hobby, or 2h before with Pro/external cron)
- **Admin dashboard** — Manage bookings, phone/walk-in entries, customer info

## Quick start (local)

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login (dev password: `123456`)
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
   - Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - (Optional) `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
4. Run **`supabase/setup-complete.sql`** in the SQL Editor (creates tables + RLS policies)
5. Verify: `npm run test-db`

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

### Step 4 — Deploy to Vercel (one project only)

This repo should be connected to **exactly one** Vercel project. If you imported the GitHub repo twice, you will get two live URLs:

| URL | Vercel project | Action |
|-----|----------------|--------|
| **https://phota.vercel.app** | `phota` | **Keep** — use this as staging until your custom domain is live |
| https://pho-ta-website.vercel.app | `pho-ta-website` | **Delete** — duplicate of the same codebase |

**Why two URLs?** Each Vercel project gets its own `*.vercel.app` subdomain. Both projects were linked to `github.com/Duynguyen0106/Pho-ta-website`, so every push deploys twice.

**Remove the duplicate:**

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open the **`pho-ta-website`** project (not `phota`)
3. **Settings → General → Delete Project**
4. Keep the **`phota`** project only

**Configure the remaining project (`phota`):**

1. **Settings → Git** — confirm it is connected to `Duynguyen0106/Pho-ta-website`, Production branch = `main`
2. **Settings → Environment Variables** — add all variables from `.env.example`
3. Set `NEXT_PUBLIC_SITE_URL=https://phota.vercel.app` until `photarestaurants.com` is connected (then switch to `https://www.photarestaurants.com`)
4. Generate a cron secret: `openssl rand -hex 32` → `CRON_SECRET`
5. Set `ADMIN_PASSWORD` for staff login
6. Deploy — daily reminder cron runs at **9:00 UTC** via `vercel.json` (Vercel Hobby). Set `REMINDER_MODE=daily` (default).

**Canonical URLs:**

- Staging (before custom domain): **https://phota.vercel.app**
- Production (final): **https://www.photarestaurants.com**

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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional — server admin access (bypasses RLS) |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | Sender address |
| `TWILIO_*` | SMS confirmations and reminders |
| `ADMIN_PASSWORD` | Staff dashboard login |
| `CRON_SECRET` | Secures `/api/cron/reminders` |
| `REMINDER_MODE` | `daily` (Hobby default) or `two_hours` (Pro / cron-job.org) |

Without Supabase credentials, bookings are stored locally in `.data/` for development only.

### Vercel env vars checklist

Copy these into **Project → Settings → Environment Variables** (all three environments):

```
NEXT_PUBLIC_SITE_URL=https://www.photarestaurants.com
NEXT_PUBLIC_SUPABASE_URL=https://sccrvdqrllsgnxctyrhr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key
RESEND_API_KEY=your-key
EMAIL_FROM=Pho Ta <bookings@photarestaurants.com>
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+44...
ADMIN_PASSWORD=your-strong-password
CRON_SECRET=your-generated-secret
REMINDER_MODE=daily
```

## Project structure

```
public/images/       # Restaurant photos (replace with your own)
src/app/(site)/      # Public pages
src/app/admin/       # Staff dashboard
src/app/api/         # Booking, availability, notifications
supabase/schema.sql  # PostgreSQL schema
scripts/check-setup  # Environment validation
```
