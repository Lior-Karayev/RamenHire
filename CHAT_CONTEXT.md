# RamenHire — Chat Context (onboarding doc for new Claude sessions)

> Generated 2026-07-06, last updated 2026-07-06. This is a snapshot, not a live document — verify anything load-bearing (row counts, deployment status, env vars) against the actual code/DB before acting on it. See `CLAUDE.md` in the project root for the authoritative, auto-loaded technical reference; this file adds narrative/decision context that CLAUDE.md doesn't cover.

---

## 1. Project Overview & Current Status

RamenHire is a job board exclusively for **bootstrapped, profitable startups**. Candidates browse and apply to jobs for free; employers post jobs (currently free during early access, intended to be $99 long-term). The pitch to candidates: "no VC pressure, no layoff roulette."

**Phase: validation / MVP.** No user authentication for job-seekers. Admin access is via the Supabase dashboard only — there is no admin UI in the app.

**Launched:** 2026-07-04. As of this writing the site has been live for ~2.5 days with very low traffic volume (~23 total users) — still far too early to draw firm conclusions from analytics. See section 6.

---

## 2. Full Tech Stack (with versions)

| Package | Version | Role |
|---|---|---|
| next | ^16.2.9 | Framework (App Router) |
| react / react-dom | ^19.2.7 | UI |
| @supabase/supabase-js | ^2.110.0 | DB + Storage client |
| resend | ^6.17.1 | Transactional email (admin notifications) |
| tailwindcss | ^4.3.2 | Styling (v4 — no `tailwind.config.js`; tokens live in `app/globals.css` `@theme`) |
| @tailwindcss/postcss | ^4.3.2 | Tailwind v4 PostCSS plugin |
| typescript | ^6.0.3 | Strict mode, path alias `@/*` → project root |
| next-sitemap | ^4.2.3 | Sitemap + robots.txt generation (postbuild) |
| puppeteer | ^25.3.0 | OG image screenshot script |
| autoprefixer | ^10.5.2 | PostCSS |

No `lint` script defined. No test framework installed. No Stripe/payment integration (post-job form just collects intent — currently free).

---

## 3. Everything Built So Far

In rough chronological order (see `git log` for exact commits):

- Next.js app scaffold, SEO metadata, hydration fixes
- GA4 analytics wired in via `next/script` (`G-1X6XVB58KC`)
- Automatic sitemap generation (`next-sitemap`)
- OG image + social preview meta tags, Puppeteer screenshot script, favicon/manifest
- JobPosting JSON-LD schema markup (fixed to resolve Search Console errors)
- GA4 custom event tracking: `apply_click`, `post_job_click`, `subscribe_submitted`, `application_submitted`, `post_job_submitted`, `form_start`, `launch_popup_cta_click`
- Supabase integration replacing what were originally Google Forms — internal apply/post-job/subscribe forms writing directly to Supabase tables
- CV file upload to Supabase Storage (`cvs` bucket) with link fallback
- Two production bugs found & fixed:
  - CV upload 400 error on non-ASCII (Hebrew) filenames — fixed by storing as `{timestamp}.{ext}`, original name kept in `cv_file_name`
  - Live-site 403 "Invalid Compact JWS" — wrong Supabase key type on Vercel (`sb_publishable_*` instead of the JWT anon key)
- Admin email notifications via Resend (`lib/email.ts`, `lib/email-templates.ts`, `app/api/notify/route.ts`) for all 3 form types → `liork03@gmail.com`, from `notifications@ramenhire.com`
- Launch-week popup (scroll-triggered, once per session, desktop only, shows dynamic job count)
- Local dev setup: full Docker-based local Supabase stack + migration workflow (see section 4)
- Job tags, pagination (6/page), strikethrough pricing UI, 7 additional job listings
- **Migrated job listings from a hardcoded array to a real `job_listings` Supabase table** — `app/page.tsx` is now a server component; interactive UI lives in `app/HomeClient.tsx`
- Internal apply modal restored on job cards (CV upload + link fallback), FK'd to `job_listings.id`
- SEO pass: "remote" added to title/H1/hero subtitle, brand name prepended to meta description, keyword reinforcement

---

## 4. Current Database Schema

**Supabase project:** `oweurollqvbffehorhss` — `https://oweurollqvbffehorhss.supabase.co`
All tables: RLS enabled. Anon can INSERT only; authenticated can SELECT/UPDATE/DELETE.

Live row counts as of 2026-07-06 (production, confirmed): `job_listings`=11 (real bootstrapped companies), `applications`=7 (test data), `job_post_requests`=5 (test data), `subscribers`=5 (test data).

### `job_listings` (11 rows)
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid PK | NO | gen_random_uuid() |
| title | text | NO | — |
| company | text | NO | — |
| company_website | text | YES | — |
| salary | text | YES | — |
| location | text | NO | — |
| job_type | text | NO | — |
| description | text | NO | — |
| tags | text[] | YES | '{}' |
| apply_url | text | NO | — |
| is_bootstrapped | boolean | YES | true |
| is_active | boolean | YES | true |
| is_featured | boolean | YES | false |
| date_posted | date | YES | CURRENT_DATE |
| valid_through | date | YES | CURRENT_DATE + 90 days |
| created_at / updated_at | timestamptz | YES | now() |

