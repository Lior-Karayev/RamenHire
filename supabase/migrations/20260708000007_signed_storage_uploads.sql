-- ── Signed upload URLs for cvs / company-logos ──────────────────────────
-- Direct anon→Storage uploads bypassed the rate-limiting and Turnstile
-- checks already enforced on the JSON metadata submission (/api/apply,
-- /api/companies/register) — someone could spam raw file uploads without
-- ever completing a real submission. Uploads now go through signed upload
-- URLs minted server-side (service_role) per submission, scoped to a path
-- tied to the row's id. createSignedUploadUrl() tokens authorize the
-- upload "without further authentication" (bypass the normal RLS INSERT
-- check for the calling role), so dropping these policies is sufficient —
-- anon can no longer upload without a valid signed token from our own API.
--
-- Applied to both local and production — signed URLs work identically
-- against local Storage, and there is no environment-specific app code,
-- so keeping the schema identical avoids drift.

DROP POLICY IF EXISTS "anon_upload_cvs"           ON storage.objects;
DROP POLICY IF EXISTS "anon_upload_company_logos" ON storage.objects;

-- ── companies: deferred logo confirmation ───────────────────────────────
-- logo_url is public-facing (rendered directly via <img> on /companies and
-- /companies/[slug], no error fallback), so it's only ever set once the
-- upload is confirmed to have actually happened — never optimistically at
-- registration time like cv_storage_path (which is private/admin-only, so
-- an orphaned reference there is low-stakes). pending_logo_path holds the
-- signed path server-side until /api/companies/confirm-logo verifies the
-- matching single-use logo_confirm_token and promotes it to logo_url.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS pending_logo_path  text,
  ADD COLUMN IF NOT EXISTS logo_confirm_token text UNIQUE;
