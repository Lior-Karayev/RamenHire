-- ============================================================
-- RamenHire — seed data for local / staging testing
-- Run AFTER schema.sql in the Supabase SQL editor
-- ============================================================

-- ── applications ────────────────────────────────────────────
INSERT INTO applications (job_title, company_name, applicant_name, applicant_email, why_interested, cv_link, status) VALUES
  (
    'Growth Marketing Manager', 'Payhip',
    'John Smith', 'john.smith@example.com',
    'I have 5+ years of growth marketing experience at bootstrapped SaaS companies and love the calm-team ethos Payhip embodies.',
    'https://linkedin.com/in/johnsmith',
    'pending'
  ),
  (
    'Senior Software Engineer', 'Aha!',
    'Sarah Chen', 'sarah.chen@example.com',
    'Aha! is a company I have admired for years. The bootstrapped model aligns with my values and I bring strong Ruby on Rails experience.',
    'https://github.com/sarahchen',
    'pending'
  ),
  (
    'Head of Product', 'Gruntwork',
    'Mike Johnson', 'mike.johnson@example.com',
    'I have led product at two profitable startups and am deeply familiar with DevOps tooling and infrastructure automation.',
    'https://mikeproduct.com',
    'pending'
  );


-- ── job_post_requests ────────────────────────────────────────
INSERT INTO job_post_requests
  (company_name, contact_name, contact_email, company_website, revenue_range,
   job_title, job_type, location, salary_range,
   job_description, company_description, is_bootstrapped, application_link, status)
VALUES
  (
    'Transistor.fm', 'Justin Jackson', 'justin@transistor.fm',
    'https://transistor.fm', '100k-plus',
    'Backend Developer', 'full-time', 'Remote · Worldwide', '$100,000 – $130,000',
    'Help scale Transistor, the podcast hosting platform used by thousands of independent podcasters worldwide. You will work primarily on our Ruby on Rails backend and PostgreSQL infrastructure.',
    'Transistor is a profitable, bootstrapped podcast hosting platform. We are a small team and have been profitable since year one with zero outside funding.',
    true,
    'https://transistor.fm/careers',
    'pending'
  ),
  (
    'Plausible Analytics', 'Uku Taht', 'uku@plausible.io',
    'https://plausible.io', '50k-100k',
    'Customer Success Manager', 'full-time', 'Remote · Europe', '$60,000 – $80,000',
    'Help our customers get the most out of Plausible Analytics. You will handle onboarding, respond to support tickets, and proactively reach out to at-risk accounts.',
    'Plausible is an open-source, privacy-friendly alternative to Google Analytics. We are bootstrapped, profitable, and growing steadily without any investor pressure.',
    true,
    'https://plausible.io/jobs',
    'pending'
  );


-- ── subscribers ──────────────────────────────────────────────
INSERT INTO subscribers (full_name, email, role_types) VALUES
  ('Alice Wang',       'alice.wang@example.com',   ARRAY['Engineering', 'Product']),
  ('David Park',       'david.park@example.com',   ARRAY['Marketing', 'Support']),
  ('Emma Rodriguez',   'emma.rodriguez@example.com', ARRAY['Design', 'Product']);
