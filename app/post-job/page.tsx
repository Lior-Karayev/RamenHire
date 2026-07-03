"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

declare function gtag(command: string, action: string, params?: Record<string, unknown>): void;

type FormData = {
  contact_name: string;
  contact_email: string;
  company_name: string;
  company_website: string;
  is_bootstrapped: "" | "yes" | "no";
  revenue_range: string;
  job_title: string;
  job_type: string;
  location: string;
  salary_range: string;
  job_description: string;
  company_description: string;
  application_link: string;
};

const INITIAL: FormData = {
  contact_name: "",
  contact_email: "",
  company_name: "",
  company_website: "",
  is_bootstrapped: "",
  revenue_range: "",
  job_title: "",
  job_type: "",
  location: "",
  salary_range: "",
  job_description: "",
  company_description: "",
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

export default function PostJobPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  function field(key: keyof FormData) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const { error: supaError } = await supabase.from("job_post_requests").insert({
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      company_name: form.company_name,
      company_website: form.company_website || null,
      is_bootstrapped: form.is_bootstrapped === "yes",
      revenue_range: form.revenue_range || null,
      job_title: form.job_title,
      job_type: form.job_type,
      location: form.location,
      salary_range: form.salary_range,
      job_description: form.job_description,
      company_description: form.company_description,
      application_link: form.application_link,
    });

    if (supaError) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    gtag("event", "post_job_submitted");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "#FAF9F7", borderColor: "#E5E0D8" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </a>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">

        {status === "success" ? (
          /* ── SUCCESS STATE ──────────────────────────── */
          <div className="text-center py-20">
            <p className="text-5xl mb-6">🍜</p>
            <h1 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
              Listing submitted!
            </h1>
            <p className="text-base mb-8" style={{ color: "#6B6560" }}>
              Thanks! We&apos;ll review your listing and get back to you within 24 hours.
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
            {/* ── HEADER ──────────────────────────────── */}
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
                Reach candidates who want to work at profitable, bootstrapped companies.
                $99 per listing.
              </p>
            </div>

            {/* ── FORM ────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">

              {/* About you */}
              <section className="flex flex-col gap-5">
                <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
                  About you
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Your Name <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contact_name}
                    onChange={field("contact_name")}
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Work Email <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.contact_email}
                    onChange={field("contact_email")}
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>
              </section>

              <div style={{ borderBottom: "1px solid #E5E0D8" }} />

              {/* About your company */}
              <section className="flex flex-col gap-5">
                <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
                  About your company
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Company Name <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company_name}
                    onChange={field("company_name")}
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Company Website <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={form.company_website}
                    onChange={field("company_website")}
                    placeholder="https://..."
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2.5" style={{ color: "#1A1A1A" }}>
                    Is your company bootstrapped / self-funded?{" "}
                    <span style={{ color: "#C8501A" }}>*</span>
                  </p>
                  <div className="flex gap-6">
                    {(["yes", "no"] as const).map((val) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_bootstrapped"
                          value={val}
                          required
                          checked={form.is_bootstrapped === val}
                          onChange={() =>
                            setForm((p) => ({ ...p, is_bootstrapped: val }))
                          }
                          style={{ accentColor: "#C8501A", width: "16px", height: "16px" }}
                        />
                        <span className="text-sm" style={{ color: "#1A1A1A" }}>
                          {val === "yes" ? "Yes" : "No"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Approximate Revenue Range{" "}
                    <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                      (optional)
                    </span>
                  </label>
                  <select
                    value={form.revenue_range}
                    onChange={field("revenue_range")}
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  >
                    <option value="">Select a range</option>
                    <option value="pre-revenue">Pre-revenue</option>
                    <option value="under-10k">Under $10K / mo</option>
                    <option value="10k-50k">$10K – $50K / mo</option>
                    <option value="50k-100k">$50K – $100K / mo</option>
                    <option value="100k-plus">$100K+ / mo</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    What makes your company great to work at?{" "}
                    <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.company_description}
                    onChange={field("company_description")}
                    placeholder="Tell candidates what makes working here special — culture, pace, mission, perks…"
                    className={`${INPUT_CLS} resize-none`}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>
              </section>

              <div style={{ borderBottom: "1px solid #E5E0D8" }} />

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
                {status === "loading" ? "Submitting…" : "Submit Listing — $99"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
