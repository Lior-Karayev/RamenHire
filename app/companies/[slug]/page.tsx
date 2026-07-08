import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { companyMatchesJob, TEAM_SIZE_OPTIONS, REVENUE_OPTIONS, type Company } from "@/lib/companies";
import type { JobListing } from "@/app/HomeClient";
import SiteFooter from "@/components/SiteFooter";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCompany(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

async function getMatchedJobs(company: Company): Promise<JobListing[]> {
  const { data, error } = await supabase
    .from("job_listings")
    .select("*")
    .eq("is_active", true);

  if (error || !data) return [];
  return data.filter((job) => companyMatchesJob(company, job));
}

function truncate(text: string, max = 155): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return {};

  const title = company.name;
  const description = truncate(company.description);
  const url = `https://www.ramenhire.com/companies/${company.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${company.name} | RamenHire`,
      description,
      url,
      ...(company.logo_url ? { images: [{ url: company.logo_url }] } : {}),
    },
    twitter: {
      title: `${company.name} | RamenHire`,
      description,
    },
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  const jobs = await getMatchedJobs(company);

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

      <nav
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#FAF9F7", borderColor: "#E5E0D8" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </a>
          <a
            href="/companies"
            className="text-sm transition-colors"
            style={{ color: "#6B6560" }}
          >
            ← All companies
          </a>
        </div>
      </nav>

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

        <section>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1A1A1A" }}>
            Open Roles {jobs.length > 0 && `(${jobs.length})`}
          </h2>

          {jobs.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B6560" }}>
              No open roles listed right now.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {jobs.map((job) => (
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
