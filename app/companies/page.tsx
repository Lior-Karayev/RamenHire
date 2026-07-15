import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/companies";
import SiteFooter from "@/components/SiteFooter";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Companies Hiring at Bootstrapped Startups",
  description:
    "Browse bootstrapped, profitable companies hiring on RamenHire. Verified, self-funded startups building without VC pressure.",
  path: "/companies",
});

export default async function CompaniesPage() {
  let companies: Company[] = [];

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error) companies = data ?? [];
  } catch {
    // Render empty state rather than crash if DB is unreachable
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#FAF9F7", borderColor: "#E5E0D8" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </a>
          <a
            href="/companies/register"
            className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
            style={{ backgroundColor: "#C8501A", color: "#FAF9F7", borderColor: "#C8501A" }}
          >
            Register Your Company
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12 max-w-2xl">
          <h1 className="text-3xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
            Companies
          </h1>
          <p className="text-base" style={{ color: "#6B6560" }}>
            Bootstrapped, profitable companies hiring on RamenHire.
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="text-4xl mb-5">🍜</p>
            <h2 className="text-xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
              No companies listed yet
            </h2>
            <p className="text-sm mb-8" style={{ color: "#6B6560" }}>
              We&apos;re just getting started. If you run a bootstrapped, profitable
              company, be the first to create a public profile.
            </p>
            <a
              href="/companies/register"
              className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
            >
              Register Your Company →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companies.map((company) => (
              <a
                key={company.id}
                href={`/companies/${company.slug}`}
                className="flex flex-col gap-3 p-5 rounded-lg border transition-all"
                style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF" }}
              >
                <div className="flex items-center gap-3">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      className="w-10 h-10 rounded-lg object-cover border"
                      style={{ borderColor: "#E5E0D8" }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: "#F0EDE8", color: "#C8501A" }}
                    >
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-base font-medium" style={{ color: "#1A1A1A" }}>
                      {company.name}
                    </p>
                    {company.is_bootstrapped && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-md border inline-block mt-1"
                        style={{ color: "#5C7A5C", borderColor: "#5C7A5C", backgroundColor: "#F0F4F0" }}
                      >
                        Bootstrapped ✓
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
                  {company.description}
                </p>
              </a>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
