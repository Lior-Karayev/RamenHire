import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { companyMatchesJob, TEAM_SIZE_OPTIONS, REVENUE_OPTIONS, type Company } from "@/lib/companies";
import type { JobListing } from "@/app/HomeClient";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import CompanyListingsManager from "@/components/CompanyListingsManager";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCompany(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

async function getMatchedJobs(company: Company): Promise<JobListing[]> {
  const { data, error } = await supabase
    .from("job_listings")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null);

  if (error || !data) return [];
  return data.filter((job) => companyMatchesJob(company, job));
}

// Anon reads only ever see is_active=true rows (RLS), so the owner's own
// inactive listings need the service-role client to be visible in their own
// management view.
async function getOwnedJobs(companyId: string): Promise<JobListing[]> {
  const { data, error } = await supabaseAdmin
    .from("job_listings")
    .select("*")
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (error || !data) return [];
  return data;
}

function truncate(text: string, max = 155): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return {};

  const description = truncate(company.description);

  return buildPageMetadata({
    title: company.name,
    description,
    path: `/companies/${company.slug}`,
    ogTitle: `${company.name} | RamenHire`,
    image: company.logo_url ?? undefined,
  });
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  const jobs = await getMatchedJobs(company);
  const user = await getCurrentUser();

  let isOwner = false;
  let ownCompany: Pick<Company, "id" | "status" | "deleted_at"> | null = null;
  if (user) {
    const { data } = await supabaseAdmin
      .from("companies")
      .select("id, status, deleted_at")
      .eq("auth_user_id", user.id)
      .maybeSingle<Pick<Company, "id" | "status" | "deleted_at">>();
    ownCompany = data;
    isOwner = ownCompany?.id === company.id;
  }

  const postJobCta = await getPostJobCta(user, ownCompany);
  const ownedJobs = isOwner ? await getOwnedJobs(company.id) : [];
  const ownedJobIds = new Set(ownedJobs.map((j) => j.id));
  const otherJobs = jobs.filter((j) => !ownedJobIds.has(j.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.website,
    description: company.description,
    ...(company.logo_url ? { logo: company.logo_url } : {}),
  };

  const metaRows = [
    company.team_size
      ? { label: "Team size", value: TEAM_SIZE_OPTIONS.find((o) => o.value === company.team_size)?.label ?? company.team_size }
      : null,
    company.revenue_range
      ? { label: "Revenue", value: REVENUE_OPTIONS.find((o) => o.value === company.revenue_range)?.label ?? company.revenue_range }
      : null,
    company.founded_year ? { label: "Founded", value: String(company.founded_year) } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header user={user} postJobCta={postJobCta} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-start gap-4 mb-6">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="w-16 h-16 rounded-xl object-cover border"
              style={{ borderColor: "#E5E0D8" }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-semibold"
              style={{ backgroundColor: "#F0EDE8", color: "#C8501A" }}
            >
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>
              {company.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {company.is_bootstrapped && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-md border"
                  style={{ color: "#5C7A5C", borderColor: "#5C7A5C", backgroundColor: "#F0F4F0" }}
                >
                  Bootstrapped ✓
                </span>
              )}
              {company.is_verified && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-md border"
                  style={{ color: "#C8501A", borderColor: "#C8501A", backgroundColor: "#FFF8F5" }}
                >
                  Verified ✓
                </span>
              )}
            </div>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm mt-1.5 inline-block transition-colors"
              style={{ color: "#C8501A" }}
            >
              {company.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>

        {metaRows.length > 0 && (
          <div
            className="flex flex-wrap gap-x-8 gap-y-2 mb-8 pb-8"
            style={{ borderBottom: "1px solid #E5E0D8" }}
          >
            {metaRows.map((row) => (
              <div key={row.label}>
                <p className="text-xs" style={{ color: "#9B9690" }}>{row.label}</p>
                <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{row.value}</p>
              </div>
            ))}
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-base font-semibold mb-3" style={{ color: "#1A1A1A" }}>
            About
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
            {company.description}
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-base font-semibold mb-3" style={{ color: "#1A1A1A" }}>
            Why work here
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
            {company.why_work_here}
          </p>
        </section>

        {isOwner && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
                Your Listings {ownedJobs.length > 0 && `(${ownedJobs.length})`}
              </h2>
              <a
                href="/post-job"
                className="text-sm font-medium px-4 py-2 rounded-lg border"
                style={{ backgroundColor: "#C8501A", color: "#FAF9F7", borderColor: "#C8501A" }}
              >
                + Post a new job
              </a>
            </div>

            {ownedJobs.length === 0 ? (
              <p className="text-sm" style={{ color: "#6B6560" }}>
                You haven&apos;t posted any listings yet.
              </p>
            ) : (
              <CompanyListingsManager jobs={ownedJobs} />
            )}
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1A1A1A" }}>
            Open Roles {otherJobs.length > 0 && `(${otherJobs.length})`}
          </h2>

          {otherJobs.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B6560" }}>
              No open roles listed right now.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {otherJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-lg border"
                  style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF" }}
                >
                  <div>
                    <p className="text-base font-medium mb-1" style={{ color: "#1A1A1A" }}>
                      {job.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#6B6560" }}>
                      <span>{job.location}</span>
                      <span>·</span>
                      <span>{job.salary ?? "Salary not listed"}</span>
                    </div>
                  </div>
                  <a
                    href={`/?apply=${job.id}#jobs`}
                    className="text-sm font-medium shrink-0"
                    style={{ color: "#C8501A" }}
                  >
                    Apply Now →
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
