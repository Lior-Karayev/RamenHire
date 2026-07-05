CREATE TABLE job_listings (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  company         text        NOT NULL,
  company_website text,
  salary          text,
  location        text        NOT NULL,
  job_type        text        NOT NULL,
  description     text        NOT NULL,
  tags            text[]      DEFAULT '{}',
  apply_url       text        NOT NULL,
  is_bootstrapped boolean     DEFAULT true,
  is_active       boolean     DEFAULT true,
  is_featured     boolean     DEFAULT false,
  date_posted     date        DEFAULT CURRENT_DATE,
  valid_through   date        DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

GRANT SELECT                              ON public.job_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE      ON public.job_listings TO authenticated;

CREATE POLICY "Public can read active listings"
  ON job_listings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access"
  ON job_listings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
