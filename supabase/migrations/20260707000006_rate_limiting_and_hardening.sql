-- ── rate_limit_hits ─────────────────────────────────────────
-- Backs application-layer rate limiting (lib/rate-limit.ts) for the four
-- public write paths (apply, post-job, register, subscribe). Only touched
-- by service_role from Route Handlers — never by anon or authenticated.
CREATE TABLE rate_limit_hits (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket_key  text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rate_limit_hits_bucket_created_idx ON rate_limit_hits (bucket_key, created_at);

ALTER TABLE rate_limit_hits ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.rate_limit_hits TO service_role;
-- Deliberately no anon/authenticated grants and no policies — RLS default-denies
-- everyone except service_role, which bypasses RLS but still needs the GRANT above.


-- ── Harden applications / job_post_requests / subscribers ───────────────
-- These three tables shipped in 20260101000000_initial_schema.sql (already
-- applied to production), so they're hardened via new statements here rather
-- than edited in place. Their writes now go through service_role-backed
-- Route Handlers (/api/apply, /api/post-job, /api/subscribe) instead of
-- directly from the browser, so anon no longer needs INSERT at all — this is
-- what actually makes rate limiting and bot-verification enforceable: a
-- scripted request straight to Supabase's REST API with the public anon key
-- can no longer write these tables at all, not just "isn't rate-limited yet."

REVOKE INSERT ON public.applications      FROM anon;
REVOKE INSERT ON public.job_post_requests FROM anon;
REVOKE INSERT ON public.subscribers       FROM anon;

DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
DROP POLICY IF EXISTS "anon_insert_job_posts"    ON job_post_requests;
DROP POLICY IF EXISTS "anon_insert_subscribers"  ON subscribers;

-- service_role bypasses RLS but still needs a standard GRANT — same gotcha
-- hit and fixed for the companies table during the email-verification work.
GRANT SELECT, INSERT ON public.applications      TO service_role;
GRANT SELECT, INSERT ON public.job_post_requests TO service_role;
GRANT SELECT, INSERT ON public.subscribers       TO service_role;
