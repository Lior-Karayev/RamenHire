"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TEAM_SIZE_OPTIONS, REVENUE_OPTIONS } from "@/lib/companies";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import { trackEvent } from "@/lib/analytics";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { CurrentUser } from "@/lib/auth";
import type { PostJobCta } from "@/lib/postJobCta";

type FormData = {
  name: string;
  website: string;
  description: string;
  why_work_here: string;
  team_size: string;
  revenue_range: string;
  founded_year: string;
  contact_email: string;
  password: string;
};

const INITIAL: FormData = {
  name: "",
  website: "",
  description: "",
  why_work_here: "",
  team_size: "",
  revenue_range: "",
  founded_year: "",
  contact_email: "",
  password: "",
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

const ALLOWED_LOGO_MIME = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_LOGO_EXT = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const CURRENT_YEAR = new Date().getFullYear();

function validateLogo(file: File): string {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (!ALLOWED_LOGO_MIME.includes(file.type) && !ALLOWED_LOGO_EXT.includes(ext))
    return "Only PNG, JPEG, or WebP images are accepted.";
  if (file.size > MAX_LOGO_BYTES)
    return "Logo must be under 2MB.";
  return "";
}

type Props = {
  user: CurrentUser | null;
  postJobCta: PostJobCta;
};

export default function RegisterClient({ user, postJobCta }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState("");
  const [logoUploadFailed, setLogoUploadFailed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real browser-history back rather than a fixed destination, so this
  // returns wherever the visitor actually came from (homepage, header CTA,
  // etc.) instead of always landing on /companies. Checking document.referrer
  // (rather than window.history.length) is what actually distinguishes "came
  // from another page on this site" from "landed directly" — history.length
  // is unreliable here since a brand-new tab still carries its own "New Tab"
  // placeholder entry, so even a bookmarked/shared direct link can leave
  // history.length > 1 and send router.back() to that placeholder instead of
  // anywhere useful.
  function handleBack() {
    const sameOriginReferrer =
      typeof document !== "undefined" &&
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin;

    if (sameOriginReferrer) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function field(key: keyof FormData) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function handleLogoInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateLogo(file);
    if (err) { setLogoError(err); setLogoFile(null); return; }
    setLogoError("");
    setLogoFile(file);
  }

  // Uploads the logo bytes to the signed URL the server issued, then tells
  // the server to promote pending_logo_path -> logo_url. Non-blocking: a
  // failure here doesn't fail the registration, it's just logo_url staying
  // null (logo is optional, and it's rendered publicly with no error
  // fallback, so it's never set until upload is actually confirmed).
  async function uploadAndConfirmLogo(upload: {
    bucket: string;
    path: string;
    token: string;
    company_id: string;
    logo_confirm_token: string;
  }): Promise<boolean> {
    if (!logoFile) return false;

    const { error: uploadError } = await supabase
      .storage
      .from(upload.bucket)
      .uploadToSignedUrl(upload.path, upload.token, logoFile);
    if (uploadError) return false;

    const res = await fetch("/api/companies/confirm-logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: upload.company_id,
        logo_confirm_token: upload.logo_confirm_token,
      }),
    });
    return res.ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot: bots fill every field, real users never see or fill this one.
    // Silently "succeed" without writing anything.
    if (honeypot.trim() !== "") {
      setStatus("success");
      return;
    }

    if (!turnstileToken) {
      setStatus("error");
      setError("Please complete the verification check.");
      return;
    }

    setStatus("loading");
    setError("");
    setLogoUploadFailed(false);

    try {
      // Metadata goes through the rate-limited/Turnstile-gated route first;
      // the server mints a signed upload URL scoped to the new company's
      // own id, so the logo bytes never touch the anon-writable Storage API.
      const res = await fetch("/api/companies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          website: form.website,
          logo_file_name: logoFile?.name ?? null,
          description: form.description,
          why_work_here: form.why_work_here,
          team_size: form.team_size || null,
          revenue_range: form.revenue_range || null,
          founded_year: form.founded_year ? Number(form.founded_year) : null,
          contact_email: form.contact_email,
          password: form.password,
          turnstile_token: turnstileToken,
          honeypot,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setError(body.message ?? "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (logoFile && data.upload) {
        const confirmed = await uploadAndConfirmLogo(data.upload);
        if (!confirmed) setLogoUploadFailed(true);
      }

      setStatus("success");
      trackEvent("company_register_submitted");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
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
              Check your email to confirm your registration
            </h1>
            <p className="text-base mb-3" style={{ color: "#6B6560" }}>
              We sent a confirmation link to the email you provided. Click it to submit your
              profile for review — the link expires in 48 hours.
            </p>
            <p className="text-base mb-8" style={{ color: "#6B6560" }}>
              You can{" "}
              <a href="/sign-in" style={{ color: "#C8501A" }}>sign in</a>{" "}
              anytime to check your status, even before you&apos;re approved.
            </p>
            {logoUploadFailed && (
              <p className="text-sm mb-8" style={{ color: "#C8501A" }}>
                Your logo didn&apos;t upload — no worries, you can add one later, everything else was saved.
              </p>
            )}
            <a
              href="/companies"
              className="inline-flex items-center px-5 py-3 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#1A1A1A", color: "#FAF9F7" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#333";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1A1A1A";
              }}
            >
              ← Back to companies
            </a>
          </div>
        ) : (
          <>
            {/* -- HEADER -------------------------------- */}
            <div className="mb-10">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm transition-colors"
                style={{ color: "#6B6560" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#C8501A";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#6B6560";
                }}
              >
                ← Back
              </button>
              <h1
                className="text-3xl font-semibold mt-5 mb-2"
                style={{ color: "#1A1A1A" }}
              >
                Register Your Company
              </h1>
              <p className="text-base" style={{ color: "#6B6560" }}>
                Create a public profile for your bootstrapped company. We manually
                review every submission before it goes live.
              </p>
            </div>

            {/* -- FORM ---------------------------------- */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">

              {/* Honeypot — hidden from real users, bots tend to fill every field */}
              <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
                <label htmlFor="company_url_confirm">Leave this field empty</label>
                <input
                  id="company_url_confirm"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <section className="flex flex-col gap-5">
                <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
                  Company details
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Company Name <span style={{ color: "#C8501A" }}>*</span>
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
                    Company Website <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={form.website}
                    onChange={field("website")}
                    placeholder="https://..."
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Contact Email <span style={{ color: "#C8501A" }}>*</span>
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

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Password <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={field("password")}
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                  <p className="text-xs mt-1.5" style={{ color: "#9B9690" }}>
                    You&apos;ll use this to sign in and manage your listings, even before your profile is approved.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#1A1A1A" }}>
                    Logo{" "}
                    <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                      (optional — PNG, JPEG, or WebP, max 2MB)
                    </span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                    onChange={handleLogoInput}
                    className="text-sm"
                  />
                  {logoFile && (
                    <p className="text-xs mt-1.5" style={{ color: "#5C7A5C" }}>
                      Selected: {logoFile.name}
                    </p>
                  )}
                  {logoError && (
                    <p className="text-xs mt-1.5" style={{ color: "#C8501A" }}>
                      {logoError}
                    </p>
                  )}
                </div>
              </section>

              <div style={{ borderBottom: "1px solid #E5E0D8" }} />

              <section className="flex flex-col gap-5">
                <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
                  About the company
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Description <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={field("description")}
                    placeholder="What does your company do?"
                    className={`${INPUT_CLS} resize-none`}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Why work here? <span style={{ color: "#C8501A" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.why_work_here}
                    onChange={field("why_work_here")}
                    placeholder="Tell candidates what makes working here special — culture, pace, mission, perks…"
                    className={`${INPUT_CLS} resize-none`}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Team Size{" "}
                    <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                      (optional)
                    </span>
                  </label>
                  <select
                    value={form.team_size}
                    onChange={field("team_size")}
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  >
                    <option value="">Select a range</option>
                    {TEAM_SIZE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
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
                    {REVENUE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
                    Founded Year{" "}
                    <span className="text-xs font-normal" style={{ color: "#9B9690" }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1900}
                    max={CURRENT_YEAR}
                    value={form.founded_year}
                    onChange={field("founded_year")}
                    placeholder="e.g. 2019"
                    className={INPUT_CLS}
                    style={INPUT_STYLE}
                    onFocus={focusOrange}
                    onBlur={blurGray}
                  />
                </div>
              </section>

              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
              />

              {status === "error" && (
                <p className="text-sm -mt-4" style={{ color: "#C8501A" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !turnstileToken}
                className="w-full py-3.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                style={{
                  backgroundColor: status === "loading" || !turnstileToken ? "#D4845A" : "#C8501A",
                  color: "#FAF9F7",
                  cursor: status === "loading" || !turnstileToken ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading" && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {status === "loading" ? "Submitting…" : "Submit for Review 🍜"}
              </button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
