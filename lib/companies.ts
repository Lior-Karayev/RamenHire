export type CompanyStatus = "unverified" | "pending" | "approved" | "rejected";

export type Company = {
  id: string;
  slug: string;
  name: string;
  website: string;
  logo_url: string | null;
  description: string;
  why_work_here: string;
  team_size: string | null;
  revenue_range: string | null;
  founded_year: number | null;
  contact_email: string;
  status: CompanyStatus;
  is_verified: boolean;
  is_bootstrapped: boolean;
  verification_token: string | null;
  verification_token_expires_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeWebsite(url: string): string {
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

export function companyMatchesJob(
  company: Pick<Company, "name" | "website">,
  job: { company: string; company_website: string | null }
): boolean {
  if (job.company_website && normalizeWebsite(job.company_website) === normalizeWebsite(company.website)) {
    return true;
  }
  return job.company.trim().toLowerCase() === company.name.trim().toLowerCase();
}

export const TEAM_SIZE_OPTIONS = [
  { value: "1-5", label: "1–5" },
  { value: "6-20", label: "6–20" },
  { value: "21-50", label: "21–50" },
  { value: "51-200", label: "51–200" },
  { value: "201+", label: "201+" },
];

export const REVENUE_OPTIONS = [
  { value: "pre-revenue", label: "Pre-revenue" },
  { value: "under-10k", label: "Under $10K / mo" },
  { value: "10k-50k", label: "$10K – $50K / mo" },
  { value: "50k-100k", label: "$50K – $100K / mo" },
  { value: "100k-plus", label: "$100K+ / mo" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];
