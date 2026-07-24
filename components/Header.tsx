"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/auth";
import type { PostJobCta } from "@/lib/postJobCta";

type HeaderProps = {
  /** false only on the homepage, which renders the wordmark as plain text instead of a self-link. */
  linkLogo?: boolean;
  /** Page-specific extra content (e.g. "← All companies") — sits alongside the universal Post-a-Job/account controls below. */
  right?: ReactNode;
  /** Some pages stack a modal at z-50 and need the nav below it; others have nothing above z-40. */
  zIndex?: 40 | 50;
  /** Required — every call site fetches this server-side so first paint is already correct (no logged-out flash). */
  user: CurrentUser | null;
  /** Required — label/destination for the universal Post-a-Job button, computed server-side via lib/postJobCta.ts so it reflects the visitor's auth/approval state. */
  postJobCta: PostJobCta;
  /** Optional analytics hook for the universal Post-a-Job link — pages that track it elsewhere can wire it here too. */
  onPostJobClick?: () => void;
};

export default function Header({ linkLogo = true, right, zIndex = 40, user, postJobCta, onPostJobClick }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [companySlug, setCompanySlug] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/account/company-slug")
      .then((res) => res.json())
      .then((data: { slug: string | null }) => {
        if (!cancelled) setCompanySlug(data.slug);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleSignOut() {
    setMenuOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  const wordmark = (
    <>
      Ramen<span style={{ color: "#C8501A" }}>Hire</span>
    </>
  );

  return (
    <nav
      className={`sticky top-0 border-b ${zIndex === 50 ? "z-50" : "z-40"}`}
      style={{ backgroundColor: "#FAF9F7", borderColor: "#E5E0D8" }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {linkLogo ? (
          <a href="/" className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            {wordmark}
          </a>
        ) : (
          <span className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            {wordmark}
          </span>
        )}

        <div className="flex items-center gap-3">
          {right}

          <a
            href={postJobCta.href}
            className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
            style={{ backgroundColor: "#C8501A", color: "#FAF9F7", borderColor: "#C8501A" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#A8401A";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#A8401A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#C8501A";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C8501A";
            }}
            onClick={onPostJobClick}
          >
            {postJobCta.label}
          </a>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#F0EDE8", color: "#C8501A" }}
              >
                {user.email.charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg border shadow-lg py-1"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
                >
                  <p
                    className="px-4 py-2 text-xs truncate border-b"
                    style={{ color: "#9B9690", borderColor: "#E5E0D8" }}
                  >
                    {user.email}
                  </p>
                  <a
                    href="/account"
                    className="block px-4 py-2 text-sm transition-colors"
                    style={{ color: "#1A1A1A" }}
                  >
                    Account Settings
                  </a>
                  {companySlug && (
                    <a
                      href={`/companies/${companySlug}`}
                      className="block px-4 py-2 text-sm transition-colors"
                      style={{ color: "#1A1A1A" }}
                    >
                      Company Page
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: "#1A1A1A" }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/sign-in"
              className="text-sm font-medium transition-colors"
              style={{ color: "#6B6560" }}
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
