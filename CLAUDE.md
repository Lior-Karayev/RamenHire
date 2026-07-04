# RamenHire — Claude Code Context

RamenHire is a job board for bootstrapped, profitable startups. Candidates browse and apply to jobs; employers pay $99 to post. Phase: **validation/MVP** (no auth for job-seekers, admin via Supabase dashboard only).

---

## Tech Stack

| Package | Version | Role |
|---|---|---|
| next | ^16.2.9 | Framework (App Router) |
| react | ^19.2.7 | UI |
| react-dom | ^19.2.7 | DOM renderer |
| @supabase/supabase-js | ^2.110.0 | DB + Storage client |
| tailwindcss | ^4.3.2 | Styling (v4 — no config file) |
| @tailwindcss/postcss | ^4.3.2 | Tailwind v4 PostCSS plugin |
| typescript | ^6.0.3 | Types (strict mode) |
| next-sitemap | ^4.2.3 | Sitemap + robots.txt generation |
| puppeteer | ^25.3.0 | OG image screenshot script |
| autoprefixer | ^10.5.2 | PostCSS |

TypeScript config: `tsconfig.json` — strict mode on, path alias `@/*` → project root.

---

## Folder Structure

```
RamenHire/
├── app/                        # Next.js App Router
│   ├── globals.css             # Tailwind v4 import + @theme design tokens
│   ├── layout.tsx              # Root layout: Inter font, GA4, JSON-LD SEO, metadata
│   └── page.tsx                # Home page: job list, apply modal, subscribe form
│   └── post-job/
│       └── page.tsx            # Post-a-Job form ($99) → inserts into job_post_requests
├── lib/
│   └── supabase.ts             # Supabase client singleton (reads env vars, throws if missing)
├── public/                     # Static assets: favicons, OG images, robots.txt, sitemap.xml
├── scripts/
│   ├── schema.sql              # Full DB schema (run once to provision)
│   ├── add-cv-storage.sql      # CV Storage bucket + cv columns migration
│   ├── seed.sql                # Test data for dev/staging
│   ├── screenshot.js           # Puppeteer OG screenshot generator
│   └── generate-og-image.js    # OG image helper
├── .claude/
│   └── settings.local.json     # Local Claude permissions
├── .env.local                  # NOT committed — Supabase keys
├── .gitignore
├── next.config.ts              # Empty NextConfig (no custom config)
├── next-sitemap.config.js      # siteUrl: https://ramenhire.com
├── postcss.config.mjs          # @tailwindcss/postcss plugin
├── tsconfig.json               # strict, paths: @/* → ./
├── package.json
└── CLAUDE.md                   # ← this file
```

---

## Database Schema

**Supabase project:** `oweurollqvbffehorhss`
**URL:** `https://oweurollqvbffehorhss.supabase.co`

All tables: RLS enabled, anon can INSERT only, authenticated can SELECT/UPDATE/DELETE.

### `applications` (4 rows live)
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid PK | NO | gen_random_uuid() |
| job_title | text | NO | — |
| company_name | text | NO | — |
| applicant_name | text | NO | — |
| applicant_email | text | NO | — |
| why_interested | text | NO | — |
| cv_link | text | YES | — |
| cv_storage_path | text | YES | — |
| cv_file_name | text | YES | — |
| created_at | timestamptz | YES | now() |
| status | text | YES | 'pending' |

### `job_post_requests` (2 rows live)
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid PK | NO | gen_random_uuid() |
| company_name | text | NO | — |
| contact_name | text | NO | — |
| contact_email | text | NO | — |
| company_website | text | YES | — |
| revenue_range | text | YES | — |
| job_title | text | NO | — |
| job_type | text | NO | — |
| location | text | NO | — |
| salary_range | text | NO | — |
| job_description | text | NO | — |
| company_description | text | NO | — |
| is_bootstrapped | boolean | NO | — |
| application_link | text | NO | — |
| created_at | timestamptz | YES | now() |
| status | text | YES | 'pending' |

### `subscribers` (3 rows live)
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid PK | NO | gen_random_uuid() |
| full_name | text | NO | — |
| email | text UNIQUE | NO | — |
| role_types | text[] | YES | — |
| created_at | timestamptz | YES | now() |

