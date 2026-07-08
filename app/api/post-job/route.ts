import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAdminNotification } from "@/lib/email";
import { jobPostTemplate } from "@/lib/email-templates";
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

type PostJobBody = {
  contact_name: string;
  contact_email: string;
  company_name: string;
  company_website: string | null;
  is_bootstrapped: boolean;
  revenue_range: string | null;
  job_title: string;
  job_type: string;
  location: string;
  salary_range: string;
  job_description: string;
  company_description: string;
  application_link: string;
  tags: string[] | null;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);

  const allowed = await checkRateLimit(`post-job:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited", message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let body: PostJobBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Something went wrong. Please try again." }, { status: 400 });
  }

  if (
    !body.contact_name || !body.contact_email || !body.company_name ||
    !body.job_title || !body.job_type || !body.location ||
    !body.salary_range || !body.job_description || !body.company_description ||
    !body.application_link
  ) {
    return NextResponse.json(
      { error: "missing_fields", message: "Something went wrong. Please try again." },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabaseAdmin.from("job_post_requests").insert({
    contact_name: body.contact_name,
    contact_email: body.contact_email,
    company_name: body.company_name,
    company_website: body.company_website,
    is_bootstrapped: body.is_bootstrapped,
    revenue_range: body.revenue_range,
    job_title: body.job_title,
    job_type: body.job_type,
    location: body.location,
    salary_range: body.salary_range,
    job_description: body.job_description,
    company_description: body.company_description,
    application_link: body.application_link,
    tags: body.tags,
  });

  if (insertError) {
    console.error("Job post insert failed:", insertError);
    return NextResponse.json(
      { error: "insert_failed", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const created_at = new Date().toISOString();
  const { subject, html } = jobPostTemplate({
    company_name: body.company_name,
    company_website: body.company_website,
    contact_name: body.contact_name,
    contact_email: body.contact_email,
    job_title: body.job_title,
    job_type: body.job_type,
    location: body.location,
    salary_range: body.salary_range,
    is_bootstrapped: body.is_bootstrapped,
    revenue_range: body.revenue_range,
    job_description: body.job_description,
    created_at,
  });
  await sendAdminNotification(subject, html);

  return NextResponse.json({ ok: true });
}
