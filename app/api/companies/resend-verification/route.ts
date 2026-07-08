import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendCompanyConfirmation } from "@/lib/email";
import { companyVerificationTemplate } from "@/lib/email-templates";
import type { Company } from "@/lib/companies";

const VERIFICATION_HOURS = 48;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Look up by the expired token — it still uniquely identifies the row
  // since we only null it out on successful verification, not on expiry.
  const { data: company, error } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle<Company>();

  if (error || !company || company.status !== "unverified") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newToken = crypto.randomUUID();
  const newExpiresAt = new Date(Date.now() + VERIFICATION_HOURS * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from("companies")
    .update({
      verification_token: newToken,
      verification_token_expires_at: newExpiresAt,
    })
    .eq("id", company.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to resend" }, { status: 500 });
  }

  const verifyUrl = `${req.nextUrl.origin}/companies/register/verify?token=${newToken}`;
  const { subject, html } = companyVerificationTemplate({ name: company.name, verify_url: verifyUrl });
  await sendCompanyConfirmation(company.contact_email, subject, html);

  return NextResponse.json({ ok: true });
}
