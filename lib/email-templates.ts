const DASHBOARD_URL =
  "https://supabase.com/dashboard/project/oweurollqvbffehorhss/editor";

// All user-supplied values must pass through this before landing in an HTML
// string — every field below ultimately comes from a public form submission
// (applicant, employer, or company registrant), and these templates render
// as real HTML in whoever's inbox receives them (usually hello@ramenhire.com).
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  const companyName = escapeHtml(d.company_name);
  const companyWebsite = d.company_website ? escapeHtml(d.company_website) : null;
  const contactName = escapeHtml(d.contact_name);
  const contactEmail = escapeHtml(d.contact_email);
  const subject = `🍜 New Job Post Request — ${companyName}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Company", companyName)}
      ${row("Website", companyWebsite ? `<a href="${companyWebsite}" style="color:#C8501A">${companyWebsite}</a>` : null)}
      ${row("Contact", `${contactName} — <a href="mailto:${contactEmail}" style="color:#C8501A">${contactEmail}</a>`)}
      ${row("Job Title", escapeHtml(d.job_title))}
      ${row("Job Type", escapeHtml(d.job_type))}
      ${row("Location", escapeHtml(d.location))}
      ${row("Salary", escapeHtml(d.salary_range))}
      ${row("Bootstrapped", d.is_bootstrapped ? "Yes ✓" : "No")}
      ${row("Revenue", d.revenue_range ? escapeHtml(d.revenue_range) : null)}
      ${row("Submitted", new Date(d.created_at).toLocaleString())}
    </table>
    <div style="margin-top:16px;padding:14px;background:#FAF9F7;border-radius:8px;border:1px solid #E5E0D8">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Job Description</p>
      <p style="margin:0;font-size:13px;color:#1A1A1A;line-height:1.6">${escapeHtml(truncate(d.job_description))}</p>
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
  const applicantName = escapeHtml(d.applicant_name);
  const applicantEmail = escapeHtml(d.applicant_email);
  const jobTitle = escapeHtml(d.job_title);
  const companyName = escapeHtml(d.company_name);
  const cvLink = d.cv_link ? escapeHtml(d.cv_link) : null;
  const applyUrl = d.apply_url ? escapeHtml(d.apply_url) : null;
  const subject = `🍜 New Application — ${applicantName} for ${jobTitle} at ${companyName}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Applicant", `${applicantName} — <a href="mailto:${applicantEmail}" style="color:#C8501A">${applicantEmail}</a>`)}
      ${row("Job", `${jobTitle} at ${companyName}`)}
      ${row("CV File", d.cv_file_name ? escapeHtml(d.cv_file_name) : null)}
      ${row("CV Link", cvLink ? `<a href="${cvLink}" style="color:#C8501A">${cvLink}</a>` : null)}
      ${row("Original Posting", applyUrl ? `<a href="${applyUrl}" style="color:#C8501A">${applyUrl}</a>` : null)}
      ${row("Submitted", new Date(d.created_at).toLocaleString())}
    </table>
    <div style="margin-top:16px;padding:14px;background:#FAF9F7;border-radius:8px;border:1px solid #E5E0D8">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Why Interested</p>
      <p style="margin:0;font-size:13px;color:#1A1A1A;line-height:1.6">${escapeHtml(truncate(d.why_interested))}</p>
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
  const fullName = escapeHtml(d.full_name);
  const email = escapeHtml(d.email);
  const subject = `🍜 New Subscriber — ${fullName}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Name", fullName)}
      ${row("Email", `<a href="mailto:${email}" style="color:#C8501A">${email}</a>`)}
      ${row("Roles", d.role_types.length > 0 ? d.role_types.map(escapeHtml).join(", ") : "Not specified")}
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
  const name = escapeHtml(d.name);
  const website = escapeHtml(d.website);
  const contactEmail = escapeHtml(d.contact_email);
  const logoUrl = d.logo_url ? escapeHtml(d.logo_url) : null;
  const subject = `🍜 New Company Registration — ${name}`;
  const table = `
    <table cellpadding="0" cellspacing="0" style="width:100%">
      ${row("Company", name)}
      ${row("Website", `<a href="${website}" style="color:#C8501A">${website}</a>`)}
      ${row("Contact", `<a href="mailto:${contactEmail}" style="color:#C8501A">${contactEmail}</a>`)}
      ${row("Team Size", d.team_size ? escapeHtml(d.team_size) : null)}
      ${row("Revenue", d.revenue_range ? escapeHtml(d.revenue_range) : null)}
      ${row("Founded", d.founded_year ? String(d.founded_year) : null)}
      ${row("Logo", logoUrl ? `<a href="${logoUrl}" style="color:#C8501A">View logo</a>` : "Not uploaded")}
      ${row("Submitted", new Date(d.created_at).toLocaleString())}
    </table>
    <div style="margin-top:16px;padding:14px;background:#FAF9F7;border-radius:8px;border:1px solid #E5E0D8">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Description</p>
      <p style="margin:0 0 12px;font-size:13px;color:#1A1A1A;line-height:1.6">${escapeHtml(truncate(d.description))}</p>
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B6560;text-transform:uppercase;letter-spacing:.05em">Why Work Here</p>
      <p style="margin:0;font-size:13px;color:#1A1A1A;line-height:1.6">${escapeHtml(truncate(d.why_work_here))}</p>
    </div>`;
  return { subject, html: wrap(subject, table) };
}

export function companyRegistrationConfirmationTemplate(
  d: Pick<CompanyRegistrationData, "name">
): { subject: string; html: string } {
  const name = escapeHtml(d.name);
  const subject = `🍜 We received your RamenHire profile — ${name}`;
  const body = `
    <p style="margin:0 0 12px;font-size:14px;color:#1A1A1A;line-height:1.6">
      Thanks for registering <strong>${name}</strong> on RamenHire!
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
  const name = escapeHtml(d.name);
  const verifyUrl = escapeHtml(d.verify_url);
  const subject = `🍜 Confirm your email to register ${name} on RamenHire`;
  const body = `
    <p style="margin:0 0 12px;font-size:14px;color:#1A1A1A;line-height:1.6">
      Thanks for starting a RamenHire profile for <strong>${name}</strong>.
      Confirm this is your email address to submit it for review:
    </p>
    <div style="margin:20px 0">
      <a href="${verifyUrl}"
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
