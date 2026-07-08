declare function gtag(command: string, action: string, params?: Record<string, unknown>): void;

// GA4's script only exists in the DOM after cookie consent is granted (see
// components/CookieConsentBanner.tsx) — before that, or during GA4's own
// async load, `gtag` may be undefined. typeof-check avoids a ReferenceError.
export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof gtag === "function") gtag("event", action, params);
}
