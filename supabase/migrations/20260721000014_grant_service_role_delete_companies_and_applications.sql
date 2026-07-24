-- ── Company-auth sprint (2026-07-21), Step F2 ──────────────────
-- The purge cascade needs to actually delete companies and applications
-- rows via the service-role client. Neither table ever granted service_role
-- DELETE — companies was flagged as a gap back in Step C1's cleanup;
-- applications never needed it before since nothing purged rows previously.
GRANT DELETE ON public.companies TO service_role;
GRANT DELETE ON public.applications TO service_role;
