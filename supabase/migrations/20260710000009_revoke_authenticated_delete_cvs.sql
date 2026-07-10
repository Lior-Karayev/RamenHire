-- ── Remove broad authenticated DELETE grant on the cvs bucket ───────────
-- "auth_delete_cvs" (20260101000001_cv_storage.sql) let ANY authenticated
-- Supabase user delete objects from the cvs bucket. This rested on the same
-- "authenticated == admin, for now" assumption already flagged as fragile
-- elsewhere in this project (see security-audits/) — but unlike reads,
-- deletes are irreversible. A single compromised or mistakenly-authenticated
-- session could wipe every CV on file. There is currently no non-admin
-- authenticated user type in the app, but the policy shouldn't rely on that
-- staying true.
--
-- No in-app feature currently deletes CVs — admin cleanup (if ever needed)
-- goes through Supabase Studio directly with the service_role key, which
-- bypasses RLS entirely and needs no policy here. If an admin-delete UI is
-- built later, it should go through a service_role-backed Route Handler,
-- the same pattern already used for signed uploads and logo confirmation.

DROP POLICY IF EXISTS "auth_delete_cvs" ON storage.objects;
