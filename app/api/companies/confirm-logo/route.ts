import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type ConfirmLogoBody = {
  company_id: string;
  logo_confirm_token: string;
};

// Promotes a company's pending_logo_path to logo_url once the client has
// confirmed the signed-URL upload actually completed. logo_url is only
// ever set here (never optimistically at registration time) because it's
// rendered publicly with no error fallback — see the migration that added
// pending_logo_path/logo_confirm_token for the full reasoning. The token
// match in the WHERE clause is what proves the caller legitimately holds
// the response from their own /api/companies/register call, not just a
// guessed company id.
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  const allowed = await checkRateLimit(`confirm-logo:${ip}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: ConfirmLogoBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.company_id || !body.logo_confirm_token) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { data: company, error: fetchError } = await supabaseAdmin
    .from("companies")
    .select("id, pending_logo_path, logo_confirm_token, status")
    .eq("id", body.company_id)
    .eq("logo_confirm_token", body.logo_confirm_token)
    .eq("status", "unverified")
    .maybeSingle();

  if (fetchError || !company || !company.pending_logo_path) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("company-logos")
    .getPublicUrl(company.pending_logo_path);

  const { error: updateError } = await supabaseAdmin
    .from("companies")
    .update({
      logo_url: publicUrlData.publicUrl,
      pending_logo_path: null,
      logo_confirm_token: null,
    })
    .eq("id", body.company_id)
    .eq("logo_confirm_token", body.logo_confirm_token);

  if (updateError) {
    console.error("Logo confirmation update failed:", updateError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
