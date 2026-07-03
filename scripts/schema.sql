-- ============================================================
-- RamenHire — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── applications ────────────────────────────────────────────
CREATE TABLE applications (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title       text        NOT NULL,
  company_name    text        NOT NULL,
  applicant_name  text        NOT NULL,
  applicant_email text        NOT NULL,
  why_interested  text        NOT NULL,
  cv_link         text,
  created_at      timestamptz DEFAULT now(),
  status          text        DEFAULT 'pending'
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

GRANT INSERT                   ON public.applications TO anon;
GRANT SELECT, UPDATE, DELETE   ON public.applications TO authenticated;

CREATE POLICY "anon_insert_applications"  ON applications FOR INSERT TO anon            WITH CHECK (true);
CREATE POLICY "auth_select_applications"  ON applications FOR SELECT TO authenticated   USING (true);
CREATE POLICY "auth_update_applications"  ON applications FOR UPDATE TO authenticated   USING (true);
CREATE POLICY "auth_delete_applications"  ON applications FOR DELETE TO authenticated   USING (true);


-- ── job_post_requests ────────────────────────────────────────
CREATE TABLE job_post_requests (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        text        NOT NULL,
  contact_name        text        NOT NULL,
  contact_email       text        NOT NULL,
  company_website     text,
  revenue_range       text,
  job_title           text        NOT NULL,
  job_type            text        NOT NULL,
  location            text        NOT NULL,
  salary_range        text        NOT NULL,
  job_description     text        NOT NULL,
  company_description text        NOT NULL,
  is_bootstrapped     boolean     NOT NULL,
  application_link    text        NOT NULL,
  created_at          timestamptz DEFAULT now(),
  status              text        DEFAULT 'pending'
);

ALTER TABLE job_post_requests ENABLE ROW LEVEL SECURITY;

GRANT INSERT                   ON public.job_post_requests TO anon;
GRANT SELECT, UPDATE, DELETE   ON public.job_post_requests TO authenticated;

CREATE POLICY "anon_insert_job_posts"  ON job_post_requests FOR INSERT TO anon            WITH CHECK (true);
CREATE POLICY "auth_select_job_posts"  ON job_post_requests FOR SELECT TO authenticated   USING (true);
CREATE POLICY "auth_update_job_posts"  ON job_post_requests FOR UPDATE TO authenticated   USING (true);
CREATE POLICY "auth_delete_job_posts"  ON job_post_requests FOR DELETE TO authenticated   USING (true);


-- ── subscribers ──────────────────────────────────────────────
CREATE TABLE subscribers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  text        NOT NULL,
  email      text        NOT NULL UNIQUE,
  role_types text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

GRANT INSERT                   ON public.subscribers TO anon;
GRANT SELECT, UPDATE, DELETE   ON public.subscribers TO authenticated;

CREATE POLICY "anon_insert_subscribers"  ON subscribers FOR INSERT TO anon            WITH CHECK (true);
CREATE POLICY "auth_select_subscribers"  ON subscribers FOR SELECT TO authenticated   USING (true);
CREATE POLICY "auth_update_subscribers"  ON subscribers FOR UPDATE TO authenticated   USING (true);
CREATE POLICY "auth_delete_subscribers"  ON subscribers FOR DELETE TO authenticated   USING (true);
