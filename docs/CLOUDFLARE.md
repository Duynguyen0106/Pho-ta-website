# Deploy on Cloudflare Workers

This project can run on **Cloudflare Workers** via [OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`), alongside or instead of Vercel.

## Prerequisites

- Cloudflare account
- API token with **Workers Scripts: Edit** and **Account Settings: Read** (to deploy)
- Account ID (Cloudflare dashboard → Workers → right sidebar)

## One-time setup

### 1. GitHub Actions (recommended)

In **GitHub → Repository → Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

Pushes to `main` run `.github/workflows/deploy-cloudflare.yml` and deploy the Worker named `pho-ta` (see `wrangler.jsonc`).

You can also run **Actions → Deploy Cloudflare → Run workflow** manually.

### 2. Environment variables / secrets on Cloudflare

Copy everything from `.env.production` / Vercel into the Worker:

**Dashboard:** Workers & Pages → `pho-ta` → Settings → Variables and secrets  

Or via CLI (never commit values):

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put CRON_SECRET
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# … SMTP_*, RESEND_*, TWILIO_*, OPENAI_API_KEY, etc.
```

**Public build-time vars** (must match production):

- `NEXT_PUBLIC_SITE_URL` — e.g. `https://www.photarestaurants.com` or your `*.workers.dev` URL until DNS moves
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Set `PHO_TA_SERVERLESS=1` is already in `wrangler.jsonc` `vars` so local JSON fallback uses `/tmp` when Supabase is not configured.

### 3. Custom domain

1. Cloudflare dashboard → Workers → `pho-ta` → Domains & routes → Add `www.photarestaurants.com` and `photarestaurants.com`
2. Point DNS to Cloudflare (if not already)
3. Update `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL
4. Redeploy

### 4. Booking reminder cron

`wrangler.jsonc` includes `triggers.crons: ["0 9 * * *"]` (09:00 UTC daily). Ensure `CRON_SECRET` is set on the Worker.

The route `GET /api/cron/reminders` expects `Authorization: Bearer <CRON_SECRET>`. After deploy, confirm reminders in **Admin → Notifications** or trigger once manually:

```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://YOUR_DOMAIN/api/cron/reminders"
```

If scheduled triggers do not hit your app as expected, use an external cron (e.g. cron-job.org) to call that URL daily.

## Local commands

```bash
npm run dev                    # Next.js dev (Node)
npm run build:cloudflare       # Next + OpenNext bundle
npm run preview:cloudflare     # Build and run in Workers runtime locally
npm run deploy:cloudflare      # Build and deploy (needs CLOUDFLARE_API_TOKEN)
```

For local preview with secrets, copy `.dev.vars.example` → `.dev.vars` and add variables Wrangler should inject locally.

## Current Workers URL

After the first deploy, the app is available at:

**https://pho-ta.duydichdanh.workers.dev**

Attach `photarestaurants.com` in the Worker custom domains settings, then update `NEXT_PUBLIC_SITE_URL` in `wrangler.jsonc` and redeploy.

## Cutover from Vercel

1. Deploy and test on `*.workers.dev` or a staging subdomain
2. Copy all env vars from Vercel to Cloudflare Worker secrets
3. Attach production domain on Cloudflare
4. When satisfied, remove or pause the Vercel project to avoid double deploys

## Vercel GitHub check

If the **Vercel** status check fails with “Account is blocked”, that is expected after moving to Cloudflare. You can ignore it or disconnect the Vercel GitHub app for this repository (**GitHub → Settings → Integrations → Vercel**). GitHub Actions `build` and `cloudflare` jobs are the source of truth for CI.

## Security note

If an API token was shared in chat or email, **revoke it** in Cloudflare → My Profile → API Tokens and create a new one for CI only.