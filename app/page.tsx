"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

declare function gtag(command: string, action: string, params?: Record<string, unknown>): void;

const POST_JOB_URL = "/post-job";

const jobs = [
  {
    title: "Growth Marketing Manager",
    company: "Payhip",
    salary: "$75,000 – $99,000",
    location: "Remote · Worldwide",
    tags: ["Marketing", "SEO", "PPC"],
    description:
      "Payhip is a profitable, bootstrapped startup powering 150,000+ entrepreneurs to sell digital products online. Looking for a growth marketer to identify high-impact opportunities and drive organic and paid acquisition.",
  },
  {
    title: "Head of Product",
    company: "Gruntwork",
    salary: "$150,000 – $180,000 (est.)",
    location: "Remote · Worldwide",
    tags: ["Product", "DevOps", "SaaS"],
    description:
      "Gruntwork is a profitable, bootstrapped DevOps company with no outside investors. Globally recognized for open source tools like Terragrunt used by thousands of companies from startups to Fortune 500s.",
  },
  {
    title: "Customer Onboarding & Support Specialist",
    company: "Gymflow",
    salary: "$45,000 – $65,000 (est.)",
    location: "Remote · South Africa",
    tags: ["Customer Support", "SaaS", "Onboarding"],
    description:
      "Gymflow is a founder-led, bootstrapped SaaS platform for gym and fitness studio owners. Small, focused team of 11 where your impact is immediate and visible.",
  },
  {
    title: "Senior Software Engineer",
    company: "Aha!",
    salary: "$130,000 – $160,000 (est.)",
    location: "Remote · Worldwide",
    tags: ["Engineering", "Ruby", "SaaS"],
    description:
      "Aha! is a self-funded, profitable, 100% remote product development company used by 700,000+ builders worldwide. They champion the Bootstrap Movement and have never taken outside funding.",
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

const ROLE_OPTIONS = ["Engineering", "Design", "Product", "Marketing", "Support", "Other"];

type Job = typeof jobs[number];
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

export default function Home() {
  // ── Apply modal ──────────────────────────────────────────
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyForm, setApplyForm] = useState<ApplyForm>({ name: "", email: "", why: "", cv: "" });
  const [applyStatus, setApplyStatus] = useState<Status>("idle");
  const [applyError, setApplyError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileError, setCvFileError] = useState("");
  const [cvUploadStage, setCvUploadStage] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Subscribe form ───────────────────────────────────────
  const [subForm, setSubForm] = useState<SubForm>({ name: "", email: "", roles: [] });
  const [subStatus, setSubStatus] = useState<Status>("idle");
  const [subError, setSubError] = useState("");

  function openApplyModal(job: Job) {
    setSelectedJob(job);
    setApplyForm({ name: "", email: "", why: "", cv: "" });
    setApplyStatus("idle");
    setApplyError("");
    setCvFile(null);
    setCvFileError("");
    setCvUploadStage("idle");
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    gtag("event", "apply_click", { job_title: job.title, company_name: job.company });
  }

  function closeApplyModal() {
    setSelectedJob(null);
  }

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob) return;
    setApplyStatus("loading");
    setApplyError("");

    let storagePath: string | null = null;
    let storageFileName: string | null = null;

    if (cvFile) {
      setCvUploadStage("uploading");
      const timestamp = Date.now();
      const ext = (cvFile.name.split(".").pop() ?? "pdf").toLowerCase();
      const path = `${slugify(selectedJob.title)}/${slugify(selectedJob.company)}/${timestamp}.${ext}`;

      const { error: uploadError } = await supabase
        .storage
        .from("cvs")
        .upload(path, cvFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setCvUploadStage("error");
        setApplyStatus("error");
        const msg = uploadError.message?.toLowerCase() ?? "";
        setApplyError(
          msg.includes("not found") || msg.includes("unavailable") || msg.includes("bucket")
            ? "File upload unavailable. Please paste a link instead."
            : "Upload failed. Please try again or paste a link to your CV instead."
        );
        return;
      }

      storagePath = path;
      storageFileName = cvFile.name;
      setCvUploadStage("done");
    }

    const { error } = await supabase.from("applications").insert({
      job_title: selectedJob.title,
      company_name: selectedJob.company,
      applicant_name: applyForm.name,
      applicant_email: applyForm.email,
      why_interested: applyForm.why,
      cv_link: applyForm.cv || null,
      cv_storage_path: storagePath,
      cv_file_name: storageFileName,
    });

    if (error) {
      setApplyStatus("error");
      setApplyError("Something went wrong. Please try again.");
      return;
    }

    setApplyStatus("success");
    gtag("event", "application_submitted", {
      job_title: selectedJob.title,
      company_name: selectedJob.company,
    });
  }

  async function submitSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubStatus("loading");
    setSubError("");

    const { error } = await supabase.from("subscribers").insert({
      full_name: subForm.name,
      email: subForm.email,
      role_types: subForm.roles.length > 0 ? subForm.roles : null,
    });

    if (error) {
      setSubStatus("error");
      setSubError(
        error.code === "23505"
          ? "You're already subscribed with this email."
          : "Something went wrong. Please try again."
      );
      return;
    }

    setSubStatus("success");
    gtag("event", "subscribe_submitted");
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

  function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

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

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: "none" }}
                        onChange={handleFileInput}
                      />

                      {!cvFile ? (
                        /* Drop zone */
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
                        /* File selected */
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

                      {/* Link fallback */}
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

                    {applyStatus === "error" && (
                      <p className="text-sm" style={{ color: "#C8501A" }}>
                        {applyError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={applyStatus === "loading"}
                      className="w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      style={{
                        backgroundColor: applyStatus === "loading" ? "#D4845A" : "#C8501A",
                        color: "#FAF9F7",
                        cursor: applyStatus === "loading" ? "not-allowed" : "pointer",
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
            onClick={() => gtag("event", "post_job_click")}
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
            Jobs at Bootstrapped,{" "}
            <span style={{ color: "#C8501A" }}>Profitable</span>{" "}
            Startups
          </h1>
          <p className="text-xl leading-relaxed mb-10" style={{ color: "#6B6560" }}>
            No VC pressure. No layoff roulette. Just calm, profitable companies hiring great people.
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
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-colors"
              style={{ backgroundColor: "transparent", color: "#1A1A1A", borderColor: "#E5E0D8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C8501A";
                (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E0D8";
                (e.currentTarget as HTMLAnchorElement).style.color = "#1A1A1A";
              }}
              onClick={() => gtag("event", "post_job_click")}
            >
              Post a Job — $99
            </a>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ───────────────────────────────────── */}
      <section className="border-y" style={{ borderColor: "#E5E0D8" }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {valueProps.map((prop) => (
              <div key={prop.title}>
                <div className="text-2xl mb-4" style={{ color: "#C8501A" }}>
                  {prop.icon}
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#1A1A1A" }}>
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

      {/* ── JOB LISTINGS ──────────────────────────────────── */}
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

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </span>
          <p className="text-sm text-center" style={{ color: "#6B6560" }}>
            © 2026 RamenHire — Jobs at companies that don&apos;t need your hustle.
          </p>
          <a
            href={POST_JOB_URL}
            className="text-sm font-medium transition-colors"
            style={{ color: "#6B6560" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#6B6560";
            }}
            onClick={() => gtag("event", "post_job_click")}
          >
            Post a Job
          </a>
        </div>
      </footer>
    </div>
  );
}