### `applications` (7 rows)
id, job_title, company_name, applicant_name, applicant_email, why_interested, cv_link, cv_storage_path, cv_file_name, created_at, status ('pending'), **job_id** (uuid FK → `job_listings.id`, added in migration `20260705000004`).

### `job_post_requests` (5 rows)
id, company_name, contact_name, contact_email, company_website, revenue_range (enum-like text), job_title, job_type, location, salary_range, job_description, company_description, is_bootstrapped, application_link, tags (text[], added later), created_at, status ('pending').

### `subscribers` (5 rows)
id, full_name, email (unique), role_types (text[]), created_at.

### Storage: `cvs` bucket
Private, 5 MB limit, PDF/DOC/DOCX only. Path pattern: `{timestamp}.{ext}` (changed from original filename to fix non-ASCII bug). RLS: anon INSERT, authenticated SELECT + DELETE.

**Migrations** live in `supabase/migrations/` (5 files, all applied to both local and production):
`20260101000000_initial_schema.sql`, `20260101000001_cv_storage.sql`, `20260101000002_add_tags_to_job_post_requests.sql`, `20260705000003_create_job_listings.sql`, `20260705000004_add_job_id_to_applications.sql`.

Note: `docs/DATABASE.md` predates the `job_listings` table and migration-based workflow — it's stale; this file and `CLAUDE.md` are more current.

---

## 5. Platforms Posted On & Status

Confirmed by the user on 2026-07-06 (supersedes earlier GA4-inferred guesses):

- ✅ **LinkedIn** — "building in public" update post live
- ✅ **Twitter/X** — 3 tweets posted (intro, insight, jobs thread)
- ✅ **Indie Hackers** — Show IH post live, getting comments
- ✅ **Dev.to** — 2 articles published (launch story + Supabase RLS tutorial)
- ✅ **Product Hunt** — listing created, launch scheduled (not yet live)
- ❌ **Reddit** — posts auto-removed; account (`u/L_Build`) is only 6 days old and hitting new-account/low-karma auto-removal restrictions
- ❌ **Hacker News** — account too new to post

**Why GA4 didn't show most of this (see section 6):** UTM tags are still not implemented on any shared link, so clicks from these platforms are likely landing as "Direct" or being misattributed rather than showing up as their real source. Don't use GA4's channel breakdown to judge which platforms are working until UTM tagging is added — the posting activity above is more reliable than the analytics for now.

**Reddit specifically:** the karma/age restriction is a platform-side blocker, not a content problem — it should resolve on its own as the account ages and accumulates karma elsewhere on Reddit, not by re-tweaking post content.

---

## 6. Analytics Setup

- **GA4** property: `G-1X6XVB58KC`, wired in via `next/script` in `app/layout.tsx`. GA4 property ID for the Analytics API/MCP is `543943905` (account "Default Account for Firebase").
- Custom events firing correctly: `apply_click`, `post_job_click`, `subscribe_submitted`, `application_submitted`, `post_job_submitted`, `form_start`, `launch_popup_cta_click`.
- **Google Search Console:** confirmed by the user to be connected and verified (2026-07-06). No Search Console MCP/tool is currently wired into this Claude Code setup, so query-level data still needs to be pulled from the Search Console UI/API directly rather than via `analytics-mcp`. Confirmed ranking: **"bootstrapped startups hiring" — position 13**.
- **UTM links:** **still not set up anywhere** — confirmed by grepping the codebase (no `utm_` string exists) and by GA4 showing `sessionCampaignName` = `(direct)` or `(referral)` on every single session since launch, never a real campaign value. User has confirmed this is a known gap, to be added going forward on all shared links.
- **Data quality caveat:** traffic volume is tiny (~23 users total as of 2026-07-06) and a meaningful chunk looks like the founder's own testing rather than organic visitors (e.g., Israel-based sessions have high sessions-per-user; 2 users alone generated 18 `apply_click` events). 13 US sessions show ~1.8s avg duration and 0% engagement — consistent with bot/crawler traffic, not real visitors. Don't trust channel/country/engagement breakdowns until volume grows substantially.
- `analytics-mcp` (Google Analytics MCP server) is registered and working — use `run_report` with `property_id: 543943905` directly rather than re-discovering it via `get_account_summaries`.

---

## 7. Social Media Accounts & Handles

Confirmed by the user on 2026-07-06 — all active:

| Platform | Handle | Notes |
|---|---|---|
| Twitter/X | `@L_Build` | Personal brand account — **not** `@ramenhire`. The `@ramenhire` handle in `app/layout.tsx`'s `twitter.creator` meta tag is stale/aspirational and doesn't match the account actually being used to post. |
| LinkedIn | Personal account, real name | — |
| Indie Hackers | `@L_Build` | — |
| Dev.to | `@L_Build` | — |
| Product Hunt | `@L_Build` | Launch scheduled, not yet live |
| Reddit | `u/L_Build` | Account 6 days old; posts currently auto-removed due to low-karma/new-account restrictions |