### Storage: `cvs` bucket
- Private (not public)
- File size limit: 5 MB
- Allowed MIME: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Path pattern: `{job-slug}/{company-slug}/{timestamp}_{filename}`
- RLS: anon INSERT, authenticated SELECT + DELETE

---

## Environment Variables

| Variable | Visibility | Purpose |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Public (client) | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public (client) | Supabase anon/publishable key |

Both are validated at startup in `lib/supabase.ts` — throws if missing.
GA4 ID (`G-1X6XVB58KC`) is hardcoded in `app/layout.tsx`.

---

## Key Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (runs next-sitemap postbuild)
npm run start        # Start production server
npm run screenshot   # Generate OG screenshot via Puppeteer
npm audit            # Check for vulnerabilities
```

No `lint` script is defined in package.json (add if needed: `"lint": "next lint"`).

---

## Component Map

| File | Description |
|---|---|
| `app/layout.tsx` | Root layout — Inter font, GA4 script, JSON-LD structured data, full SEO metadata |
| `app/globals.css` | Tailwind v4 import + design tokens (`--color-brand`, `--color-canvas`, etc.) |
| `app/page.tsx` | **Main page** — hardcoded job list, apply modal (with CV upload + link fallback), email subscribe form |
| `app/post-job/page.tsx` | **Post-a-Job page** — multi-section form writing to `job_post_requests` table |
| `lib/supabase.ts` | Supabase singleton client — validates env vars, exports `supabase` |

**Inline data note:** Job listings are currently hardcoded arrays in `app/page.tsx`. They are not fetched from the database yet — this is intentional for MVP validation.

---

## Design Tokens (from `globals.css`)

| Token | Value | Usage |
|---|---|---|
| `--color-brand` | `#C8501A` | Primary CTA, links, focus rings |
| `--color-brand-hover` | `#A8401A` | Hover state for brand elements |
| `--color-sage` | `#5C7A5C` | "Bootstrapped ✓" badge |
| `--color-canvas` | `#FAF9F7` | Page background |
| `--color-ink` | `#1A1A1A` | Primary text |
| `--color-border` | `#E5E0D8` | Borders, dividers |
| `--color-muted` | `#6B6560` | Secondary text |

Most color usage is via inline `style={{}}` props (not Tailwind classes) for precise control.

---

## Critical Rules

- **NEVER push to GitHub** without explicit user instruction
- **NEVER run migrations on production Supabase** without user approval — use `scripts/` SQL files and confirm first
- **Never expose `service_role` key** in any client-side code; only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is allowed client-side
- **No `any` TypeScript types** — use proper types or `unknown`
- **All async functions need try/catch** or `.catch()` error handling
- **Check npm package health** before installing any new package
- **Run `npm audit`** after every new package install
- Tailwind v4 — no `tailwind.config.js` exists; tokens live in `globals.css` `@theme` block
- **DEV ENVIRONMENT RULE:** All development work must target the local Supabase stack (`http://localhost:54321`), not production. Only promote to production after reaching a stable milestone. Schema changes go to `supabase/migrations/` first, then `npx supabase db reset` locally, then reviewed and applied to prod via MCP with explicit user approval.

---

## Current Status / In Progress

- Job listings are hardcoded — DB fetch not yet implemented
- No payment integration yet (Stripe not installed) — form just collects $99 intent
- Supabase MCP is connected and authorized for this project
- **Local Supabase stack initialized** — `npx supabase start` initializes the stack; `npx supabase db reset` applies all migrations in `supabase/migrations/`. Local Studio: `http://localhost:54323`. Swap `.env.local` to local values (URL: `http://localhost:54321`, anon key printed by `supabase start`) for dev; restore prod keys before deploying.

## Resolved Issues

- CV upload 400 error (non-ASCII/Hebrew filename in Storage path) — fixed by using `{timestamp}.{ext}` as path; original filename stored in `cv_file_name` column
- Live site 403 "Invalid Compact JWS" on all Supabase calls — was wrong key on Vercel (`sb_publishable_*` instead of JWT anon key); fixed by updating env var + redeploying

---

## Cross-References

- Full schema details → `docs/DATABASE.md`
- Architectural decisions → `docs/ARCHITECTURE.md`
- Security rules → `docs/SECURITY.md`
- Coding standards → `docs/CODING_STANDARDS.md`
- Package inventory → `docs/PACKAGES.md`
