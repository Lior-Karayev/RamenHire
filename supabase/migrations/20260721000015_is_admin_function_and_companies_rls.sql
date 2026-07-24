-- ── Company-auth sprint (2026-07-21), Step G1 ──────────────────
-- Closes security-audits/2026-07-10-audit.md findings 1.1/1.2 for the
-- companies table: the broad `authenticated ... USING (true)` policies were
-- only ever safe because no real end-user auth existed. Now that companies
-- have real Auth accounts, those policies let ANY logged-in company read,
-- update, and delete EVERY company's row, not just their own.

-- SECURITY DEFINER so this can be called from other tables' RLS policies
-- (companies included) without the recursive-policy trap of a policy on
-- companies needing to query companies under companies' own RLS. This works
-- because the function is owned by the migration role (table owner), which
-- bypasses RLS on the table it owns regardless of SECURITY DEFINER — the
-- standard Postgres/Supabase pattern for this exact problem.
-- SET search_path pins name resolution against a fixed schema, standard
-- hardening for SECURITY DEFINER functions (prevents a caller-controlled
-- search_path from redirecting an unqualified table reference).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM companies WHERE auth_user_id = auth.uid()),
    false
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "anon_select_approved_companies" ON companies;
DROP POLICY IF EXISTS "auth_select_companies"           ON companies;
DROP POLICY IF EXISTS "auth_update_companies"           ON companies;
DROP POLICY IF EXISTS "auth_delete_companies"           ON companies;

-- Public (anon) — approved and not-deleted only, as before, now also
-- excluding deleted_at as a DB-level backstop matching the app-level filter
-- added in Step F1.
CREATE POLICY "anon_select_approved_companies"
  ON companies FOR SELECT
  TO anon
  USING (status = 'approved' AND deleted_at IS NULL);

-- Authenticated — a company can always see its own row regardless of
-- status/deleted_at (this is what /account's own status view depends on
-- conceptually, even though that specific page reads via the service-role
-- client today); every other company's row only if publicly approved and
-- not deleted, same as anon; is_admin() gets everything, as a DB-level
-- backstop for a future admin dashboard — no app route exercises this
-- branch yet (Section 8: in-app admin moderation is out of scope this sprint).
CREATE POLICY "authenticated_select_companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR (status = 'approved' AND deleted_at IS NULL)
    OR is_admin()
  );

CREATE POLICY "authenticated_update_companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin())
  WITH CHECK (auth_user_id = auth.uid() OR is_admin());

-- No authenticated (non-admin) DELETE policy at all — self-service deletion
-- in this app is the soft-delete request in Step E1 (an UPDATE via a
-- service-role route), never a raw client-side DELETE. Only is_admin() can
-- hard-delete, and even that has no app route calling it yet.
CREATE POLICY "admin_delete_companies"
  ON companies FOR DELETE
  TO authenticated
  USING (is_admin());
