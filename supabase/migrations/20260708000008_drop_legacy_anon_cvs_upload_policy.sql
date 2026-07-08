-- ── Close residual anon-upload gap on the cvs bucket ────────────────────
-- 20260708000007_signed_storage_uploads.sql dropped a policy named
-- "anon_upload_cvs" to close direct anon→Storage uploads. On production,
-- the actual legacy policy predates the migration system (created via the
-- Supabase dashboard when the cvs bucket was first set up) and is named
-- "Allow anonymous uploads" instead — a different name — so the prior
-- DROP POLICY IF EXISTS silently no-op'd against it and anon could still
-- upload directly to cvs, bypassing signed upload URLs, rate limiting, and
-- Turnstile. Confirmed live via a raw POST to the Storage REST endpoint
-- with the anon key (no signed token), which returned 200 before this fix.
--
-- Local dev never had this policy under this name (its local-only
-- equivalent was already "anon_upload_cvs", already dropped), so this
-- migration is a prod-only cleanup; running it locally is a harmless no-op.

DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
