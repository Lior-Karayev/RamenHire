-- ── Company-auth sprint (2026-07-21), Step G2 ──────────────────
-- Closes security-audits/2026-07-10-audit.md finding 1.2 for job_listings —
-- the widest blanket grant in the schema ("Admin full access" applied to
-- every authenticated user, not just admins, letting any logged-in company
-- read/write/delete every other company's listings).

-- Same SECURITY DEFINER pattern and reasoning as is_admin() in the Step G1
-- migration — resolves the caller's own company id once, reusable across
-- every policy below instead of repeating the same subquery (which would
-- otherwise re-evaluate companies' own RLS policy tree on every row check).
CREATE OR REPLACE FUNCTION public.my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM companies WHERE auth_user_id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.my_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_company_id() TO authenticated;

DROP POLICY IF EXISTS "Public can read active listings" ON job_listings;
DROP POLICY IF EXISTS "Admin full access"                ON job_listings;

-- Public listing visibility — anon and authenticated alike see the same
-- active, non-deleted set (a logged-in company isn't more exposed to other
-- companies' listings than the public is). deleted_at IS NULL is the
-- DB-level backstop matching Step F1's app-level filter.
CREATE POLICY "public_read_active_listings"
  ON job_listings FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- A company additionally sees its own listings regardless of
-- is_active/deleted_at (so its own management view can show inactive or
-- recently-deleted rows), and is_admin() sees everything — a DB-level
-- backstop for a future admin dashboard, no app route exercises this yet.
CREATE POLICY "authenticated_select_own_or_admin_listings"
  ON job_listings FOR SELECT
  TO authenticated
  USING (company_id = my_company_id() OR is_admin());

-- Self-service create (Step D1) — a company can only ever insert a listing
-- under its own company_id, never a client-supplied one.
CREATE POLICY "authenticated_insert_own_listings"
  ON job_listings FOR INSERT
  TO authenticated
  WITH CHECK (company_id = my_company_id() OR is_admin());

-- Self-service edit (Step D2) — same ownership scoping, no admin-override
-- branch in the app layer even though the DB-level policy has one (Section 8:
-- in-app admin moderation is deliberately out of scope this sprint).
CREATE POLICY "authenticated_update_own_listings"
  ON job_listings FOR UPDATE
  TO authenticated
  USING (company_id = my_company_id() OR is_admin())
  WITH CHECK (company_id = my_company_id() OR is_admin());

-- Self-service delete (Step D2) — unlike companies (where "deletion" is
-- always a soft UPDATE), job_listings' self-service delete really is a hard
-- DELETE, so a real non-admin DELETE policy is correct here.
CREATE POLICY "authenticated_delete_own_listings"
  ON job_listings FOR DELETE
  TO authenticated
  USING (company_id = my_company_id() OR is_admin());
