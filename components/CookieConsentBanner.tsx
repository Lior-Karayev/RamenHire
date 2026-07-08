"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = "G-1X6XVB58KC";
const CONSENT_KEY = "ramenhire_cookie_consent";
const REOPEN_EVENT = "ramenhire:open-cookie-settings";

type Consent = "unknown" | "granted" | "denied";

// Dispatch this from anywhere (e.g. a footer link) to reopen the banner so a
// visitor can change a choice they already made.
export function openCookieSettings() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

// Removes any GA4 cookies left over from a prior "granted" choice. Needed
// because declining after having previously accepted only stops *new*
// tracking (we simply stop rendering the gtag Script tags) — it doesn't by
// itself remove cookies GA4 already set in an earlier session.
function clearGaCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  const host = window.location.hostname;
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  for (const name of names) {
    document.cookie = `${name}=; ${expired}`;
    document.cookie = `${name}=; ${expired}; domain=${host}`;
    document.cookie = `${name}=; ${expired}; domain=.${host}`;
  }
}

// Drop-in inline link/button for use inside server-rendered prose (e.g. the
// Privacy Policy's cookies section) without making the whole page a client component.
export function CookieSettingsLink({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openCookieSettings} className={className} style={style}>
      {children}
    </button>
  );
}

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<Consent>("unknown");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "granted" || stored === "denied") {
      setConsent(stored);
    } else {
      setShowBanner(true);
    }

    function handleReopen() {
      setShowBanner(true);
    }
    window.addEventListener(REOPEN_EVENT, handleReopen);
    return () => window.removeEventListener(REOPEN_EVENT, handleReopen);
  }, []);

  function choose(value: Consent) {
    const hadPriorChoice = localStorage.getItem(CONSENT_KEY) !== null;
    localStorage.setItem(CONSENT_KEY, value);
    setShowBanner(false);

    if (value === "denied") clearGaCookies();

    if (hadPriorChoice) {
      // Changing an existing choice (e.g. via "Cookie Settings" in the footer).
      // Reload so GA4 cleanly starts or stops rather than trying to tear down
      // an already-running analytics session client-side.
      window.location.reload();
    } else {
      // First-time choice — nothing has loaded yet, so just flip state.
      setConsent(value);
    }
  }

  return (
    <>
      {/* GA4 is only ever requested from the network after consent is granted —
          not loaded-then-restricted, actually absent from the page until then. */}
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div
            className="max-w-2xl mx-auto rounded-xl border shadow-lg p-5 sm:p-6"
            style={{ backgroundColor: "#FAF9F7", borderColor: "#E5E0D8" }}
          >
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#1A1A1A" }}>
              We use cookies for analytics (Google Analytics 4) to understand how
              people use RamenHire. These are off by default — nothing is set
              unless you accept. See our{" "}
              <a href="/privacy-policy#cookies" className="underline" style={{ color: "#C8501A" }}>
                Privacy Policy
              </a>{" "}
              for details.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => choose("granted")}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: "#C8501A", color: "#FAF9F7" }}
              >
                Accept
              </button>
              <button
                onClick={() => choose("denied")}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
                style={{ backgroundColor: "transparent", color: "#1A1A1A", borderColor: "#E5E0D8" }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
