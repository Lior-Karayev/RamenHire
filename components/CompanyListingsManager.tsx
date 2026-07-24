"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JobListing } from "@/app/HomeClient";

const JOB_TAGS = [
  "Engineering", "Design", "Product", "Marketing", "Sales",
  "Customer Success", "Operations", "Finance", "Legal", "HR",
  "DevOps", "Data", "Security", "Mobile", "Frontend", "Backend",
  "Fullstack", "Python", "Ruby", "JavaScript", "TypeScript",
  "React", "Node.js", "Go", "Rust", "Other",
];

const INPUT_CLS =
  "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors appearance-none";
const INPUT_STYLE = {
  borderColor: "#E5E0D8",
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
};

type EditForm = {
  job_title: string;
  job_type: string;
  location: string;
  salary_range: string;
  job_description: string;
  application_link: string;
};

function toEditForm(job: JobListing): EditForm {
  return {
    job_title: job.title,
    job_type: job.job_type,
    location: job.location,
    salary_range: job.salary ?? "",
    job_description: job.description,
    application_link: job.apply_url,
  };
}

type RowProps = {
  job: JobListing;
};

function ListingRow({ job }: RowProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [form, setForm] = useState<EditForm>(() => toEditForm(job));
  const [tags, setTags] = useState<string[]>(job.tags ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function field(key: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/companies/job-listings/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: tags.length > 0 ? tags : null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      setMode("view");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    setBusy(true);
    try {
      await fetch(`/api/companies/job-listings/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !job.is_active }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await fetch(`/api/companies/job-listings/${job.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (mode === "edit") {
    return (
      <form
        onSubmit={saveEdit}
        className="flex flex-col gap-3 p-5 rounded-lg border"
        style={{ borderColor: "#C8501A", backgroundColor: "#FFFFFF" }}
      >
        <input
          required
          value={form.job_title}
          onChange={field("job_title")}
          placeholder="Job title"
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
        <div className="flex flex-wrap gap-1.5">
          {JOB_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                style={{
                  borderColor: active ? "#C8501A" : "#E5E0D8",
                  backgroundColor: active ? "#C8501A" : "transparent",
                  color: active ? "#FAF9F7" : "#6B6560",
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <select
          required
          value={form.job_type}
          onChange={field("job_type")}
          className={INPUT_CLS}
          style={INPUT_STYLE}
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
        <input
          required
          value={form.location}
          onChange={field("location")}
          placeholder="Location / Remote"
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
        <input
          required
          value={form.salary_range}
          onChange={field("salary_range")}
          placeholder="Salary range"
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
        <textarea
          required
          rows={4}
          value={form.job_description}
          onChange={field("job_description")}
          placeholder="Job description"
          className={`${INPUT_CLS} resize-none`}
          style={INPUT_STYLE}
        />
        <input
          required
          value={form.application_link}
          onChange={field("application_link")}
          placeholder="Application link or email"
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />

        {error && <p className="text-sm" style={{ color: "#C8501A" }}>{error}</p>}

        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#C8501A", color: "#FAF9F7", cursor: busy ? "not-allowed" : "pointer" }}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("view")}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: "#E5E0D8", color: "#6B6560" }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-lg border"
      style={{ borderColor: "#E5E0D8", backgroundColor: "#FFFFFF" }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-base font-medium" style={{ color: "#1A1A1A" }}>{job.title}</p>
          {!job.is_active && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-md border"
              style={{ color: "#6B6560", borderColor: "#E5E0D8", backgroundColor: "#F0EDE8" }}
            >
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "#6B6560" }}>
          <span>{job.location}</span>
          <span>·</span>
          <span>{job.salary ?? "Salary not listed"}</span>
        </div>
      </div>

      {mode === "confirm-delete" ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm" style={{ color: "#1A1A1A" }}>Delete this listing?</span>
          <button
            type="button"
            disabled={busy}
            onClick={confirmDelete}
            className="text-sm font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
          >
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("view")}
            className="text-sm font-medium px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "#E5E0D8", color: "#6B6560" }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={toggleActive}
            className="text-sm font-medium"
            style={{ color: "#6B6560" }}
          >
            {job.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("edit")}
            className="text-sm font-medium"
            style={{ color: "#C8501A" }}
          >
            Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("confirm-delete")}
            className="text-sm font-medium"
            style={{ color: "#C8501A" }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

type Props = {
  jobs: JobListing[];
};

export default function CompanyListingsManager({ jobs }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <ListingRow key={job.id} job={job} />
      ))}
    </div>
  );
}
