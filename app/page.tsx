import { supabase } from "@/lib/supabase";
import HomeClient, { type JobListing } from "./HomeClient";
import type { Company } from "@/lib/companies";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

function buildJobPostingSchema(job: JobListing) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.company_website ? { sameAs: job.company_website } : {}),
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: job.location },
    employmentType: "FULL_TIME",
    url: job.apply_url,
    directApply: true,
    datePosted: job.date_posted,
    validThrough: job.valid_through,
  };
}

export default async function Home() {
  let jobs: JobListing[] = [];
  let totalCount = 0;
  let companies: Company[] = [];

  try {
    const { data, count, error } = await supabase
      .from("job_listings")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error) {
      jobs = data ?? [];
      totalCount = count ?? 0;
    }
  } catch {
    // Render empty state rather than crash if DB is unreachable
  }

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("status", "approved")
      .is("deleted_at", null);

    if (!error) companies = data ?? [];
  } catch {
    // Company linking is a progressive enhancement — ignore failures
  }

  const jobPostingSchemas = jobs.map(buildJobPostingSchema);
  const user = await getCurrentUser();
  const postJobCta = await getPostJobCta(user);

  return (
    <>
      {jobPostingSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchemas) }}
        />
      )}
      <HomeClient jobs={jobs} totalCount={totalCount} companies={companies} user={user} postJobCta={postJobCta} />
    </>
  );
}
