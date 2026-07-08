const DASHBOARD_URL =
  "https://supabase.com/dashboard/project/oweurollqvbffehorhss/editor";

function truncate(text: string, max = 300): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function row(label: string, value: string | undefined | null): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:6px 12px 6px 0;color:#6B6560;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:6px 0;color:#1A1A1A;font-size:13px">${value}</td>
    </tr>`;
}

function wrap(title: string, body: string): string {
  return wrapBase(
    title,
    body,
    `<div style="margin-top:24px;padding-top:20px;border-top:1px solid #E5E0D8">
        <a href="${DASHBOARD_URL}"
           style="display:inline-block;background:#1A1A1A;color:#FAF9F7;text-decoration:none;font-size:13px;font-weight:500;padding:10px 18px;border-radius:8px">
          Review in Supabase →
        </a>
      </div>`
  );
}

// For emails sent to external recipients (not the admin) — no dashboard link.
function wrapPublic(title: string, body: string): string {
  return wrapBase(title, body, "");
}

function wrapBase(title: string, body: string, footer: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#FFFFFF;border:1px solid #E5E0D8;border-radius:12px;overflow:hidden">
    <div style="background:#C8501A;padding:16px 24px">
      <span style="color:#FAF9F7;font-size:16px;font-weight:600">RamenHire</span>
    </div>
    <div style="padding:24px">
      <h2 style="margin:0 0 20px;font-size:18px;color:#1A1A1A">${title}</h2>
      ${body}
      ${footer}
    </div>
  </div>
</body>
</html>`.trim();
}

// ── Job Post Request ─────────────────────────────────────────

export type JobPostData = {
  company_name: string;
  company_website?: string | null;
  contact_name: string;
  contact_email: string;
  job_title: string;
  job_type: string;
  location: string;
  salary_range: string;
  is_bootstrapped: boolean;
  revenue_range?: string | null;
  job_description: string;
  created_at: string;
};

export function jobPostTemplate(d: JobPostData): { subject: string; html: string } {
  const subject = `🍜 New Job Post Request — ${d.company_name}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Company", d.company_name)}
      ${row("Website", d.company_website ? `<a href="${d.company_website}" style="color:#C8501A">${d.company_website}</a>` : null)}
      ${row("Contact", `${d.contact_name} — <a href="mailto:${d.contact_email}" style="color:#C8501A">${d.contact_email}</a>`)}
      ${row("Job Title", d.job_title)}
      ${row("Job Type", d.job_type)}
      ${row("Location", d.location)}
      ${row("Salary", d.salary_range)}
      ${row("Bootstrapped", d.is_bootstrapped ? "Yes ✓" : "No")}
      ${row("Revenue", d.revenue_range ?? null)}
      ${row("Submitted", new Date(d.created_at).toLocaleString())}
    </table>
    <div style="margin-top:16px;padding:14px;background:#FAF9F7;border-radius:8px;border:1px solid #E5E0D8">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Job Description</p>
      <p style="margin:0;font-size:13px;color:#1A1A1A;line-height:1.6">${truncate(d.job_description)}</p>
    </div>`;
  return { subject, html: wrap(subject, table) };
}

// ── Application ──────────────────────────────────────────────

export type ApplicationData = {
  applicant_name: string;
  applicant_email: string;
  job_title: string;
  company_name: string;
  why_interested: string;
  cv_link?: string | null;
  cv_file_name?: string | null;
  apply_url?: string | null;
  created_at: string;
};

export function applicationTemplate(d: ApplicationData): { subject: string; html: string } {
  const subject = `🍜 New Application — ${d.applicant_name} for ${d.job_title} at ${d.company_name}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Applicant", `${d.applicant_name} — <a href="mailto:${d.applicant_email}" style="color:#C8501A">${d.applicant_email}</a>`)}
      ${row("Job", `${d.job_title} at ${d.company_name}`)}
      ${row("CV File", d.cv_file_name ?? null)}
      ${row("CV Link", d.cv_link ? `<a href="${d.cv_link}" style="color:#C8501A">${d.cv_link}</a>` : null)}
      ${row("Original Posting", d.apply_url ? `<a href="${d.apply_url}" style="color:#C8501A">${d.apply_url}</a>` : null)}
      ${row("Submitted", new Date(d.created_at).toLocaleString())}
    </table>
    <div style="margin-top:16px;padding:14px;background:#FAF9F7;border-radius:8px;border:1px solid #E5E0D8">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Why Interested</p>
      <p style="margin:0;font-size:13px;color:#1A1A1A;line-height:1.6">${truncate(d.why_interested)}</p>
    </div>`;
  return { subject, html: wrap(subject, table) };
}

