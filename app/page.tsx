"use client";

const POST_JOB_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXHCqqYpiSNLKJhe3Cpo4aRjpyTKRwEju4SO9A30eMOzChiA/viewform?usp=publish-editor";
const EMAIL_SIGNUP_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdr85e8kfqKd8qCdW-kClDYdTx7WMZMl9SrJ-aozi0HYfUsqw/viewform?usp=publish-editor";

const jobs = [
  {
    title: "Growth Marketing Manager",
    company: "Payhip",
    salary: "$75,000 – $99,000",
    location: "Remote · Worldwide",
    tags: ["Marketing", "SEO", "PPC"],
    description:
      "Payhip is a profitable, bootstrapped startup powering 150,000+ entrepreneurs to sell digital products online. Looking for a growth marketer to identify high-impact opportunities and drive organic and paid acquisition.",
    applyUrl: "https://weworkremotely.com/remote-jobs/payhip-growth-marketing-manager",
  },
  {
    title: "Head of Product",
    company: "Gruntwork",
    salary: "$150,000 – $180,000 (est.)",
    location: "Remote · Worldwide",
    tags: ["Product", "DevOps", "SaaS"],
    description:
      "Gruntwork is a profitable, bootstrapped DevOps company with no outside investors. Globally recognized for open source tools like Terragrunt used by thousands of companies from startups to Fortune 500s.",
    applyUrl: "https://jobs.ashbyhq.com/gruntwork/c216e88e-2580-447d-9ea7-665ef00b15ea",
  },
  {
    title: "Customer Onboarding & Support Specialist",
    company: "Gymflow",
    salary: "$45,000 – $65,000 (est.)",
    location: "Remote · South Africa",
    tags: ["Customer Support", "SaaS", "Onboarding"],
    description:
      "Gymflow is a founder-led, bootstrapped SaaS platform for gym and fitness studio owners. Small, focused team of 11 where your impact is immediate and visible.",
    applyUrl: "https://weworkremotely.com/remote-jobs/gymflow-customer-onboarding-support-specialist-remote-south-africa",
  },
  {
    title: "Senior Software Engineer",
    company: "Aha!",
    salary: "$130,000 – $160,000 (est.)",
    location: "Remote · Worldwide",
    tags: ["Engineering", "Ruby", "SaaS"],
    description:
      "Aha! is a self-funded, profitable, 100% remote product development company used by 700,000+ builders worldwide. They champion the Bootstrap Movement and have never taken outside funding.",
    applyUrl: "https://www.aha.io/company/careers/current-openings",
  },
];

