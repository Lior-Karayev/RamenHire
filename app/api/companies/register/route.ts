import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendCompanyConfirmation } from "@/lib/email";
import { companyVerificationTemplate } from "@/lib/email-templates";
import { slugify } from "@/lib/companies";
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { verifyTurnstile, BOT_CHECK_MESSAGE } from "@/lib/turnstile";
import { buildStoragePath, createSignedUpload } from "@/lib/storage-upload";

const VERIFICATION_HOURS = 48;

type RegisterBody = {
  name: string;
  website: string;
  logo_file_name: string | null;
  description: string;
  why_work_here: string;
  team_size: string | null;
  revenue_range: string | null;
  founded_year: number | null;
  contact_email: string;
  turnstile_token: string;
};

async function insertCompany(
  id: string,
  slug: string,
  body: RegisterBody,
  token: string,
  expiresAt: string,
  pendingLogoPath: string | null,
  logoConfirmToken: string | null
) {
  return supabaseAdmin.from("companies").insert({
    id,
    slug,
    name: body.name,
    website: body.website,
    logo_url: null,
    pending_logo_path: pendingLogoPath,
    logo_confirm_token: logoConfirmToken,
    description: body.description,
    why_work_here: body.why_work_here,
    team_size: body.team_size,
    revenue_range: body.revenue_range,
    founded_year: body.founded_year,
    contact_email: body.contact_email,
    verification_token: token,
    verification_token_expires_at: expiresAt,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  const allowed = await checkRateLimit(`register:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  const verified = await verifyTurnstile(body.turnstile_token, ip);
  if (!verified) {
    return NextResponse.json({ error: "bot_check_failed", message: BOT_CHECK_MESSAGE }, { status: 403 });
  }

  if (!body.name || !body.website || !body.description || !body.why_work_here || !body.contact_email) {
    return NextResponse.json(
      { error: "missing_fields", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const companyId = crypto.randomUUID();

  // Logo upload goes through a signed URL scoped to this company's own id.
  // logo_url is only ever set by /api/companies/confirm-logo once the
  // upload actually completes — see the migration for why (public-facing
  // image, no error fallback, so it's never optimistically pre-set).
  let pendingLogoPath: string | null = null;
  let logoConfirmToken: string | null = null;
  let upload: { bucket: string; path: string; token: string; company_id: string; logo_confirm_token: string } | null = null;

  if (body.logo_file_name) {
    try {
      pendingLogoPath = buildStoragePath(companyId, body.logo_file_name);
      const signed = await createSignedUpload("company-logos", pendingLogoPath);
      logoConfirmToken = crypto.randomUUID();
      upload = { ...signed, company_id: companyId, logo_confirm_token: logoConfirmToken };
    } catch (err) {
      console.error("Failed to create signed logo upload URL:", err);
      return NextResponse.json(
        { error: "upload_url_failed", message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }

  const baseSlug = slugify(body.name);
  let slug = baseSlug;
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + VERIFICATION_HOURS * 60 * 60 * 1000).toISOString();

  let { error: insertError } = await insertCompany(companyId, slug, body, token, expiresAt, pendingLogoPath, logoConfirmToken);

  // Slug collision — retry once with a short random suffix. The insert never
  // persisted on a 23505, so reusing the same id/token/expiresAt here is safe.
  if (insertError?.code === "23505" && insertError.message.includes("slug")) {
    slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    ({ error: insertError } = await insertCompany(companyId, slug, body, token, expiresAt, pendingLogoPath, logoConfirmToken));
  }

  if (insertError) {
    console.error("Company registration insert failed:", insertError);
    return NextResponse.json(
      { error: "insert_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const verifyUrl = `${req.nextUrl.origin}/companies/register/verify?token=${token}`;
  const { subject, html } = companyVerificationTemplate({ name: body.name, verify_url: verifyUrl });
  await sendCompanyConfirmation(body.contact_email, subject, html);

  return NextResponse.json({ ok: true, upload });
}
