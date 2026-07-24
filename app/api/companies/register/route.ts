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
  password: string;
  turnstile_token: string;
  honeypot?: string;
};

// Compensates for a partial registration failure by removing the just-created
// Auth account. If this delete itself fails, the account becomes a real,
// loginable orphan with no company row and no self-service recovery path
// (retrying registration with the same email fails at createUser with
// "already exists", since auth_user_id is UNIQUE) — log loudly so this is
// findable and can be resolved manually via Supabase Studio.
async function cleanupOrphanedAuthUser(authUserId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
  if (error) {
    console.error(
      `ORPHANED AUTH ACCOUNT: failed to delete Auth user ${authUserId} while cleaning up a failed ` +
        `registration. This account can still log in but has no company row and no self-service ` +
        `recovery path — delete it manually via Supabase Studio (Authentication > Users).`,
      error
    );
  }
}

async function insertCompany(
  id: string,
  slug: string,
  body: RegisterBody,
  token: string,
  expiresAt: string,
  pendingLogoPath: string | null,
  logoConfirmToken: string | null,
  authUserId: string
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
    auth_user_id: authUserId,
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

  // Honeypot: real users never see or fill this field (hidden off-screen in
  // the form), so a filled value means a bot that scraped and submitted every
  // input it found — including ones a browser user never would. Mirrors the
  // client-side check in RegisterClient.tsx, but enforced here too since a
  // scripted request can skip the browser (and that client-side check)
  // entirely. Silently "succeeds" rather than erroring, same as the client,
  // so as not to tip off the bot that it was caught.
  if (body.honeypot && body.honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const verified = await verifyTurnstile(body.turnstile_token, ip);
  if (!verified) {
    return NextResponse.json({ error: "bot_check_failed", message: BOT_CHECK_MESSAGE }, { status: 403 });
  }

  if (!body.name || !body.website || !body.description || !body.why_work_here || !body.contact_email || !body.password) {
    return NextResponse.json(
      { error: "missing_fields", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  if (body.password.length < 8) {
    return NextResponse.json(
      { error: "weak_password", message: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // Real Auth account created at registration time, not after admin approval —
  // this is what lets a company log in anytime to check its own status, even
  // pre-approval. email_confirm: true so Supabase's own "confirm your email"
  // flow never fires — the pre-existing verification_token/48h flow below
  // remains the only email-verification gate, exactly as it worked before.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: body.contact_email,
    password: body.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    const alreadyExists = authError?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      {
        error: alreadyExists ? "email_in_use" : "auth_signup_failed",
        message: alreadyExists
          ? "An account with this email already exists. Try signing in instead."
          : "Something went wrong. Please try again.",
      },
      { status: alreadyExists ? 409 : 500 }
    );
  }

  const authUserId = authData.user.id;
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
      await cleanupOrphanedAuthUser(authUserId);
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

  let { error: insertError } = await insertCompany(companyId, slug, body, token, expiresAt, pendingLogoPath, logoConfirmToken, authUserId);

  // Slug collision — retry once with a short random suffix. The insert never
  // persisted on a 23505, so reusing the same id/token/expiresAt here is safe.
  if (insertError?.code === "23505" && insertError.message.includes("slug")) {
    slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    ({ error: insertError } = await insertCompany(companyId, slug, body, token, expiresAt, pendingLogoPath, logoConfirmToken, authUserId));
  }

  if (insertError) {
    console.error("Company registration insert failed:", insertError);
    // The company row never persisted — clean up the Auth account too, so a
    // failed registration never leaves a loginable account with no company
    // behind it (auth_user_id is also UNIQUE, so a retry would otherwise fail
    // at the Auth step above with "already exists" for a company that doesn't exist).
    await cleanupOrphanedAuthUser(authUserId);
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
