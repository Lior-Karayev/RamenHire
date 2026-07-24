"use client";

import { useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import { trackEvent } from "@/lib/analytics";
import type { CurrentUser } from "@/lib/auth";
import type { PostJobCta } from "@/lib/postJobCta";

const JOB_TAGS = [
  "Engineering", "Design", "Product", "Marketing", "Sales",
  "Customer Success", "Operations", "Finance", "Legal", "HR",
  "DevOps", "Data", "Security", "Mobile", "Frontend", "Backend",
  "Fullstack", "Python", "Ruby", "JavaScript", "TypeScript",
  "React", "Node.js", "Go", "Rust", "Other",
];

type FormData = {
  job_title: string;
  job_type: string;
  location: string;
  salary_range: string;
  job_description: string;
  application_link: string;
};

const INITIAL: FormData = {
  job_title: "",
  job_type: "",
  location: "",
  salary_range: "",
  job_description: "",
  application_link: "",
};

type Status = "idle" | "loading" | "success" | "error";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors appearance-none";
const INPUT_STYLE = {
  borderColor: "#E5E0D8",
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
};

type FocusEl = React.FocusEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

function focusOrange(e: FocusEl) { e.currentTarget.style.borderColor = "#C8501A"; }
function blurGray(e: FocusEl)   { e.currentTarget.style.borderColor = "#E5E0D8"; }

type Props = {
  user: CurrentUser | null;
  postJobCta: PostJobCta;
};

export default function PostJobClient({ user, postJobCta }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function field(key: keyof FormData) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch("/api/companies/job-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_title: form.job_title,
        job_type: form.job_type,
        location: form.location,
        salary_range: form.salary_range,
        job_description: form.job_description,
        application_link: form.application_link,
        tags: selectedTags.length > 0 ? selectedTags : null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setError(body.message ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    trackEvent("post_job_submitted");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>

      {/* -- NAV ------------------------------------------- */}
      <Header zIndex={50} user={user} postJobCta={postJobCta} />

      <main className="max-w-2xl mx-auto px-6 py-16">

        {status === "success" ? (
          /* -- SUCCESS STATE ---------------------------- */
          <div className="text-center py-20">
            <p className="text-5xl mb-6">🍜</p>
            <h1 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
              Your listing is live!
            </h1>
            <p className="text-base mb-8" style={{ color: "#6B6560" }}>
              Candidates can see it now. Manage your listings anytime from your company profile.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#1A1A1A", color: "#FAF9F7" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#333";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1A1A1A";
              }}
            >
              ← Back to jobs
            </a>
          </div>
        ) : (
          <>
            {/* -- HEADER -------------------------------- */}
            <div className="mb-10">
              <a
                href="/"
                className="text-sm transition-colors"
                style={{ color: "#6B6560" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#6B6560";
                }}
              >
                ← Back to jobs
              </a>
              <h1
                className="text-3xl font-semibold mt-5 mb-2"
                style={{ color: "#1A1A1A" }}
              >
                Post a Job
              </h1>
              <p className="text-base" style={{ color: "#6B6560" }}>
                Reach candidates who want to work at profitable, bootstrapped companies.{" "}
                <s style={{ color: "#9CA3AF" }}>$99</s>{" "}
                <strong style={{ color: "#22C55E" }}>Free during early access 🍜</strong>
              </p>
            </div>

            {/* -- FORM ---------------------------------- */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">

              {/* About the role */}
              <section className="flex flex-col gap-5">
                <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
                  About the role
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Job Title <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.job_title}
                    onChange={field("job_title")}
                    placeholder="e.g. Senior Software Engineer"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>
                    Job Tags{" "}
                    <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                      (optional — select up to 5)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {JOB_TAGS.map((tag) => {
                      const active = selectedTags.includes(tag);
                      const maxed = selectedTags.length >= 5 && !active;
                      return (
                        <button
                          key={tag}
                          type="button"
                          disabled={maxed}
                          onClick={() => toggleTag(tag)}
                          className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                          style={{
                            borderColor: active ? "#C8501A" : "#E5E0D8",
                            backgroundColor: active ? "#C8501A" : "transparent",
                            color: active ? "#FAF9F7" : maxed ? "#C5BFB9" : "#6B6560",
                            cursor: maxed ? "not-allowed" : "pointer",
                          }}
                          onMouseEnter={(e) => {
                            if (!active && !maxed)
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8501A";
                          }}
                          onMouseLeave={(e) => {
                            if (!active && !maxed)
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E0D8";
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Job Type <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <select
                    required
                    value={form.job_type}
                    onChange={field("job_type")}
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  >
                    <option value="">Select job type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Location / Remote <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={field("location")}
                    placeholder="e.g. Remote · Worldwide"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Salary Range <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.salary_range}
                    onChange={field("salary_range")}
                    placeholder="e.g. $80,000 – $110,000"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Job Description <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={form.job_description}
                    onChange={field("job_description")}
                    placeholder="Responsibilities, requirements, and anything else candidates should know…"
                    className={`${INPUT_CLS} resize-none`}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Application Link or Email <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.application_link}
                    onChange={field("application_link")}
                    placeholder="https://... or jobs@yourcompany.com"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>
              </section>

              {status === "error" && (
                <p className="text-sm -mt-4" style={{ color: "#C8501A" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                style={{
                  backgroundColor: status === "loading" ? "#D4845A" : "#C8501A",
                  color: "#FAF9F7",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading" && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {status === "loading" ? "Publishing…" : "Publish Listing — Free 🍜"}
              </button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