**Follow-up worth doing:** `app/layout.tsx`'s Twitter Card `creator` field still says `@ramenhire` — consider updating it to `@L_Build` (or a real `@ramenhire` account if one gets created later) so link previews credit the account actually being used for promotion.

---

## 8. Key Decisions Made

- **Pricing:** employer job posts are priced at **$99** long-term, but currently **free during early access** ("Free during early access 🍜" with strikethrough `~~$99~~") — a deliberate validation-phase decision to lower friction while testing demand. No Stripe/payment integration exists yet; the form only collects posting intent.
- **Validation approach:** ship an MVP with no user auth, admin operations done manually via the Supabase dashboard, and forms writing directly to Supabase rather than building a full back office. Keep scope minimal and appropriate for an unproven, pre-revenue product.
- **Dev/prod separation:** all development work targets a local Supabase stack (`http://localhost:54321`, Docker-based) — never production — until a stable milestone is reached, at which point schema changes are promoted via Supabase MCP with explicit user approval. See `supabase/migrations/` for the migration-first workflow.
- **Deploy workflow:** build (`npm run build`) → `npm audit` → apply any DB migration to prod via Supabase MCP → git push to `main` → Vercel auto-deploys → manually verify on ramenhire.com. Never push to GitHub or run production migrations without explicit user approval — this is a hard rule, not a suggestion.
- **No `any` types**, all async functions need try/catch, `service_role` key must never appear client-side — only `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 9. Deployed vs. Still Local

**Deployed to production (ramenhire.com via Vercel, auto-deploy on push to `main`):**
- All 5 DB migrations, including `job_listings` table and the `applications.job_id` FK
- All features listed in section 3 (job listings from DB, pagination, apply modal, post-job form, CV upload, email notifications, SEO/JSON-LD, GA4 event tracking)
- Latest known production commit: `e78cc40` ("seo: prepend brand name to meta description")

**Env vars on Vercel — all confirmed set (2026-07-06):**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `RESEND_API_KEY` ✅ — admin email notifications confirmed working in production for all 3 form types (applications, job_post_requests, subscribers)

**Still local-only / not yet done:**
- No UTM tagging on any outbound marketing links
- No payment integration (Stripe not installed)
- No admin UI (dashboard access only)
- No receiving/reply-to email inbox set up — Resend is currently one-way (outbound admin notifications only)

---

## 10. Next Tasks in the Pipeline

Known open items, not a committed roadmap — confirm priority with the user:

1. **Add UTM parameters to every future external link** shared on any platform (LinkedIn, Twitter/X, Indie Hackers, Dev.to, Product Hunt), so channel attribution in GA4 becomes trustworthy — still the single biggest analytics gap.
2. **Product Hunt launch** — listing exists but hasn't gone live yet; plan/schedule the actual launch day.
3. **Reddit** — no action needed beyond waiting; account is too new/low-karma for posts to survive. Revisit once the account ages and builds karma elsewhere.
4. Let traffic accumulate before drawing conclusions from analytics — current volume (~23 users) is too small to be meaningful; revisit once volume is materially higher.
5. Consider updating the stale `@ramenhire` Twitter Card handle in `app/layout.tsx` to `@L_Build` (see section 7).
6. Decide whether a receiving/reply-to email inbox is needed, or if one-way admin notifications remain sufficient for this phase.

---

## 12. Email Setup (Detail)

- Resend domain **`ramenhire.com` is verified** (DKIM verified) — deliverability from this domain is properly configured, not just "set up and hoping."
- Sending address: `notifications@ramenhire.com`
- Admin notifications confirmed working in production for all 3 form types: `applications`, `job_post_requests`, `subscribers` (see `app/api/notify/route.ts`, `lib/email.ts`, `lib/email-templates.ts`).
- **No receiving/reply-to inbox exists yet** — this is purely one-way outbound notification to the admin (`liork03@gmail.com`), not a monitored `@ramenhire.com` mailbox. If candidates or employers ever need to reply to a RamenHire email, there's currently nowhere for that to land.

---

## 13. Outreach / Contacts Log

- **Aryan Singh Yadav** (`hello@beryxa.com`) reached out unsolicited — appears to be a domain seller/consultant. User replied politely; no further action taken or needed. Logged here only so a future session doesn't mistake this for a real partnership lead or re-engage unnecessarily.

---

## 11. Important Context About Project Direction

- This is a **pre-revenue validation project** for a solo/small team — the guiding principle across all past decisions has been to keep scope minimal, avoid premature infrastructure (no auth, no payments, no admin UI), and prioritize learning whether there's real demand over building out features.
- The user is deliberate about production safety: never push to GitHub or touch production Supabase without explicit approval, always test locally first. This is a hard, repeatedly-reinforced rule, not a one-off preference.
- Early data (as of 2026-07-06) suggests the product mechanics work end-to-end (forms, uploads, emails, DB writes all functioning) but **real distribution hasn't started yet** — the current priority is less "fix the product" and more "get real traffic through known, trackable channels."
