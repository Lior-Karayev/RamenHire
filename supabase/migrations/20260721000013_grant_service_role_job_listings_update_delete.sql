-- ── Company-auth sprint (2026-07-21), Step D2 ──────────────────
-- Extends the Step D1 grant (SELECT, INSERT) with UPDATE + DELETE, now that
-- self-service edit/delete (/api/companies/job-listings/[id]) needs them.
GRANT UPDATE, DELETE ON public.job_listings TO service_role;
