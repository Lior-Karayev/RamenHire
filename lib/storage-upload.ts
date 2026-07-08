import { supabaseAdmin } from "@/lib/supabase-admin";

export type SignedUpload = {
  bucket: string;
  path: string;
  token: string;
};

// Builds the "{id}/{timestamp}.{ext}" path convention shared by both
// Storage buckets — namespacing by the owning row's id makes orphan
// detection trivial later and guarantees callers can only ever be signed
// a path under their own submission.
export function buildStoragePath(id: string, filename: string): string {
  const ext = (filename.split(".").pop() ?? "bin").toLowerCase();
  return `${id}/${Date.now()}.${ext}`;
}

// Mints a signed upload URL via the service-role client. The resulting
// token authorizes an upload to this exact path without needing an anon
// INSERT policy on storage.objects — see the migration that drops those
// policies for the full reasoning.
export async function createSignedUpload(bucket: string, path: string): Promise<SignedUpload> {
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Failed to create signed upload URL for ${bucket}/${path}: ${error?.message}`);
  }

  return { bucket, path: data.path, token: data.token };
}
