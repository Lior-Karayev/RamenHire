import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCurrentUser, getOwnCompany } from "@/lib/auth";

type CreateListingBody = {
  job_title: string;
  job_type: string;
  location: string;
  salary_range: string;
  job_description: string;
  application_link: string;
  tags: string[] | null;
};

// Approved-company self-service listing creation — publishes directly to
// job_listings, no admin review (that's the whole point of this sprint's
// section 4). Re-validates the session + approval status server-side rather
// than trusting the page-level gate in app/post-job/page.tsx, since this
// route can be called directly.
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated", message: "Please sign in." }, { status: 401 });
  }

  const company = await getOwnCompany(user.id);

  if (!company) {
    return NextResponse.json({ error: "no_company", message: "No company profile found for this account." }, { status: 403 });
  }

  if (company.status !== "approved" || company.deleted_at) {
    return NextResponse.json(
      { error: "not_approved", message: "Your company profile isn't approved yet." },
      { status: 403 }
    );
  }

  let body: CreateListingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  if (
    !body.job_title || !body.job_type || !body.location ||
    !body.salary_range || !body.job_description || !body.application_link
  ) {
    return NextResponse.json(
      { error: "missing_fields", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const { data, error: insertError } = await supabaseAdmin
    .from("job_listings")
    .insert({
      company_id: company.id,
      // Duplicated onto job_listings' own text columns (not just company_id)
      // so existing read paths (homepage list, JSON-LD, the companyMatchesJob
      // heuristic on the company profile page) keep working unchanged — none
      // of them join through company_id yet.
      company: company.name,
      company_website: company.website,
      is_bootstrapped: company.is_bootstrapped,
      title: body.job_title,
      job_type: body.job_type,
      location: body.location,
      salary: body.salary_range,
      description: body.job_description,
      apply_url: body.application_link,
      tags: body.tags,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Self-service job listing insert failed:", insertError);
    return NextResponse.json(
      { error: "insert_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