// ── Subscriber ───────────────────────────────────────────────

export type SubscriberData = {
  full_name: string;
  email: string;
  role_types: string[];
  created_at: string;
};

export function subscriberTemplate(d: SubscriberData): { subject: string; html: string } {
  const subject = `🍜 New Subscriber — ${d.full_name}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Name", d.full_name)}
      ${row("Email", `<a href="mailto:${d.email}" style="color:#C8501A">${d.email}</a>`)}
      ${row("Roles", d.role_types.length > 0 ? d.role_types.join(", ") : "Not specified")}
      ${row("Subscribed", new Date(d.created_at).toLocaleString())}
    </table>`;
  return { subject, html: wrap(subject, table) };
}

// ── Company Registration ────────────────────────────────────

export type CompanyRegistrationData = {
  name: string;
  website: string;
  contact_email: string;
  description: string;
  why_work_here: string;
  team_size?: string | null;
  revenue_range?: string | null;
  founded_year?: number | null;
  logo_url?: string | null;
  created_at: string;
};

export function companyRegistrationAdminTemplate(
  d: CompanyRegistrationData
): { subject: string; html: string } {
  const subject = `🍜 New Company Registration — ${d.name}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Company", d.name)}
      ${row("Website", `<a href="${d.website}" style="color:#C8501A">${d.website}</a>`)}
      ${row("Contact", `<a href="mailto:${d.contact_email}" style="color:#C8501A">${d.contact_email}</a>`)}
      ${row("Team Size", d.team_size ?? null)}
      ${row("Revenue", d.revenue_range ?? null)}
      ${row("Founded", d.founded_year ? String(d.founded_year) : null)}
      ${row("Logo", d.logo_url ? `<a href="${d.logo_url}" style="color:#C8501A">View logo</a>` : "Not uploaded")}
      ${row("Submitted", new Date(d.created_at).toLocaleString())}
    </table>
    <div style="margin-top:16px;padding:14px;background:#FAF9F7;border-radius:8px;border:1px solid #E5E0D8">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Description</p>
      <p style="margin:0 0 12px;font-size:13px;color:#1A1A1A;line-height:1.6">${truncate(d.description)}</p>
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Why Work Here</p>
      <p style="margin:0;font-size:13px;color:#1A1A1A;line-height:1.6">${truncate(d.why_work_here)}</p>
    </div>`;
  return { subject, html: wrap(subject, table) };
}

export function companyRegistrationConfirmationTemplate(
  d: Pick<CompanyRegistrationData, "name">
): { subject: string; html: string } {
  const subject = `🍜 We received your RamenHire profile — ${d.name}`;
  const body = `
    <p style="margin:0 0 12px;font-size:14px;color:#1A1A1A;line-height:1.6">
      Thanks for registering <strong>${d.name}</strong> on RamenHire!
    </p>
    <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.6">
      We're reviewing your profile now and will email you at this address once
      it's live — this usually takes 24–48 hours. No action needed from you in
      the meantime.
    </p>`;
  return { subject, html: wrapPublic(subject, body) };
}

// ── Company Email Verification ──────────────────────────────

export type CompanyVerificationData = {
  name: string;
  verify_url: string;
};

export function companyVerificationTemplate(
  d: CompanyVerificationData
): { subject: string; html: string } {
  const subject = `🍜 Confirm your email to register ${d.name} on RamenHire`;
  const body = `
    <p style="margin:0 0 12px;font-size:14px;color:#1A1A1A;line-height:1.6">
      Thanks for starting a RamenHire profile for <strong>${d.name}</strong>.
      Confirm this is your email address to submit it for review:
    </p>
    <div style="margin:20px 0">
      <a href="${d.verify_url}"
         style="display:inline-block;background:#C8501A;color:#FAF9F7;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px">
        Confirm your email →
      </a>
    </div>
    <p style="margin:0;font-size:13px;color:#6B6560;line-height:1.6">
      This link expires in 48 hours. If you didn't request this, you can
      safely ignore this email — nothing is submitted for review until you
      confirm.
    </p>`;
  return { subject, html: wrapPublic(subject, body) };
}
