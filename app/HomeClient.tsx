"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { companyMatchesJob, type Company } from "@/lib/companies";
import { trackEvent } from "@/lib/analytics";
import SiteFooter from "@/components/SiteFooter";
import TurnstileWidget from "@/components/TurnstileWidget";

const POST_JOB_URL = "/post-job";

export type JobListing = {
  id: string;
  title: string;
  company: string;
  company_website: string | null;
  salary: string | null;
  location: string;
  job_type: string;
  description: string;
  tags: string[];
  apply_url: string;
  is_bootstrapped: boolean;
  is_active: boolean;
  is_featured: boolean;
  date_posted: string;
  valid_through: string;
  created_at: string;
  updated_at: string;
};

const ROLE_OPTIONS = ["Engineering", "Design", "Product", "Marketing", "Support", "Other"];

const whyBootstrappedCards = [
  {
    icon: "🛡️",
    title: "No layoff roulette",
    text: "Your job is funded by revenue, not a funding round that might not close.",
  },
  {
    icon: "📈",
    title: "Profitable by default",
    text: "These companies don't need to grow 10x to survive. They just need to keep their customers happy.",
  },
  {
    icon: "🧭",
    title: "Founders who decide",
    text: "No committees, no board approval. The people building the product make the calls.",
  },
  {
    icon: "🌱",
    title: "You stay for years",
    text: "Bootstrapped companies have dramatically lower turnover. People actually like working there.",
  },
  {
    icon: "🔍",
    title: "Verified bootstrapped",
    text: "Every company is manually reviewed. No VC rounds, no Series A on the way, no secret funding.",
  },
  {
    icon: "🧘",
    title: "No pitch culture",
    text: "Calm teams, sustainable pace, thoughtful roadmaps. Work that fits a life, not a startup that asks you to live for work.",
  },
];

const employerBenefits = [
  "Candidates who understand bootstrapped culture",
  "No noise from people chasing FAANG salaries",
  "Free during early access — no credit card needed",
];

type ApplyForm = { name: string; email: string; why: string; cv: string };
type SubForm = { name: string; email: string; roles: string[] };
type Status = "idle" | "loading" | "success" | "error";

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors";
const INPUT_STYLE = {
  borderColor: "#E5E0D8",
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
};

function focusOrange(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#C8501A";
}
function blurGray(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#E5E0D8";
}

type Props = {
  jobs: JobListing[];
  totalCount: number;
  companies: Company[];
};

