import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCurrentUser, getOwnCompany } from "@/lib/auth";

// Self-service soft-delete request — a UX grace period, not a compliance
// mechanism (see sprints/2026-07-21-company-auth-sprint.md section 7). Sets
// deleted_at on the company and cascades the same timestamp onto its own
// listings so everything tied to the account starts its retention countdown
// together, rather than the company disappearing while its listings linger.
// No self-service restore this sprint (confirmed assumption) — recovery
// within the 90-day window is a manual hello@ contact only. Actual public
// read-path filtering on deleted_at is Phase F1; permanent purge is F2/F3.
export async function POST(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated", message: "Please sign in." }, { status: 401 });
  }

  const company = await getOwnCompany(user.id);

  if (!company) {
    return NextResponse.json({ error: "no_company", message: "No company profile found for this account." }, { status: 403 });
  }

  if (company.deleted_at) {
    return NextResponse.json({ ok: true, already_requested: true });
  }

  const deletedAt = new Date().toISOString();

  const { error: companyError } = await supabaseAdmin
    .from("companies")
    .update({ deleted_at: deletedAt })
    .eq("id", company.id);

  if (companyError) {
    console.error("Account delete-request failed:", companyError);
    return NextResponse.json({ error: "update_failed", message: "Something went wrong. Please try again." }, { status: 500 });
  }

  const { error: listingsError } = await supabaseAdmin
    .from("job_listings")
    .update({ deleted_at: deletedAt })
    .eq("company_id", company.id)
    .is("deleted_at", null);

  if (listingsError) {
    console.error("Cascading delete_at to job_listings failed:", listingsError);
    // The company itself is already marked — not fatal to the request, but
    // worth knowing about since it means a listing could outlive its company.
  }

  return NextResponse.json({ ok: true });
}