const valueProps = [
  {
    icon: "✦",
    title: "Verified Bootstrapped",
    body: "Every company is manually reviewed. No VC rounds, no Series A on the way, no secret funding. Just founders who built something real.",
  },
  {
    icon: "◎",
    title: "Profitable by Default",
    body: "These companies don't need your next sprint to hit growth targets. Revenue comes from customers, not investors chasing a 10x exit.",
  },
  {
    icon: "◻",
    title: "No Pitch Culture",
    body: "Calm teams, sustainable pace, thoughtful roadmaps. Work that fits a life — not a startup that asks you to live for work.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      {/* NAVBAR */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "#FAF9F7",
          borderColor: "#E5E0D8",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </span>
          <a
            href={POST_JOB_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: "#C8501A",
              color: "#FAF9F7",
              borderColor: "#C8501A",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#A8401A";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#A8401A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#C8501A";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C8501A";
            }}
          >
            Post a Job
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mb-8"
            style={{ color: "#5C7A5C", borderColor: "#5C7A5C", backgroundColor: "#F0F4F0" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#5C7A5C" }}
            />
            Bootstrapped companies only
          </div>
          <h1
            className="text-5xl font-semibold leading-[1.1] tracking-tight mb-6"
            style={{ color: "#1A1A1A" }}
          >
            Jobs at Bootstrapped,{" "}
            <span style={{ color: "#C8501A" }}>Profitable</span>{" "}
            Startups
          </h1>
          <p className="text-xl leading-relaxed mb-10" style={{ color: "#6B6560" }}>
            No VC pressure. No layoff roulette. Just calm, profitable companies
            hiring great people.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#jobs"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-colors"
              style={{
                backgroundColor: "#1A1A1A",
                color: "#FAF9F7",
                borderColor: "#1A1A1A",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#333";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1A1A1A";
              }}
            >
              Browse Jobs
            </a>
            <a
              href={POST_JOB_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-colors"
              style={{
                backgroundColor: "transparent",
                color: "#1A1A1A",
                borderColor: "#E5E0D8",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C8501A";
                (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E0D8";
                (e.currentTarget as HTMLAnchorElement).style.color = "#1A1A1A";
              }}
            >
              Post a Job — $99
            </a>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section
        className="border-y"
        style={{ borderColor: "#E5E0D8" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {valueProps.map((prop) => (
              <div key={prop.title}>
                <div
                  className="text-2xl mb-4"
                  style={{ color: "#C8501A" }}
                >
                  {prop.icon}
                </div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: "#1A1A1A" }}
                >
                  {prop.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
                  {prop.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOB LISTINGS */}
      <section id="jobs" className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>
            Latest Openings
          </h2>
          <span className="text-sm" style={{ color: "#6B6560" }}>
            {jobs.length} jobs
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div
              key={`${job.title}-${job.company}`}
              className="group flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-lg border cursor-pointer transition-all"
              style={{
                borderColor: "#E5E0D8",
                backgroundColor: "#FAF9F7",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#C8501A";
                (e.currentTarget as HTMLDivElement).style.backgroundColor = "#FFF8F5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E0D8";
                (e.currentTarget as HTMLDivElement).style.backgroundColor = "#FAF9F7";
              }}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-medium" style={{ color: "#1A1A1A" }}>
                    {job.title}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md border"
                    style={{
                      color: "#5C7A5C",
                      borderColor: "#5C7A5C",
                      backgroundColor: "#F0F4F0",
                    }}
                  >
                    Bootstrapped ✓
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#6B6560" }}>
                  <span>{job.company}</span>
                  <span>·</span>
                  <span>{job.location}</span>
                  <span>·</span>
                  <span>{job.salary}</span>
                </div>
                <p className="text-sm leading-relaxed mt-0.5" style={{ color: "#6B6560", maxWidth: "580px" }}>
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-md border"
                      style={{
                        color: "#6B6560",
                        borderColor: "#E5E0D8",
                        backgroundColor: "#F5F3F0",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition-colors"
                  style={{ color: "#C8501A" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#A8401A";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Apply Now ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EMAIL SIGNUP */}
      <section
        className="border-y"
        style={{ borderColor: "#E5E0D8" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
              Get new jobs in your inbox every week
            </h2>
            <p className="text-base mb-8" style={{ color: "#6B6560" }}>
              No spam, no noise. Just a curated list of new openings at
              bootstrapped companies, every Monday.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.open(EMAIL_SIGNUP_FORM_URL, "_blank");
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-3 rounded-lg border text-sm outline-none transition-colors"
                style={{
                  borderColor: "#E5E0D8",
                  backgroundColor: "#FFFFFF",
                  color: "#1A1A1A",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#C8501A";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E0D8";
                }}
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: "#C8501A",
                  color: "#FAF9F7",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#A8401A";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#C8501A";
                }}
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs mt-4" style={{ color: "#6B6560" }}>
              Unsubscribe anytime. We respect your inbox.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </span>
          <p className="text-sm text-center" style={{ color: "#6B6560" }}>
            © 2026 RamenHire — Jobs at companies that don&apos;t need your hustle.
          </p>
          <a
            href={POST_JOB_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium transition-colors"
            style={{ color: "#6B6560" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#6B6560";
            }}
          >
            Post a Job
          </a>
        </div>
      </footer>
    </div>
  );
}
