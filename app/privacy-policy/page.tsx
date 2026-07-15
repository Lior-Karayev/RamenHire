import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import { CookieSettingsLink } from "@/components/CookieConsentBanner";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How RamenHire collects, stores, and shares data — what's actually done with job applications, company registrations, and site analytics.",
  path: "/privacy-policy",
});

const H2 = "text-xl font-semibold mt-10 mb-3";
const H3 = "text-base font-semibold mt-6 mb-2";
const P = "text-sm leading-relaxed mb-3";
const UL = "text-sm leading-relaxed mb-3 list-disc pl-5 flex flex-col gap-1.5";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#FAF9F7", borderColor: "#E5E0D8" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="text-lg font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            Ramen<span style={{ color: "#C8501A" }}>Hire</span>
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "#9B9690" }}>
          Last updated: July 7, 2026
        </p>

        <p className={P} style={{ color: "#6B6560" }}>
          RamenHire (&quot;RamenHire,&quot; &quot;we,&quot; &quot;us&quot;) is a job board connecting job
          seekers with bootstrapped, profitable startups. RamenHire is operated by an individual —
          there is no separate company or legal entity behind it. This policy describes, as
          accurately and concretely as we can, what data we actually collect, why, where it goes,
          and what you can do about it. It applies to visitors, job seekers, and companies using
          ramenhire.com.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          We have users in the EU, so this policy is written with GDPR in mind. It is not a
          generic template — every section below reflects what this specific site does.
        </p>

        <h2 className={H2}>1. What we collect</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          We only collect what you actively submit through a form. There is no account system,
          no login, and no passive tracking beyond the analytics cookies described in Section 5.
        </p>

        <h3 className={H3}>Job seekers (applying to a job)</h3>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>Full name and email address</li>
          <li>Your answer to &quot;why are you interested in this role&quot;</li>
          <li>
            Either an uploaded CV file (PDF or Word document, max 5MB) or a link to your CV/portfolio
            — one or the other, not required to be both
          </li>
        </ul>
        <p className={P} style={{ color: "#6B6560" }}>
          <strong>Note on CV files:</strong> if you upload a CV, the file itself is stored, and so
          is its original filename (e.g. &quot;Jane_Doe_Resume.pdf&quot;) — which can itself contain
          your name. Uploaded CVs are stored in a <strong>private</strong> storage bucket that is
          not publicly accessible; only we (as admin) can retrieve them, not other site visitors.
        </p>

        <h3 className={H3}>Companies (posting a job or registering a company profile)</h3>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>Contact name and email address of the person submitting</li>
          <li>
            Company details: name, website, description, &quot;why work here,&quot; team size,
            approximate revenue range, founded year, and (optionally) a logo image
          </li>
          <li>Job details for any role submitted (title, type, location, salary range, description)</li>
        </ul>
        <p className={P} style={{ color: "#6B6560" }}>
          Company profile registrations include a hidden spam-trap field. It is never shown to
          real visitors and is not stored — if it&apos;s filled in (a sign of automated spam), the
          submission is silently discarded before anything is saved.
        </p>

        <h3 className={H3}>Subscribers (weekly email list)</h3>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>Full name, email address, and optionally the role types you&apos;re interested in</li>
        </ul>

        <h3 className={H3}>Everyone (site visitors)</h3>
        <p className={P} style={{ color: "#6B6560" }}>
          If you accept cookies, Google Analytics 4 collects page views, the interactions listed in
          Section 5, and standard technical data (browser, device type, approximate location derived
          from IP). See Section 5 for full detail — this only happens if you accept.
        </p>

        <h2 className={H2}>2. Why we collect it &amp; legal basis</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          We process job seeker and company data to operate the core service you asked for — to
          submit your application, publish your job listing, or register your company profile
          (legal basis: <strong>performance of a contract/pre-contractual steps</strong> you
          initiated by submitting the form). Where we send you a confirmation or notification
          email about your own submission, that&apos;s the same basis. Analytics cookies are used
          only with your <strong>consent</strong> (Section 5) — none are set until you accept.
        </p>

        <h2 className={H2}>3. Where your data is stored</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          All form data and uploaded files are stored in Supabase, our database and file storage
          provider. The specific project backing RamenHire is hosted in Supabase&apos;s{" "}
          <strong>us-west-1 region (Oregon, United States)</strong>. If you are located in the EU
          or elsewhere outside the US, your data is transferred to and processed in the United
          States as a result. This transfer relies on Supabase&apos;s own data processing
          agreement and standard contractual clauses as the transfer mechanism — we don&apos;t
          operate separate infrastructure of our own.
        </p>

        <h2 className={H2}>4. Who we share it with</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          We don&apos;t sell data, and we don&apos;t share it for advertising purposes. The
          following third parties process data on our behalf, strictly to run the service:
        </p>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li><strong>Supabase</strong> — database and file storage hosting (Section 3).</li>
          <li><strong>Vercel</strong> — hosts and serves the website; sees standard request/connection data as part of serving any web page.</li>
          <li>
            <strong>Resend</strong> — sends transactional emails on our behalf: your submission
            details are included in the notification email we receive, and (for company
            registrations) a confirmation email is sent back to the address you provided.
          </li>
          <li>
            <strong>Google Workspace / Gmail</strong> — our admin inbox (hello@ramenhire.com) that
            receives the notification emails above.
          </li>
          <li>
            <strong>Google Analytics 4</strong> — site usage analytics, only after you consent to
            cookies (Section 5).
          </li>
          <li>
            <strong>Google Search Console</strong> — aggregated, site-level search performance
            data (e.g. which search queries lead to our pages). This does not include personal data
            about individual visitors.
          </li>
        </ul>

        <h2 className={H2} id="cookies">5. Cookies</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          RamenHire does not set any non-essential cookie until you accept the cookie banner shown
          on your first visit. If you decline, no analytics cookie is set at all — this isn&apos;t
          just a preference toggle after the fact, the underlying analytics script itself is not
          loaded until you accept.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          If you accept, Google Analytics 4 sets two cookies:
        </p>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li><code>_ga</code> — a general, cross-session identifier used to distinguish visitors. Google&apos;s default duration is approximately 2 years.</li>
          <li><code>_ga_1X6XVB58KC</code> — a property-specific cookie that tracks session state for this site. Google&apos;s default duration is approximately 2 years.</li>
        </ul>
        <p className={P} style={{ color: "#6B6560" }}>
          We have not configured IP anonymization because Google Analytics 4 does not offer that
          setting (it was specific to the older Universal Analytics product) — Google states GA4
          does not persist full IP addresses. We have not layered on any additional anonymization
          beyond GA4&apos;s own default handling.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          Separately, the site uses your browser&apos;s <code>sessionStorage</code> (not a cookie)
          to remember if you&apos;ve dismissed a promotional popup during your visit. This never
          leaves your browser, contains no personal data, and clears automatically when you close
          the tab — it doesn&apos;t require consent.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          You can change your cookie choice at any time:{" "}
          <CookieSettingsLink className="underline" style={{ color: "#C8501A" }}>
            manage cookie settings
          </CookieSettingsLink>
          . If you previously accepted and later decline, we also actively remove the{" "}
          <code>_ga</code> and <code>_ga_1X6XVB58KC</code> cookies already set on your browser —
          declining doesn&apos;t just stop future tracking, it clears what was already there.
        </p>

        <h2 className={H2}>6. Data retention</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          We&apos;ll describe this honestly rather than promise a schedule we don&apos;t enforce:{" "}
          <strong>there is currently no automated deletion or retention policy</strong>. Submitted
          applications, job post requests, subscriber entries, and company registrations persist
          indefinitely unless manually deleted by us. If you&apos;d like your data removed sooner,
          see Section 7.
        </p>

        <h2 className={H2}>7. Your rights</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Depending on where you live, you may have rights to access, correct, delete, restrict, or
          export your data, and to object to how it&apos;s processed. To exercise any of these
          rights, email <strong>hello@ramenhire.com</strong>. We&apos;ll describe the process
          honestly: at this stage there is no automated self-service tool — a person manually
          locates and removes or exports your data on request. We aim to respond promptly, but this
          is a manual process, not an instant one.
        </p>

        <h2 className={H2}>8. Security</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Uploaded CVs are stored in a private storage bucket that isn&apos;t publicly accessible —
          only admin access can retrieve them. All data access is governed by database-level
          row-level-security rules restricting what an anonymous visitor can read versus what only
          an authenticated admin can. No system is perfectly secure, but we don&apos;t take
          shortcuts like exposing raw database access to the public.
        </p>

        <h2 className={H2}>9. Children&apos;s privacy</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          RamenHire is a professional job board and is not directed at, or intended for use by,
          children. We don&apos;t knowingly collect data from minors.
        </p>

        <h2 className={H2}>10. Changes to this policy</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          If our practices change, we&apos;ll update this page and its &quot;last updated&quot;
          date. We don&apos;t currently have a mailing list for policy changes specifically —
          check back periodically if this matters to you.
        </p>

        <h2 className={H2}>11. Contact</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Questions about this policy or your data: <strong>hello@ramenhire.com</strong>.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
