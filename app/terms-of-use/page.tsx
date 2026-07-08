import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms governing use of RamenHire — for job seekers browsing listings and companies posting jobs or registering a profile.",
  alternates: {
    canonical: "https://www.ramenhire.com/terms-of-use",
  },
  openGraph: {
    title: "Terms of Use | RamenHire",
    description:
      "The terms governing use of RamenHire — for job seekers browsing listings and companies posting jobs or registering a profile.",
    url: "https://www.ramenhire.com/terms-of-use",
  },
  twitter: {
    title: "Terms of Use | RamenHire",
    description:
      "The terms governing use of RamenHire — for job seekers browsing listings and companies posting jobs or registering a profile.",
  },
};

const H2 = "text-xl font-semibold mt-10 mb-3";
const P = "text-sm leading-relaxed mb-3";
const UL = "text-sm leading-relaxed mb-3 list-disc pl-5 flex flex-col gap-1.5";

export default function TermsOfUsePage() {
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
          Terms of Use
        </h1>
        <p className="text-sm mb-10" style={{ color: "#9B9690" }}>
          Last updated: July 7, 2026
        </p>

        <p className={P} style={{ color: "#6B6560" }}>
          RamenHire (&quot;RamenHire,&quot; &quot;we,&quot; &quot;us&quot;) is operated by an
          individual — there is no separate company or legal entity behind it. By using
          ramenhire.com (the &quot;Service&quot;), you agree to these terms.
        </p>

        <h2 className={H2}>1. What the Service is</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          RamenHire is a job board that connects job seekers with bootstrapped, profitable
          startups. Job seekers can browse and apply to listings for free. Companies can submit
          job listings and register a public company profile. RamenHire is a platform that
          facilitates these connections — we are not a party to, and are not responsible for, the
          employment relationship (or lack of one) that may result between a job seeker and a
          company.
        </p>

        <h2 className={H2}>2. Company registration &amp; job listings</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Companies submitting a job post or registering a company profile represent that the
          information provided is accurate and that they have the authority to submit it on the
          company&apos;s behalf. All submissions are reviewed manually before being published —
          submitting a form does not guarantee publication. We may reject, edit for clarity, or
          remove any submission at our discretion, including after it has been published.
        </p>
        <p className={P} style={{ color: "#6B6560" }}>
          There is no user account system — submissions are tied to the email address provided,
          not to a login. Keep that email address accurate if you want to be able to manage or
          request removal of your listing later.
        </p>

        <h2 className={H2}>3. Acceptable use</h2>
        <p className={P} style={{ color: "#6B6560" }}>You agree not to:</p>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>Submit fake, misleading, or duplicate job listings or company profiles</li>
          <li>Impersonate a company or individual you&apos;re not authorized to represent</li>
          <li>Scrape, crawl, or systematically extract data from the Service outside of normal browsing</li>
          <li>Use the apply, post-a-job, registration, or subscribe forms to send spam or unrelated content</li>
          <li>Attempt to interfere with, disrupt, or gain unauthorized access to the Service or its underlying systems</li>
          <li>Use the Service for any unlawful purpose</li>
        </ul>

        <h2 className={H2}>4. Content ownership</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Companies retain ownership of the job listing and company profile content they submit
          (job descriptions, company descriptions, logos, etc.). By submitting content, you grant
          RamenHire a non-exclusive, worldwide, royalty-free license to display, reproduce, and
          distribute that content on the Service (and in related promotional contexts, such as
          social media posts referencing a live listing) for as long as the listing or profile
          remains published. Job seekers retain ownership of their CV, application content, and
          any other material they submit when applying.
        </p>

        <h2 className={H2}>5. Disclaimers</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          The Service is provided &quot;as is,&quot; without warranties of any kind. In particular:
        </p>
        <ul className={UL} style={{ color: "#6B6560" }}>
          <li>
            <strong>We do not guarantee employment outcomes.</strong> Applying to a listing through
            RamenHire does not guarantee an interview, an offer, or any response from the company.
          </li>
          <li>
            <strong>&quot;Bootstrapped&quot; verification is manual and best-effort, not a
            guarantee.</strong> We review company claims about being bootstrapped/self-funded as
            best we can, but we do not conduct formal financial audits. A company&apos;s funding
            status can also change after a listing is published without our immediate knowledge.
          </li>
          <li>
            We do not guarantee the accuracy, completeness, or currency of any job listing or
            company profile — that content is submitted by the company, not verified line-by-line
            by us.
          </li>
        </ul>

        <h2 className={H2}>6. Limitation of liability</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          To the maximum extent permitted by law, RamenHire and its operator will not be liable
          for any indirect, incidental, special, consequential, or punitive damages, or any loss
          of profits, opportunities, or data, arising from your use of (or inability to use) the
          Service — including any hiring decision, application outcome, or reliance on listing
          content. Because RamenHire is operated by an individual, our liability in any case is
          limited to the maximum extent the applicable law allows.
        </p>

        <h2 className={H2}>7. Termination</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          We may reject, suspend, or remove any job listing, company profile, or submission — and
          refuse future submissions from a given company or individual — at our discretion, at any
          time, including without prior notice, for example if we believe these terms have been
          violated.
        </p>

        <h2 className={H2}>8. Governing law</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          These terms are governed by the laws of <strong>Israel</strong>, without regard to
          conflict-of-law principles. Any dispute arising from these terms or use of the Service
          will be subject to the exclusive jurisdiction of the courts of Israel.
        </p>

        <h2 className={H2}>9. Changes to these terms</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          We may update these terms from time to time. If we do, we&apos;ll update the &quot;last
          updated&quot; date above. Continued use of the Service after a change means you accept
          the updated terms.
        </p>

        <h2 className={H2}>10. Contact</h2>
        <p className={P} style={{ color: "#6B6560" }}>
          Questions about these terms: <strong>hello@ramenhire.com</strong>.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
