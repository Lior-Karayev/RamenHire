-- ── companies ───────────────────────────────────────────────
-- Self-registration model: companies sign up themselves via /companies/register.
-- New rows start as status='unverified' — they don't enter the admin approval
-- queue (status='pending') until the submitter confirms they control the
-- contact email via the link sent to verification_token. Not publicly visible
-- until an admin manually approves them (directly in Supabase for now).
CREATE TABLE companies (
  id                            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                          text        NOT NULL UNIQUE,
  name                          text        NOT NULL,
  website                       text        NOT NULL,
  logo_url                      text,
  description                   text        NOT NULL,
  why_work_here                 text        NOT NULL,
  team_size                     text,
  revenue_range                 text,
  founded_year                  integer,
  contact_email                 text        NOT NULL,
  status                        text        NOT NULL DEFAULT 'unverified',
  is_verified                   boolean     NOT NULL DEFAULT false,
  is_bootstrapped               boolean     NOT NULL DEFAULT false,
  verification_token            text        UNIQUE,
  verification_token_expires_at timestamptz,
  email_verified_at             timestamptz,
  created_at                    timestamptz DEFAULT now(),
  updated_at                    timestamptz DEFAULT now(),
  CONSTRAINT companies_status_check CHECK (status IN ('unverified', 'pending', 'approved', 'rejected'))
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

GRANT SELECT                       ON public.companies TO anon;
GRANT SELECT, UPDATE, DELETE       ON public.companies TO authenticated;
-- service_role bypasses RLS policies but still needs a standard table-level GRANT —
-- required for the email-verification lookup/update in lib/supabase-admin.ts, and
-- (as of the rate-limiting/bot-protection pass) the registration insert itself, which
-- now happens via /api/companies/register instead of directly from the browser.
GRANT SELECT, INSERT, UPDATE       ON public.companies TO service_role;

-- Public can only ever see approved profiles — pending/rejected must 404, not leak.
CREATE POLICY "anon_select_approved_companies"
  ON companies FOR SELECT
  TO anon
  USING (status = 'approved');

-- anon has no INSERT grant at all (see GRANT above) — registration now goes through
-- /api/companies/register (service_role), which is what makes rate limiting and
-- Turnstile verification there actually enforceable rather than just UI-level.

CREATE POLICY "auth_select_companies"  ON companies FOR SELECT TO authenticated   USING (true);
CREATE POLICY "auth_update_companies"  ON companies FOR UPDATE TO authenticated   USING (true);
CREATE POLICY "auth_delete_companies"  ON companies FOR DELETE TO authenticated   USING (true);


-- ── company-logos storage bucket ───────────────────────────────
-- Public bucket (logos are meant to be publicly viewable once a profile is approved).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

CREATE POLICY "anon_upload_company_logos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "public_read_company_logos"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'company-logos');

CREATE POLICY "auth_delete_company_logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'company-logos');
