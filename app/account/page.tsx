import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getOwnCompany } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import ResendVerificationButton from "@/components/ResendVerificationButton";
import AccountSettingsClient from "./AccountSettingsClient";
import { UNVERIFIED_RETENTION_DAYS, COMPANY_RETENTION_DAYS } from "@/lib/purge";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

function daysRemaining(fromDate: string, windowDays: number): number {
  const deadline = new Date(fromDate).getTime() + windowDays * 24 * 60 * 60 * 1000;
  const msLeft = deadline - Date.now();
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const company = await getOwnCompany(user.id);
  const postJobCta = await getPostJobCta(user, company);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <Header user={user} postJobCta={postJobCta} />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
          Account
        </h1>
        <p className="text-sm mb-10" style={{ color: "#9B9690" }}>{user.email}</p>

        {!company ? (
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF" }}
          >
            <p className="text-sm" style={{ color: "#6B6560" }}>
              No company profile is linked to this account yet.
            </p>
            <a
              href="/companies/register"
              className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium mt-4"
              style={{ backgroundColor: "#1A1A1A", color: "#FAF9F7" }}
            >
              Register a company
            </a>
          </div>
        ) : company.deleted_at ? (
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF" }}
          >
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-md border mb-4"
              style={{ color: "#6B6560", borderColor: "#E5E0D8", backgroundColor: "#F0EDE8" }}
            >
              Deletion requested
            </span>
            <p className="text-sm" style={{ color: "#6B6560" }}>
              Your account and listings are scheduled for permanent deletion in{" "}
              {daysRemaining(company.deleted_at, COMPANY_RETENTION_DAYS)} day(s). Changed your mind?
              Email{" "}
              <a href="mailto:hello@ramenhire.com" style={{ color: "#C8501A" }}>hello@ramenhire.com</a>{" "}
              before then.
            </p>
          </div>
        ) : (
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF" }}
          >
            <p className="text-sm mb-1" style={{ color: "#9B9690" }}>Company</p>
            <p className="text-lg font-medium mb-6" style={{ color: "#1A1A1A" }}>{company.name}</p>

            {company.status === "approved" && (
              <>
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-md border mb-4"
                  style={{ color: "#5C7A5C", borderColor: "#5C7A5C", backgroundColor: "#F0F4F0" }}
                >
                  Approved ✓
                </span>
                <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
                  Your profile is live. You can post and manage job listings.
                </p>
                <a
                  href="/post-job"
                  className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
                >
                  Post a Job
                </a>
              </>
            )}

            {(company.status === "unverified" || company.status === "pending") && (
              <>
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-md border mb-4"
                  style={{ color: "#C8501A", borderColor: "#C8501A", backgroundColor: "#FFF8F5" }}
                >
                  {company.status === "unverified" ? "Awaiting email confirmation" : "Pending review"}
                </span>
                <p className="text-sm mb-2" style={{ color: "#6B6560" }}>
                  {company.status === "unverified"
                    ? "Confirm your email to enter our review queue — check your inbox for the link we sent, or request a new one below."
                    : "Your profile is in our review queue. This usually takes 24–48 hours."}
                </p>
                <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
                  If your account isn&apos;t approved within {daysRemaining(company.created_at, UNVERIFIED_RETENTION_DAYS)} more day(s), it
                  becomes eligible for removal. Questions? Email{" "}
                  <a href="mailto:hello@ramenhire.com" style={{ color: "#C8501A" }}>hello@ramenhire.com</a>.
                </p>
                {company.status === "unverified" && company.verification_token && (
                  <ResendVerificationButton token={company.verification_token} />
                )}
              </>
            )}

            {company.status === "rejected" && (
              <>
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-md border mb-4"
                  style={{ color: "#6B6560", borderColor: "#E5E0D8", backgroundColor: "#F0EDE8" }}
                >
                  Not approved
                </span>
                <p className="text-sm" style={{ color: "#6B6560" }}>
                  Your profile wasn&apos;t approved. If you think this was a mistake, email{" "}
                  <a href="mailto:hello@ramenhire.com" style={{ color: "#C8501A" }}>hello@ramenhire.com</a>.
                </p>
              </>
            )}
          </div>
        )}

        {company && !company.deleted_at && (
          <AccountSettingsClient contactEmail={company.contact_email} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
