-- ── Remove broad authenticated DELETE grant on the company-logos bucket ─
-- Same fix as 20260710000009_revoke_authenticated_delete_cvs.sql, applied
-- to the second bucket flagged with the identical pattern
-- (security-audits/2026-07-10-audit.md, finding 2.1). "auth_delete_company_logos"
-- (20260707000005_create_companies.sql) let any authenticated Supabase user
-- delete any company logo — unscoped by ownership, resting on the same
-- "authenticated == admin, for now" assumption that isn't enforced anywhere.
--
-- No in-app feature currently deletes logos. Admin cleanup, if ever needed,
-- goes through Supabase Studio directly with the service_role key (bypasses
-- RLS, needs no policy here) — same as the cvs bucket.

DROP POLICY IF EXISTS "auth_delete_company_logos" ON storage.objects;
