# RamenHire — Architecture

## Overview

Single-page Next.js app (App Router). No backend API routes — all data operations go directly to Supabase from the client using the anon key and RLS policies.

---

## Data Flow

```
User action
  → React state (useState)
  → supabase client (lib/supabase.ts)
  → Supabase REST API (anon key + RLS)
  → PostgreSQL table  OR  Storage bucket
  → Response → setState (success/error)
```

### Apply for a job
1. User fills apply modal in `app/page.tsx`
2. If CV file attached: upload to `cvs` bucket → get storage path
3. Insert row into `applications` with both `cv_storage_path` (file) and `cv_link` (URL) as optional fallbacks
4. Show success state on `applyStatus === "success"`

### Subscribe to job alerts
1. User fills subscribe form in `app/page.tsx`
2. Insert row into `subscribers` — error code `23505` = duplicate email
3. Show success state

### Post a job
1. Employer fills form in `app/post-job/page.tsx`
2. Insert row into `job_post_requests` — status defaults to `'pending'`
3. Admin reviews in Supabase dashboard and manually lists the job (no automation yet)

---

## Deployment

```
GitHub (main branch)
  → Vercel auto-deploy (triggered on push)
  → ramenhire.com (production)
```

- No staging environment yet
- Vercel reads env vars from Vercel dashboard settings
- `npm run postbuild` runs `next-sitemap` automatically after every build
- **IMPORTANT:** `NEXT_PUBLIC_*` env vars are baked into the JS bundle at build time. Changing them in the Vercel dashboard requires a manual redeploy to take effect.
- Vercel must use the **JWT anon key** (`eyJhbGci...`) — not the `sb_publishable_*` format, which PostgREST rejects as "Invalid Compact JWS"

## Local Development (Docker / Supabase)

Target state: run `supabase start` to get a full local Supabase stack (Postgres + Storage + Auth) so all dev work hits local DB, not production.

Setup steps (once Docker Desktop is installed):
```bash
npx supabase init          # creates supabase/ config dir
npx supabase start         # pulls Docker images, starts local stack
npx supabase db reset      # applies migrations + seed data
```

Local URLs (after `supabase start`):
- API: http://localhost:54321
- Studio: http://localhost:54323
- DB: postgresql://postgres:postgres@localhost:54322/postgres

`.env.local` will need two versions of vars — swap to local values during dev:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<printed by supabase start>
```

Migration files live in `supabase/migrations/` once initialized.

---

## Auth Strategy

- **No user auth** for job-seekers or employers
- **Admin access** is via Supabase dashboard only (email/password login at supabase.com)
- All public-facing writes use `anon` RLS role
- All reads/updates/deletes require `authenticated` role (dashboard only)

---

## File Upload Flow

```
Client validates file (MIME type + extension + 5 MB limit)
  → supabase.storage.from("cvs").upload(path, file)
  → path: {job-slug}/{company-slug}/{timestamp}_{filename}
  → On success: store path in applications.cv_storage_path
  → On failure: show error, allow URL fallback (cv_link)
```

Validation in `app/page.tsx`: `validateFile()` checks MIME and `.pdf/.doc/.docx` extension.

---

## SEO / Structured Data

- Full `metadata` export in `app/layout.tsx` (OG, Twitter card, robots, canonical)
- JSON-LD `JobPosting` schema injected inline for each hardcoded job
- `next-sitemap` generates `/sitemap.xml` and `/robots.txt` at build time
- GA4 tracking via `gtag()` (loaded via Next.js `<Script strategy="afterInteractive">`)

---

## Hardcoded vs. DB-driven

| Data | Source | Reason |
|---|---|---|
| Job listings (4 jobs) | Hardcoded in `page.tsx` | MVP validation — no DB fetch yet |
| Applications | Supabase `applications` table | Persistent, admin-reviewable |
| Job post requests | Supabase `job_post_requests` table | Persistent, admin-reviewable |
| Subscribers | Supabase `subscribers` table | Persistent |

**Next step:** move job listings to a `jobs` table and fetch dynamically.
