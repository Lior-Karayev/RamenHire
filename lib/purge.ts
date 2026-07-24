import { supabaseAdmin } from "./supabase-admin";

// UX grace-period windows, not compliance/tax retention claims — see
// sprints/2026-07-21-company-auth-sprint.md section 7 and the Privacy Policy.
// Exported so app/account/page.tsx's days-remaining display and this file's
// actual purge eligibility can never drift apart from duplicating the literals.
const JOB_LISTING_RETENTION_DAYS = 30;
export const COMPANY_RETENTION_DAYS = 90;
export const UNVERIFIED_RETENTION_DAYS = 15;

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// Most-specific first: CV storage objects -> applications rows -> the
// listing row itself. applications.job_id has no ON DELETE clause (defaults
// to RESTRICT), so dependent applications must be gone before the listing
// can be deleted.
async function purgeJobListing(jobId: string): Promise<void> {
  const { data: applications } = await supabaseAdmin
    .from("applications")
    .select("id, cv_storage_path")
    .eq("job_id", jobId);

  const cvPaths = (applications ?? [])
    .map((app) => app.cv_storage_path)
    .filter((path): path is string => path !== null);

  if (cvPaths.length > 0) {
    await supabaseAdmin.storage.from("cvs").remove(cvPaths);
  }

  if ((applications ?? []).length > 0) {
    await supabaseAdmin.from("applications").delete().eq("job_id", jobId);
  }

  await supabaseAdmin.from("job_listings").delete().eq("id", jobId);
}

// logo_url is a public URL, not a storage path — pending_logo_path (the
// actual path) is nulled out once a logo upload is confirmed (see
// /api/companies/confirm-logo), so it's not reliably available on the row by
// purge time. Listing everything under the company's own prefix and
// removing it is more robust than trying to parse a path out of the URL.
async function purgeCompanyLogo(companyId: string): Promise<void> {
  const { data: files } = await supabaseAdmin.storage.from("company-logos").list(companyId);
  if (files && files.length > 0) {
    const paths = files.map((f) => `${companyId}/${f.name}`);
    await supabaseAdmin.storage.from("company-logos").remove(paths);
  }
}

// Company purge cascades through every one of its own listings first
// (regardless of each listing's own deleted_at timing — an orphaned listing
// referencing a soon-to-be-deleted company makes no sense, and
// companies.id has no ON DELETE clause on job_listings.company_id either),
// then the logo, then the company row, then the linked Auth account —
// so no loginable account outlives its profile.
async function purgeCompany(companyId: string): Promise<void> {
  const { data: listings } = await supabaseAdmin
    .from("job_listings")
    .select("id")
    .eq("company_id", companyId);

  for (const listing of listings ?? []) {
    await purgeJobListing(listing.id);
  }

  await purgeCompanyLogo(companyId);

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("auth_user_id")
    .eq("id", companyId)
    .maybeSingle<{ auth_user_id: string | null }>();

  await supabaseAdmin.from("companies").delete().eq("id", companyId);

  if (company?.auth_user_id) {
    await supabaseAdmin.auth.admin.deleteUser(company.auth_user_id);
  }
}

export type PurgeResult = {
  companiesPurged: number;
  jobListingsPurged: number;
};

// The 30/90-day soft-delete purge (deleted_at-based). The distinct 15-day
// unverified-account purge (created_at-based, no deleted_at involved) is a
// separate case — see runUnverifiedAccountPurge in this same file, Step F3.
export async function runSoftDeletePurge(): Promise<PurgeResult> {
  let companiesPurged = 0;
  let jobListingsPurged = 0;

  const { data: companiesToPurge } = await supabaseAdmin
    .from("companies")
    .select("id")
    .not("deleted_at", "is", null)
    .lt("deleted_at", daysAgoIso(COMPANY_RETENTION_DAYS));

  for (const c of companiesToPurge ?? []) {
    await purgeCompany(c.id);
    companiesPurged++;
  }

  // Listings reach their own 30-day mark well before their company reaches
  // its 90-day mark (both get the same deleted_at at cascade time today), so
  // this is the branch that actually fires in practice — the company-purge
  // loop above mostly finds those listings already gone by the time it runs.
  const { data: listingsToPurge } = await supabaseAdmin
    .from("job_listings")
    .select("id")
    .not("deleted_at", "is", null)
    .lt("deleted_at", daysAgoIso(JOB_LISTING_RETENTION_DAYS));

  for (const l of listingsToPurge ?? []) {
    await purgeJobListing(l.id);
    jobListingsPurged++;
  }

  return { companiesPurged, jobListingsPurged };
}

// Distinct from the soft-delete purge above: eligibility here is
// `created_at` age, not `deleted_at` — these accounts were never soft-deleted
// at all, they simply never got approved in time. Confirmed scope: rejected
// companies get the same 15-day window as unverified/pending (no special
// case for a rejection), and the clock starts at created_at (registration
// time), not whenever they happened to reach 'pending'. Reuses the same
// purgeCompany() cascade — an unapproved-and-expired account is removed
// exactly as completely as a soft-deleted one.
export async function runUnverifiedAccountPurge(): Promise<{ unverifiedAccountsPurged: number }> {
  const { data: toPurge } = await supabaseAdmin
    .from("companies")
    .select("id")
    .neq("status", "approved")
    .lt("created_at", daysAgoIso(UNVERIFIED_RETENTION_DAYS));

  let unverifiedAccountsPurged = 0;
  for (const c of toPurge ?? []) {
    await purgeCompany(c.id);
    unverifiedAccountsPurged++;
  }

  return { unverifiedAccountsPurged };
}
