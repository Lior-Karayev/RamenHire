-- ── Company-auth sprint (2026-07-21), Step A2 ──────────────────
-- Schema-only additions — no RLS/grant changes in this migration. Existing
-- app behavior must be unaffected: nothing reads or writes these columns yet.
-- See sprints/2026-07-21-company-auth-sprint.md for full sprint context.

-- One Supabase Auth user ↔ one companies row. Nullable because every existing
-- company row predates real auth accounts (backfilled only for new sign-ups
-- going forward, per Step C1).
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id);

-- Cross-company permission (approve registrations, moderate any company) —
-- not a public-directory visibility rule. Directory visibility stays governed
-- solely by status='approved' + active listings, per sprint scope section 8.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Soft-delete grace period. NULL = active, timestamp = deleted/counting down
-- toward the retention window's purge job (Phase F). Deliberately distinct
-- from job_listings.is_active, which is unrelated (temporary deactivation,
-- no deletion timeline) — see sprint scope section 7.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE job_listings
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Real ownership FK, replacing the heuristic name/website matching in
-- lib/companies.ts (companyMatchesJob()). Nullable: the ~19 legacy curated
-- listings have no real company account and keep company_id = NULL — they
-- stay admin-managed exactly as today (sprint scope section 9). New
-- company-created listings (Phase D) always set this.
ALTER TABLE job_listings
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id);
