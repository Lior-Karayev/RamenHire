declare function gtag(command: string, action: string, params?: Record<string, unknown>): void;

declare global {
  interface Window {
    // GoatCounter's own script (see app/layout.tsx) attaches this global once
    // it loads — undefined for a brief moment right after page load, hence
    // the optional chaining below rather than a typeof guard like gtag's.
    goatcounter?: {
      count?: (opts: { path: string; title?: string; event?: boolean }) => void;
    };
  }
}

// GA4's script only exists in the DOM after cookie consent is granted (see
// components/CookieConsentBanner.tsx) — before that, or during GA4's own
// async load, `gtag` may be undefined. typeof-check avoids a ReferenceError.
// GoatCounter loads unconditionally and consent-independently (also in
// app/layout.tsx), so every event fired here reaches it regardless of the
// visitor's cookie consent choice.
export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof gtag === "function") gtag("event", action, params);
  window.goatcounter?.count?.({ path: action, title: action, event: true });
}