export default function HomeClient({ jobs, totalCount, companies }: Props) {
  function matchedCompanySlug(job: JobListing): string | null {
    const match = companies.find((c) => companyMatchesJob(c, job));
    return match?.slug ?? null;
  }
  // ── Pagination ───────────────────────────────────────────
  const JOBS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsVisible, setJobsVisible] = useState(true);
  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const pageStart = (currentPage - 1) * JOBS_PER_PAGE;
  const pageEnd = Math.min(pageStart + JOBS_PER_PAGE, jobs.length);
  const pagedJobs = jobs.slice(pageStart, pageEnd);

  function changePage(page: number) {
    if (page === currentPage || page < 1 || page > totalPages) return;
    setJobsVisible(false);
    setTimeout(() => {
      setCurrentPage(page);
      setJobsVisible(true);
      jobsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }

  // ── Bootstrapped badge tooltip ───────────────────────────
  const [tooltipJobId, setTooltipJobId] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function tapTooltip(jobId: string) {
    setTooltipJobId(jobId);
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setTooltipJobId(null), 3000);
  }

  // ── Apply modal ──────────────────────────────────────────
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applyForm, setApplyForm] = useState<ApplyForm>({ name: "", email: "", why: "", cv: "" });
  const [applyStatus, setApplyStatus] = useState<Status>("idle");
  const [applyError, setApplyError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileError, setCvFileError] = useState("");
  const [cvUploadStage, setCvUploadStage] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [applyTurnstileToken, setApplyTurnstileToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Subscribe form ───────────────────────────────────────
  const [subForm, setSubForm] = useState<SubForm>({ name: "", email: "", roles: [] });
  const [subStatus, setSubStatus] = useState<Status>("idle");
  const [subError, setSubError] = useState("");

  // ── Launch week popup ────────────────────────────────────
  const [popupMounted, setPopupMounted] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const jobsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.innerWidth < 640) return;
    if (sessionStorage.getItem("ramenhire_popup_dismissed") === "true") return;
    const section = jobsSectionRef.current;
    if (!section) return;
    let triggered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (triggered || !entries[0].isIntersecting) return;
        triggered = true;
        observer.disconnect();
        setTimeout(() => {
          setPopupMounted(true);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setPopupVisible(true))
          );
        }, 1000);
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function dismissPopup() {
    setPopupVisible(false);
    sessionStorage.setItem("ramenhire_popup_dismissed", "true");
    setTimeout(() => setPopupMounted(false), 200);
  }

  // Deep-link support: /?apply=<job_id> (used by company profile pages) reopens
  // the same internal apply flow rather than duplicating it on another page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const applyId = params.get("apply");
    if (!applyId) return;
    const job = jobs.find((j) => j.id === applyId);
    if (job) openApplyModal(job);
    const url = new URL(window.location.href);
    url.searchParams.delete("apply");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openApplyModal(job: JobListing) {
    setSelectedJob(job);
    setApplyForm({ name: "", email: "", why: "", cv: "" });
    setApplyStatus("idle");
    setApplyError("");
    setCvFile(null);
    setCvFileError("");
    setCvUploadStage("idle");
    setIsDragOver(false);
    setApplyTurnstileToken("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    trackEvent("apply_click", { job_title: job.title, company_name: job.company });
  }

  function closeApplyModal() {
    setSelectedJob(null);
  }

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob) return;
    setApplyStatus("loading");
    setApplyError("");

    if (!applyTurnstileToken) {
      setApplyStatus("error");
      setApplyError("Please complete the verification check.");
      return;
    }

    // Metadata goes through the rate-limited/Turnstile-gated route first;
    // the server mints a signed upload URL scoped to the new application's
    // own id, so the file bytes never touch the anon-writable Storage API.
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        company_name: selectedJob.company,
        applicant_name: applyForm.name,
        applicant_email: applyForm.email,
        why_interested: applyForm.why,
        cv_link: applyForm.cv || null,
        cv_file_name: cvFile?.name ?? null,
        apply_url: selectedJob.apply_url,
        turnstile_token: applyTurnstileToken,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setApplyStatus("error");
      setApplyError(body.message ?? "Something went wrong. Please try again.");
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (cvFile && data.upload) {
      setCvUploadStage("uploading");
      const { error: uploadError } = await supabase
        .storage
        .from(data.upload.bucket)
        .uploadToSignedUrl(data.upload.path, data.upload.token, cvFile);

      // The application row already exists at this point — a failed file
      // upload doesn't invalidate the submission (there's a cv_link fallback
      // and this is a private, admin-only reference), so just surface a
      // non-blocking notice instead of treating the whole submit as failed.
      setCvUploadStage(uploadError ? "error" : "done");
    }

    setApplyStatus("success");
    trackEvent("application_submitted", {
      job_title: selectedJob.title,
      company_name: selectedJob.company,
    });
  }

  async function submitSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubStatus("loading");
    setSubError("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: subForm.name,
        email: subForm.email,
        role_types: subForm.roles.length > 0 ? subForm.roles : null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSubStatus("error");
      setSubError(body.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSubStatus("success");
    trackEvent("subscribe_submitted");
  }

  function toggleRole(role: string) {
    setSubForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  }

  // ── File upload helpers ──────────────────────────────────
  const ALLOWED_MIME = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
  const MAX_BYTES = 5 * 1024 * 1024;

  function formatBytes(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function validateFile(file: File): string {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ALLOWED_MIME.includes(file.type) && !ALLOWED_EXT.includes(ext))
      return "Only PDF or Word documents are accepted.";
    if (file.size > MAX_BYTES)
      return "File must be under 5MB.";
    return "";
  }

  function pickFile(file: File) {
    const err = validateFile(file);
    if (err) { setCvFileError(err); return; }
    setCvFile(file);
    setCvFileError("");
    setCvUploadStage("idle");
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  function removeFile() {
    setCvFile(null);
    setCvFileError("");
    setCvUploadStage("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>

      {/* ── LAUNCH WEEK POPUP ────────────────────────────── */}
      {popupMounted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: popupVisible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
            transition: "background-color 0.2s ease",
          }}
          onClick={dismissPopup}
        >
          <div
            className="w-full max-w-[480px] rounded-xl border shadow-2xl"
            style={{
              backgroundColor: "#FAF9F7",
              borderColor: "#E5E0D8",
              opacity: popupVisible ? 1 : 0,
              transform: popupVisible ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-8">
              <button
                onClick={dismissPopup}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-xl leading-none transition-colors"
                style={{ color: "#6B6560" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F0EDE8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                aria-label="Close"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold mb-3 pr-8" style={{ color: "#1A1A1A" }}>
                Post your job free during early access 🍜
              </h2>

              <p className="text-sm leading-relaxed mb-6" style={{ color: "#6B6B6B" }}>
                RamenHire is growing fast — all job posts are completely free while we
                build our community of bootstrapped job seekers. No credit card. No
                commitment.
              </p>

              <div
                className="flex items-center gap-8 mb-6 pb-6"
                style={{ borderBottom: "1px solid #E5E0D8" }}
              >
                {[
                  { value: `${totalCount}`, label: "open jobs" },
                  { value: "22+", label: "job seekers" },
                  { value: "100%", label: "bootstrapped" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-lg font-bold" style={{ color: "#1A1A1A" }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: "#6B6560" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <a
                href="/post-job"
                className="block w-full text-center py-3 rounded-lg text-sm font-medium mb-3 transition-colors"
                style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#A8401A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#C8501A"; }}
                onClick={() => trackEvent("launch_popup_cta_click")}
              >
                Post a Job — It&apos;s Free →
              </a>

              <button
                onClick={dismissPopup}
                className="block w-full text-center text-xs transition-colors"
                style={{ color: "#9B9690" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6560"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9B9690"; }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLY MODAL ───────────────────────────────────── */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(26,26,26,0.6)" }}
          onClick={closeApplyModal}
        >
          <div
            className="w-full max-w-lg rounded-xl border overflow-y-auto relative"
            style={{
              backgroundColor: "#FAF9F7",
              borderColor: "#E5E0D8",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <button
                onClick={closeApplyModal}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-xl leading-none transition-colors"
                style={{ color: "#6B6560" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F0EDE8";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
                aria-label="Close"
              >
                ×
              </button>

              {applyStatus === "success" ? (
                <div className="py-10 text-center">
                  <p className="text-4xl mb-4">🍜</p>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "#1A1A1A" }}>
                    Application sent!
                  </h3>
                  <p className="text-sm" style={{ color: "#6B6560" }}>
                    We&apos;ll review your CV and be in touch soon.
                  </p>
                  {cvUploadStage === "error" && (
                    <p className="text-sm mt-3" style={{ color: "#C8501A" }}>
                      Your application was sent, but the CV file didn&apos;t upload. Feel free to email it directly or add a link next time.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-1 pr-8" style={{ color: "#1A1A1A" }}>
                    Apply for {selectedJob.title}
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
                    at {selectedJob.company}
                  </p>

                  <form onSubmit={submitApplication} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                        Full Name <span style={{ color: "#C8501A" }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={applyForm.name}
                        onChange={(e) => setApplyForm((p) => ({ ...p, name: e.target.value }))}
                        className={INPUT_CLS}
                        style={INPUT_STYLE}
                        onFocus={focusOrange}
                        onBlur={blurGray}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                        Email Address <span style={{ color: "#C8501A" }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={applyForm.email}
                        onChange={(e) => setApplyForm((p) => ({ ...p, email: e.target.value }))}
                        className={INPUT_CLS}
                        style={INPUT_STYLE}
                        onFocus={focusOrange}
                        onBlur={blurGray}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                        Why are you interested in this role?{" "}
                        <span style={{ color: "#C8501A" }}>*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={applyForm.why}
                        onChange={(e) => setApplyForm((p) => ({ ...p, why: e.target.value }))}
                        className={`${INPUT_CLS} resize-none`}
                        style={INPUT_STYLE}
                        onFocus={focusOrange}
                        onBlur={blurGray}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>
                        CV / Resume{" "}
                        <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                          (optional)
                        </span>
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: "none" }}
                        onChange={handleFileInput}
                      />

                      {!cvFile ? (
                        <div
                          onDrop={handleDrop}
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onClick={() => fileInputRef.current?.click()}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                          className="rounded-lg text-center cursor-pointer transition-colors"
                          style={{
                            border: "2px dashed #C8501A",
                            backgroundColor: isDragOver ? "#FFF0EA" : "#FAF9F7",
                            padding: "24px 16px",
                          }}
                        >
                          <p className="text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>
                            Drop your file here or{" "}
                            <span style={{ color: "#C8501A" }}>browse</span>
                          </p>
                          <p className="text-xs" style={{ color: "#9B9690" }}>
                            PDF or Word document, max 5MB
                          </p>
                        </div>
                      ) : (
                        <div
                          className="rounded-lg"
                          style={{
                            border: `2px solid ${cvUploadStage === "error" ? "#E53E3E" : "#C8501A"}`,
                            backgroundColor: "#FAF9F7",
                            padding: "12px 16px",
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base shrink-0" style={{ color: cvUploadStage === "done" ? "#5C7A5C" : "#C8501A" }}>
                                {cvUploadStage === "done" ? "✓" : "📄"}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "#1A1A1A" }}>
                                  {cvFile.name}
                                </p>
                                <p className="text-xs" style={{ color: "#9B9690" }}>
                                  {formatBytes(cvFile.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-base leading-none transition-colors"
                              style={{ color: "#6B6560" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F0EDE8"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                              aria-label="Remove file"
                            >
                              ×
                            </button>
                          </div>
                          {cvUploadStage === "uploading" && (
                            <div
                              className="mt-2 rounded-full overflow-hidden"
                              style={{ height: "3px", backgroundColor: "#E5E0D8" }}
                            >
                              <div
                                className="h-full rounded-full animate-pulse"
                                style={{ width: "65%", backgroundColor: "#C8501A" }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {cvFileError && (
                        <p className="text-xs mt-1.5" style={{ color: "#C8501A" }}>
                          {cvFileError}
                        </p>
                      )}

                      <p className="text-xs mt-3 mb-1.5" style={{ color: "#9B9690" }}>
                        Or paste a link to your CV or portfolio
                      </p>
                      <input
                        type="url"
                        value={applyForm.cv}
                        onChange={(e) => setApplyForm((p) => ({ ...p, cv: e.target.value }))}
                        placeholder="https://..."
                        className={INPUT_CLS}
                        style={INPUT_STYLE}
                        onFocus={focusOrange}
                        onBlur={blurGray}
                      />
                    </div>

                    <TurnstileWidget
                      resetKey={selectedJob?.id}
                      onVerify={setApplyTurnstileToken}
                      onExpire={() => setApplyTurnstileToken("")}
                    />

                    {applyStatus === "error" && (
                      <p className="text-sm" style={{ color: "#C8501A" }}>
                        {applyError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={applyStatus === "loading" || !applyTurnstileToken}
                      className="w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      style={{
                        backgroundColor: applyStatus === "loading" || !applyTurnstileToken ? "#D4845A" : "#C8501A",
                        color: "#FAF9F7",
                        cursor: applyStatus === "loading" || !applyTurnstileToken ? "not-allowed" : "pointer",
                      }}
                    >
                      {applyStatus === "loading" && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {applyStatus === "loading"
                        ? cvUploadStage === "uploading"
                          ? "Uploading CV…"
                          : "Sending application…"
                        : "Send Application"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#FAF9F7", borderColor: "#E5E0D8" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </span>
          <a
            href={POST_JOB_URL}
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
            onClick={() => trackEvent("post_job_click")}
          >
            Post a Job
          </a>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mb-8"
            style={{ color: "#5C7A5C", borderColor: "#5C7A5C", backgroundColor: "#F0F4F0" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#5C7A5C" }} />
            Bootstrapped companies only
          </div>
          <h1
            className="text-5xl font-semibold leading-[1.1] tracking-tight mb-6"
            style={{ color: "#1A1A1A" }}
          >
            Remote Jobs at Bootstrapped,{" "}
            <span style={{ color: "#C8501A" }}>Profitable</span>{" "}
            Startups
          </h1>
          <p className="text-xl leading-relaxed mb-10" style={{ color: "#6B6560" }}>
            No VC pressure. No layoff roulette. Just calm, profitable bootstrapped startups hiring great people for the long run.{" "}
            <span style={{ color: "#1A1A1A" }}>
              Where company funding philosophy is part of the hiring criteria.
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#jobs"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-colors"
              style={{ backgroundColor: "#1A1A1A", color: "#FAF9F7", borderColor: "#1A1A1A" }}
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
              href={POST_JOB_URL}
              className="inline-flex flex-col items-center px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors leading-tight"
              style={{ backgroundColor: "transparent", color: "#1A1A1A", borderColor: "#E5E0D8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C8501A";
                (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E0D8";
                (e.currentTarget as HTMLAnchorElement).style.color = "#1A1A1A";
              }}
              onClick={() => trackEvent("post_job_click")}
            >
              <span>Post a Job — Free 🍜</span>
              <span className="text-xs font-normal" style={{ color: "#9CA3AF", textDecoration: "line-through" }}>
                $99
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section className="border-y" style={{ borderColor: "#E5E0D8", backgroundColor: "#FAF9F7" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: `${totalCount} jobs`, label: "Open positions" },
              { value: "6 countries", label: "Hiring worldwide" },
              { value: "100% bootstrapped", label: "Verified listings" },
              { value: "0 VC funding", label: "Across all companies" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center px-4 py-6 ${
                  i === 1 || i === 3 ? "border-l" : ""
                } ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
                style={{ borderColor: "#E5E0D8" }}
              >
                <span className="text-lg sm:text-xl font-bold" style={{ color: "#C8501A" }}>
                  {stat.value}
                </span>
                <span className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BOOTSTRAPPED ──────────────────────────────── */}
      <section style={{ backgroundColor: "#F0EDE8" }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ color: "#1A1A1A" }}>
              Why bootstrapped companies?
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#6B6560" }}>
              Bootstrapped isn&apos;t just how a company is financed — it&apos;s a signal for
              how decisions get made, who has power, and whether your job exists next year.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyBootstrappedCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border p-6"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6B6B" }}>
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOB LISTINGS ──────────────────────────────────── */}
      <section id="jobs" ref={jobsSectionRef} className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>
            Latest Openings
          </h2>
          <span className="text-sm" style={{ color: "#6B6560" }}>
            {totalCount} jobs
          </span>
        </div>

        {jobs.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: "#6B6560" }}>
            No openings right now — check back soon.
          </p>
        ) : (
          <>
            {/* Job cards with fade transition */}
            <div
              className="flex flex-col gap-3"
              style={{
                opacity: jobsVisible ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              {pagedJobs.map((job) => (
                <div
                  key={job.id}
                  className="group flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-lg border transition-all"
                  style={{ borderColor: "#E5E0D8", backgroundColor: "#FAF9F7" }}
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
                      {job.is_bootstrapped && (
                        <span
                          className="relative inline-block"
                          onMouseEnter={() => setTooltipJobId(job.id)}
                          onMouseLeave={() => setTooltipJobId(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            tapTooltip(job.id);
                          }}
                        >
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-md border cursor-default"
                            style={{
                              color: "#5C7A5C",
                              borderColor: "#5C7A5C",
                              backgroundColor: "#F0F4F0",
                            }}
                          >
                            Bootstrapped ✓
                          </span>
                          {tooltipJobId === job.id && (
                            <span
                              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-64 max-w-[70vw] px-3 py-2 rounded-md text-xs leading-relaxed text-left font-normal"
                              style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF" }}
                            >
                              This company is self-funded with no VC investment. Bootstrapped =
                              profitable, stable, founder-controlled.
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#6B6560" }}>
                      {matchedCompanySlug(job) ? (
                        <a
                          href={`/companies/${matchedCompanySlug(job)}`}
                          className="transition-colors"
                          style={{ color: "#6B6560" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6B6560"; }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {job.company}
                        </a>
                      ) : (
                        <span>{job.company}</span>
                      )}
                      <span>·</span>
                      <span>{job.location}</span>
                      <span>·</span>
                      <span>{job.salary ?? "Salary not listed"}</span>
                    </div>
                    <p
                      className="text-sm leading-relaxed mt-0.5"
                      style={{ color: "#6B6560", maxWidth: "580px" }}
                    >
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
                    <button
                      className="text-sm font-medium transition-colors"
                      style={{ color: "#C8501A" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "#A8401A";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "#C8501A";
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openApplyModal(job);
                      }}
                    >
                      Apply Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── PAGINATION CONTROLS ───────────────────────────── */}
            {totalPages > 1 && (
              <div
                className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* Left: showing counter */}
                <span className="text-sm text-center sm:text-left" style={{ color: "#6B6560" }}>
                  Showing {pageStart + 1}–{pageEnd} of {totalCount} jobs
                </span>

                {/* Center: page buttons */}
                <div className="flex items-center justify-center gap-1">
                  {/* Previous */}
                  <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3 rounded-lg border text-sm transition-colors"
                    style={{
                      borderColor: "#E5E0D8",
                      backgroundColor: "transparent",
                      color: currentPage === 1 ? "#C5BFB9" : "#6B6560",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1)
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8501A";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E0D8";
                    }}
                  >
                    ← Prev
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      className="h-8 w-8 rounded-lg border text-sm font-medium transition-colors"
                      style={{
                        borderColor: page === currentPage ? "#C8501A" : "#E5E0D8",
                        backgroundColor: page === currentPage ? "#C8501A" : "transparent",
                        color: page === currentPage ? "#FAF9F7" : "#6B6560",
                        cursor: page === currentPage ? "default" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (page !== currentPage) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8501A";
                          (e.currentTarget as HTMLButtonElement).style.color = "#C8501A";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (page !== currentPage) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E0D8";
                          (e.currentTarget as HTMLButtonElement).style.color = "#6B6560";
                        }
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 rounded-lg border text-sm transition-colors"
                    style={{
                      borderColor: "#E5E0D8",
                      backgroundColor: "transparent",
                      color: currentPage === totalPages ? "#C5BFB9" : "#6B6560",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages)
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8501A";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E0D8";
                    }}
                  >
                    Next →
                  </button>
                </div>

                {/* Right: spacer to balance layout on desktop */}
                <span
                  className="hidden sm:block text-sm"
                  style={{ color: "#6B6560", minWidth: "120px", textAlign: "right" }}
                >
                  {totalCount} jobs found
                </span>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── EMPLOYER CTA ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-4 pb-16">
        <div
          className="rounded-xl border px-6 py-12 sm:px-12 sm:py-14 text-center sm:text-left"
          style={{ backgroundColor: "#F5F0EB", borderColor: "#E5E0D8" }}
        >
          <div className="max-w-xl mx-auto sm:mx-0">
            <span
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mb-6"
              style={{ color: "#5C7A5C", borderColor: "#5C7A5C", backgroundColor: "#F0F4F0" }}
            >
              For Bootstrapped Founders
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
              Hiring at a bootstrapped company?
            </h2>

            <p className="text-base leading-relaxed mb-6" style={{ color: "#6B6560" }}>
              Reach job seekers who specifically want to work at calm, profitable, founder-run
              companies. No VC-backed chaos. Just the right candidates. Candidates who use
              funding philosophy as a hiring filter — and choose bootstrapped on purpose.
            </p>

            <ul className="flex flex-col gap-2 mb-8 items-center sm:items-start">
              {employerBenefits.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "#1A1A1A" }}
                >
                  <span style={{ color: "#C8501A" }}>✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <a
              href="/post-job?utm_source=homepage&utm_medium=cta&utm_campaign=employers"
              className="inline-block w-full sm:w-auto text-center px-8 py-3 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#A8401A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#C8501A";
              }}
              onClick={() => trackEvent("post_job_click")}
            >
              Post a Job — It&apos;s Free 🍜
            </a>

            <p className="text-xs mt-3" style={{ color: "#6B6560" }}>
              All listings reviewed within 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* ── EMAIL SIGNUP ──────────────────────────────────── */}
      <section className="border-y" style={{ borderColor: "#E5E0D8" }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-3" style={{ color: "#1A1A1A" }}>
                Get new jobs in your inbox every week
              </h2>
              <p className="text-base" style={{ color: "#6B6560" }}>
                No spam, no noise. Just a curated list of new openings at bootstrapped companies,
                every Monday.
              </p>
            </div>

            {subStatus === "success" ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-4">🍜</p>
                <p className="text-lg font-semibold mb-1" style={{ color: "#1A1A1A" }}>
                  You&apos;re in!
                </p>
                <p className="text-sm" style={{ color: "#6B6560" }}>
                  We&apos;ll send you the best bootstrapped jobs every week.
                </p>
              </div>
            ) : (
              <form onSubmit={submitSubscribe} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Full Name <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subForm.name}
                    onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors"
                    style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "#C8501A";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E0D8";
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Email Address <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={subForm.email}
                    onChange={(e) => setSubForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors"
                    style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "#C8501A";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E0D8";
                    }}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>
                    What roles are you looking for?{" "}
                    <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                      (optional)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((role) => {
                      const active = subForm.roles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                          style={{
                            borderColor: active ? "#C8501A" : "#E5E0D8",
                            backgroundColor: active ? "#FFF8F5" : "transparent",
                            color: active ? "#C8501A" : "#6B6560",
                          }}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {subStatus === "error" && (
                  <p className="text-sm" style={{ color: "#C8501A" }}>
                    {subError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={subStatus === "loading"}
                  className="w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  style={{
                    backgroundColor: subStatus === "loading" ? "#D4845A" : "#C8501A",
                    color: "#FAF9F7",
                    cursor: subStatus === "loading" ? "not-allowed" : "pointer",
                  }}
                >
                  {subStatus === "loading" && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {subStatus === "loading" ? "Subscribing…" : "Subscribe"}
                </button>

                <p className="text-xs text-center" style={{ color: "#6B6560" }}>
                  Unsubscribe anytime. We respect your inbox.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
