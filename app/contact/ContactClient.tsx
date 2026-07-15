"use client";

import { useState } from "react";
import SiteFooter from "@/components/SiteFooter";

type FormData = {
  name: string;
  email: string;
  reason: string;
  message: string;
};

const INITIAL: FormData = {
  name: "",
  email: "",
  reason: "",
  message: "",
};

type Status = "idle" | "loading" | "success" | "error";

const REASON_OPTIONS = [
  "General question",
  "Company / hiring",
  "Job seeker question",
  "Other",
];

const INPUT_CLS =
  "w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors appearance-none";
const INPUT_STYLE = {
  borderColor: "#E5E0D8",
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
};

type FocusEl = React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

function focusOrange(e: FocusEl) { e.currentTarget.style.borderColor = "#C8501A"; }
function blurGray(e: FocusEl)   { e.currentTarget.style.borderColor = "#E5E0D8"; }

export default function ContactClient() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  function field(key: keyof FormData) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot: bots fill every field, real users never see or fill this one.
    // Silently "succeed" without sending anything.
    if (honeypot.trim() !== "") {
      setStatus("success");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          reason: form.reason || null,
          message: form.message,
          honeypot,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setError(body.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
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
              Thanks — we&apos;ll get back to you soon
            </h1>
            <p className="text-base mb-8" style={{ color: "#6B6560" }}>
              Your message has been sent. We usually reply within a day or two.
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
              ← Back to home
            </a>
          </div>
        ) : (
          <>
            {/* ── HEADER ──────────────────────────────── */}
            <div className="mb-10">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
                Get in touch
              </h1>
              <p className="text-base" style={{ color: "#6B6560" }}>
                Question about a job, hiring, or anything else? Send us a message and
                we&apos;ll reply from hello@ramenhire.com.
              </p>
            </div>

            {/* ── FORM ────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Honeypot — hidden from real users, bots tend to fill every field */}
              <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
                <label htmlFor="contact_url_confirm">Leave this field empty</label>
                <input
                  id="contact_url_confirm"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                  Name <span style={{ color: "#C8501A" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={field("name")}
                  className={INPUT_CLS}
                  style={INPUT_STYLE}
                  onFocus={focusOrange}
                  onBlur={blurGray}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                  Email <span style={{ color: "#C8501A" }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={field("email")}
                  className={INPUT_CLS}
                  style={INPUT_STYLE}
                  onFocus={focusOrange}
                  onBlur={blurGray}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                  Reason{" "}
                  <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                    (optional)
                  </span>
                </label>
                <select
                  value={form.reason}
                  onChange={field("reason")}
                  className={INPUT_CLS}
                  style={INPUT_STYLE}
                  onFocus={focusOrange}
                  onBlur={blurGray}
                >
                  <option value="">Select a reason</option>
                  {REASON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                  Message <span style={{ color: "#C8501A" }}>*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={field("message")}
                  placeholder="How can we help?"
                  className={`${INPUT_CLS} resize-none`}
                  style={INPUT_STYLE}
                  onFocus={focusOrange}
                  onBlur={blurGray}
                />
              </div>

              {status === "error" && (
                <p className="text-sm -mt-2" style={{ color: "#C8501A" }}>
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
                {status === "loading" ? "Sending…" : "Send Message"}
              </button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
