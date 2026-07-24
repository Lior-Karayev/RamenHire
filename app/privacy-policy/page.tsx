import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import Header from "@/components/Header";
import { CookieSettingsLink } from "@/components/CookieConsentBanner";
import { buildPageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";
import { getPostJobCta } from "@/lib/postJobCta";

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

export default async function PrivacyPolicyPage() {
  const user = await getCurrentUser();
  const postJobCta = await getPostJobCta(user);
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }}>
      <Header user={user} postJobCta={postJobCta} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "#9B9690" }}>
          Last updated: July 21, 2026
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
          Beyond what you actively submit through a form, the only other data collected is the
          anonymous, aggregate site-analytics traffic described below and in Section 5. Job seekers
          have no account system and no login. Companies do have real accounts, as of July 2026 —
          see below.
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

        <h3 className={H3}>Companies (registering a company profile, and managing it afterward)</h3>
        <p className={P} style={{ color: "#6B6560" }}>
          Registering creates a real account (email + password), used to sign in and manage your
          profile and listings going forward:
        </p>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>
            A password, which we never see or store in plain text — Supabase Auth (Section 3)
            hashes it before it ever reaches our database.
          </li>
          <li>
            Contact name and email address of the person registering. This becomes both your login
            email and your public-facing contact email at registration time — the two can later
            diverge, since Account Settings lets you change your contact email without changing your
            login email.
          </li>
          <li>
            Company details, collected once at registration and reused for every listing you post
            afterward (not re-collected per listing): name, website, description, &quot;why work
            here,&quot; team size, approximate revenue range, founded year, and (optionally) a logo
            image.
          </li>
          <li>
            Job details for each role you post (title, type, location, salary range, description) —
            collected separately, whenever you actually post a listing, once your account is
            approved.
          </li>
        </ul>
        <p className={P} style={{ color: "#6B6560" }}>
          Company profile registrations include a hidden spam-trap field. It is never shown to
          real visitors and is not stored — if it&apos;s filled in (a sign of automated spam), the
          submission is silently discarded before anything is saved.
        </p>

        <h3 className={H3}>1a. Company accounts</h3>
        <p className={P} style={{ color: "#6B6560" }}>
          A company account can be in one of a few states: awaiting email confirmation, pending our
          manual review, approved (able to post and manage listings), or not approved. You can sign
          in at any time, in any state, to check your status. Requesting deletion of your account
          (Section 7) puts it into its own distinct, time-limited state — see Section 6.
        </p>

        <h3 className={H3}>Subscribers (weekly email list)</h3>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>Full name, email address, and optionally the role types you&apos;re interested in</li>
        </ul>

        <h3 className={H3}>Everyone (site visitors)</h3>
        <p className={P} style={{ color: "#6B6560" }}>
          If you accept cookies, Google Analytics 4 additionally collects page views, the
          interactions listed in Section 5, and standard technical data (browser, device type,
          approximate location derived from IP) — this only happens if you accept. Separately,
          GoatCounter, Vercel Web Analytics, and Vercel Speed Insights each record an anonymous
          pageview for every visitor regardless of that choice, since none of them set a cookie or
          need consent to do so — see Section 5 for the full explanation of that distinction.
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
          <li><strong>Supabase</strong> — database, file storage, and (for company accounts) authentication hosting (Section 3).</li>
          <li><strong>Vercel</strong> — hosts and serves the website; sees standard request/connection data as part of serving any web page.</li>
          <li>
            <strong>GoatCounter</strong>{" "}— cookieless site analytics that runs for every visitor
            regardless of your cookie choice (see Section 5 for why). Per GoatCounter&apos;s own
            documentation, it does not store IP addresses — an incoming IP is used only momentarily
            to derive a country-level location, then discarded, and no cookie, localStorage, or
            other browser storage is used. Each pageview it records includes browser/OS, screen
            width, language, referrer, and the page path.
          </li>
          <li>
            <strong>Vercel Web Analytics</strong>{" "}— cookieless traffic analytics, also unaffected by
            your cookie choice (Section 5). Per Vercel&apos;s own documentation, visitors are
            identified only by a hash derived from the incoming request, not by IP address or any
            cookie; that hash is discarded after 24 hours rather than kept as a persistent
            identifier. Each data point includes the page URL, referrer, country/region-level
            location, and device/browser/OS type — none of it tied to an individual visitor.
          </li>
          <li>
            <strong>Vercel Speed Insights</strong>{" "}— cookieless page-load performance measurement
            (e.g. how fast pages render for real visitors), also unaffected by your cookie choice
            (Section 5). Per Vercel&apos;s own documentation for this specific product, recording is
            anonymous and not tied to, or able to reconstruct, an individual visitor&apos;s browsing
            session, and it sets no cookie. Each data point includes the page route, network speed,
            device/browser/OS type, country, and page-load performance metrics (e.g. how fast the
            page rendered).
          </li>
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
          <strong>Company sign-in session (strictly necessary, no consent banner)</strong> — set
          regardless of your cookie choice below. If you sign in to a company account, a session
          cookie (<code>sb-...-auth-token</code>) is set so you stay signed in across pages and
          visits. This cookie is required for the sign-in feature itself to function — it
          isn&apos;t used for tracking or analytics and contains no data beyond what&apos;s needed
          to identify your session. It&apos;s removed when you sign out.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          RamenHire does not set any non-essential cookie until you accept the cookie banner shown
          on your first visit. If you decline, no analytics cookie is set at all — this isn&apos;t
          just a preference toggle after the fact, the underlying analytics script itself is not
          loaded until you accept.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          <strong>GoatCounter, Vercel Web Analytics, and Vercel Speed Insights are the exception</strong>{" "}
          — they run on every page view regardless of the choice you make above, and that&apos;s
          intentional, not an oversight or a workaround of your decision. The cookie banner governs
          cookies specifically, and none of these tools sets one: no cookie, no localStorage, no
          identifier saved to your browser at all — so there is genuinely no non-essential cookie to
          ask permission for. What they do instead is send a single, anonymous record of that page
          view directly to their own servers the moment the page loads, before you&apos;ve made any
          cookie choice — a real network request you can see for yourself in your browser&apos;s
          network tab. That&apos;s the &quot;processes a pageview&quot; side of privacy law, not the
          &quot;sets a cookie&quot; side; the consent requirement in this section is specifically
          about the latter. Concretely: GoatCounter discards the IP address it briefly sees after
          deriving a country-level location from it; Vercel Web Analytics identifies visitors only
          via a hash that&apos;s discarded after 24 hours rather than kept as a persistent
          identifier; and Vercel Speed Insights doesn&apos;t identify individual visitors at all —
          its recordings are anonymous by design. None of the three can link a page view back to you
          on a future visit or across other sites.
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
          Company accounts and their listings now have automated retention windows. These are{" "}
          <strong>grace periods for undoing a deletion, not a legal or tax record-retention
          schedule</strong> — we make no compliance claim about how long data is kept; they exist
          purely so a deletion request (yours, or an account that never got approved) isn&apos;t
          instantly irreversible.
        </p>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>
            <strong>Company registrations that never get approved</strong> (still awaiting email
            confirmation, still in our review queue, or not approved) are eligible for removal{" "}
            <strong>15 days</strong> after registration.
          </li>
          <li>
            <strong>A company that requests account deletion</strong> (Section 7) gets a{" "}
            <strong>90-day</strong> window before permanent removal — during which the request can
            still be reversed by emailing us.
          </li>
          <li>
            <strong>That same company&apos;s job listings</strong> are removed on their own{" "}
            <strong>30-day</strong> window, independent of and shorter than the 90-day account
            window — so listings come down well before the account itself is fully purged.
          </li>
          <li>
            Permanent removal, once a window elapses, deletes the company/listing record, any
            uploaded logo or CV files tied to it, and the underlying sign-in account itself — not
            just a status flag.
          </li>
        </ul>
        <p className={P} style={{ color: "#6B6560" }}>
          Everything not covered above — submitted job applications, job-post-request history
          predating company accounts, and subscriber list entries — still has{" "}
          <strong>no automated deletion or retention policy</strong>; those persist indefinitely
          unless manually deleted by us. If you&apos;d like data removed sooner than these windows,
          see Section 7.
        </p>

        <h2 className={H2}>7. Your rights</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Depending on where you live, you may have rights to access, correct, delete, restrict, or
          export your data, and to object to how it&apos;s processed.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          <strong>Companies</strong> can now request deletion of their own account and listings
          directly from Account Settings, self-service — no email needed to initiate it (though
          Section 6&apos;s 90-day window means emailing <strong>hello@ramenhire.com</strong> is
          still how you&apos;d reverse a request already made). <strong>Job seekers</strong> have no
          account or self-service tool; to exercise any right over data submitted as a job seeker
          (or anything not covered by the self-service tool above), email{" "}
          <strong>hello@ramenhire.com</strong>. We&apos;ll describe that process honestly: a person
          manually locates and removes or exports the data on request. We aim to respond promptly,
          but this is a manual process, not an instant one.
        </p>

        <h2 className={H2}>8. Security</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Uploaded CVs are stored in a private storage bucket that isn&apos;t publicly accessible —
          only admin access can retrieve them. Company account passwords are handled entirely by
          our authentication provider (Supabase Auth) and hashed before storage — we never see or
          store a plain-text password. All data access is governed by database-level
          row-level-security rules: an anonymous visitor, a signed-in company (scoped strictly to
          its own account and listings), and an admin each see only what their role is allowed to.
          No system is perfectly secure, but we don&apos;t take shortcuts like exposing raw database
          access to the public.
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
