-- ============================================================
-- RamenHire — CV Storage Setup
-- Run this in the Supabase SQL editor BEFORE deploying the
-- updated app code (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── STEP 1: Create private "cvs" storage bucket ─────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false,
  5242880,  -- 5 MB in bytes
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- ── STEP 2: RLS policies for storage.objects ────────────────
-- Anonymous users may upload (insert) into the cvs bucket
CREATE POLICY "anon_upload_cvs"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'cvs');

-- Only authenticated admins can read / download files
CREATE POLICY "auth_read_cvs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cvs');

-- Only authenticated admins can delete files
CREATE POLICY "auth_delete_cvs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cvs');

-- ── STEP 3: Add cv_storage_path and cv_file_name columns ────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cv_storage_path text,
  ADD COLUMN IF NOT EXISTS cv_file_name    text;

-- cv_link already exists — kept as optional fallback, no change needed
