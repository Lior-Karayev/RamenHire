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
- GA4 analytics wired in via `next/script` (`G-1X6XVB58KC`) — as of 2026-07-07, gated behind cookie consent (see below), not unconditional
- Automatic sitemap generation (`next-sitemap`)
- OG image + social preview meta tags, Puppeteer screenshot script, favicon/manifest
- JobPosting JSON-LD schema markup (fixed to resolve Search Console errors)
- GA4 custom event tracking: `apply_click`, `post_job_click`, `subscribe_submitted`, `application_submitted`, `post_job_submitted`, `form_start`, `launch_popup_cta_click`
- Supabase integration replacing what were originally Google Forms — internal apply/post-job/subscribe forms writing directly to Supabase tables
- CV file upload to Supabase Storage (`cvs` bucket) with link fallback
- Two production bugs found & fixed:
  - CV upload 400 error on non-ASCII (Hebrew) filenames — fixed by storing as `{timestamp}.{ext}`, original name kept in `cv_file_name`
  - Live-site 403 "Invalid Compact JWS" — wrong Supabase key type on Vercel (`sb_publishable_*` instead of the JWT anon key)
- Admin email notifications via Resend (`lib/email.ts`, `lib/email-templates.ts`) for all form types → `hello@ramenhire.com` (migrated from `liork03@gmail.com` on 2026-07-07 — see note in §12), from `notifications@ramenhire.com`. Originally routed through a shared `app/api/notify/route.ts`; that route was deleted 2026-07-07 once all four forms got their own dedicated, rate-limited API routes (`/api/apply`, `/api/post-job`, `/api/subscribe`, `/api/companies/register`) that each send their own email directly.
- Launch-week popup (scroll-triggered, once per session, desktop only, shows dynamic job count)
- Local dev setup: full Docker-based local Supabase stack + migration workflow (see section 4)
- Job tags, pagination (6/page), strikethrough pricing UI, 7 additional job listings
- **Migrated job listings from a hardcoded array to a real `job_listings` Supabase table** — `app/page.tsx` is now a server component; interactive UI lives in `app/HomeClient.tsx`
- Internal apply modal restored on job cards (CV upload + link fallback), FK'd to `job_listings.id`
- SEO pass: "remote" added to title/H1/hero subtitle, brand name prepended to meta description, keyword reinforcement
- Homepage stats bar (dynamic job count from `totalCount` + hardcoded countries/bootstrapped/VC-funding stats), between hero and value props
- "Why Bootstrapped?" explainer section (consolidated to a single 6-card section on 2026-07-07 — previously two overlapping sections with a duplicated "Profitable by Default" card)
- Employer CTA section between job listings and email signup, linking to `/post-job?utm_source=homepage&utm_medium=cta&utm_campaign=employers`
- Hover/tap tooltip on the "Bootstrapped ✓" job-card badge explaining the term (tap auto-hides after 3s on mobile)
- Positioning copy pass based on real user feedback: hero subheadline and employer CTA now reinforce "funding philosophy is part of the hiring criteria"; meta description updated to match
- **Company self-registration + public profiles** (2026-07-07): `/companies` (directory, approved-only), `/companies/register` (public form), `/companies/[slug]` (profile). New `companies` table, local-only — not yet promoted to production. `is_verified`/`is_bootstrapped` are admin-only fields, enforced via RLS. Homepage job cards link to a company's profile when a curated `job_listings` row matches by name/website.
- **Email verification for company registration** (2026-07-07, same day, registration-only — apply/post-a-job/subscribe are unchanged): submitting the form no longer inserts a `pending` row directly. It inserts `status='unverified'` with a random token + 48h expiry, and sends a verification email via Resend. Clicking the link (`/companies/register/verify?token=...`) is what actually moves the row to `status='pending'` (into the admin queue) — done server-side via a service-role Supabase client (`lib/supabase-admin.ts`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`) so `anon` never gets an UPDATE policy on `companies` at all. Expired links offer a one-click resend. Admin notification + company "we're reviewing it" confirmation emails now fire at verification-success time, not at initial submit.
- **Privacy Policy, Terms of Use, GDPR cookie consent banner** (2026-07-07): `/privacy-policy`, `/terms-of-use`, footer links site-wide. GA4 (`gtag`) is no longer loaded unconditionally in `app/layout.tsx` — the `<Script>` tags are now conditionally rendered by `components/CookieConsentBanner.tsx` and genuinely absent from the page until a visitor accepts (verified empirically, not just configured). Declining after a prior accept actively clears the `_ga`/`_ga_1X6XVB58KC` cookies, not just stops refreshing them. Admin notifications migrated from `liork03@gmail.com` to `hello@ramenhire.com` — **mail delivery to that inbox was not confirmed as of 2026-07-07**, only that MX records point to Google Workspace at the domain level.
- **Rate limiting + bot protection on all 4 public write paths** (2026-07-07): apply, post-job, subscribe, and company registration no longer insert directly from the browser via the anon key — `anon`'s INSERT grant was **revoked** on `applications`, `job_post_requests`, `subscribers`, and `companies` (see migration `20260707000006_rate_limiting_and_hardening.sql` plus the in-place edit to `20260707000005_create_companies.sql`, since that one was still local-only). Every write now goes through a new dedicated Route Handler (`/api/apply`, `/api/post-job`, `/api/subscribe`, `/api/companies/register`) using the `service_role` client, which is what makes the following actually enforceable rather than just cosmetic:
  - **Rate limiting**: IP-based, backed by a new `rate_limit_hits` table (`lib/rate-limit.ts`) — 5/hour for apply/post-job/register, 3/hour for subscribe. Not Redis/Upstash — a Postgres count-then-insert check, appropriate for this site's traffic volume.
  - **Cloudflare Turnstile** on apply + register only (post-job/subscribe skipped as lower priority): `components/TurnstileWidget.tsx` (client) + `lib/turnstile.ts` (server-side `siteverify` call). `.env.local` currently holds Cloudflare's published always-pass **test keys** — must be swapped for real keys from a Cloudflare dashboard before production.
  - The old shared `app/api/notify/route.ts` was **deleted** — each new route sends its own email directly now.
- **Signed upload URLs for `cvs` and `company-logos` Storage** (2026-07-08): closed the residual gap noted above — anon can no longer upload to either bucket directly. The `anon_upload_cvs`/`anon_upload_company_logos` RLS policies on `storage.objects` were dropped (migration `20260708000007_signed_storage_uploads.sql`), applied to **both local and production** (no environment split — signed URLs work identically against local Storage and the app code has no branching either way, so keeping schema identical avoids drift). New flow for both `/api/apply` and `/api/companies/register`:
  - Client POSTs metadata first (through the existing rate-limited/Turnstile-gated route) with just the file's *name*, not its bytes.
  - Server generates the row's id itself, mints a signed upload URL (`lib/storage-upload.ts`, `createSignedUploadUrl` via `service_role`) scoped to `{row_id}/{timestamp}.{ext}`, and returns it to the client.
  - Client uploads the actual bytes via `uploadToSignedUrl` — the signed token authorizes the upload without needing any anon RLS grant at all.
  - **CVs**: `cv_storage_path` is set optimistically at insert time. If the upload never completes (closed tab, network drop), the row is simply left referencing a path with no file — accepted as-is, since CVs are private/admin-only and there's already a `cv_link` fallback.
  - **Company logos**: handled more carefully, because logos render **publicly** (`<img>`, no error fallback) on `/companies` and `/companies/[slug]`. `logo_url` is never set at insert time — instead `pending_logo_path` + a single-use `logo_confirm_token` (new nullable `companies` columns) are stored, and a new route `/api/companies/confirm-logo` promotes `pending_logo_path` → `logo_url` only after the client confirms the upload actually succeeded. A failed/abandoned logo upload just leaves `logo_url` null — registration still succeeds, logo stays genuinely optional.
  - Bucket-level `file_size_limit`/`allowed_mime_types` enforcement is unaffected by this change (applies regardless of upload method).

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
Private, 5 MB limit, PDF/DOC/DOCX only. Path pattern: `{application_id}/{timestamp}.{ext}` (namespaced by the owning `applications` row's id since the 2026-07-08 signed-upload-URL rework — see section 3). RLS: no anon INSERT (uploads only via signed URLs minted server-side), authenticated SELECT + DELETE.

**Migrations** live in `supabase/migrations/` (all applied to both local and production):
`20260101000000_initial_schema.sql`, `20260101000001_cv_storage.sql`, `20260101000002_add_tags_to_job_post_requests.sql`, `20260705000003_create_job_listings.sql`, `20260705000004_add_job_id_to_applications.sql`, `20260707000005_create_companies.sql`, `20260707000006_rate_limiting_and_hardening.sql`, `20260708000007_signed_storage_uploads.sql`.

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
- All features listed in section 3 (job listings from DB, pagination, apply modal, post-job form, CV upload, email notifications, SEO/JSON-LD, GA4 event tracking, stats bar, Why Bootstrapped section, employer CTA, badge tooltip, positioning copy pass)
- Latest known production commit: `8a48fb8` ("docs: add CHAT_CONTEXT.md onboarding doc for new Claude sessions"), homepage feature work in `7725c2c`. Verified live on ramenhire.com 2026-07-06 — no DB migration was needed for this push (pure UI/copy changes).

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
6. Receiving/reply-to inbox question is now superseded by the `hello@ramenhire.com` mail-delivery check in the production-push checklist below.

### Production-Push Checklist (target: 2026-07-08)

Concrete and time-bound — distinct from the open items above. See [[rate-limiting-and-bot-protection]], [[legal-pages-and-consent]], [[companies-email-verification]] for the full technical context behind each item.

- [ ] **`hello@ramenhire.com` mail delivery** — user will manually verify by sending a test email from their personal Gmail on 2026-07-08. **Do not assume this works until the user reports back confirmed** — admin notifications and the Privacy Policy's stated contact channel both depend on it.
- [x] **Cloudflare Turnstile real keys** — done. Real site/secret keys are in place in both `.env.local` and Vercel Project Settings → Environment Variables (replacing the test keys used for local dev). No remaining action.
- [x] **Storage bucket anon-upload restriction — done properly, both environments.** Superseded by the signed-upload-URL rework above (2026-07-08) — rather than a prod-only patch, direct anon uploads are now closed on **both** local and production via the same migration, since the real fix (signed URLs) carries no meaningful extra complexity locally. See the signed-upload-URLs entry earlier in this doc for the full architecture.
- [ ] Resend usage check (currently 38/3000, healthy) — manual vendor-dashboard reminder, not urgent, revisit at push time.
- [ ] Supabase plan/Spend Cap confirmation (no card on file, Spend Cap default protections apply) — manual vendor-dashboard reminder, not urgent, revisit at push time.
- [x] Outreach email placeholders updated with the real production registration URL — done as of 2026-07-07, `outreach/outreach-emails.txt` uses `https://www.ramenhire.com/companies/register` directly (see section 13).

---

## 12. Email Setup (Detail)

- Resend domain **`ramenhire.com` is verified** (DKIM verified) — deliverability from this domain is properly configured, not just "set up and hoping."
- Sending address: `notifications@ramenhire.com`
- Admin notifications confirmed working in production for all 3 form types: `applications`, `job_post_requests`, `subscribers`. **As of 2026-07-07 this moved off the shared `app/api/notify/route.ts` (deleted)** — see rate-limiting/bot-protection note below for the current per-form API routes.
- **Admin notifications migrated to `hello@ramenhire.com` on 2026-07-07** (was `liork03@gmail.com`). **Mail delivery to `hello@` is not yet confirmed** — DNS shows an MX record pointing to `smtp.google.com` (consistent with Google Workspace being configured for the domain), but that only confirms mail routing exists for the domain, not that the specific `hello@` mailbox/alias has been provisioned inside Workspace. Confirm this receives mail before relying on it in production or promising it as a working contact channel anywhere (e.g. the Privacy Policy).

---

## 13. Outreach / Contacts Log

- **Aryan Singh Yadav** (`hello@beryxa.com`) reached out unsolicited — appears to be a domain seller/consultant. User replied politely; no further action taken or needed. Logged here only so a future session doesn't mistake this for a real partnership lead or re-engage unnecessarily.
- **Company model terminology (2026-07-07, confirmed permanent): self-registration only, never pre-populated/claim-based.** Any earlier "claim flow" / "claim_token" architecture was a rejected draft that never actually existed in the repo (see [[companies-feature]]) — do not resurrect it. Outreach copy does still casually use the word "claim" (e.g. "claim it with a free company profile") as ordinary marketing language for *creating* a registration — that's unrelated to the old pre-populate-and-claim database model and is not a sign the old model came back.
- **Outreach emails rewritten (2026-07-07)** — `outreach/outreach-emails.txt` now uses a permission-ask-first structure: state the role is featured on the site, offer to remove it, then offer free self-registration via `https://www.ramenhire.com/companies/register`. This replaces the original draft's "we already listed you" framing, which was flagged as potentially misleading (implied an existing relationship these 13 companies don't actually have). **Ready to send as of 2026-07-07.** Known limitation: the job link in each email points to `https://www.ramenhire.com/#jobs` (homepage anchor), not a specific role — there's no individual job permalink page in the app yet, so this was the best real, working link available rather than an invented one.
- **Top-of-funnel priority (as of 2026-07-07): attracting real registered companies comes before any job-seeker growth push** — the product has no real employer data yet (see [[employer-growth-strategy]] — zero real registrations as of this writing, all `companies` table testing to date used fake test data). **Next planned activity (2026-07-08):** manual outreach to the 13 companies via the rewritten emails above, plus a new parallel effort reaching out to HR contacts/hiring managers directly on LinkedIn to raise employer-side awareness of RamenHire (not candidate-side/job-seeker outreach).

---

## 11. Important Context About Project Direction

- This is a **pre-revenue validation project** for a solo/small team — the guiding principle across all past decisions has been to keep scope minimal, avoid premature infrastructure (no auth, no payments, no admin UI), and prioritize learning whether there's real demand over building out features.
- The user is deliberate about production safety: never push to GitHub or touch production Supabase without explicit approval, always test locally first. This is a hard, repeatedly-reinforced rule, not a one-off preference.
- Early data (as of 2026-07-06) suggests the product mechanics work end-to-end (forms, uploads, emails, DB writes all functioning) but **real distribution hasn't started yet** — the current priority is less "fix the product" and more "get real traffic through known, trackable channels."
