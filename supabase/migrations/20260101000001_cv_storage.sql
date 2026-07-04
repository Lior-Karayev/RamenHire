-- ── STEP 1: Create private "cvs" storage bucket ─────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false,
  5242880,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- ── STEP 2: RLS policies for storage.objects ────────────────
CREATE POLICY "anon_upload_cvs"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'cvs');

CREATE POLICY "auth_read_cvs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cvs');

CREATE POLICY "auth_delete_cvs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cvs');

-- ── STEP 3: Add cv_storage_path and cv_file_name columns ────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cv_storage_path text,
  ADD COLUMN IF NOT EXISTS cv_file_name    text;
