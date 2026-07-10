-- ── Close residual gap: legacy authenticated-DELETE policy on cvs ──────
-- 20260710000009_revoke_authenticated_delete_cvs.sql dropped a policy named
-- "auth_delete_cvs" to remove the authenticated DELETE grant on the cvs
-- bucket. On production, the actual policy predates the migration system
-- (dashboard-created, back when the cvs bucket was first set up) and is
-- named "Allow authenticated deletes" instead — a different name — so that
-- DROP POLICY IF EXISTS silently no-op'd against it. Identical failure mode
-- to the "Allow anonymous uploads" incident fixed in
-- 20260708000008_drop_legacy_anon_cvs_upload_policy.sql. Confirmed live via
-- pg_policies inspection: "Allow authenticated deletes" (DELETE, TO
-- authenticated, USING bucket_id = 'cvs') was still present in production
-- after 20260710000009 reported success.
--
-- Local dev never had this policy under this name (its local-only
-- equivalent was already "auth_delete_cvs", already dropped), so this
-- migration is a prod-only cleanup; running it locally is a harmless no-op.

DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
