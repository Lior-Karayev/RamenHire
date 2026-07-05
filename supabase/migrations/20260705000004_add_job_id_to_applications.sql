ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES job_listings(id);
