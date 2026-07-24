-- ── Company-auth sprint (2026-07-21), Step G3 ──────────────────
-- Closes the remaining span of security-audits/2026-07-10-audit.md finding
-- 1.1 for applications, subscribers, and job_post_requests. None of these
-- three has a real per-company ownership concept (applications has job_id
-- but no direct company_id; job_post_requests predates company accounts
-- entirely; subscribers isn't tied to any company at all) — per confirmed
-- Assumptions 2–3, they get admin-only access via is_admin(), not
-- per-company scoping. Approved companies do not see their own applicants
-- this sprint (Assumption 3) — that stays admin-only, matching today's
-- actual (Supabase-dashboard-only) capability, just now properly enforced
-- instead of merely assumed.

DROP POLICY IF EXISTS "auth_select_applications" ON applications;
DROP POLICY IF EXISTS "auth_update_applications" ON applications;
DROP POLICY IF EXISTS "auth_delete_applications" ON applications;

CREATE POLICY "admin_all_applications"
  ON applications FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "auth_select_subscribers" ON subscribers;
DROP POLICY IF EXISTS "auth_update_subscribers" ON subscribers;
DROP POLICY IF EXISTS "auth_delete_subscribers" ON subscribers;

CREATE POLICY "admin_all_subscribers"
  ON subscribers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "auth_select_job_posts" ON job_post_requests;
DROP POLICY IF EXISTS "auth_update_job_posts" ON job_post_requests;
DROP POLICY IF EXISTS "auth_delete_job_posts" ON job_post_requests;

CREATE POLICY "admin_all_job_post_requests"
  ON job_post_requests FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
