"use client";

import { trackEvent } from "@/lib/analytics";
import { openCookieSettings } from "./CookieConsentBanner";

export default function SiteFooter() {
  return (
    <footer className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="/" className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
          Ramen<span style={{ color: "#C8501A" }}>Hire</span>
        </a>
        <p className="text-sm text-center" style={{ color: "#6B6560" }}>
          © 2026 RamenHire — Jobs at companies that don&apos;t need your hustle.
        </p>
        <a
          href="/post-job"
          className="text-sm font-medium transition-colors"
          style={{ color: "#6B6560" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#C8501A";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#6B6560";
          }}
          onClick={() => trackEvent("post_job_click")}
        >
          Post a Job
        </a>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 pt-6 text-xs"
        style={{ borderTop: "1px solid #E5E0D8", color: "#9B9690" }}
      >
        <a href="/privacy-policy" className="transition-colors hover:underline">
          Privacy Policy
        </a>
        <a href="/terms-of-use" className="transition-colors hover:underline">
          Terms of Use
        </a>
        <button
          type="button"
          onClick={openCookieSettings}
          className="transition-colors hover:underline"
        >
          Cookie Settings
        </button>
      </div>
    </footer>
  );
}
