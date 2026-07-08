# Privacy Policy

_Last updated: July 7, 2026_

RamenHire ("RamenHire," "we," "us") is a job board connecting job seekers with bootstrapped, profitable startups. RamenHire is operated by an individual — there is no separate company or legal entity behind it. This policy describes, as accurately and concretely as we can, what data we actually collect, why, where it goes, and what you can do about it. It applies to visitors, job seekers, and companies using ramenhire.com.

We have users in the EU, so this policy is written with GDPR in mind. It is not a generic template — every section below reflects what this specific site does.

## 1. What we collect

We only collect what you actively submit through a form. There is no account system, no login, and no passive tracking beyond the analytics cookies described in Section 5.

### Job seekers (applying to a job)

- Full name and email address
- Your answer to "why are you interested in this role"
- Either an uploaded CV file (PDF or Word document, max 5MB) or a link to your CV/portfolio — one or the other, not required to be both

**Note on CV files:** if you upload a CV, the file itself is stored, and so is its original filename (e.g. "Jane_Doe_Resume.pdf") — which can itself contain your name. Uploaded CVs are stored in a **private** storage bucket that is not publicly accessible; only we (as admin) can retrieve them, not other site visitors.

### Companies (posting a job or registering a company profile)

- Contact name and email address of the person submitting
- Company details: name, website, description, "why work here," team size, approximate revenue range, founded year, and (optionally) a logo image
- Job details for any role submitted (title, type, location, salary range, description)

Company profile registrations include a hidden spam-trap field. It is never shown to real visitors and is not stored — if it's filled in (a sign of automated spam), the submission is silently discarded before anything is saved.

### Subscribers (weekly email list)

- Full name, email address, and optionally the role types you're interested in

### Everyone (site visitors)

If you accept cookies, Google Analytics 4 collects page views, the interactions listed in Section 5, and standard technical data (browser, device type, approximate location derived from IP). See Section 5 for full detail — this only happens if you accept.

## 2. Why we collect it & legal basis

We process job seeker and company data to operate the core service you asked for — to submit your application, publish your job listing, or register your company profile (legal basis: **performance of a contract/pre-contractual steps** you initiated by submitting the form). Where we send you a confirmation or notification email about your own submission, that's the same basis. Analytics cookies are used only with your **consent** (Section 5) — none are set until you accept.

## 3. Where your data is stored

All form data and uploaded files are stored in Supabase, our database and file storage provider. The specific project backing RamenHire is hosted in Supabase's **us-west-1 region (Oregon, United States)**. If you are located in the EU or elsewhere outside the US, your data is transferred to and processed in the United States as a result. This transfer relies on Supabase's own data processing agreement and standard contractual clauses as the transfer mechanism — we don't operate separate infrastructure of our own.

## 4. Who we share it with

We don't sell data, and we don't share it for advertising purposes. The following third parties process data on our behalf, strictly to run the service:

- **Supabase** — database and file storage hosting (Section 3).
- **Vercel** — hosts and serves the website; sees standard request/connection data as part of serving any web page.
- **Resend** — sends transactional emails on our behalf: your submission details are included in the notification email we receive, and (for company registrations) a confirmation email is sent back to the address you provided.
- **Google Workspace / Gmail** — our admin inbox (hello@ramenhire.com) that receives the notification emails above.
- **Google Analytics 4** — site usage analytics, only after you consent to cookies (Section 5).
- **Google Search Console** — aggregated, site-level search performance data (e.g. which search queries lead to our pages). This does not include personal data about individual visitors.

## 5. Cookies

RamenHire does not set any non-essential cookie until you accept the cookie banner shown on your first visit. If you decline, no analytics cookie is set at all — this isn't just a preference toggle after the fact, the underlying analytics script itself is not loaded until you accept.

If you accept, Google Analytics 4 sets two cookies:

- `_ga` — a general, cross-session identifier used to distinguish visitors. Google's default duration is approximately 2 years.
- `_ga_1X6XVB58KC` — a property-specific cookie that tracks session state for this site. Google's default duration is approximately 2 years.

We have not configured IP anonymization because Google Analytics 4 does not offer that setting (it was specific to the older Universal Analytics product) — Google states GA4 does not persist full IP addresses. We have not layered on any additional anonymization beyond GA4's own default handling.

Separately, the site uses your browser's `sessionStorage` (not a cookie) to remember if you've dismissed a promotional popup during your visit. This never leaves your browser, contains no personal data, and clears automatically when you close the tab — it doesn't require consent.

You can change your cookie choice at any time using the "Cookie Settings" link in the site footer. If you previously accepted and later decline, we also actively remove the `_ga` and `_ga_1X6XVB58KC` cookies already set on your browser — declining doesn't just stop future tracking, it clears what was already there.

## 6. Data retention

We'll describe this honestly rather than promise a schedule we don't enforce: **there is currently no automated deletion or retention policy**. Submitted applications, job post requests, subscriber entries, and company registrations persist indefinitely unless manually deleted by us. If you'd like your data removed sooner, see Section 7.

## 7. Your rights

Depending on where you live, you may have rights to access, correct, delete, restrict, or export your data, and to object to how it's processed. To exercise any of these rights, email **hello@ramenhire.com**. We'll describe the process honestly: at this stage there is no automated self-service tool — a person manually locates and removes or exports your data on request. We aim to respond promptly, but this is a manual process, not an instant one.

## 8. Security

Uploaded CVs are stored in a private storage bucket that isn't publicly accessible — only admin access can retrieve them. All data access is governed by database-level row-level-security rules restricting what an anonymous visitor can read versus what only an authenticated admin can. No system is perfectly secure, but we don't take shortcuts like exposing raw database access to the public.

## 9. Children's privacy

RamenHire is a professional job board and is not directed at, or intended for use by, children. We don't knowingly collect data from minors.

## 10. Changes to this policy

If our practices change, we'll update this page and its "last updated" date. We don't currently have a mailing list for policy changes specifically — check back periodically if this matters to you.

## 11. Contact

Questions about this policy or your data: **hello@ramenhire.com**.
