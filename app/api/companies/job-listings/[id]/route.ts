import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCurrentUser, getOwnCompany } from "@/lib/auth";

type UpdateListingBody = {
  job_title?: string;
  job_type?: string;
  location?: string;
  salary_range?: string;
  job_description?: string;
  application_link?: string;
  tags?: string[] | null;
  is_active?: boolean;
};

type Props = {
  params: Promise<{ id: string }>;
};

// Owner-only — resolved server-side from the session, never from a
// client-supplied company id. No admin-override branch: an is_admin
// company's session gets the exact same rejection as any other non-owner.
// In-app admin moderation is deliberately out of scope this sprint (see
// sprints/2026-07-21-company-auth-sprint.md section 8) — admins moderate
// via Supabase Studio directly, not through this route.
async function resolveOwnedListing(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "not_authenticated", message: "Please sign in." }, { status: 401 }) };

  const company = await getOwnCompany(user.id);

  if (!company) {
    return { error: NextResponse.json({ error: "no_company", message: "No company profile found for this account." }, { status: 403 }) };
  }

  if (company.deleted_at) {
    return { error: NextResponse.json({ error: "deleted", message: "This account is scheduled for deletion." }, { status: 403 }) };
  }

  const { data: listing } = await supabaseAdmin
    .from("job_listings")
    .select("id, company_id")
    .eq("id", id)
    .maybeSingle<{ id: string; company_id: string | null }>();

  // Same 404 whether the listing doesn't exist or belongs to another company
  // — a distinguishing error would leak which listing ids exist to non-owners.
  if (!listing || listing.company_id !== company.id) {
    return { error: NextResponse.json({ error: "not_found", message: "Listing not found." }, { status: 404 }) };
  }

  return { company, listing };
}

export async function PATCH(req: NextRequest, { params }: Props): Promise<NextResponse> {
  const { id } = await params;
  const resolved = await resolveOwnedListing(id);
  if (resolved.error) return resolved.error;

  let body: UpdateListingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  // Required text fields must not be blanked out — the create route (D1)
  // already rejects empty values on the way in; this edit route had no
  // equivalent check, which would have let a client silently null out a
  // live listing's title/description/etc via an empty string.
  const requiredFields: (keyof UpdateListingBody)[] = [
    "job_title", "job_type", "location", "salary_range", "job_description", "application_link",
  ];
  for (const field of requiredFields) {
    if (body[field] !== undefined && !body[field]) {
      return NextResponse.json(
        { error: "missing_fields", message: "Something went wrong. Please try again." },
        { status: 400 }
      );
    }
  }

  const update: Record<string, unknown> = {};
  if (body.job_title !== undefined) update.title = body.job_title;
  if (body.job_type !== undefined) update.job_type = body.job_type;
  if (body.location !== undefined) update.location = body.location;
  if (body.salary_range !== undefined) update.salary = body.salary_range;
  if (body.job_description !== undefined) update.description = body.job_description;
  if (body.application_link !== undefined) update.apply_url = body.application_link;
  if (body.tags !== undefined) update.tags = body.tags;
  if (body.is_active !== undefined) update.is_active = body.is_active;

  const { error: updateError } = await supabaseAdmin
    .from("job_listings")
    .update(update)
    .eq("id", id);

  if (updateError) {
    console.error("Self-service job listing update failed:", updateError);
    return NextResponse.json(
      { error: "update_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Props): Promise<NextResponse> {
  const { id } = await params;
  const resolved = await resolveOwnedListing(id);
  if (resolved.error) return resolved.error;

  const { error: deleteError } = await supabaseAdmin
    .from("job_listings")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Self-service job listing delete failed:", deleteError);
    return NextResponse.json(
      { error: "delete_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
