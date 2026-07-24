import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCurrentUser, getOwnCompany } from "@/lib/auth";

type Body = {
  contact_email: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Updates companies.contact_email — the public/admin-facing business contact
// address. Deliberately does NOT touch auth.users.email (the sign-in
// credential) — that's a more sensitive operation with its own re-verification
// concerns and isn't what this sprint's "contact email management" asks for.
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated", message: "Please sign in." }, { status: 401 });
  }

  const company = await getOwnCompany(user.id);

  if (!company) {
    return NextResponse.json({ error: "no_company", message: "No company profile found for this account." }, { status: 403 });
  }

  if (company.deleted_at) {
    return NextResponse.json({ error: "deleted", message: "This account is scheduled for deletion." }, { status: 403 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  if (!body.contact_email || !EMAIL_RE.test(body.contact_email)) {
    return NextResponse.json({ error: "invalid_email", message: "Enter a valid email address." }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("companies")
    .update({ contact_email: body.contact_email })
    .eq("id", company.id);

  if (updateError) {
    console.error("Contact email update failed:", updateError);
    return NextResponse.json({ error: "update_failed", message: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
