import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAdminNotification } from "@/lib/email";
import { applicationTemplate } from "@/lib/email-templates";
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { verifyTurnstile, BOT_CHECK_MESSAGE } from "@/lib/turnstile";
import { buildStoragePath, createSignedUpload } from "@/lib/storage-upload";

type ApplyBody = {
  job_id: string;
  job_title: string;
  company_name: string;
  applicant_name: string;
  applicant_email: string;
  why_interested: string;
  cv_link: string | null;
  cv_file_name: string | null;
  apply_url: string | null;
  turnstile_token: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  const allowed = await checkRateLimit(`apply:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let body: ApplyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  const verified = await verifyTurnstile(body.turnstile_token, ip);
  if (!verified) {
    return NextResponse.json({ error: "bot_check_failed", message: BOT_CHECK_MESSAGE }, { status: 403 });
  }

  if (!body.job_id || !body.applicant_name || !body.applicant_email || !body.why_interested) {
    return NextResponse.json(
      { error: "missing_fields", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const applicationId = crypto.randomUUID();

  // Uploads go through a signed URL scoped to this application's own id —
  // the file bytes never touch the anon-writable Storage API directly.
  // See supabase/migrations/20260708000007_signed_storage_uploads.sql.
  let cvStoragePath: string | null = null;
  let upload: { bucket: string; path: string; token: string } | null = null;

  if (body.cv_file_name) {
    try {
      cvStoragePath = buildStoragePath(applicationId, body.cv_file_name);
      upload = await createSignedUpload("cvs", cvStoragePath);
    } catch (err) {
      console.error("Failed to create signed CV upload URL:", err);
      return NextResponse.json(
        { error: "upload_url_failed", message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }

  const { error: insertError } = await supabaseAdmin.from("applications").insert({
    id: applicationId,
    job_id: body.job_id,
    job_title: body.job_title,
    company_name: body.company_name,
    applicant_name: body.applicant_name,
    applicant_email: body.applicant_email,
    why_interested: body.why_interested,
    cv_link: body.cv_link,
    cv_storage_path: cvStoragePath,
    cv_file_name: body.cv_file_name,
  });

  if (insertError) {
    console.error("Application insert failed:", insertError);
    return NextResponse.json(
      { error: "insert_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const created_at = new Date().toISOString();
  const { subject, html } = applicationTemplate({
    applicant_name: body.applicant_name,
    applicant_email: body.applicant_email,
    job_title: body.job_title,
    company_name: body.company_name,
    why_interested: body.why_interested,
    cv_link: body.cv_link,
    cv_file_name: body.cv_file_name,
    apply_url: body.apply_url,
    created_at,
  });
  await sendAdminNotification(subject, html);

  return NextResponse.json({ ok: true, upload });
}
