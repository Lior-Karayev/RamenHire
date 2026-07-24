import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAdminNotification, sendCompanyConfirmation } from "@/lib/email";
import {
  companyRegistrationAdminTemplate,
  companyRegistrationConfirmationTemplate,
} from "@/lib/email-templates";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import ResendVerificationButton from "@/components/ResendVerificationButton";
import type { Company } from "@/lib/companies";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

export const metadata: Metadata = {
  title: "Confirm Your Email",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

type Outcome =
  | { kind: "invalid" }
  | { kind: "expired"; token: string; name: string }
  | { kind: "already-verified"; name: string }
  | { kind: "verified"; name: string };

async function processVerification(token: string | undefined): Promise<Outcome> {
  if (!token) return { kind: "invalid" };

  const { data: company, error } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle<Company>();

  if (error || !company) return { kind: "invalid" };

  if (company.status !== "unverified") {
    // Idempotent: a repeat click (or an email-security-scanner prefetch that
    // already hit this URL once) lands here instead of erroring or re-firing emails.
    return { kind: "already-verified", name: company.name };
  }

  const expiresAt = company.verification_token_expires_at
    ? new Date(company.verification_token_expires_at)
    : null;
  if (!expiresAt || expiresAt < new Date()) {
    return { kind: "expired", token, name: company.name };
  }

  // Deliberately NOT nulling verification_token here: the status check above
  // (status !== "unverified") is what makes this mutation idempotent. Nulling
  // the token would break that — a repeat click on the same link would then
  // match no row at all and show "invalid" instead of "already confirmed".
  const { error: updateError } = await supabaseAdmin
    .from("companies")
    .update({
      status: "pending",
      email_verified_at: new Date().toISOString(),
    })
    .eq("id", company.id);

  if (updateError) return { kind: "invalid" };

  // Admin notification + company confirmation fire only now — not at initial
  // submit — since this is the point the submission actually enters the queue.
  const admin = companyRegistrationAdminTemplate(company);
  const confirmation = companyRegistrationConfirmationTemplate(company);
  await Promise.all([
    sendAdminNotification(admin.subject, admin.html),
    sendCompanyConfirmation(company.contact_email, confirmation.subject, confirmation.html),
  ]);

  return { kind: "verified", name: company.name };
}

export default async function VerifyCompanyPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const outcome = await processVerification(token);
  const user = await getCurrentUser();
  const postJobCta = await getPostJobCta(user);

  let heading: string;
  let body: React.ReactNode;

  if (outcome.kind === "verified") {
    heading = "Thanks — we're reviewing your profile";
    body = (
      <>
        <strong>{outcome.name}</strong>{" "}
        is confirmed and in our review queue. We&apos;ll email you once it&apos;s live — this
        usually takes 24–48 hours.
      </>
    );
  } else if (outcome.kind === "already-verified") {
    heading = "Already confirmed";
    body = (
      <>
        This email was already confirmed for <strong>{outcome.name}</strong> — no action needed.
      </>
    );
  } else if (outcome.kind === "expired") {
    heading = "This link has expired";
    body = (
      <>
        Verification links expire after 48 hours. Request a new one below and we&apos;ll resend it
        to the email you registered with for <strong>{outcome.name}</strong>.
      </>
    );
  } else {
    heading = "This link isn't valid";
    body = <>The verification link is missing or incorrect. Double-check the link from your email, or start a new registration.</>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <Header user={user} postJobCta={postJobCta} />

      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-6">🍜</p>
        <h1 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
          {heading}
        </h1>
        <p className="text-base mb-8" style={{ color: "#6B6560" }}>
          {body}
        </p>

        {outcome.kind === "expired" && <ResendVerificationButton token={outcome.token} />}

        <a
          href="/companies"
          className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium mt-4"
          style={{ backgroundColor: "#1A1A1A", color: "#FAF9F7" }}
        >
          ← Back to companies
        </a>
      </main>

      <SiteFooter />
    </div>
  );
}
